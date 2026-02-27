import { NextRequest, NextResponse } from "next/server";
import type Stripe from "stripe";
import { stripe } from "@/lib/stripe";
import { db } from "@/lib/db";
import { EXCHANGE_RATES, RATES_LAST_UPDATED, getChargeAmountInSmallestUnit, getDisplayPrice } from "@/lib/currency";

export const runtime = "nodejs";

// Warn if exchange rates are stale (> 60 days old)
const ratesAge = (Date.now() - new Date(RATES_LAST_UPDATED).getTime()) / 86_400_000;
if (ratesAge > 60) {
  console.warn(`[checkout] Exchange rates are ${Math.round(ratesAge)} days old (last updated ${RATES_LAST_UPDATED}). Update src/lib/currency.ts.`);
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
    const { visitor_id, utm_source, utm_medium, utm_campaign, tier, email, name, phone, fbc, fbp, currency } = body;

    if (!email || typeof email !== "string" || !EMAIL_REGEX.test(email.trim())) {
      return NextResponse.json({ error: "Valid email is required" }, { status: 400 });
    }

    // Validate currency — must be GBP or a supported exchange rate
    const resolvedCurrency: string = (typeof currency === "string" && currency.length > 0) ? currency.toUpperCase() : "GBP";
    if (resolvedCurrency !== "GBP" && !EXCHANGE_RATES[resolvedCurrency]) {
      return NextResponse.json({ error: "Unsupported currency" }, { status: 400 });
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

    // Build line items based on tier + currency
    let lineItems: Stripe.Checkout.SessionCreateParams.LineItem[];
    let mode: Stripe.Checkout.SessionCreateParams["mode"];

    if (resolvedTier === "unlimited") {
      mode = "subscription";
      if (resolvedCurrency === "GBP") {
        // Use existing price ID for GBP
        const priceId = process.env.STRIPE_UNLIMITED_PRICE_ID?.trim();
        if (!priceId) throw new Error("STRIPE_UNLIMITED_PRICE_ID environment variable is not set");
        lineItems = [{ price: priceId, quantity: 1 }];
      } else {
        // Use price_data with computed local amount for non-GBP
        lineItems = [{
          price_data: {
            currency: resolvedCurrency.toLowerCase(),
            product: process.env.STRIPE_UNLIMITED_PRODUCT_ID!,
            unit_amount: getChargeAmountInSmallestUnit(1300, resolvedCurrency, "unlimited"),
            recurring: { interval: "month" },
          },
          quantity: 1,
        }];
      }
    } else {
      // Trial — always use existing price ID (Adaptive Pricing handles non-GBP)
      mode = "payment";
      const priceId = process.env.STRIPE_PRICE_ID?.trim();
      if (!priceId) throw new Error("STRIPE_PRICE_ID environment variable is not set");
      lineItems = [{ price: priceId, quantity: 1 }];
    }

    const sessionParams: Stripe.Checkout.SessionCreateParams = {
      mode,
      line_items: lineItems,
      billing_address_collection: "required",
      phone_number_collection: { enabled: true },
      customer: customer.id,
      success_url: `${origin}/success?session_id={CHECKOUT_SESSION_ID}`,
      cancel_url: `${origin}/#checkout`,
      metadata: {
        tier: resolvedTier,
        currency: resolvedCurrency,
        visitor_id: visitor_id ?? "",
        utm_source: utm_source ?? "",
        utm_medium: utm_medium ?? "",
        utm_campaign: utm_campaign ?? "",
        fbc: fbc ?? "",
        fbp: fbp ?? "",
        client_ip: ip,
        client_ua: ua.slice(0, 500),
      },
    };

    // Enable Adaptive Pricing for non-GBP trial (Stripe auto-converts)
    const session = await stripe.checkout.sessions.create({
      ...sessionParams,
      ...(resolvedTier === "trial" && resolvedCurrency !== "GBP"
        ? { adaptive_pricing: { enabled: true } } as Record<string, unknown>
        : {}),
    } as Stripe.Checkout.SessionCreateParams);

    // Track checkout start for abandoned cart recovery
    const displayAmount = resolvedCurrency === "GBP"
      ? (resolvedTier === "unlimited" ? 1300 : 497)
      : getDisplayPrice(resolvedTier === "unlimited" ? 1300 : 497, resolvedCurrency, resolvedTier as "trial" | "unlimited").amount;

    await db.execute({
      sql: `INSERT OR IGNORE INTO checkouts (email, name, session_id, amount, currency, tier, created_at)
            VALUES (?, ?, ?, ?, ?, ?, datetime('now'))`,
      args: [
        email,
        name || null,
        session.id,
        displayAmount,
        resolvedCurrency,
        resolvedTier,
      ],
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
