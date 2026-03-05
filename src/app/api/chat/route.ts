import { streamText, convertToModelMessages } from "ai";
import { anthropic } from "@ai-sdk/anthropic";
import { readFileSync } from "fs";
import { join } from "path";
import { reportError } from "@/lib/error-reporting";

export const runtime = "nodejs";

// ---------------------------------------------------------------------------
// Rate limiting: per visitor_id, shared in-memory Map
// ---------------------------------------------------------------------------
const chatRateMap = new Map<string, { count: number; windowStart: number }>();
const CHAT_RATE_MAX = 60; // max messages per window
const CHAT_RATE_WINDOW_MS = 60 * 60 * 1000; // 1 hour

function isChatRateLimited(visitorId: string): boolean {
  if (!visitorId) return false;
  const now = Date.now();
  const entry = chatRateMap.get(visitorId);
  if (!entry || now - entry.windowStart > CHAT_RATE_WINDOW_MS) {
    chatRateMap.set(visitorId, { count: 1, windowStart: now });
    return false;
  }
  entry.count++;
  return entry.count > CHAT_RATE_MAX;
}

// Cleanup stale entries every 10 minutes
setInterval(() => {
  const now = Date.now();
  for (const [key, entry] of chatRateMap) {
    if (now - entry.windowStart > CHAT_RATE_WINDOW_MS) {
      chatRateMap.delete(key);
    }
  }
}, 10 * 60 * 1000).unref();

// ---------------------------------------------------------------------------
// Load system prompt and KB docs once at module scope (cached on cold start)
// ---------------------------------------------------------------------------
const docsDir = join(process.cwd(), "docs");
const kbDir = join(docsDir, "v2");

const basePrompt = readFileSync(join(kbDir, "v2-base-prompt.md"), "utf-8");

const kbFiles = [
  "v2-kb-product-context.txt",
  "v2-kb-sales-methodology.txt",
  "v2-kb-objection-handling.txt",
  "v2-kb-examples.txt",
];

const kbContent = kbFiles
  .map((f) => readFileSync(join(kbDir, f), "utf-8"))
  .join("\n\n---\n\n");

/**
 * Replace {{ variable_name }} placeholders with values from dynamicVariables.
 * Unmatched placeholders are replaced with empty string.
 */
function interpolate(
  template: string,
  vars: Record<string, string>
): string {
  return template.replace(
    /\{\{\s*(\w+)\s*\}\}/g,
    (_, key) => vars[key] ?? ""
  );
}

export async function POST(request: Request) {
  let body;
  try {
    body = await request.json();
  } catch {
    return new Response("Invalid JSON", { status: 400 });
  }

  const { messages, dynamicVariables } = body;

  if (!Array.isArray(messages) || messages.length === 0) {
    return new Response("Missing messages", { status: 400 });
  }

  // Rate limit by visitor_id
  const visitorId = dynamicVariables?.visitor_id ?? "";
  if (isChatRateLimited(visitorId)) {
    return new Response("Rate limit exceeded", { status: 429 });
  }

  const vars = dynamicVariables ?? {};

  const systemPrompt =
    interpolate(basePrompt, vars) + "\n\n# Knowledge Base\n\n" + kbContent;

  // Convert UIMessages (from DefaultChatTransport) to model messages
  try {
    const modelMessages = await convertToModelMessages(messages);

    const result = streamText({
      model: anthropic(process.env.ANTHROPIC_MODEL ?? "claude-sonnet-4-6"),
      system: {
        role: "system",
        content: systemPrompt,
        providerOptions: {
          anthropic: { cacheControl: { type: "ephemeral" } },
        },
      },
      messages: modelMessages,
      maxOutputTokens: 400,
      onError({ error }) {
        reportError(error, {
          route: "/api/chat",
          severity: "critical",
          extra: { visitorId, chatVersion: "v4", messageCount: messages.length },
        });
      },
    });

    return result.toUIMessageStreamResponse();
  } catch (error) {
    await reportError(error, {
      route: "/api/chat",
      severity: "critical",
      extra: { visitorId, chatVersion: "v4", messageCount: messages.length },
    });
    return new Response("Internal server error", { status: 500 });
  }
}
