import { NextRequest, NextResponse } from "next/server";
import { sendConversionEvent } from "@/lib/meta-capi";

const VALID_EVENTS = new Set(["AIChat", "AIChatEngaged"]);

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { eventName, eventId, fbc, fbp } = body;

    if (!eventName || !VALID_EVENTS.has(eventName) || !eventId) {
      return NextResponse.json({ error: "Invalid request" }, { status: 400 });
    }

    const ip = req.headers.get("x-forwarded-for")?.split(",")[0]?.trim() || null;
    const ua = req.headers.get("user-agent") || null;

    await sendConversionEvent({
      eventName,
      eventId,
      eventSourceUrl: "https://start.huddleduck.co.uk",
      ipAddress: ip,
      userAgent: ua,
      fbc: fbc || null,
      fbp: fbp || null,
      contentName: "AI Sales Chat",
      contentCategory: "chat_engagement",
    });

    return NextResponse.json({ ok: true });
  } catch {
    return NextResponse.json({ error: "Internal error" }, { status: 500 });
  }
}
