"use client";

import { useEffect, useState } from "react";
import { trackPixelEvent } from "./MetaPixel";
import { track } from "@vercel/analytics";

interface StickyCheckoutCTAProps {
  chatOutcome?: string;
}

export default function StickyCheckoutCTA({ chatOutcome }: StickyCheckoutCTAProps) {
  const [visible, setVisible] = useState(true);

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
    if (chatOutcome?.includes("FRANCHISE")) return "Start Your Franchise Pilot for £497";
    return "Start Your Pilot for £497";
  };

  function handleClick() {
    trackPixelEvent("InitiateCheckout", { value: 497, currency: "GBP" });
    track("sticky_cta_click");

    const el = document.getElementById("checkout");
    if (el) {
      el.scrollIntoView({ behavior: "smooth", block: "center" });
    }
  }

  if (!visible) return null;

  return (
    <div className="sticky-cta">
      <button
        onClick={handleClick}
        className="sticky-cta-btn"
      >
        {getCtaText()}
      </button>
      <p className="sticky-cta-credit">£497 credited if you upgrade within 30 days</p>
    </div>
  );
}
