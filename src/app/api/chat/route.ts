import { streamText, convertToModelMessages } from "ai";
import { anthropic } from "@ai-sdk/anthropic";
import { readFileSync } from "fs";
import { join } from "path";
import { type NextRequest } from "next/server";
import { reportError } from "@/lib/error-reporting";
import { generateChatToken } from "@/lib/chat-token";

export const runtime = "nodejs";

// ---------------------------------------------------------------------------
// Rate limiting: per IP, shared in-memory Map
// ---------------------------------------------------------------------------
const chatRateMap = new Map<string, { count: number; windowStart: number }>();
const CHAT_RATE_MAX = 60; // max messages per window
const CHAT_RATE_WINDOW_MS = 60 * 60 * 1000; // 1 hour
const MAX_MESSAGES = 50;
const MAX_MESSAGE_LENGTH = 4000;

function isChatRateLimited(ip: string): boolean {
  if (ip === "unknown") return true;
  const now = Date.now();
  const entry = chatRateMap.get(ip);
  if (!entry || now - entry.windowStart > CHAT_RATE_WINDOW_MS) {
    chatRateMap.set(ip, { count: 1, windowStart: now });
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

// ---------------------------------------------------------------------------
// Dynamic variable sanitization
// ---------------------------------------------------------------------------
const ALLOWED_DYNAMIC_KEYS = new Set([
  "visitor_id", "utm_source", "utm_medium", "utm_campaign",
  "page_url", "returning_visitor", "prev_business_name",
  "prev_challenge", "prev_location_count", "prev_outcome",
  "detected_currency", "chat_version",
]);
const MAX_VAR_LENGTH = 200;

function sanitizeVars(raw: Record<string, string>): Record<string, string> {
  const clean: Record<string, string> = {};
  for (const [key, val] of Object.entries(raw)) {
    if (!ALLOWED_DYNAMIC_KEYS.has(key)) continue;
    if (typeof val !== "string") continue;
    clean[key] = val.slice(0, MAX_VAR_LENGTH).replace(/[\n\r{}]/g, "");
  }
  return clean;
}

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

export async function POST(request: NextRequest) {
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

  // Validate message array size and content length
  if (messages.length > MAX_MESSAGES) {
    return new Response("Too many messages", { status: 400 });
  }
  for (const msg of messages) {
    if (typeof msg.content === "string" && msg.content.length > MAX_MESSAGE_LENGTH) {
      msg.content = msg.content.slice(0, MAX_MESSAGE_LENGTH);
    }
    if (Array.isArray(msg.parts)) {
      for (const part of msg.parts) {
        if (part.type === "text" && typeof part.text === "string" && part.text.length > MAX_MESSAGE_LENGTH) {
          part.text = part.text.slice(0, MAX_MESSAGE_LENGTH);
        }
      }
    }
  }

  // Rate limit by IP
  const ip = request.headers.get("x-forwarded-for")?.split(",")[0]?.trim() || "unknown";
  if (isChatRateLimited(ip)) {
    return new Response("Rate limit exceeded", { status: 429 });
  }

  const visitorId = dynamicVariables?.visitor_id ?? "";
  const vars = sanitizeVars(dynamicVariables ?? {});

  const systemPrompt =
    interpolate(basePrompt, vars) + "\n\n# Knowledge Base\n\n" + kbContent;

  // Generate chat token for save route authentication
  const chatToken = generateChatToken(ip);

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
          extra: { visitorId, chatVersion: "diy-sonnet", messageCount: messages.length },
        });
      },
    });

    const response = result.toUIMessageStreamResponse();
    response.headers.set("x-chat-token", chatToken);
    return response;
  } catch (error) {
    await reportError(error, {
      route: "/api/chat",
      severity: "critical",
      extra: { visitorId, chatVersion: "diy-sonnet", messageCount: messages.length },
    });
    return new Response("Internal server error", { status: 500 });
  }
}
