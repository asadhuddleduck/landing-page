import { NextRequest, NextResponse } from "next/server";
import { after } from "next/server";
import { generateObject } from "ai";
import { anthropic } from "@ai-sdk/anthropic";
import { z } from "zod";
import { db } from "@/lib/db";
import { sendConversationNotification } from "@/lib/slack";
import { reportError } from "@/lib/error-reporting";
import { verifyChatToken } from "@/lib/chat-token";
import { sendConversionEvent } from "@/lib/meta-capi";

export const runtime = "nodejs";
export const maxDuration = 60;

// ---------------------------------------------------------------------------
// In-memory rate limiting: per IP
// ---------------------------------------------------------------------------
const rateLimitMap = new Map<string, { count: number; windowStart: number }>();
const RATE_LIMIT_MAX = 200; // max requests per window
const RATE_LIMIT_WINDOW_MS = 60 * 60 * 1000; // 1 hour
const MAX_MESSAGES = 50;
const MIN_USER_MESSAGES_FOR_SLACK = 3;

function isRateLimited(ip: string): boolean {
  if (ip === "unknown") return true;
  const now = Date.now();
  const entry = rateLimitMap.get(ip);

  if (!entry || now - entry.windowStart > RATE_LIMIT_WINDOW_MS) {
    rateLimitMap.set(ip, { count: 1, windowStart: now });
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
  visitor_email: z.string().describe("Email address if the visitor shared one during the conversation. Empty string if not mentioned."),
  visitor_phone: z.string().describe("Phone number if the visitor shared one during the conversation. Empty string if not mentioned."),
  is_fb: z.boolean().describe("Whether the visitor is in the food & beverage industry"),
  objections_raised: z.array(z.string()).describe("List of individual objections, each as a short label (e.g. 'price too high', 'wants ROI guarantee', 'needs partner approval', 'not ready yet'). Empty array if none."),
  buying_intent: z.number().min(1).max(5).describe(
    "Buying intent score: 1=just browsing or not F&B, 2=asked questions about the product, 3=discussed pricing or details, 4=asked how to buy or showed urgency, 5=explicitly said they want to purchase or clicked checkout"
  ),
  conversation_outcome: z.enum([
    "qualified",
    "not_qualified",
    "nurture",
    "dropped_off",
    "booked",
  ]).describe("qualified=F&B with buying intent, not_qualified=not F&B or not a real prospect, nurture=F&B and interested but not ready yet, dropped_off=left mid-conversation, booked=requested a call or demo"),
  qualification_reason: z.string().describe(
    "Brief reason for the outcome. E.g. 'Not in F&B, runs a clothing store', 'Owns 3 pizza shops, concerned about ROI but interested', 'Asked about pricing then went silent'"
  ),
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
    chatToken?: string;
  };

  try {
    const raw = await request.text();
    body = JSON.parse(raw);
  } catch {
    return NextResponse.json({ error: "Invalid JSON" }, { status: 400 });
  }

  const { conversationId, messages, dynamicVariables = {}, durationSecs = 0, chatToken } = body;

  if (!conversationId || typeof conversationId !== "string" || conversationId.length > 100) {
    return NextResponse.json({ error: "Invalid conversationId" }, { status: 400 });
  }

  if (!Array.isArray(messages) || messages.length === 0) {
    return NextResponse.json({ error: "Missing or empty messages" }, { status: 400 });
  }

  // Rate limit by IP
  const ip = request.headers.get("x-forwarded-for")?.split(",")[0]?.trim() || "unknown";
  if (isRateLimited(ip)) {
    return NextResponse.json({ error: "Rate limit exceeded" }, { status: 429 });
  }

  // Validate chat token (proves conversation went through /api/chat)
  if (!chatToken || !verifyChatToken(ip, chatToken)) {
    return NextResponse.json({ error: "Invalid session" }, { status: 403 });
  }

  const cap = (s: string | undefined, max = 200) =>
    (s ?? "").slice(0, max).replace(/[\n\r{}]/g, "");
  const visitorId = dynamicVariables.visitor_id ?? "";
  const chatVersion = cap(dynamicVariables.chat_version) || "diy-sonnet";

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
        utm_source, utm_medium, utm_campaign, chat_version
      ) VALUES (
        ?, ?, ?,
        ?, ?, ?, ?,
        ?, ?, ?, ?,
        ?, ?, ?, ?,
        ?, ?,
        ?, ?, ?, ?
      )`,
      args: [
        conversationId,
        conversationId,
        "diy-sonnet",
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
        cap(dynamicVariables.utm_source),
        cap(dynamicVariables.utm_medium),
        cap(dynamicVariables.utm_campaign),
        chatVersion,
      ],
    });
  } catch (err) {
    await reportError(err, {
      route: "/api/chat/save",
      severity: "critical",
      extra: { conversationId, step: "db-insert" },
    });
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
        visitor_email = ?,
        visitor_phone = ?,
        business_name = ?,
        location_count = ?,
        main_challenge = ?,
        is_fb = ?,
        objections_raised = ?,
        reached_checkout = ?,
        buying_intent = ?,
        conversation_outcome = ?,
        qualification_reason = ?
      WHERE conversation_id = ?`,
      args: [
        extracted.visitor_role,
        extracted.visitor_email,
        extracted.visitor_phone,
        extracted.business_name,
        extracted.location_count,
        extracted.main_challenge,
        extracted.is_fb ? 1 : 0,
        JSON.stringify(extracted.objections_raised),
        extracted.buying_intent >= 4 ? 1 : 0, // backwards compat: high intent = reached_checkout
        extracted.buying_intent,
        extracted.conversation_outcome,
        extracted.qualification_reason,
        conversationId,
      ],
    });
    // INSERT each objection into the normalized objections table
    if (extracted.objections_raised.length > 0) {
      await Promise.all(
        extracted.objections_raised.map((label) =>
          db.execute({
            sql: "INSERT INTO objections (conversation_id, label) VALUES (?, ?)",
            args: [conversationId, label],
          })
        )
      );
    }
  } catch (err) {
    await reportError(err, {
      route: "/api/chat/save",
      severity: "warning",
      extra: { conversationId, step: "haiku-extraction" },
    });
    // Still return success — transcript was saved even if extraction failed
  }

  // Fire Meta CAPI events + Slack notification after response is sent
  const userMessageCount = capped.filter((m) => m.role === "user").length;

  if (extracted) {
    const ext = extracted; // capture for after() closures (TS narrowing doesn't carry into async callbacks)
    const ua = request.headers.get("user-agent") || undefined;

    // Lead event: only when we captured contact info from an F&B visitor
    const hasContactInfo = (ext.visitor_email && ext.visitor_email !== "") ||
                           (ext.visitor_phone && ext.visitor_phone !== "");
    if (hasContactInfo && ext.is_fb) {
      after(async () => {
        try {
          await sendConversionEvent({
            eventName: "Lead",
            eventId: `lead_${conversationId}`,
            eventSourceUrl: "https://start.huddleduck.co.uk",
            email: ext.visitor_email || undefined,
            phone: ext.visitor_phone || undefined,
            ipAddress: ip,
            userAgent: ua,
            contentName: ext.business_name || "Unknown Business",
            contentCategory: ext.conversation_outcome,
          });
        } catch (err) {
          await reportError(err, {
            route: "/api/chat/save",
            severity: "warning",
            extra: { conversationId, step: "capi-lead" },
          });
        }
      });

      // Sync email to duck-emails drip sequence
      if (ext.visitor_email) {
        after(async () => {
          try {
            const duckUrl = process.env.DUCK_EMAILS_API_URL;
            const duckSecret = process.env.DUCK_EMAILS_API_SECRET;
            if (!duckUrl || !duckSecret) return;

            const res = await fetch(`${duckUrl}/api/contacts`, {
              method: "POST",
              headers: {
                "Content-Type": "application/json",
                Authorization: `Bearer ${duckSecret}`,
              },
              body: JSON.stringify({
                email: ext.visitor_email,
                source: "chat",
                metadata: {
                  business_name: ext.business_name || undefined,
                  buying_intent: ext.buying_intent,
                  conversation_outcome: ext.conversation_outcome,
                  conversation_id: conversationId,
                },
              }),
            });
            if (!res.ok) {
              console.error(`[save] Duck-emails sync failed: ${res.status}`);
            }
          } catch (err) {
            await reportError(err, {
              route: "/api/chat/save",
              severity: "warning",
              extra: { conversationId, step: "duck-emails-sync" },
            });
          }
        });
      }
    }

    // ViewContent event: engaged F&B visitor (discussed product)
    if (ext.buying_intent >= 2 && ext.is_fb) {
      after(async () => {
        try {
          await sendConversionEvent({
            eventName: "ViewContent",
            eventId: `vc_${conversationId}`,
            eventSourceUrl: "https://start.huddleduck.co.uk",
            ipAddress: ip,
            userAgent: ua,
            contentName: ext.business_name || "Unknown Business",
          });
        } catch (err) {
          await reportError(err, {
            route: "/api/chat/save",
            severity: "warning",
            extra: { conversationId, step: "capi-viewcontent" },
          });
        }
      });
    }

    // Slack notification
    if (userMessageCount >= MIN_USER_MESSAGES_FOR_SLACK) {
      after(async () => {
        try {
          await sendConversationNotification({
            conversationId,
            businessName: ext.business_name,
            visitorRole: ext.visitor_role,
            locationCount: ext.location_count,
            mainChallenge: ext.main_challenge,
            isFb: ext.is_fb,
            objections: ext.objections_raised,
            reachedCheckout: ext.buying_intent >= 4,
            buyingIntent: ext.buying_intent,
            conversationOutcome: ext.conversation_outcome,
            qualificationReason: ext.qualification_reason,
            visitorEmail: ext.visitor_email,
            visitorPhone: ext.visitor_phone,
            durationSecs,
            messageCount: capped.length,
            utmSource: cap(dynamicVariables.utm_source),
            utmMedium: cap(dynamicVariables.utm_medium),
            utmCampaign: cap(dynamicVariables.utm_campaign),
            transcript,
            chatVersion,
          });
        } catch (err) {
          await reportError(err, {
            route: "/api/chat/save",
            severity: "warning",
            extra: { conversationId, step: "slack-notification" },
          });
        }
      });
    }
  } else if (userMessageCount >= MIN_USER_MESSAGES_FOR_SLACK) {
    // Extraction failed but conversation was meaningful — send minimal Slack notification
    after(async () => {
      try {
        await sendConversationNotification({
          conversationId,
          businessName: "",
          visitorRole: "",
          locationCount: "",
          mainChallenge: "",
          isFb: false,
          objections: [],
          reachedCheckout: false,
          buyingIntent: 0,
          conversationOutcome: "dropped_off",
          qualificationReason: "Extraction failed — review transcript manually",
          visitorEmail: "",
          visitorPhone: "",
          durationSecs,
          messageCount: capped.length,
          utmSource: cap(dynamicVariables.utm_source),
          utmMedium: cap(dynamicVariables.utm_medium),
          utmCampaign: cap(dynamicVariables.utm_campaign),
          transcript,
          chatVersion,
        });
      } catch (err) {
        await reportError(err, {
          route: "/api/chat/save",
          severity: "warning",
          extra: { conversationId, step: "slack-fallback" },
        });
      }
    });
  }

  return NextResponse.json({
    saved: true,
    extracted: extracted ?? undefined,
  });
}
