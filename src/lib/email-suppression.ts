import type { Client } from "@libsql/client";

export async function suppressMarketing(database: Client, email: string) {
  const lower = email.trim().toLowerCase();
  await database.batch([
    { sql: "UPDATE email_marketing_permissions SET allowed = 0, updated_at = CURRENT_TIMESTAMP WHERE email = ?", args: [lower] },
    { sql: `INSERT INTO email_source_suppressions (email, reason) VALUES (?, 'unsubscribed')
        ON CONFLICT(email) DO UPDATE SET reason = 'unsubscribed', mirrored_at = NULL`, args: [lower] },
  ], "write");
}

export async function mirrorPendingUnsubscribes(database: Client, overrides?: { endpoint?: string; secret?: string; fetcher?: typeof fetch; email?: string }) {
  const secret = overrides?.secret ?? process.env.HATCHFLOW_EMAIL_SECRET?.trim() ?? "";
  if (!secret) return 0;
  const endpoint = new URL(overrides?.endpoint ?? process.env.HATCHFLOW_EMAIL_URL?.trim() ?? "https://hatchflow.app/api/notify/email");
  if (endpoint.protocol !== "https:") throw new Error("HatchFlow suppression endpoint must use HTTPS");
  endpoint.pathname = `${endpoint.pathname.replace(/\/$/, "")}/suppressions`;
  const pending = await database.execute(overrides?.email
    ? { sql: "SELECT email, reason FROM email_source_suppressions WHERE mirrored_at IS NULL AND email = ?", args: [overrides.email.trim().toLowerCase()] }
    : "SELECT email, reason FROM email_source_suppressions WHERE mirrored_at IS NULL ORDER BY created_at LIMIT 100");
  let mirrored = 0;
  for (const row of pending.rows) {
    try {
      const response = await (overrides?.fetcher ?? fetch)(endpoint, {
        method: "POST", headers: { authorization: `Bearer ${secret}`, "content-type": "application/json" },
        body: JSON.stringify({ source: "landing-page", brand: "huddleduck", email: row.email, kind: "unsubscribe", reason: row.reason }),
        signal: AbortSignal.timeout(10_000),
      });
      if (!response.ok || (await response.json()).ok !== true) continue;
      await database.execute({ sql: "UPDATE email_source_suppressions SET mirrored_at = CURRENT_TIMESTAMP WHERE email = ? AND reason = ?", args: [row.email, row.reason] });
      mirrored++;
    } catch { /* Local suppression stands; the cron retries the durable mirror. */ }
  }
  return mirrored;
}
