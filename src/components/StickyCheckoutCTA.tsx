"use client";

import { useEffect, useRef, useState } from "react";
import { trackPixelEvent } from "./MetaPixel";
import { track } from "@vercel/analytics";
import { useCurrency } from "@/hooks/useCurrency";

interface StickyCheckoutCTAProps {
  chatOutcome?: string;
}

export default function StickyCheckoutCTA({ chatOutcome }: StickyCheckoutCTAProps) {
  const [visible, setVisible] = useState(false);
  const hasSeenCheckout = useRef(false);
  const { currency, getDisplayPrice } = useCurrency();

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
  const trialPrice = getDisplayPrice(497, "trial");
  const getCtaText = () => {
    if (chatOutcome?.includes("FRANCHISE")) return `Start Your Franchise Trial for ${trialPrice.formatted}`;
    return `Get Started - from ${trialPrice.formatted}`;
  };

  function handleClick() {
    // Value reflects the minimum tier (Trial). The sticky CTA scrolls to
    // the checkout section where the user's actual tier selection is preserved.
    trackPixelEvent("InitiateCheckout", { value: trialPrice.amount, currency: currency || "GBP" });
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
      <p className="sticky-cta-credit">{trialPrice.formatted} Trial fee fully credited if you upgrade within 30 days</p>
    </div>
  );
}
