"use client";

import { useState } from "react";
import { getVisitorId, getStoredUtms } from "@/lib/visitor";
import { trackPixelEvent } from "./MetaPixel";
import { track } from "@vercel/analytics";

const steps = [
  "AI deep-researches your audience",
  "We remake your real content into ads",
  "3 weeks managed, then you decide",
];

const features = [
  "Deep audience research from social data & competitor analysis",
  "Ad creative remade from your existing content",
  "Full Meta campaign setup & 3-week managed run",
  "Tracking report & strategy review call",
  "Ad spend is separate (min £10/location/day)",
];

export default function CheckoutSection() {
  const [loading, setLoading] = useState(false);

  async function handleCheckout() {
    setLoading(true);
    try {
      trackPixelEvent("InitiateCheckout", { value: 497, currency: "GBP" });
      track("checkout_click");

      const vid = getVisitorId();
      const params = new URLSearchParams(window.location.search);
      const utms = {
        utm_source: params.get("utm_source") || "",
        utm_medium: params.get("utm_medium") || "",
        utm_campaign: params.get("utm_campaign") || "",
      };
      if (!utms.utm_source) {
        const stored = getStoredUtms();
        utms.utm_source = stored.utm_source || "";
        utms.utm_medium = stored.utm_medium || "";
        utms.utm_campaign = stored.utm_campaign || "";
      }

      const res = await fetch("/api/checkout", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ visitor_id: vid, ...utms }),
      });

      const data = await res.json();

      if (data.url) {
        window.location.href = data.url;
      } else {
        console.error("[checkout] No URL returned:", data);
        setLoading(false);
      }
    } catch (err) {
      console.error("[checkout] Error:", err);
      setLoading(false);
    }
  }

  return (
    <section id="checkout" className="section">
      <div className="checkout-card">
        <p className="checkout-label">AI Ad Engine Pilot</p>

        <div className="checkout-price">
          <span className="checkout-currency">£</span>
          <span className="checkout-amount">497</span>
        </div>
        <p className="checkout-payment-type">one-time payment</p>

        <hr className="checkout-divider" />

        <p className="checkout-steps-label">How it works</p>
        <div className="checkout-steps">
          {steps.map((step, i) => (
            <div key={step} className="checkout-step">
              <span className="checkout-step-num">{i + 1}</span>
              <span className="checkout-step-text">{step}</span>
            </div>
          ))}
        </div>

        <div className="checkout-features">
          {features.map((feature) => (
            <div key={feature} className="checkout-feature">
              <svg
                className="checkout-check"
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
              {feature}
            </div>
          ))}
        </div>

        <button
          onClick={handleCheckout}
          disabled={loading}
          className="checkout-btn"
        >
          {loading ? "Processing..." : "Start Your Pilot"}
        </button>

        <p className="checkout-fine-print">
          A mutual trial. You see what we can do. We see if you&apos;re a fit.
        </p>
        <p className="checkout-credit">
          £497 fully credited if you upgrade within 30 days.
        </p>
      </div>
    </section>
  );
}
