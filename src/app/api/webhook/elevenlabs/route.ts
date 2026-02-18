import { NextRequest, NextResponse } from "next/server";
import { createHmac, timingSafeEqual } from "crypto";
import { db } from "@/lib/db";

export const runtime = "nodejs";

/**
 * Verify ElevenLabs webhook signature (HMAC-SHA256).
 * Header format: ElevenLabs-Signature: t=<timestamp>,v0=<signature>
 */
function verifySignature(body: string, header: string | null, secret: string): boolean {
  if (!header) return false;

  const parts: Record<string, string> = {};
  for (const part of header.split(",")) {
    const [key, ...rest] = part.split("=");
    parts[key] = rest.join("=");
  }

  const timestamp = parts["t"];
  const signature = parts["v0"];
  if (!timestamp || !signature) return false;

  // Reject timestamps older than 5 minutes
  const age = Math.abs(Date.now() / 1000 - Number(timestamp));
  if (age > 300) return false;

  const expected = createHmac("sha256", secret)
    .update(`${timestamp}.${body}`)
    .digest("hex");

  try {
    return timingSafeEqual(Buffer.from(signature), Buffer.from(expected));
  } catch {
    return false;
  }
}

export async function POST(request: NextRequest) {
  const body = await request.text();
  const sig = request.headers.get("elevenlabs-signature");
  const secret = process.env.ELEVENLABS_WEBHOOK_SECRET;

  if (!secret) {
    console.error("[elevenlabs-webhook] Missing ELEVENLABS_WEBHOOK_SECRET");
    return NextResponse.json({ error: "Not configured" }, { status: 500 });
  }

  if (!verifySignature(body, sig, secret)) {
    console.error("[elevenlabs-webhook] Signature verification failed");
    return NextResponse.json({ error: "Invalid signature" }, { status: 400 });
  }

  let payload;
  try {
    payload = JSON.parse(body);
  } catch {
    return NextResponse.json({ error: "Invalid JSON" }, { status: 400 });
  }

  const conversationId = payload.conversation_id;
  if (!conversationId) {
    return NextResponse.json({ error: "Missing conversation_id" }, { status: 400 });
  }

  // Extract data collection fields (set in ElevenLabs Analysis tab)
  const data = payload.data_collection ?? payload.analysis?.data_collection ?? {};

  // Extract dynamic variables passed from the widget
  const dynVars = payload.dynamic_variables ?? payload.conversation_initiation_metadata?.dynamic_variables ?? {};

  // Build transcript from messages array
  let transcript = "";
  if (Array.isArray(payload.transcript)) {
    transcript = payload.transcript
      .map((m: { role: string; message: string }) => `${m.role}: ${m.message}`)
      .join("\n");
  }

  try {
    await db.execute({
      sql: `INSERT OR REPLACE INTO conversations (
        id, conversation_id, agent_id,
        visitor_id, visitor_name, visitor_email, visitor_phone,
        visitor_role, business_name, location_count, main_challenge,
        is_fb, objections_raised, reached_checkout, conversation_outcome,
        transcript, duration_secs,
        utm_source, utm_medium, utm_campaign
      ) VALUES (
        ?, ?, ?,
        ?, ?, ?, ?,
        ?, ?, ?, ?,
        ?, ?, ?, ?,
        ?, ?,
        ?, ?, ?
      )`,
      args: [
        conversationId,
        conversationId,
        payload.agent_id ?? "",
        dynVars.visitor_id ?? "",
        data.visitor_name ?? "",
        data.visitor_email ?? "",
        data.visitor_phone ?? "",
        data.visitor_role ?? "",
        data.business_name ?? "",
        data.location_count ?? "",
        data.main_challenge ?? "",
        data.is_fb === true || data.is_fb === "true" ? 1 : 0,
        data.objections_raised ?? "",
        data.reached_checkout === true || data.reached_checkout === "true" ? 1 : 0,
        data.conversation_outcome ?? "",
        transcript,
        payload.metadata?.duration_secs ?? payload.call_duration_secs ?? 0,
        dynVars.utm_source ?? "",
        dynVars.utm_medium ?? "",
        dynVars.utm_campaign ?? "",
      ],
    });
  } catch (err) {
    console.error("[elevenlabs-webhook] DB insert error:", err);
    // Still return 200 to avoid retries
  }

  return NextResponse.json({ received: true });
}
