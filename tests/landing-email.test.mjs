import { mkdtempSync, rmSync } from "node:fs";
import { tmpdir } from "node:os";
import { join } from "node:path";
import assert from "node:assert/strict";
import { test } from "node:test";
import { createClient } from "@libsql/client";
import { EMAIL_SOURCE_SCHEMA, stableEmailJobId } from "../src/lib/hatchflow-email.ts";
import { landingPageEligibility, landingPageEmailSource } from "../src/lib/email-source.ts";
import { suppressMarketing, mirrorPendingUnsubscribes } from "../src/lib/email-suppression.ts";

const email = "person@example.test";
const request = { source: "landing-page", sourceJobId: stableEmailJobId("abandoned-cart", "session-test"), brand: "huddleduck", purpose: "marketing", category: "abandoned-cart", to: email, subject: "Your requested checkout", text: "Checkout details", unsubUrl: "https://example.test/unsubscribe", contentVersion: "test-v1", eligibility: { sessionId: "session-test" } };
async function setup() {
  const directory = mkdtempSync(join(tmpdir(), "email-source-test-"));
  const database = createClient({ url: `file:${join(directory, "database.sqlite")}` });
  const close = database.close.bind(database);
  database.close = () => { close(); rmSync(directory, { recursive: true, force: true }); };
  await database.batch([...EMAIL_SOURCE_SCHEMA,
    "CREATE TABLE checkouts (session_id TEXT PRIMARY KEY, email TEXT, nudged_at TEXT)",
    "CREATE TABLE purchases (stripe_session_id TEXT, email TEXT)",
    { sql: "INSERT INTO checkouts VALUES ('session-test', ?, NULL)", args: [email] }], "write");
  return database;
}
async function permit(database) {
  await database.execute({ sql: "INSERT INTO email_marketing_permissions (email, allowed, evidence_ref, verified_at) VALUES (?, 1, 'synthetic-consent', '2026-09-12T09:00:00Z')", args: [email] });
}

test("captured checkout addresses do not imply permission and late purchases stop queued marketing", async () => {
  const database = await setup();
  try {
    assert.equal((await landingPageEligibility(database, request, async () => false)).reason, "permission_not_verified");
    await permit(database);
    assert.equal((await landingPageEligibility(database, request, async () => false)).eligible, true);
    await assert.rejects(landingPageEligibility(database, request, async () => { throw new Error("provider unavailable"); }), /provider unavailable/);
    assert.equal((await landingPageEligibility(database, request, async () => true)).reason, "already_paid");
    await database.execute({ sql: "INSERT INTO purchases VALUES ('another-paid-session', ?)", args: [email] });
    assert.equal((await landingPageEligibility(database, request, async () => false)).reason, "already_purchased");
  } finally { database.close(); }
});

test("checkout progress records only real acceptance and its timestamp", async () => {
  const database = await setup();
  try {
    const queued = { schemaVersion: 1, source: "landing-page", sourceJobId: request.sourceJobId, jobId: "hf-checkout-test", status: "queued" };
    const source = landingPageEmailSource(database, { endpoint: "https://hatchflow.example.test/api/notify/email", secret: "test-key", fetcher: async () => Response.json(queued) });
    await source.submit(request);
    assert.equal((await database.execute("SELECT nudged_at FROM checkouts")).rows[0].nudged_at, null);
    const accepted = { ...queued, status: "accepted", resendId: "provider-checkout-test", acceptedAt: "2026-09-12T10:00:00Z", receiptId: "checkout-receipt-test" };
    await source.recordReceipt(accepted);
    await source.recordReceipt(accepted);
    assert.equal((await database.execute("SELECT nudged_at FROM checkouts")).rows[0].nudged_at, accepted.acceptedAt);
  } finally { database.close(); }
});

test("local opt-out persists even while its HatchFlow mirror is unavailable", async () => {
  const database = await setup();
  try {
    await permit(database);
    await suppressMarketing(database, email);
    assert.equal((await landingPageEligibility(database, request, async () => false)).eligible, false);
    await database.execute("UPDATE email_marketing_permissions SET allowed = 1");
    assert.equal((await landingPageEligibility(database, request, async () => false)).reason, "unsubscribed");
    const options = { endpoint: "https://hatchflow.example.test/api/notify/email", secret: "test-key" };
    assert.equal(await mirrorPendingUnsubscribes(database, { ...options, fetcher: async () => new Response(null, { status: 503 }) }), 0);
    assert.equal(await mirrorPendingUnsubscribes(database, { ...options, fetcher: async (_url, init) => {
      assert.equal(JSON.parse(init.body).source, "landing-page");
      return Response.json({ ok: true });
    } }), 1);
  } finally { database.close(); }
});
