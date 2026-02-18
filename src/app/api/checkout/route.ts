import { NextRequest, NextResponse } from "next/server";
import { stripe } from "@/lib/stripe";

export const runtime = "nodejs";

const PRICE_ID = process.env.STRIPE_PRICE_ID!.trim();

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { visitor_id, utm_source, utm_medium, utm_campaign } = body;

    const origin =
      request.headers.get("origin") || "https://start.huddleduck.co.uk";

    const session = await stripe.checkout.sessions.create({
      mode: "payment",
      line_items: [{ price: PRICE_ID, quantity: 1 }],
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
