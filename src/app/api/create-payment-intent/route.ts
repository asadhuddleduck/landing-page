import { NextRequest, NextResponse } from "next/server";
import { stripe } from "@/lib/stripe";
import { addContact, triggerEvent } from "@/lib/loops";

export const runtime = "nodejs";

// Simple in-memory rate limiting (resets on cold start, basic bot protection)
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
    const {
      email,
      name,
      phone,
      visitor_id,
      utm_source,
      utm_medium,
      utm_campaign,
      fbc,
      fbp,
    } = body;

    if (!email || typeof email !== "string" || !EMAIL_REGEX.test(email.trim())) {
      return NextResponse.json({ error: "Valid email is required" }, { status: 400 });
    }

    const ua = request.headers.get("user-agent") ?? "";

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

    // Create PaymentIntent attached to the customer
    const paymentIntent = await stripe.paymentIntents.create({
      amount: 49700,
      currency: "gbp",
      customer: customer.id,
      receipt_email: email,
      automatic_payment_methods: { enabled: true },
      metadata: {
        tier: "trial",
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

    // Fire checkout_started event to Loops (enables abandoned cart recovery).
    // Non-blocking: don't let Loops failures break the checkout flow.
    addContact({
      email,
      firstName: name?.split(" ")[0] ?? null,
      lastName: name?.split(" ").slice(1).join(" ") || null,
      source: "checkout_started",
      utmSource: utm_source ?? null,
      utmMedium: utm_medium ?? null,
      utmCampaign: utm_campaign ?? null,
    })
      .then(() => triggerEvent(email, "checkout_started", {
        amount: 497,
        currency: "GBP",
        product: "AI Ad Engine Trial",
        payment_intent_id: paymentIntent.id,
      }))
      .catch((err) => console.error("[create-payment-intent] Loops error:", err));

    return NextResponse.json({
      clientSecret: paymentIntent.client_secret,
      paymentIntentId: paymentIntent.id,
    });
  } catch (err) {
    console.error("[create-payment-intent] Error:", err);
    return NextResponse.json(
      { error: "Failed to create payment intent" },
      { status: 500 }
    );
  }
}
