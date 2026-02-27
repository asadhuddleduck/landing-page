import { NextRequest, NextResponse } from "next/server";
import { generateObject } from "ai";
import { anthropic } from "@ai-sdk/anthropic";
import { z } from "zod";
import { db } from "@/lib/db";

export const runtime = "nodejs";
export const maxDuration = 30;

// ---------------------------------------------------------------------------
// In-memory rate limiting: per visitor_id
// ---------------------------------------------------------------------------
const rateLimitMap = new Map<string, { count: number; windowStart: number }>();
const RATE_LIMIT_MAX = 200; // max requests per window
const RATE_LIMIT_WINDOW_MS = 60 * 60 * 1000; // 1 hour
const MAX_MESSAGES = 50;

function isRateLimited(visitorId: string): boolean {
  if (!visitorId) return false;
  const now = Date.now();
  const entry = rateLimitMap.get(visitorId);

  if (!entry || now - entry.windowStart > RATE_LIMIT_WINDOW_MS) {
    rateLimitMap.set(visitorId, { count: 1, windowStart: now });
    return false;
  }

  entry.count++;
  return entry.count > RATE_LIMIT_MAX;
}

// Cleanup stale entries every 10 minutes
setInterval(() => {
  const now = Date.now();
  for (const [key, entry] of rateLimitMap) {
    if (now - entry.windowStart > RATE_LIMIT_WINDOW_MS) {
      rateLimitMap.delete(key);
    }
  }
}, 10 * 60 * 1000).unref();

// ---------------------------------------------------------------------------
// Extraction schema
// ---------------------------------------------------------------------------
const extractionSchema = z.object({
  business_name: z.string().describe("The visitor's business name, or empty string if not mentioned"),
  location_count: z.string().describe("Number of locations, or empty string if not mentioned"),
  main_challenge: z.string().describe("The main marketing challenge they described, or empty string"),
  visitor_role: z.string().describe("Their role (owner, manager, marketing, etc.), or empty string"),
  is_fb: z.boolean().describe("Whether the visitor is in the food & beverage industry"),
  objections_raised: z.string().describe("Any objections or concerns they raised, or empty string"),
  reached_checkout: z.boolean().describe("Whether the conversation progressed to discussing checkout/payment"),
  conversation_outcome: z.string().describe("Brief outcome: e.g. 'booked', 'interested', 'dropped off', 'not qualified'"),
});

// ---------------------------------------------------------------------------
// POST handler
// ---------------------------------------------------------------------------
export async function POST(request: NextRequest) {
  // Handle both application/json and text/plain (sendBeacon sends text/plain)
  let body: {
    conversationId?: string;
    messages?: { role: string; content: string }[];
    dynamicVariables?: Record<string, string>;
    durationSecs?: number;
  };

  try {
    const raw = await request.text();
    body = JSON.parse(raw);
  } catch {
    return NextResponse.json({ error: "Invalid JSON" }, { status: 400 });
  }

  const { conversationId, messages, dynamicVariables = {}, durationSecs = 0 } = body;

  if (!conversationId) {
    return NextResponse.json({ error: "Missing conversationId" }, { status: 400 });
  }

  if (!Array.isArray(messages) || messages.length === 0) {
    return NextResponse.json({ error: "Missing or empty messages" }, { status: 400 });
  }

  const visitorId = dynamicVariables.visitor_id ?? "";

  // Rate limit check
  if (isRateLimited(visitorId)) {
    return NextResponse.json({ error: "Rate limit exceeded" }, { status: 429 });
  }

  // Cap messages
  const capped = messages.slice(0, MAX_MESSAGES);

  // Build transcript
  const transcript = capped
    .map((m) => `${m.role}: ${m.content}`)
    .join("\n");

  // INSERT OR REPLACE into conversations
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
        "diy-sonnet-4.6",
        visitorId,
        "", // visitor_name
        "", // visitor_email
        "", // visitor_phone
        "", // visitor_role (updated by Haiku extraction below)
        "", // business_name (updated by Haiku extraction below)
        "", // location_count (updated by Haiku extraction below)
        "", // main_challenge (updated by Haiku extraction below)
        0,  // is_fb (updated by Haiku extraction below)
        "", // objections_raised (updated by Haiku extraction below)
        0,  // reached_checkout (updated by Haiku extraction below)
        "", // conversation_outcome — extracted later
        transcript,
        durationSecs,
        dynamicVariables.utm_source ?? "",
        dynamicVariables.utm_medium ?? "",
        dynamicVariables.utm_campaign ?? "",
      ],
    });
  } catch (err) {
    console.error("[chat/save] DB insert error:", err);
    return NextResponse.json({ error: "Failed to save" }, { status: 500 });
  }

  // Run Haiku extraction on the transcript
  let extracted: z.infer<typeof extractionSchema> | null = null;

  try {
    const result = await generateObject({
      model: anthropic("claude-haiku-4-5"),
      schema: extractionSchema,
      prompt: `Extract structured data from this sales conversation transcript:\n\n${transcript}`,
    });
    extracted = result.object;

    // Update the row with extracted fields
    await db.execute({
      sql: `UPDATE conversations SET
        visitor_role = ?,
        business_name = ?,
        location_count = ?,
        main_challenge = ?,
        is_fb = ?,
        objections_raised = ?,
        reached_checkout = ?,
        conversation_outcome = ?
      WHERE conversation_id = ?`,
      args: [
        extracted.visitor_role,
        extracted.business_name,
        extracted.location_count,
        extracted.main_challenge,
        extracted.is_fb ? 1 : 0,
        extracted.objections_raised,
        extracted.reached_checkout ? 1 : 0,
        extracted.conversation_outcome,
        conversationId,
      ],
    });
  } catch (err) {
    console.error("[chat/save] Extraction error:", err);
    // Still return success — transcript was saved even if extraction failed
  }

  return NextResponse.json({
    saved: true,
    extracted: extracted ?? undefined,
  });
}
