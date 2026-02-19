import { NextRequest, NextResponse } from "next/server";
import { stripe } from "@/lib/stripe";

export const runtime = "nodejs";

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const {
      email,
      name,
      phone,
      visitor_id,
      utm_source,
      utm_medium,
      utm_campaign,
    } = body;

    if (!email) {
      return NextResponse.json({ error: "Email is required" }, { status: 400 });
    }

    // Create a Stripe Customer so we capture contact details
    const customer = await stripe.customers.create({
      email,
      name: name || undefined,
      phone: phone || undefined,
    });

    // Create PaymentIntent attached to the customer
    const paymentIntent = await stripe.paymentIntents.create({
      amount: 49700,
      currency: "gbp",
      customer: customer.id,
      receipt_email: email,
      metadata: {
        visitor_id: visitor_id ?? "",
        utm_source: utm_source ?? "",
        utm_medium: utm_medium ?? "",
        utm_campaign: utm_campaign ?? "",
      },
    });

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
