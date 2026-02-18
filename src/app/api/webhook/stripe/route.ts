import { NextRequest, NextResponse } from "next/server";
import { stripe } from "@/lib/stripe";
import { handlePurchase } from "@/lib/onboarding";

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
    const session = event.data.object;
    try {
      await handlePurchase(session);
    } catch (err) {
      console.error("[webhook] Onboarding error:", err);
      // Still return 200 — Stripe will retry otherwise
    }
  }

  return NextResponse.json({ received: true });
}
