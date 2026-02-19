import type Stripe from "stripe";
import { stripe } from "./stripe";
import { db } from "./db";
import { addContact, triggerEvent } from "./loops";
import { createPurchaseTask } from "./notion";
import { sendConversionEvent } from "./meta-capi";

/**
 * Post-purchase orchestrator (legacy Checkout Session flow).
 * Called by the Stripe webhook after checkout.session.completed.
 * Fans out to all downstream services in parallel. Never throws.
 */
export async function handlePurchase(session: Stripe.Checkout.Session) {
  const email =
    session.customer_details?.email ?? session.customer_email ?? "";
  const name = session.customer_details?.name ?? null;
  const phone = session.customer_details?.phone ?? null;
  const metadata = session.metadata ?? {};

  const results = await Promise.allSettled([
    // 1. Record in Turso (idempotent via INSERT OR REPLACE on unique stripe_session_id)
    db.execute({
      sql: `INSERT OR REPLACE INTO purchases
            (stripe_session_id, stripe_customer_id, email, name, phone,
             amount_total, currency, visitor_id, utm_source, utm_medium, utm_campaign)
            VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
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
        metadata.utm_source ?? null,
        metadata.utm_medium ?? null,
        metadata.utm_campaign ?? null,
      ],
    }),

    // 2. Loops: add contact then trigger event (sequential: contact must exist first)
    (async () => {
      await addContact({
        email,
        firstName: name?.split(" ")[0] ?? null,
        lastName: name?.split(" ").slice(1).join(" ") || null,
        source: "landing_page_purchase",
        utmSource: metadata.utm_source ?? null,
        utmMedium: metadata.utm_medium ?? null,
        utmCampaign: metadata.utm_campaign ?? null,
      });
      await triggerEvent(email, "purchase_completed", {
        amount: 497,
        currency: "GBP",
        product: "AI Ad Engine Pilot",
      });
    })(),

    // 3. Notion: create task for Akmal
    createPurchaseTask({ email, name }),

    // 4. Meta CAPI: Purchase event (event_id for dedup with browser pixel)
    sendConversionEvent({
      eventName: "Purchase",
      eventId: `stripe_${session.id}`,
      email,
      phone,
      value: 497,
      currency: "GBP",
      eventSourceUrl: "https://start.huddleduck.co.uk",
    }),
  ]);

  // Log results for observability
  const labels = ["Turso", "Loops", "Notion", "Meta CAPI"];
  results.forEach((result, i) => {
    if (result.status === "rejected") {
      console.error(`[onboarding] ${labels[i]} failed:`, result.reason);
    } else {
      console.log(`[onboarding] ${labels[i]} succeeded`);
    }
  });
}

/**
 * Post-purchase orchestrator (inline Payment Element flow).
 * Called by the Stripe webhook after payment_intent.succeeded.
 * Fetches customer details from the PI's customer, then fans out.
 */
export async function handlePaymentIntentPurchase(
  paymentIntent: Stripe.PaymentIntent
) {
  const metadata = paymentIntent.metadata ?? {};

  // Fetch customer details from Stripe
  let email = "";
  let name: string | null = null;
  let phone: string | null = null;
  let customerId: string | null = null;

  if (paymentIntent.customer) {
    const custId =
      typeof paymentIntent.customer === "string"
        ? paymentIntent.customer
        : paymentIntent.customer.id;
    customerId = custId;

    try {
      const customer = await stripe.customers.retrieve(custId);
      if (!customer.deleted) {
        email = customer.email ?? "";
        name = customer.name ?? null;
        phone = customer.phone ?? null;
      }
    } catch (err) {
      console.error("[onboarding] Failed to fetch customer:", err);
    }
  }

  // Fallback: use receipt_email if customer email is empty
  if (!email && paymentIntent.receipt_email) {
    email = paymentIntent.receipt_email;
  }

  const results = await Promise.allSettled([
    // 1. Record in Turso (uses PI ID in stripe_session_id column for idempotency)
    db.execute({
      sql: `INSERT OR REPLACE INTO purchases
            (stripe_session_id, stripe_customer_id, email, name, phone,
             amount_total, currency, visitor_id, utm_source, utm_medium, utm_campaign)
            VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
      args: [
        paymentIntent.id,
        customerId,
        email,
        name,
        phone,
        paymentIntent.amount,
        paymentIntent.currency,
        metadata.visitor_id ?? null,
        metadata.utm_source ?? null,
        metadata.utm_medium ?? null,
        metadata.utm_campaign ?? null,
      ],
    }),

    // 2. Loops: add contact then trigger event
    (async () => {
      await addContact({
        email,
        firstName: name?.split(" ")[0] ?? null,
        lastName: name?.split(" ").slice(1).join(" ") || null,
        source: "landing_page_purchase",
        utmSource: metadata.utm_source ?? null,
        utmMedium: metadata.utm_medium ?? null,
        utmCampaign: metadata.utm_campaign ?? null,
      });
      await triggerEvent(email, "purchase_completed", {
        amount: 497,
        currency: "GBP",
        product: "AI Ad Engine Pilot",
      });
    })(),

    // 3. Notion: create task for Akmal
    createPurchaseTask({ email, name }),

    // 4. Meta CAPI: Purchase event (event_id matches browser pixel for dedup)
    sendConversionEvent({
      eventName: "Purchase",
      eventId: `stripe_${paymentIntent.id}`,
      email,
      phone,
      value: 497,
      currency: "GBP",
      eventSourceUrl: "https://start.huddleduck.co.uk",
    }),
  ]);

  const labels = ["Turso", "Loops", "Notion", "Meta CAPI"];
  results.forEach((result, i) => {
    if (result.status === "rejected") {
      console.error(`[onboarding:pi] ${labels[i]} failed:`, result.reason);
    } else {
      console.log(`[onboarding:pi] ${labels[i]} succeeded`);
    }
  });
}
