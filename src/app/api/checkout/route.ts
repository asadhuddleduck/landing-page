import { NextRequest, NextResponse } from "next/server";
import { stripe } from "@/lib/stripe";

export const runtime = "nodejs";

function getPriceId(tier: string): string {
  if (tier === "unlimited") {
    const id = process.env.STRIPE_UNLIMITED_PRICE_ID?.trim();
    if (!id) throw new Error("STRIPE_UNLIMITED_PRICE_ID environment variable is not set");
    return id;
  }
  const id = process.env.STRIPE_PRICE_ID?.trim();
  if (!id) throw new Error("STRIPE_PRICE_ID environment variable is not set");
  return id;
}

// Simple in-memory rate limiting
const rateLimitMap = new Map<string, { count: number; resetAt: number }>();
const RATE_LIMIT = 5;
const RATE_WINDOW = 600_000; // 10 minutes

const EMAIL_REGEX = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

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
    const { visitor_id, utm_source, utm_medium, utm_campaign, tier, email, name, phone, fbc, fbp, promoCode } = body; // --- DISCOUNT CODE ---

    if (!email || typeof email !== "string" || !EMAIL_REGEX.test(email.trim())) {
      return NextResponse.json({ error: "Valid email is required" }, { status: 400 });
    }

    const ua = request.headers.get("user-agent") ?? "";
    const resolvedTier = tier === "unlimited" ? "unlimited" : "trial";
    const origin = "https://start.huddleduck.co.uk";

    // Find existing customer by email, or create a new one
    const existing = await stripe.customers.list({ email, limit: 1 });
    let customer;
    if (existing.data.length > 0) {
      customer = await stripe.customers.update(existing.data[0].id, {
        name: name || undefined,
        phone: phone || undefined,
      });
    } else {
      customer = await stripe.customers.create({
        email,
        name: name || undefined,
        phone: phone || undefined,
      });
    }

    // --- START DISCOUNT CODE ---
    let discounts: { promotion_code: string }[] | undefined;
    if (promoCode && typeof promoCode === "string") {
      const promos = await stripe.promotionCodes.list({
        code: promoCode.trim().toUpperCase(),
        active: true,
        limit: 1,
      });
      if (promos.data.length > 0) {
        discounts = [{ promotion_code: promos.data[0].id }];
      } else {
        return NextResponse.json({ error: "Invalid discount code" }, { status: 400 });
      }
    }
    // --- END DISCOUNT CODE ---

    const session = await stripe.checkout.sessions.create({
      mode: resolvedTier === "unlimited" ? "subscription" : "payment",
      line_items: [{ price: getPriceId(resolvedTier), quantity: 1 }],
      payment_method_types: ["card"],
      billing_address_collection: "required",
      phone_number_collection: { enabled: true },
      customer: customer.id,
      ...(discounts ? { discounts } : {}), // --- DISCOUNT CODE ---
      success_url: `${origin}/success?session_id={CHECKOUT_SESSION_ID}`,
      cancel_url: `${origin}/#checkout`,
      metadata: {
        tier: resolvedTier,
        visitor_id: visitor_id ?? "",
        utm_source: utm_source ?? "",
        utm_medium: utm_medium ?? "",
        utm_campaign: utm_campaign ?? "",
        fbc: fbc ?? "",
        fbp: fbp ?? "",
        client_ip: ip,
        client_ua: ua.slice(0, 500),
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
