"use client";

import { useEffect, useRef } from "react";
import { trackPixelEvent } from "./MetaPixel";
import { track } from "@vercel/analytics";

/**
 * Fires Meta Pixel Purchase event on the /success page.
 * Uses stripe_{eventId} as event_id to deduplicate with server-side CAPI.
 * eventId can be a checkout session ID or a payment intent ID.
 */
export default function SuccessPixel({ eventId }: { eventId: string }) {
  const hasFired = useRef(false);

  useEffect(() => {
    if (hasFired.current || !eventId) return;
    hasFired.current = true;

    trackPixelEvent(
      "Purchase",
      { value: 497, currency: "GBP" },
      `stripe_${eventId}`
    );

    track("purchase_completed", { event_id: eventId });
  }, [eventId]);

  return null;
}
