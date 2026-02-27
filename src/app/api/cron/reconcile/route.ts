import { NextRequest, NextResponse } from "next/server";
import { stripe } from "@/lib/stripe";
import { db } from "@/lib/db";
import { handlePurchase } from "@/lib/onboarding";

export const runtime = "nodejs";

export async function GET(request: NextRequest) {
  // Verify cron secret (Vercel cron sends this header)
  const cronSecret = process.env.CRON_SECRET;
  if (!cronSecret) {
    console.error("[reconcile] CRON_SECRET env var is not set");
    return NextResponse.json({ error: "Server misconfigured" }, { status: 500 });
  }
  const authHeader = request.headers.get("authorization");
  if (authHeader !== `Bearer ${cronSecret}`) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    const oneDayAgo = Math.floor(Date.now() / 1000) - 86400;

    // Fetch recent successful checkout sessions
    const checkoutEvents = await stripe.events.list({
      type: "checkout.session.completed",
      created: { gte: oneDayAgo },
      limit: 100,
    });

    let reconciled = 0;
    let alreadyExists = 0;
    let failed = 0;

    // Reconcile checkout sessions
    for (const event of checkoutEvents.data) {
      const session = event.data.object as import("stripe").Stripe.Checkout.Session;
      try {
        const existing = await db.execute({
          sql: "SELECT 1 FROM purchases WHERE stripe_session_id = ?",
          args: [session.id],
        });
        if (existing.rows.length === 0) {
          console.log(`[reconcile] Missing session ${session.id}, re-processing`);
          await handlePurchase(session);
          reconciled++;
        } else {
          alreadyExists++;
        }
      } catch (err) {
        console.error(`[reconcile] Failed to reconcile session ${session.id}:`, err);
        failed++;
      }
    }

    console.log(`[reconcile] Done: ${reconciled} reconciled, ${alreadyExists} already existed, ${failed} failed`);

    return NextResponse.json({
      reconciled,
      alreadyExists,
      failed,
      eventsChecked: checkoutEvents.data.length,
    });
  } catch (err) {
    console.error("[reconcile] Cron error:", err);
    return NextResponse.json({ error: "Internal error" }, { status: 500 });
  }
}
