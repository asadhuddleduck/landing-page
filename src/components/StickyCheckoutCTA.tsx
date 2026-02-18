"use client";

import { useEffect, useState } from "react";
import { getVisitorId, getStoredUtms } from "@/lib/visitor";
import { trackPixelEvent } from "./MetaPixel";
import { track } from "@vercel/analytics";

interface StickyCheckoutCTAProps {
  chatOutcome?: string;
}

export default function StickyCheckoutCTA({ chatOutcome }: StickyCheckoutCTAProps) {
  const [visible, setVisible] = useState(true);
  const [loading, setLoading] = useState(false);

  // Hide when #checkout section is in viewport
  useEffect(() => {
    const checkoutEl = document.getElementById("checkout");
    if (!checkoutEl) return;

    const observer = new IntersectionObserver(
      ([entry]) => {
        setVisible(!entry.isIntersecting);
      },
      { threshold: 0.1 }
    );

    observer.observe(checkoutEl);
    return () => observer.disconnect();
  }, []);

  // Smart CTA copy based on conversation outcome
  const getCtaText = () => {
    if (loading) return "Processing...";
    if (chatOutcome?.includes("FRANCHISE")) return "Start Your Franchise Pilot for £497";
    return "Start Your Pilot for £497";
  };

  async function handleCheckout() {
    setLoading(true);
    try {
      trackPixelEvent("InitiateCheckout", { value: 497, currency: "GBP" });
      track("sticky_cta_click");

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
        console.error("[sticky-cta] No URL returned:", data);
        setLoading(false);
      }
    } catch (err) {
      console.error("[sticky-cta] Error:", err);
      setLoading(false);
    }
  }

  if (!visible) return null;

  return (
    <div className="sticky-cta">
      <button
        onClick={handleCheckout}
        disabled={loading}
        className="sticky-cta-btn"
      >
        {getCtaText()}
      </button>
      <p className="sticky-cta-credit">£497 credited if you upgrade within 30 days</p>
    </div>
  );
}
