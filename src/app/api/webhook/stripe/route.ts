import { NextRequest, NextResponse } from "next/server";
import { stripe } from "@/lib/stripe";
import { reconcileSession, refundIntent } from "@/lib/consultation";
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
      process.env.STRIPE_WEBHOOK_SECRET!.trim()
    );
  } catch (err) {
    console.error("[webhook] Signature verification failed:", err);
    return NextResponse.json({ error: "Invalid signature" }, { status: 400 });
  }

  if (event.type === "charge.refunded" && event.data.object.refunded) {
    const intent=event.data.object.payment_intent;
    if(typeof intent === "string") {try {await refundIntent(intent);} catch {return NextResponse.json({error:"Refund processing will retry"},{status:503});}}
  }
  if (event.type === "checkout.session.completed") {
    const session = event.data.object;
    if(session.metadata?.product === "asad-consultation") {
      try { await reconcileSession(session.id); return NextResponse.json({received:true}); }
      catch { return NextResponse.json({error:"Consultation processing will retry"},{status:503}); }
    }
    try {
      await handlePurchase(session);
    } catch (err) {
      // Return 200 to prevent Stripe retry storms. Errors are logged for investigation.
      console.error("[webhook] Onboarding error (session):", err);
      return NextResponse.json({ received: true });
    }
  }

  return NextResponse.json({ received: true });
}
