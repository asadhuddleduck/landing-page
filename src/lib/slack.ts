import { generateConversationSummary } from "./slack-summary";
import { db } from "./db";
import { signConversationUrl } from "./chat-token";
import * as Sentry from "@sentry/nextjs";

// ---------------------------------------------------------------------------
// Pricing (per million tokens)
// ---------------------------------------------------------------------------
const SONNET_INPUT_PER_MTOK = 3.0;
const SONNET_OUTPUT_PER_MTOK = 15.0;
const SONNET_CACHE_READ_PER_MTOK = 0.3;
const HAIKU_INPUT_PER_MTOK = 1.0;
const HAIKU_OUTPUT_PER_MTOK = 5.0;
const SYSTEM_PROMPT_TOKENS = 87_000;
const USD_TO_GBP = 0.79;

export interface SlackConversationPayload {
  conversationId: string;
  businessName: string;
  visitorRole: string;
  locationCount: string;
  mainChallenge: string;
  isFb: boolean;
  objections: string[];
  reachedCheckout: boolean;
  durationSecs: number;
  messageCount: number;
  utmSource: string;
  utmMedium: string;
  utmCampaign: string;
  transcript: string;
  chatVersion: string;
}

interface CostBreakdown {
  totalTokens: number;
  totalUsd: number;
  totalGbp: number;
}

function estimateTokens(text: string): number {
  return Math.ceil(text.length / 4);
}

function estimateCost(
  transcript: string,
  haikuUsage: { inputTokens: number; outputTokens: number },
  chatVersion: string
): CostBreakdown {
  const lines = transcript.split("\n").filter((l) => l.trim());
  const messages: { role: string; tokens: number }[] = [];
  for (const line of lines) {
    const colonIdx = line.indexOf(": ");
    if (colonIdx === -1) continue;
    messages.push({
      role: line.slice(0, colonIdx).trim(),
      tokens: estimateTokens(line.slice(colonIdx + 2)),
    });
  }

  let sonnetInputTokens = 0;
  let sonnetOutputTokens = 0;
  let cumulativeHistory = 0;
  const turns = Math.ceil(messages.length / 2);

  for (const msg of messages) {
    cumulativeHistory += msg.tokens;
    if (msg.role === "assistant") {
      sonnetInputTokens += cumulativeHistory;
      sonnetOutputTokens += msg.tokens;
    }
  }

  const systemTokens = SYSTEM_PROMPT_TOKENS;
  const sonnetCacheReadTokens = systemTokens * turns;
  const extractionInput = estimateTokens(transcript) + 100;
  const extractionOutput = 200;
  const haikuInputTokens = extractionInput + haikuUsage.inputTokens;
  const haikuOutputTokens = extractionOutput + haikuUsage.outputTokens;

  const sonnetCost =
    (sonnetInputTokens / 1_000_000) * SONNET_INPUT_PER_MTOK +
    (sonnetOutputTokens / 1_000_000) * SONNET_OUTPUT_PER_MTOK +
    (sonnetCacheReadTokens / 1_000_000) * SONNET_CACHE_READ_PER_MTOK;

  const haikuCost =
    (haikuInputTokens / 1_000_000) * HAIKU_INPUT_PER_MTOK +
    (haikuOutputTokens / 1_000_000) * HAIKU_OUTPUT_PER_MTOK;

  const totalUsd = sonnetCost + haikuCost;
  const totalTokens =
    sonnetInputTokens + sonnetOutputTokens + sonnetCacheReadTokens + haikuInputTokens + haikuOutputTokens;

  return { totalTokens, totalUsd, totalGbp: totalUsd * USD_TO_GBP };
}

function formatDuration(secs: number): string {
  if (secs < 60) return `${secs}s`;
  const mins = Math.floor(secs / 60);
  const rem = secs % 60;
  return rem > 0 ? `${mins}m ${rem}s` : `${mins}m`;
}

function formatTokens(n: number): string {
  if (n >= 1000) return `${(n / 1000).toFixed(1)}k`;
  return String(n);
}

/** Fetch objection counts from the normalized objections table (last 30 days). */
async function fetchObjectionCounts(): Promise<Map<string, number>> {
  try {
    const result = await db.execute({
      sql: "SELECT label, COUNT(*) as cnt FROM objections WHERE created_at >= datetime('now', '-30 days') GROUP BY label",
      args: [],
    });
    const counts = new Map<string, number>();
    for (const row of result.rows) {
      counts.set((row.label as string).toLowerCase().trim(), row.cnt as number);
    }
    return counts;
  } catch (err) {
    Sentry.captureException(err, { tags: { route: "slack", severity: "warning" } });
    console.error("[slack] Failed to fetch objection counts:", err);
    return new Map();
  }
}

