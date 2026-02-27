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
  searchParams: Promise<{ session_id?: string }>;
}) {
  const { session_id } = await searchParams;

  let customerName = "there";
  let sessionRef = "";
  let eventId = "";
  let purchaseValue = 497;
  let purchaseCurrency = "GBP";
  let productName = "AI Ad Engine Trial";
  let tier: "trial" | "unlimited" = "trial";
  let isSubscription = false;
  let hasValidOrder = false;

  if (session_id) {
    try {
      const session = await stripe.checkout.sessions.retrieve(session_id);
      if (session.payment_status === "paid") {
        hasValidOrder = true;
        if (session.customer_details?.name) {
          customerName = session.customer_details.name.split(" ")[0];
        }
        sessionRef = session.id.slice(-8).toUpperCase();
        eventId = session.id;

        const sessionCurrency = (session.currency ?? "gbp").toUpperCase();
        purchaseCurrency = sessionCurrency;
        const rawAmount = session.amount_total ?? 0;
        const isZeroDecimal = sessionCurrency === "JPY"; // matches ZERO_DECIMAL_CURRENCIES
        purchaseValue = isZeroDecimal ? rawAmount : rawAmount / 100;

        if (session.mode === "subscription") {
          productName = "AI Ad Engine Unlimited";
          tier = "unlimited";
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

            <SuccessPixel eventId={eventId} value={purchaseValue} currency={purchaseCurrency} tier={tier} />
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
