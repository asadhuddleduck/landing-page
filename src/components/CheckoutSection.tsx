"use client";

import { useState } from "react";
import { motion } from "framer-motion";
import { getVisitorId, getStoredUtms } from "@/lib/visitor";
import { trackPixelEvent } from "./MetaPixel";
import { track } from "@vercel/analytics";

const features = [
  "Customer avatar research",
  "Ad copy, voiceover script & video creative",
  "Full campaign setup & 3-week managed run",
  "Tracking report & strategy review",
  "Ad spend is separate (min £10/location/day)",
];

const cardVariant = {
  hidden: { opacity: 0, y: 40, scale: 0.96 },
  visible: { opacity: 1, y: 0, scale: 1 },
};

const featureVariant = {
  hidden: { opacity: 0, x: -10 },
  visible: { opacity: 1, x: 0 },
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
    <section id="checkout" className="relative z-10 py-16 px-4 md:py-20 md:px-6">
      <motion.div
        className="max-w-lg mx-auto"
        variants={cardVariant}
        initial="hidden"
        whileInView="visible"
        viewport={{ once: true, margin: "-80px" }}
        transition={{ duration: 0.6, ease: [0.16, 1, 0.3, 1] }}
      >
        {/* Animated gradient border wrapper */}
        <div className="gradient-border-wrap">
          <div
            className="p-5 sm:p-8 md:p-10 relative overflow-hidden"
            style={{ background: "var(--glass-bg-solid)" }}
          >
            {/* Top accent bar (animated) */}
            <div
              className="absolute top-0 left-0 right-0 h-1"
              style={{
                background: "linear-gradient(90deg, var(--viridian), var(--sandstorm), var(--viridian))",
                backgroundSize: "200% 100%",
                animation: "gradient-shift 4s ease-in-out infinite",
              }}
            />

            <p
              className="text-sm font-semibold uppercase tracking-wider mb-2"
              style={{ color: "var(--viridian)" }}
            >
              AI Ad Engine Pilot
            </p>

            <div className="flex items-baseline gap-1 mb-1">
              <span
                className="text-3xl md:text-4xl font-bold bg-clip-text text-transparent"
                style={{
                  backgroundImage: "linear-gradient(135deg, var(--viridian), var(--sandstorm))",
                }}
              >
                £
              </span>
              <span
                className="text-5xl sm:text-6xl md:text-7xl font-black"
                style={{ color: "var(--text-primary)" }}
              >
                497
              </span>
            </div>
            <p
              className="text-base font-semibold"
              style={{ color: "var(--text-muted)" }}
            >
              one-time payment
            </p>

            <ul className="mt-8 space-y-3">
              {features.map((feature, i) => (
                <motion.li
                  key={feature}
                  className="flex items-center gap-3 text-sm"
                  style={{ color: "var(--text-secondary)" }}
                  variants={featureVariant}
                  initial="hidden"
                  whileInView="visible"
                  viewport={{ once: true }}
                  transition={{
                    duration: 0.4,
                    ease: [0.16, 1, 0.3, 1],
                    delay: 0.3 + i * 0.08,
                  }}
                >
                  <svg
                    className="w-5 h-5 flex-shrink-0"
                    fill="none"
                    viewBox="0 0 24 24"
                    stroke="currentColor"
                    strokeWidth={2.5}
                    style={{
                      color: "var(--viridian)",
                      filter: "drop-shadow(0 0 4px rgba(30, 186, 143, 0.4))",
                    }}
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      d="M5 13l4 4L19 7"
                    />
                  </svg>
                  {feature}
                </motion.li>
              ))}
            </ul>

            <button
              onClick={handleCheckout}
              disabled={loading}
              className="checkout-btn mt-10 w-full py-4 rounded-xl text-white font-bold text-lg tracking-tight cursor-pointer transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed"
              style={{ animation: loading ? "none" : "glow-pulse 3s ease-in-out infinite" }}
            >
              {loading ? "Processing..." : "Start Your Pilot"}
            </button>

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
          </div>
        </div>
      </motion.div>
    </section>
  );
}