/** Save pain point to normalized pain_points table. */
async function savePainPoint(conversationId: string, label: string): Promise<void> {
  if (!label) return;
  try {
    await db.execute({
      sql: "INSERT INTO pain_points (conversation_id, label) VALUES (?, ?)",
      args: [conversationId, label],
    });
  } catch (err) {
    Sentry.captureException(err, { tags: { route: "slack", severity: "warning" } });
    console.error("[slack] Failed to save pain point:", err);
  }
}

function buildBlocks(
  payload: SlackConversationPayload,
  analysis: {
    summary: string;
    closingImprovements: string;
    painPoint: string;
  },
  objectionCounts: Map<string, number>,
  cost: CostBreakdown
): object[] {
  const sig = signConversationUrl(payload.conversationId);
  const viewerUrl = `https://start.huddleduck.co.uk/conversations/${payload.conversationId}?sig=${sig}`;
  const title = payload.businessName || "Unknown visitor";

  const blocks: object[] = [
    {
      type: "header",
      text: { type: "plain_text", text: `🤖  ${title}`, emoji: true },
    },
    {
      type: "section",
      fields: [
        { type: "mrkdwn", text: `*👤 Who*\n${payload.visitorRole || "Unknown"} · ${payload.locationCount || "?"} locations` },
        { type: "mrkdwn", text: `*⏱️ Duration*\n${formatDuration(payload.durationSecs)} · ${payload.messageCount} messages` },
        { type: "mrkdwn", text: `*📣 Source*\n${payload.utmSource ? `${payload.utmSource}${payload.utmMedium ? ` / ${payload.utmMedium}` : ""}` : "Direct"}` },
        { type: "mrkdwn", text: `*💰 Cost*\n£${cost.totalGbp.toFixed(3)} (~${formatTokens(cost.totalTokens)} tokens)` },
      ],
    },
  ];

  // Pain point
  if (analysis.painPoint) {
    blocks.push({
      type: "section",
      text: { type: "mrkdwn", text: `*🔥 Pain point:* ${analysis.painPoint}` },
    });
  }

  // Objections (each on its own line with count from objections table)
  if (payload.objections.length > 0) {
    const objectionLines = payload.objections.map((obj, i) => {
      const count = objectionCounts.get(obj.toLowerCase().trim()) ?? 0;
      const countLabel = count > 1 ? `  _(${count}x in last 30 days)_` : "  _(1st time)_";
      return `${i + 1}. ${obj}${countLabel}`;
    });
    blocks.push({
      type: "section",
      text: { type: "mrkdwn", text: `*🚧 Objections*\n${objectionLines.join("\n")}` },
    });
  }

  blocks.push(
    { type: "divider" },
    {
      type: "section",
      text: { type: "mrkdwn", text: `> ${analysis.summary}` },
    },
    {
      type: "section",
      text: { type: "mrkdwn", text: `*💡 Closing tips*\n${analysis.closingImprovements}` },
    },
    {
      type: "actions",
      elements: [
        {
          type: "button",
          text: { type: "plain_text", text: "View Full Conversation →", emoji: true },
          url: viewerUrl,
          style: "primary",
        },
      ],
    },
    {
      type: "context",
      elements: [
        {
          type: "mrkdwn",
          text: `${new Date().toLocaleString("en-GB", { timeZone: "Europe/London" })}`,
        },
      ],
    }
  );

  return blocks;
}

export async function sendConversationNotification(
  payload: SlackConversationPayload
): Promise<void> {
  const webhookUrl = process.env.SLACK_WEBHOOK_URL;
  if (!webhookUrl) {
    console.warn("[slack] SLACK_WEBHOOK_URL not set, skipping notification");
    return;
  }

  const [objectionCounts, result] = await Promise.all([
    fetchObjectionCounts(),
    generateConversationSummary(payload.transcript, {
      businessName: payload.businessName,
      objectionsRaised: payload.objections.join(", "),
      reachedCheckout: payload.reachedCheckout,
    }),
  ]);

  // Save pain point to normalized table
  await savePainPoint(payload.conversationId, result.pain_point);

  const cost = estimateCost(payload.transcript, result.usage, payload.chatVersion);

  const body = {
    blocks: buildBlocks(
      payload,
      {
        summary: result.summary,
        closingImprovements: result.closing_improvements,
        painPoint: result.pain_point,
      },
      objectionCounts,
      cost
    ),
    text: `New conversation: ${payload.businessName || "Unknown"} — ${result.pain_point || "no pain point identified"}`,
  };

  const response = await fetch(webhookUrl, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(body),
  });

  if (!response.ok) {
    const text = await response.text();
    throw new Error(`Slack webhook failed (${response.status}): ${text}`);
  }

  console.log(`[slack] Notification sent for ${payload.conversationId} (£${cost.totalGbp.toFixed(3)})`);
}
