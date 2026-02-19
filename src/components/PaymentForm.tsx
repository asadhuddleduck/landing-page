"use client";

import { useState } from "react";
import { loadStripe } from "@stripe/stripe-js";
import {
  Elements,
  PaymentElement,
  useStripe,
  useElements,
} from "@stripe/react-stripe-js";
import type { Appearance } from "@stripe/stripe-js";

const stripePromise = loadStripe(
  process.env.NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY!
);

const appearance: Appearance = {
  theme: "night",
  variables: {
    colorPrimary: "#1EBA8F",
    colorBackground: "#0A0A0A",
    colorText: "#FFFFFF",
    colorTextSecondary: "#999999",
    colorTextPlaceholder: "#555555",
    colorDanger: "#ef4444",
    fontFamily:
      "-apple-system, 'SF Pro Display', 'SF Pro Text', 'Lato', 'Helvetica Neue', Helvetica, Arial, sans-serif",
    borderRadius: "12px",
    spacingUnit: "4px",
  },
  rules: {
    ".Input": {
      backgroundColor: "#0A0A0A",
      border: "1px solid rgba(255,255,255,0.08)",
      boxShadow: "none",
      padding: "14px 16px",
      fontSize: "15px",
      transition: "border-color 0.3s, box-shadow 0.3s",
    },
    ".Input:focus": {
      borderColor: "rgba(30,186,143,0.5)",
      boxShadow: "0 0 0 2px rgba(30,186,143,0.15)",
    },
    ".Label": {
      fontSize: "11px",
      fontWeight: "700",
      textTransform: "uppercase",
      letterSpacing: "1px",
      color: "#999999",
      marginBottom: "8px",
    },
    ".Tab": {
      backgroundColor: "#0D0D0D",
      border: "1px solid rgba(255,255,255,0.08)",
    },
    ".Tab--selected": {
      backgroundColor: "#0A0A0A",
      borderColor: "rgba(30,186,143,0.5)",
    },
    ".Error": {
      color: "#ef4444",
      fontSize: "12px",
    },
  },
};

function PaymentFormInner({
  paymentIntentId,
}: {
  paymentIntentId: string;
}) {
  const stripe = useStripe();
  const elements = useElements();
  const [error, setError] = useState<string | null>(null);
  const [processing, setProcessing] = useState(false);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!stripe || !elements) return;

    setProcessing(true);
    setError(null);

    const origin = window.location.origin;
    const { error: stripeError } = await stripe.confirmPayment({
      elements,
      confirmParams: {
        return_url: `${origin}/success?payment_intent=${paymentIntentId}`,
      },
    });

    // Only reaches here if there's an error (otherwise browser redirects)
    if (stripeError) {
      setError(stripeError.message || "Payment failed. Please try again.");
      setProcessing(false);
    }
  }

  return (
    <form onSubmit={handleSubmit} className="checkout-payment-form">
      <PaymentElement />
      {error && <p className="checkout-error">{error}</p>}
      <button
        type="submit"
        disabled={!stripe || processing}
        className="checkout-btn"
        style={{ marginTop: "20px" }}
      >
        {processing ? "Processing..." : "Pay £497"}
      </button>
    </form>
  );
}

interface PaymentFormProps {
  clientSecret: string;
  paymentIntentId: string;
}

export default function PaymentForm({
  clientSecret,
  paymentIntentId,
}: PaymentFormProps) {
  return (
    <Elements
      stripe={stripePromise}
      options={{
        clientSecret,
        appearance,
      }}
    >
      <PaymentFormInner paymentIntentId={paymentIntentId} />
    </Elements>
  );
}
