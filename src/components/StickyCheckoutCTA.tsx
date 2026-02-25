"use client";

import { useEffect, useRef, useState } from "react";
import { trackPixelEvent } from "./MetaPixel";
import { track } from "@vercel/analytics";

interface StickyCheckoutCTAProps {
  chatOutcome?: string;
}

export default function StickyCheckoutCTA({ chatOutcome }: StickyCheckoutCTAProps) {
  const [visible, setVisible] = useState(false);
  const hasSeenCheckout = useRef(false);

  useEffect(() => {
    const checkoutEl = document.getElementById("checkout");
    if (!checkoutEl) return;

    // Track when checkout enters/leaves viewport
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          hasSeenCheckout.current = true;
          setVisible(false);
        } else if (hasSeenCheckout.current) {
          // Checkout left viewport — only show if it's ABOVE us (we scrolled past)
          const rect = checkoutEl.getBoundingClientRect();
          setVisible(rect.top < 0);
        }
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
