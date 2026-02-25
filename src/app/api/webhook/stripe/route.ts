import { NextRequest, NextResponse } from "next/server";
import { stripe } from "@/lib/stripe";
import { handlePurchase, handlePaymentIntentPurchase } from "@/lib/onboarding";

export const runtime = "nodejs";

export async function POST(request: NextRequest) {
  const body = await request.text();
  const sig = request.headers.get("stripe-signature");

  if (!sig) {
    return NextResponse.json({ error: "Missing signature" }, { status: 400 });
  }

  let event;
  try {
    event = stripe.webhooks.constructEvent(
      body,
      sig,
      process.env.STRIPE_WEBHOOK_SECRET!
    );
  } catch (err) {
    console.error("[webhook] Signature verification failed:", err);
    return NextResponse.json({ error: "Invalid signature" }, { status: 400 });
  }

  if (event.type === "checkout.session.completed") {
    // Legacy flow (Checkout Session redirect)
    const session = event.data.object;
    try {
      await handlePurchase(session);
    } catch (err) {
      console.error("[webhook] Onboarding error (session):", err);
      return NextResponse.json({ error: "Processing failed" }, { status: 500 });
    }
  } else if (event.type === "payment_intent.succeeded") {
    // New flow (inline Payment Element)
    const paymentIntent = event.data.object;
    try {
      await handlePaymentIntentPurchase(paymentIntent);
    } catch (err) {
      console.error("[webhook] Onboarding error (payment_intent):", err);
      return NextResponse.json({ error: "Processing failed" }, { status: 500 });
    }
  }

  return NextResponse.json({ received: true });
}
