import { NextRequest, NextResponse } from "next/server";
import { stripe } from "@/lib/stripe";

export const runtime = "nodejs";

function getPriceId(): string {
  const id = process.env.STRIPE_PRICE_ID?.trim();
  if (!id) throw new Error("STRIPE_PRICE_ID environment variable is not set");
  return id;
}

// Simple in-memory rate limiting
const rateLimitMap = new Map<string, { count: number; resetAt: number }>();
const RATE_LIMIT = 5;
const RATE_WINDOW = 600_000; // 10 minutes

export async function POST(request: NextRequest) {
  try {
    // Rate limit by IP
    const ip = request.headers.get("x-forwarded-for")?.split(",")[0]?.trim() || "unknown";
    const now = Date.now();
    const entry = rateLimitMap.get(ip);
    if (entry && now < entry.resetAt) {
      if (entry.count >= RATE_LIMIT) {
        return NextResponse.json({ error: "Too many requests" }, { status: 429 });
      }
      entry.count++;
    } else {
      rateLimitMap.set(ip, { count: 1, resetAt: now + RATE_WINDOW });
    }

    const body = await request.json();
    if (typeof body !== "object" || body === null) {
      return NextResponse.json({ error: "Invalid request" }, { status: 400 });
    }
    const { visitor_id, utm_source, utm_medium, utm_campaign } = body;

    const origin = "https://start.huddleduck.co.uk";

    const session = await stripe.checkout.sessions.create({
      mode: "payment",
      line_items: [{ price: getPriceId(), quantity: 1 }],
      payment_method_types: ["card"],
      billing_address_collection: "required",
      phone_number_collection: { enabled: true },
      customer_creation: "always",
      success_url: `${origin}/success?session_id={CHECKOUT_SESSION_ID}`,
      cancel_url: `${origin}/#checkout`,
      metadata: {
        visitor_id: visitor_id ?? "",
        utm_source: utm_source ?? "",
        utm_medium: utm_medium ?? "",
        utm_campaign: utm_campaign ?? "",
      },
    });

    return NextResponse.json({ url: session.url });
  } catch (err) {
    console.error("[checkout] Error creating session:", err);
    return NextResponse.json(
      { error: "Failed to create checkout session" },
      { status: 500 }
    );
  }
}
