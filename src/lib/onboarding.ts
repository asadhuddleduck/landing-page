import type Stripe from "stripe";
import { db } from "./db";
import { sendPurchaseConfirmation } from "./email";
import { createPurchaseTask, upsertLeadAsWon } from "./notion";
import { sendConversionEvent } from "./meta-capi";
import { getCurrencySymbol, ZERO_DECIMAL_CURRENCIES } from "./currency";
import { recoverAttributionByIp, markContactAsCustomer } from "./attribution-recovery";

/**
 * Post-purchase orchestrator (Checkout Session flow).
 * Called by the Stripe webhook after checkout.session.completed.
 * Fans out to all downstream services in parallel. Never throws.
 */
export async function handlePurchase(session: Stripe.Checkout.Session) {
  const email =
    session.customer_details?.email ?? session.customer_email ?? "";
  const name = session.customer_details?.name ?? null;
  const phone = session.customer_details?.phone ?? null;
  const metadata = session.metadata ?? {};

  const tier = (metadata.tier as "trial" | "unlimited") ?? "trial";
  const productName = tier === "unlimited" ? "AI Ad Engine Unlimited" : "AI Ad Engine Trial";
  const subscriptionId = session.subscription
    ? typeof session.subscription === "string"
      ? session.subscription
      : session.subscription.id
    : null;

  // Derive amount from session (supports multi-currency)
  const amountTotal = session.amount_total ?? 0;
  const sessionCurrency = (session.currency ?? "gbp").toUpperCase();
  const isZeroDecimal = ZERO_DECIMAL_CURRENCIES.has(sessionCurrency);
  const amount = isZeroDecimal ? amountTotal : amountTotal / 100;

  // Format amount string for email
  const symbol = getCurrencySymbol(sessionCurrency);
  const amountStr = tier === "unlimited"
    ? `${symbol}${amount.toLocaleString("en-US")}/month`
    : `${symbol}${amount.toLocaleString("en-US")}`;

  // Meta CAPI always in GBP (ad account currency)
  const capiValue = tier === "unlimited" ? 1300 : 497;

  let fbc = metadata.fbc || undefined;
  const fbp = metadata.fbp || undefined;
  const clientIp = metadata.client_ip || undefined;
  const clientUa = metadata.client_ua || undefined;

  // Cross-browser fbc recovery: if fbc is missing, query attribution-tracker
  // by IP to find the original ad click and construct fbc from its fbclid
  let recoveredUtmSource = metadata.utm_source || undefined;
  let recoveredUtmMedium = metadata.utm_medium || undefined;
  let recoveredUtmCampaign = metadata.utm_campaign || undefined;
  if (!fbc && clientIp) {
    try {
      const recovered = await recoverAttributionByIp(clientIp);
      if (recovered) {
        if (recovered.fbc) fbc = recovered.fbc;
        if (!recoveredUtmSource && recovered.utm_source) {
          recoveredUtmSource = recovered.utm_source;
          recoveredUtmMedium = recovered.utm_medium;
          recoveredUtmCampaign = recovered.utm_campaign;
        }
        console.log(`[onboarding] Recovered attribution by IP: fbc=${!!recovered.fbc}, utm_source=${recovered.utm_source}`);
      }
    } catch (err) {
      console.error("[onboarding] Attribution recovery failed:", err);
    }
  }

  // 1. Atomic dedup via INSERT ... ON CONFLICT DO NOTHING
  const insertResult = await db.execute({
    sql: `INSERT INTO purchases
          (stripe_session_id, stripe_customer_id, email, name, phone,
           amount_total, currency, visitor_id, utm_source, utm_medium, utm_campaign,
           tier, stripe_subscription_id, recurring)
          VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
          ON CONFLICT(stripe_session_id) DO NOTHING`,
    args: [
      session.id,
      typeof session.customer === "string"
        ? session.customer
        : session.customer?.id ?? null,
      email,
      name,
      phone,
      session.amount_total,
      session.currency,
      metadata.visitor_id ?? null,
      recoveredUtmSource ?? null,
      recoveredUtmMedium ?? null,
      recoveredUtmCampaign ?? null,
      tier,
      subscriptionId,
      tier === "unlimited" ? 1 : 0,
    ],
  });

  if (insertResult.rowsAffected === 0) {
    console.log(`[onboarding] Duplicate webhook for session ${session.id}, skipping`);
    return;
  }

  console.log(`[onboarding] Turso succeeded`);

  // 2. Side effects (only reached if INSERT succeeded)
  const results = await Promise.allSettled([
    // Purchase confirmation email via Resend
    sendPurchaseConfirmation({
      email,
      firstName: name?.split(" ")[0] ?? "there",
      product: productName,
      amount: amountStr,
    }),

    // Notion: create task for Akmal
    createPurchaseTask({ email, name, tier }),

    // Meta CAPI: Purchase event (event_id for dedup with browser pixel)
    sendConversionEvent({
      eventName: "Purchase",
      eventId: `stripe_${session.id}`,
      email,
      phone,
      value: capiValue,
      currency: "GBP",
      eventSourceUrl: "https://start.huddleduck.co.uk",
      fbc,
      fbp,
      ipAddress: clientIp,
      userAgent: clientUa,
    }),

    // Notion: upsert lead in Leads DB as Won
    upsertLeadAsWon({ email, name, phone, amount }),

    // Attribution tracker: mark contact as customer
    markContactAsCustomer(email, clientIp),
  ]);

  // Log results for observability
  const labels = ["Email", "Notion Task", "Meta CAPI", "Notion Lead", "Attribution Tracker"];
  results.forEach((result, i) => {
    if (result.status === "rejected") {
      console.error(`[onboarding] ${labels[i]} failed:`, result.reason);
    } else {
      console.log(`[onboarding] ${labels[i]} succeeded`);
    }
  });
}
