"use client";

import { useEffect, useRef } from "react";
import { trackPixelEvent } from "./MetaPixel";
import { track } from "@vercel/analytics";

/**
 * Fires Meta Pixel Purchase event on the /success page.
 * Uses stripe_{eventId} as event_id to deduplicate with server-side CAPI.
 * eventId can be a checkout session ID or a payment intent ID.
 */
interface SuccessPixelProps {
  eventId: string;
  value?: number;
}

export default function SuccessPixel({ eventId, value = 497 }: SuccessPixelProps) {
  const hasFired = useRef(false);

  useEffect(() => {
    if (hasFired.current || !eventId) return;
    hasFired.current = true;

    trackPixelEvent(
      "Purchase",
      { value, currency: "GBP" },
      `stripe_${eventId}`
    );

    track("purchase_completed", { event_id: eventId });
  }, [eventId, value]);

  return null;
}
