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
      // Return 200 to prevent Stripe retry storms. Errors are logged for investigation.
      console.error("[webhook] Onboarding error (session):", err);
      return NextResponse.json({ received: true });
    }
  } else if (event.type === "payment_intent.succeeded") {
    // Inline Payment Element flow only — skip PIs from Checkout Sessions/subscriptions
    // Our create-payment-intent route always sets metadata.tier; subscription PIs don't have it
    const paymentIntent = event.data.object;
    if (!paymentIntent.metadata?.tier) {
      console.log(`[webhook] Skipping PI ${paymentIntent.id} — no tier metadata (likely from Checkout Session)`);
      return NextResponse.json({ received: true });
    }
    try {
      await handlePaymentIntentPurchase(paymentIntent);
    } catch (err) {
      // Return 200 to prevent Stripe retry storms. Errors are logged for investigation.
      console.error("[webhook] Onboarding error (payment_intent):", err);
      return NextResponse.json({ received: true });
    }
  }

  return NextResponse.json({ received: true });
}
