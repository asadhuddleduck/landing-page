import type { Metadata } from "next";
import { stripe } from "@/lib/stripe";
import Link from "next/link";
import SuccessPixel from "@/components/SuccessPixel";

export const metadata: Metadata = {
  robots: { index: false, follow: false },
};

const steps = [
  {
    number: "1",
    title: "Check your inbox",
    description: "You'll receive a welcome email with everything you need to know.",
  },
  {
    number: "2",
    title: "Akmal will reach out",
    description: "Your dedicated account manager will contact you within 24 hours.",
  },
  {
    number: "3",
    title: "The AI starts building",
    description:
      "It begins researching your market and crafting your campaign strategy.",
  },
];

export default async function SuccessPage({
  searchParams,
}: {
  searchParams: Promise<{ session_id?: string; payment_intent?: string }>;
}) {
  const { session_id, payment_intent } = await searchParams;

  let customerName = "there";
  let sessionRef = "";
  let eventId = "";
  let purchaseValue = 497;
  let productName = "AI Ad Engine Trial";
  let isSubscription = false;
  let hasValidOrder = false;

  if (payment_intent) {
    // New flow: inline Payment Element (always trial)
    try {
      const pi = await stripe.paymentIntents.retrieve(payment_intent, {
        expand: ["customer"],
      });
      if (pi.status === "succeeded") {
        hasValidOrder = true;
        const customer = pi.customer;
        if (customer && typeof customer !== "string" && !customer.deleted) {
          if (customer.name) {
            customerName = customer.name.split(" ")[0];
          }
        }
        sessionRef = pi.id.slice(-8).toUpperCase();
        eventId = pi.id;
      }
    } catch {
      // Invalid PI. Show fallback
    }
  } else if (session_id) {
    // Checkout Session flow (trial or unlimited)
    try {
      const session = await stripe.checkout.sessions.retrieve(session_id);
      if (session.payment_status === "paid") {
        hasValidOrder = true;
        if (session.customer_details?.name) {
          customerName = session.customer_details.name.split(" ")[0];
        }
        sessionRef = session.id.slice(-8).toUpperCase();
        eventId = session.id;

        if (session.mode === "subscription") {
          purchaseValue = 1300;
          productName = "AI Ad Engine Unlimited";
          isSubscription = true;
        }
      }
    } catch {
      // Invalid session. Show fallback
    }
  }

  return (
    <main
      style={{
        background: "var(--black)",
        minHeight: "100vh",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        padding: "80px 24px",
      }}
    >
      <div style={{ maxWidth: 520, width: "100%", textAlign: "center" }}>
        {hasValidOrder ? (
          <>
            {/* Success icon */}
            <div
              style={{
                width: 80,
                height: 80,
                borderRadius: "50%",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                margin: "0 auto 32px",
                background: "var(--viridian-glow)",
              }}
            >
              <svg
                width={40}
                height={40}
                style={{ color: "var(--viridian)" }}
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
                strokeWidth={2.5}
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  d="M5 13l4 4L19 7"
                />
              </svg>
            </div>

            <h1
              style={{
                color: "var(--text-primary)",
                fontSize: "clamp(28px, 5vw, 40px)",
                fontWeight: 900,
                fontFamily: "var(--font-heading)",
                margin: "0 0 12px",
              }}
            >
              Welcome aboard, {customerName}!
            </h1>

            <p
              style={{
                color: "var(--text-secondary)",
                fontSize: 18,
                margin: "0 0 8px",
              }}
            >
              Your {productName}{isSubscription ? " subscription" : ""} is confirmed.
            </p>

            {sessionRef && (
              <p
                style={{
                  color: "var(--text-muted)",
                  fontSize: 14,
                  margin: "0 0 40px",
                }}
              >
                Order ref: {sessionRef}
              </p>
            )}

            {/* What happens next */}
            <div
              style={{
                background: "var(--black-card)",
                border: "1px solid var(--border)",
                borderRadius: 16,
                padding: "32px",
                textAlign: "left",
                margin: "0 0 40px",
              }}
            >
              <h2
                style={{
                  color: "var(--text-primary)",
                  fontSize: 18,
                  fontWeight: 700,
                  margin: "0 0 24px",
                }}
              >
                What happens next
              </h2>

              <div style={{ display: "flex", flexDirection: "column", gap: 24 }}>
                {steps.map((step) => (
                  <div key={step.number} style={{ display: "flex", gap: 16 }}>
                    <div
                      style={{
                        width: 32,
                        height: 32,
                        borderRadius: "50%",
                        display: "flex",
                        alignItems: "center",
                        justifyContent: "center",
                        flexShrink: 0,
                        fontSize: 14,
                        fontWeight: 700,
                        background: "var(--viridian-glow)",
                        color: "var(--viridian)",
                      }}
                    >
                      {step.number}
                    </div>
                    <div>
                      <p
                        style={{
                          color: "var(--text-primary)",
                          fontSize: 14,
                          fontWeight: 600,
                          margin: 0,
                        }}
                      >
                        {step.title}
                      </p>
                      <p
                        style={{
                          color: "var(--text-muted)",
                          fontSize: 14,
                          margin: "4px 0 0",
                          lineHeight: 1.5,
                        }}
                      >
                        {step.description}
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            <Link
              href="/"
              style={{
                display: "inline-block",
                padding: "12px 28px",
                borderRadius: 12,
                fontSize: 14,
                fontWeight: 600,
                color: "var(--viridian)",
                border: "1px solid var(--viridian)",
                textDecoration: "none",
                transition: "all 0.3s ease",
              }}
            >
              Back to home
            </Link>

            <SuccessPixel eventId={eventId} value={purchaseValue} />
          </>
        ) : (
          <div style={{ textAlign: "center" }}>
            <h1
              style={{
                color: "var(--text-primary)",
                fontSize: "clamp(28px, 5vw, 40px)",
                fontWeight: 900,
                fontFamily: "var(--font-heading)",
                margin: "0 0 12px",
              }}
            >
              No order found
            </h1>
            <p
              style={{
                color: "var(--text-secondary)",
                fontSize: 18,
                margin: "0 0 32px",
              }}
            >
              If you completed a purchase, check your email for confirmation.
            </p>
            <Link
              href="/"
              style={{
                display: "inline-block",
                padding: "12px 28px",
                borderRadius: 12,
                fontSize: 14,
                fontWeight: 600,
                color: "var(--viridian)",
                border: "1px solid var(--viridian)",
                textDecoration: "none",
                transition: "all 0.3s ease",
              }}
            >
              Back to home
            </Link>
          </div>
        )}
      </div>
    </main>
  );
}
