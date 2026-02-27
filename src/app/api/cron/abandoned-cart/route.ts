import { NextRequest, NextResponse } from "next/server";
import { stripe } from "@/lib/stripe";
import { db } from "@/lib/db";
import { sendAbandonedCartEmail } from "@/lib/email";
import { getCurrencySymbol } from "@/lib/currency";

export const runtime = "nodejs";

export async function GET(request: NextRequest) {
  // Verify cron secret (Vercel cron sends this header)
  const cronSecret = process.env.CRON_SECRET;
  if (!cronSecret) {
    console.error("[abandoned-cart] CRON_SECRET env var is not set");
    return NextResponse.json({ error: "Server misconfigured" }, { status: 500 });
  }
  const authHeader = request.headers.get("authorization");
  if (authHeader !== `Bearer ${cronSecret}`) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    // Find checkouts older than 1 hour with no matching purchase and not yet nudged
    const result = await db.execute({
      sql: `SELECT c.* FROM checkouts c
            LEFT JOIN purchases p ON c.session_id = p.stripe_session_id
            WHERE p.stripe_session_id IS NULL
            AND c.created_at < datetime('now', '-1 hour')
            AND c.nudged_at IS NULL
            LIMIT 20`,
      args: [],
    });

    let sent = 0;
    let failed = 0;

    for (const row of result.rows) {
      const email = row.email as string;
      const name = (row.name as string) || "";
      const amount = row.amount as number;
      const sessionId = row.session_id as string;
      const currency = (row.currency as string) || "GBP";

      try {
        // Verify the session is truly unpaid before sending (prevents race with webhook)
        const session = await stripe.checkout.sessions.retrieve(sessionId);
        if (session.payment_status === "paid") {
          await db.execute({
            sql: `UPDATE checkouts SET nudged_at = datetime('now') WHERE session_id = ?`,
            args: [sessionId],
          });
          continue;
        }

        // Amount is stored as display amount (e.g. 497, 627, 1300)
        const symbol = getCurrencySymbol(currency);
        const formattedAmount = `${symbol}${amount.toLocaleString("en-US")}`;

        await sendAbandonedCartEmail({
          email,
          firstName: name.split(" ")[0] || "there",
          amount: formattedAmount,
        });

        // Mark as nudged so we don't re-send
        await db.execute({
          sql: `UPDATE checkouts SET nudged_at = datetime('now') WHERE session_id = ?`,
          args: [sessionId],
        });

        sent++;
      } catch (err) {
        console.error(`[abandoned-cart] Failed to nudge ${email}:`, err);
        failed++;
      }
    }

    // Clean up stale checkouts older than 30 days
    const cleanup = await db.execute({
      sql: `DELETE FROM checkouts WHERE created_at < datetime('now', '-30 days')`,
      args: [],
    });

    console.log(
      `[abandoned-cart] Processed: ${sent} sent, ${failed} failed, ${result.rows.length} total, ${cleanup.rowsAffected} stale rows cleaned`
    );

    return NextResponse.json({
      processed: result.rows.length,
      sent,
      failed,
      cleaned: cleanup.rowsAffected,
    });
  } catch (err) {
    console.error("[abandoned-cart] Cron error:", err);
    return NextResponse.json({ error: "Internal error" }, { status: 500 });
  }
}
