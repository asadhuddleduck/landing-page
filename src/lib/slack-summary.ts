import { generateObject } from "ai";
import { anthropic } from "@ai-sdk/anthropic";
import { z } from "zod";

const summarySchema = z.object({
  summary: z
    .string()
    .describe(
      "A 2-3 sentence summary of the conversation. Cover who the visitor is, what they were interested in, and how the conversation ended."
    ),
  closing_improvements: z
    .string()
    .describe(
      "2-3 specific, actionable suggestions for how the AI agent could have better closed this deal or moved the visitor closer to purchase. Format as bullet points starting with • character. Reference actual moments from the conversation."
    ),
  pain_point: z
    .string()
    .describe(
      "The visitor's core pain point or problem they're trying to solve, in one short sentence. Empty string if not mentioned."
    ),
});

export type ConversationSummary = z.infer<typeof summarySchema> & {
  usage: { inputTokens: number; outputTokens: number };
};

export async function generateConversationSummary(
  transcript: string,
  context: {
    businessName: string;
    objectionsRaised: string;
    reachedCheckout: boolean;
  }
): Promise<ConversationSummary> {
  const contextLines = [
    context.businessName && `Business: ${context.businessName}`,
    `Reached checkout: ${context.reachedCheckout ? "Yes" : "No"}`,
    context.objectionsRaised && `Objections: ${context.objectionsRaised}`,
  ]
    .filter(Boolean)
    .join("\n");

  const result = await generateObject({
    model: anthropic("claude-haiku-4-5"),
    schema: summarySchema,
    prompt: `You are reviewing a sales conversation between an AI agent and a website visitor on a landing page for "Huddle Duck AI Ad Engine" (an AI-powered advertising product for restaurant chains, priced at £497 one-time or £1,300/month retainer).

Extracted context:
${contextLines}

Full transcript:
${transcript}

Generate a concise summary, the visitor's core pain point, and actionable closing improvement suggestions. For improvements, focus on what the AI agent could have done differently to convert this visitor. Be specific and reference actual moments in the conversation.`,
  });

  return {
    ...result.object,
    usage: {
      inputTokens: result.usage.inputTokens ?? 0,
      outputTokens: result.usage.outputTokens ?? 0,
    },
  };
}
