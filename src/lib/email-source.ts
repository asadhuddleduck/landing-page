import { createHmac, timingSafeEqual } from "node:crypto";
import type { Client, InStatement } from "@libsql/client";
import { createEmailSource, stableEmailJobId, type EmailReceipt, type EmailRequest } from "./hatchflow-email.ts";

export function landingPageAcceptedStatements(request: EmailRequest, receipt: EmailReceipt): InStatement[] {
  if (request.category !== "abandoned-cart") return [];
  const sessionId = String(request.eligibility?.sessionId ?? "");
  if (!sessionId || request.sourceJobId !== stableEmailJobId("abandoned-cart", sessionId)) {
    throw new Error("Checkout receipt did not match the saved source job");
  }
  return [{ sql: "UPDATE checkouts SET nudged_at = COALESCE(nudged_at, ?) WHERE session_id = ? AND lower(trim(email)) = ?",
    args: [receipt.acceptedAt!, sessionId, request.to] }];
}

export function landingPageEmailSource(database: Client, overrides?: { endpoint?: string; secret?: string; fetcher?: typeof fetch }) {
  return createEmailSource({ source: "landing-page", database,
    endpoint: overrides?.endpoint ?? process.env.HATCHFLOW_EMAIL_URL?.trim() ?? "https://hatchflow.app/api/notify/email",
    secret: overrides?.secret ?? process.env.HATCHFLOW_EMAIL_SECRET?.trim() ?? "",
    fetcher: overrides?.fetcher, acceptedStatements: landingPageAcceptedStatements });
}

export async function landingPageEligibility(database: Client, request: EmailRequest, isPaid: (sessionId: string) => Promise<boolean>) {
  const sessionId = String(request.eligibility?.sessionId ?? "");
  if (request.source !== "landing-page" || request.brand !== "huddleduck" || request.purpose !== "marketing" ||
    request.category !== "abandoned-cart" || request.sourceJobId !== stableEmailJobId("abandoned-cart", sessionId)) {
    return { eligible: false, reason: "unknown_marketing_job" };
  }
  const result = await database.execute({
    sql: `SELECT c.nudged_at, p.allowed, p.evidence_ref,
      EXISTS(SELECT 1 FROM email_source_suppressions s WHERE s.email = lower(trim(c.email))) AS suppressed,
      EXISTS(SELECT 1 FROM purchases x WHERE x.stripe_session_id = c.session_id OR lower(trim(x.email)) = ?) AS purchased
      FROM checkouts c LEFT JOIN email_marketing_permissions p ON p.email = lower(trim(c.email))
      WHERE c.session_id = ? AND lower(trim(c.email)) = ?`, args: [request.to, sessionId, request.to] });
  const row = result.rows[0];
  if (!row || row.nudged_at) return { eligible: false, reason: "checkout_no_longer_due" };
  if (Number(row.suppressed)) return { eligible: false, reason: "unsubscribed" };
  if (Number(row.purchased)) return { eligible: false, reason: "already_purchased" };
  if (Number(row.allowed) !== 1 || !row.evidence_ref) return { eligible: false, reason: "permission_not_verified" };
  // A source/provider outage throws so HatchFlow postpones. It must never be
  // mistaken for an unpaid customer or a permanent eligibility decision.
  if (await isPaid(sessionId)) return { eligible: false, reason: "already_paid" };
  return { eligible: true, contentVersion: request.contentVersion };
}

export function emailUnsubscribeToken(email: string, secret = process.env.EMAIL_UNSUB_SECRET?.trim() ?? ""): string {
  if (!secret) throw new Error("EMAIL_UNSUB_SECRET is not set");
  return createHmac("sha256", secret).update(email.trim().toLowerCase()).digest("hex");
}

export function verifyEmailUnsubscribe(email: string, token: string): boolean {
  if (!email || !token) return false;
  const expected = Buffer.from(emailUnsubscribeToken(email));
  const actual = Buffer.from(token);
  return expected.length === actual.length && timingSafeEqual(expected, actual);
}

export function emailUnsubscribeUrl(email: string): string {
  return `https://start.huddleduck.co.uk/api/email/unsubscribe?${new URLSearchParams({ e: email.trim().toLowerCase(), t: emailUnsubscribeToken(email) })}`;
}
