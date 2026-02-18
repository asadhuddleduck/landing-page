"use client";

import { useState } from "react";
import { motion } from "framer-motion";
import { getVisitorId, getStoredUtms } from "@/lib/visitor";
import { trackPixelEvent } from "./MetaPixel";
import { track } from "@vercel/analytics";

const steps = [
  "We research your audience",
  "We build & launch your campaigns",
  "We optimise weekly & report back",
];

const features = [
  "Customer avatar research",
  "Ad copy, voiceover script & video creative",
  "Full campaign setup & 3-week managed run",
  "Tracking report & strategy review",
  "Ad spend is separate (min £10/location/day)",
];

const fadeUp = {
  hidden: { opacity: 0, y: 20 },
  visible: { opacity: 1, y: 0 },
};

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
    <section id="checkout" className="relative z-10 section-spacing">
      <motion.div
        className="card max-w-lg mx-auto p-6 sm:p-8 md:p-10"
        variants={fadeUp}
        initial="hidden"
        whileInView="visible"
        viewport={{ once: true, margin: "-80px" }}
        transition={{ duration: 0.6, ease: [0.16, 1, 0.3, 1] }}
      >
        {/* Label */}
        <p
          className="text-xs font-semibold uppercase tracking-wider mb-4"
          style={{ color: "var(--viridian)" }}
        >
          AI Ad Engine Pilot
        </p>

        {/* Price */}
        <div className="flex items-baseline gap-1 mb-1">
          <span
            className="font-serif text-3xl md:text-4xl font-bold"
            style={{ color: "var(--viridian)" }}
          >
            £
          </span>
          <span
            className="font-serif text-5xl sm:text-6xl md:text-7xl font-black"
            style={{ color: "var(--text-primary)" }}
          >
            497
          </span>
        </div>
        <p
          className="text-sm font-medium mb-8"
          style={{ color: "var(--text-muted)" }}
        >
          one-time payment
        </p>

        {/* How it works — 3 steps */}
        <div
          className="mb-8 pb-8"
          style={{ borderBottom: "1px solid var(--border)" }}
        >
          <p
            className="text-xs uppercase tracking-wider font-medium mb-4"
            style={{ color: "var(--text-muted)" }}
          >
            How it works
          </p>
          <div className="space-y-3">
            {steps.map((step, i) => (
              <div key={step} className="flex items-center gap-3">
                <span
                  className="flex-shrink-0 w-6 h-6 rounded-full flex items-center justify-center text-[10px] font-bold"
                  style={{
                    background: "var(--viridian-glow)",
                    color: "var(--viridian)",
                    border: "1px solid rgba(30, 186, 143, 0.2)",
                  }}
                >
                  {i + 1}
                </span>
                <span
                  className="text-sm"
                  style={{ color: "var(--text-secondary)" }}
                >
                  {step}
                </span>
              </div>
            ))}
          </div>
        </div>

        {/* Features */}
        <ul className="space-y-3 mb-10">
          {features.map((feature) => (
            <li
              key={feature}
              className="flex items-center gap-3 text-sm"
              style={{ color: "var(--text-secondary)" }}
            >
              <svg
                className="w-4 h-4 flex-shrink-0"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
                strokeWidth={2.5}
                style={{ color: "var(--viridian)" }}
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  d="M5 13l4 4L19 7"
                />
              </svg>
              {feature}
            </li>
          ))}
        </ul>

        {/* CTA */}
        <button
          onClick={handleCheckout}
          disabled={loading}
          className="checkout-btn w-full py-4 rounded-full text-white font-bold text-base tracking-tight cursor-pointer transition-all duration-300 hover:scale-[1.02] disabled:opacity-50 disabled:cursor-not-allowed"
        >
          {loading ? "Processing..." : "Start Your Pilot"}
        </button>

        {/* Fine print */}
        <p
          className="mt-5 text-center text-xs leading-relaxed"
          style={{ color: "var(--text-muted)" }}
        >
          A mutual trial. You see what we can do. We see if you&apos;re a fit.
        </p>
        <p
          className="mt-1 text-center text-xs"
          style={{ color: "var(--sandstorm)" }}
        >
          £497 credited toward your first month if you upgrade within 30 days.
        </p>
      </motion.div>
    </section>
  );
}
