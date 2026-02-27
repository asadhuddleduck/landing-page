"use client";

import { useEffect, useRef } from "react";
import { trackPixelEvent } from "./MetaPixel";
import { track } from "@vercel/analytics";
import { gtagEvent } from "@/lib/ga";

/**
 * Fires Meta Pixel Purchase event on the /success page.
 * Uses stripe_{eventId} as event_id to deduplicate with server-side CAPI.
 * eventId can be a checkout session ID or a payment intent ID.
 */
interface SuccessPixelProps {
  eventId: string;
  value?: number;
  currency?: string;
}

export default function SuccessPixel({ eventId, value = 497, currency = "GBP" }: SuccessPixelProps) {
  const hasFired = useRef(false);

  useEffect(() => {
    if (hasFired.current || !eventId) return;
    hasFired.current = true;

    trackPixelEvent(
      "Purchase",
      { value, currency },
      `stripe_${eventId}`
    );

    gtagEvent("purchase", {
      transaction_id: `stripe_${eventId}`,
      value,
      currency,
      items: [
        {
          item_id: value >= 1300 ? "ai-ad-engine-unlimited" : "ai-ad-engine-trial",
          item_name: value >= 1300 ? "AI Ad Engine Unlimited" : "AI Ad Engine Trial",
          price: value,
          quantity: 1,
        },
      ],
    });

    track("purchase_completed", { event_id: eventId });
  }, [eventId, value, currency]);

  return null;
}
