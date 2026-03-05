import * as Sentry from "@sentry/nextjs";

const SLACK_WEBHOOK_URL = process.env.SLACK_WEBHOOK_URL;

interface ErrorContext {
  route: string;
  severity: "critical" | "warning";
  extra?: Record<string, unknown>;
}

/**
 * Report an error to Sentry + Slack (critical only).
 * Never throws. Safe to call in catch blocks.
 */
export async function reportError(
  error: unknown,
  ctx: ErrorContext
): Promise<void> {
  const err = error instanceof Error ? error : new Error(String(error));

  // Sentry
  Sentry.captureException(err, {
    tags: { route: ctx.route, severity: ctx.severity },
    extra: ctx.extra,
  });

  // Slack (critical only, server-side only)
  if (ctx.severity === "critical" && SLACK_WEBHOOK_URL) {
    try {
      await sendSlackErrorAlert(err, ctx);
    } catch {
      console.error("[error-reporting] Slack alert failed");
    }
  }

  // Always log for Vercel logs
  console.error(`[${ctx.route}] ${err.message}`, ctx.extra);
}

async function sendSlackErrorAlert(
  err: Error,
  ctx: ErrorContext
): Promise<void> {
  const stackSnippet = (err.stack ?? "").split("\n").slice(0, 5).join("\n");

  const blocks = [
    {
      type: "header",
      text: { type: "plain_text", text: "\ud83d\udd34  Error Alert", emoji: true },
    },
    {
      type: "section",
      fields: [
        { type: "mrkdwn", text: `*Route*\n\`${ctx.route}\`` },
        {
          type: "mrkdwn",
          text: `*Severity*\n${ctx.severity === "critical" ? "\ud83d\udea8 Critical" : "\u26a0\ufe0f Warning"}`,
        },
        {
          type: "mrkdwn",
          text: `*Error*\n${err.name}: ${err.message.slice(0, 150)}`,
        },
        {
          type: "mrkdwn",
          text: `*Time*\n${new Date().toLocaleString("en-GB", { timeZone: "Europe/London" })}`,
        },
      ],
    },
    { type: "divider" },
    {
      type: "section",
      text: {
        type: "mrkdwn",
        text: stackSnippet
          ? `\`\`\`${stackSnippet}\`\`\``.slice(0, 2900)
          : "_No stack trace available_",
      },
    },
    {
      type: "context",
      elements: [
        {
          type: "mrkdwn",
          text: ctx.extra
            ? `Extra: ${JSON.stringify(ctx.extra).slice(0, 200)}`
            : "No extra context",
        },
      ],
    },
  ];

  const response = await fetch(SLACK_WEBHOOK_URL!, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      blocks,
      text: `\ud83d\udd34 Error in ${ctx.route}: ${err.message.slice(0, 100)}`,
    }),
  });

  if (!response.ok) {
    const text = await response.text();
    throw new Error(`Slack error alert failed (${response.status}): ${text}`);
  }
}
