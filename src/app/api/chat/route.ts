import { streamText, convertToModelMessages } from "ai";
import { anthropic } from "@ai-sdk/anthropic";
import { readFileSync } from "fs";
import { join } from "path";

export const runtime = "nodejs";

// Load system prompt and KB docs once at module scope (cached on cold start)
const docsDir = join(process.cwd(), "docs");

const basePrompt = readFileSync(
  join(docsDir, "agent-prompts", "base-prompt-v3.md"),
  "utf-8"
);

const kbFiles = [
  "kb-01-product.txt",
  "kb-02-pricing.txt",
  "kb-03-differentiation.txt",
  "kb-04-ideal-client.txt",
  "kb-05-case-studies.txt",
  "kb-06-faq.txt",
  "kb-07-objection-handling.txt",
  "kb-08-tracking-attribution.txt",
  "kb-09-example-conversations.txt",
];

const kbContent = kbFiles
  .map((f) => readFileSync(join(docsDir, f), "utf-8"))
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
  const { messages, dynamicVariables } = await request.json();

  const vars = dynamicVariables ?? {};
  const systemPrompt =
    interpolate(basePrompt, vars) + "\n\n# Knowledge Base\n\n" + kbContent;

  // Convert UIMessages (from DefaultChatTransport) to model messages
  const modelMessages = await convertToModelMessages(messages);

  const result = streamText({
    model: anthropic(process.env.ANTHROPIC_MODEL ?? "claude-sonnet-4-6"),
    messages: [
      {
        role: "system" as const,
        content: systemPrompt,
        providerOptions: {
          anthropic: { cacheControl: { type: "ephemeral" } },
        },
      },
      ...modelMessages,
    ],
    maxOutputTokens: 150,
  });

  return result.toUIMessageStreamResponse();
}
