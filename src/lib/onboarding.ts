import type Stripe from "stripe";
import { stripe } from "./stripe";
import { db } from "./db";
import { addContact, triggerEvent } from "./loops";
import { sendPurchaseConfirmation } from "./email";
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

  const tier = (metadata.tier as "trial" | "unlimited") ?? "trial";
  const amount = tier === "unlimited" ? 1300 : 497;
  const productName = tier === "unlimited" ? "AI Ad Engine Unlimited" : "AI Ad Engine Trial";
  const subscriptionId = session.subscription
    ? typeof session.subscription === "string"
      ? session.subscription
      : session.subscription.id
    : null;

  const fbc = metadata.fbc || undefined;
  const fbp = metadata.fbp || undefined;
  const clientIp = metadata.client_ip || undefined;
  const clientUa = metadata.client_ua || undefined;

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
      metadata.utm_source ?? null,
      metadata.utm_medium ?? null,
      metadata.utm_campaign ?? null,
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
    // Loops: add contact, trigger event, send purchase confirmation email
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
        amount,
        currency: "GBP",
        product: productName,
      });
    })(),

    // Purchase confirmation email via Resend
    sendPurchaseConfirmation({
      email,
      firstName: name?.split(" ")[0] ?? "there",
      product: productName,
      amount: `£${amount.toLocaleString("en-GB")}`,
    }),

    // Notion: create task for Akmal
    createPurchaseTask({ email, name, tier }),

    // Meta CAPI: Purchase event (event_id for dedup with browser pixel)
    sendConversionEvent({
      eventName: "Purchase",
      eventId: `stripe_${session.id}`,
      email,
      phone,
      value: amount,
      currency: "GBP",
      eventSourceUrl: "https://start.huddleduck.co.uk",
      fbc,
      fbp,
      ipAddress: clientIp,
      userAgent: clientUa,
    }),
  ]);

  // Log results for observability
  const labels = ["Loops", "Email", "Notion", "Meta CAPI"];
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

  const fbc = metadata.fbc || undefined;
  const fbp = metadata.fbp || undefined;
  const clientIp = metadata.client_ip || undefined;
  const clientUa = metadata.client_ua || undefined;

  // 1. Atomic dedup via INSERT ... ON CONFLICT DO NOTHING
  const insertResult = await db.execute({
    sql: `INSERT INTO purchases
          (stripe_session_id, stripe_customer_id, email, name, phone,
           amount_total, currency, visitor_id, utm_source, utm_medium, utm_campaign,
           tier, stripe_subscription_id, recurring)
          VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
          ON CONFLICT(stripe_session_id) DO NOTHING`,
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
      "trial",
      null,
      0,
    ],
  });

  if (insertResult.rowsAffected === 0) {
    console.log(`[onboarding] Duplicate webhook for PI ${paymentIntent.id}, skipping`);
    return;
  }

  console.log(`[onboarding:pi] Turso succeeded`);

  // 2. Side effects (only reached if INSERT succeeded)
  const results = await Promise.allSettled([
    // Loops: add contact + trigger event
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
        product: "AI Ad Engine Trial",
      });
    })(),

    // Purchase confirmation email via Resend
    sendPurchaseConfirmation({
      email,
      firstName: name?.split(" ")[0] ?? "there",
      product: "AI Ad Engine Trial",
      amount: "£497",
    }),

    // Notion: create task for Akmal
    createPurchaseTask({ email, name, tier: "trial" }),

    // Meta CAPI: Purchase event (event_id matches browser pixel for dedup)
    sendConversionEvent({
      eventName: "Purchase",
      eventId: `stripe_${paymentIntent.id}`,
      email,
      phone,
      value: 497,
      currency: "GBP",
      eventSourceUrl: "https://start.huddleduck.co.uk",
      fbc,
      fbp,
      ipAddress: clientIp,
      userAgent: clientUa,
    }),
  ]);

  const labels = ["Loops", "Email", "Notion", "Meta CAPI"];
  results.forEach((result, i) => {
    if (result.status === "rejected") {
      console.error(`[onboarding:pi] ${labels[i]} failed:`, result.reason);
    } else {
      console.log(`[onboarding:pi] ${labels[i]} succeeded`);
    }
  });
}
