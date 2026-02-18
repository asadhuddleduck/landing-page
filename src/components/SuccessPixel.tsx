"use client";

import { useEffect, useRef } from "react";
import { trackPixelEvent } from "./MetaPixel";
import { track } from "@vercel/analytics";

/**
 * Fires Meta Pixel Purchase event on the /success page.
 * Uses stripe_{sessionId} as event_id to deduplicate with server-side CAPI.
 */
export default function SuccessPixel({ sessionId }: { sessionId: string }) {
  const hasFired = useRef(false);

  useEffect(() => {
    if (hasFired.current || !sessionId) return;
    hasFired.current = true;

    trackPixelEvent(
      "Purchase",
      { value: 497, currency: "GBP" },
      `stripe_${sessionId}`
    );

    track("purchase_completed", { session_id: sessionId });
  }, [sessionId]);

  return null;
}
