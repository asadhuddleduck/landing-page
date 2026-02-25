import { stripe } from "@/lib/stripe";
import Link from "next/link";
import SuccessPixel from "@/components/SuccessPixel";

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

  if (payment_intent) {
    // New flow: inline Payment Element
    try {
      const pi = await stripe.paymentIntents.retrieve(payment_intent, {
        expand: ["customer"],
      });
      if (pi.status === "succeeded") {
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
      // Invalid PI. Show generic thank you
    }
  } else if (session_id) {
    // Legacy flow: Checkout Session redirect
    try {
      const session = await stripe.checkout.sessions.retrieve(session_id);
      if (session.payment_status === "paid") {
        if (session.customer_details?.name) {
          customerName = session.customer_details.name.split(" ")[0];
        }
        sessionRef = session.id.slice(-8).toUpperCase();
        eventId = session.id;
      }
    } catch {
      // Invalid session. Show generic thank you
    }
  }

  return (
    <main
      className="min-h-screen flex items-center justify-center px-6 py-20"
      style={{ background: "var(--black)" }}
    >
      <div className="max-w-lg w-full text-center">
        {/* Success icon */}
        <div
          className="w-20 h-20 rounded-full flex items-center justify-center mx-auto mb-8"
          style={{ background: "rgba(30, 186, 143, 0.15)" }}
        >
          <svg
            className="w-10 h-10"
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
          className="text-4xl font-black mb-3"
          style={{ color: "var(--text-primary)" }}
        >
          Welcome aboard, {customerName}!
        </h1>

        <p
          className="text-lg mb-2"
          style={{ color: "var(--text-secondary)" }}
        >
          Your AI Ad Engine Pilot is confirmed.
        </p>

        {sessionRef && (
          <p
            className="text-sm mb-10"
            style={{ color: "var(--text-muted)" }}
          >
            Order ref: {sessionRef}
          </p>
        )}

        {/* What happens next */}
        <div
          className="rounded-2xl p-8 text-left mb-10"
          style={{ background: "var(--black-card)" }}
        >
          <h2
            className="text-lg font-bold mb-6"
            style={{ color: "var(--text-primary)" }}
          >
            What happens next
          </h2>

          <div className="space-y-6">
            {steps.map((step) => (
              <div key={step.number} className="flex gap-4">
                <div
                  className="w-8 h-8 rounded-full flex items-center justify-center flex-shrink-0 text-sm font-bold"
                  style={{
                    background: "rgba(30, 186, 143, 0.15)",
                    color: "var(--viridian)",
                  }}
                >
                  {step.number}
                </div>
                <div>
                  <p
                    className="font-semibold text-sm"
                    style={{ color: "var(--text-primary)" }}
                  >
                    {step.title}
                  </p>
                  <p
                    className="text-sm mt-0.5"
                    style={{ color: "var(--text-muted)" }}
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
          className="inline-block px-6 py-3 rounded-xl text-sm font-semibold transition-all duration-300"
          style={{
            color: "var(--viridian)",
            border: "1px solid var(--viridian)",
          }}
        >
          Back to home
        </Link>

        <SuccessPixel eventId={eventId} />
      </div>
    </main>
  );
}
