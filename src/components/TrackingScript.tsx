"use client";

import { useEffect, useRef } from "react";
import {
  getVisitorId,
  getStoredUtms,
  storeFirstTouchUtms,
  getFbCookies,
} from "@/lib/visitor";

const TRACKING_URL = process.env.NEXT_PUBLIC_TRACKING_URL;

const UTM_KEYS = [
  "utm_source",
  "utm_medium",
  "utm_campaign",
  "utm_content",
  "utm_term",
  "utm_placement",
  "utm_geo",
] as const;

export default function TrackingScript() {
  const hasFired = useRef(false);

  useEffect(() => {
    if (hasFired.current || !TRACKING_URL) return;
    hasFired.current = true;

    // Parse UTMs from current URL
    const params = new URLSearchParams(window.location.search);
    const urlUtms: Record<string, string> = {};
    for (const key of UTM_KEYS) {
      const val = params.get(key);
      if (val) urlUtms[key] = val;
    }

    // Store first-touch UTMs (only writes if none stored yet)
    storeFirstTouchUtms(urlUtms);

    // Use current URL UTMs, fallback to stored first-touch
    const utms =
      Object.keys(urlUtms).length > 0 ? urlUtms : getStoredUtms();

    const vid = getVisitorId();
    const { fbc, fbp } = getFbCookies();

    const payload = {
      visitor_id: vid,
      event_type: "page_view",
      page_url: window.location.href,
      utm_source: utms.utm_source || null,
      utm_medium: utms.utm_medium || null,
      utm_campaign: utms.utm_campaign || null,
      utm_content: utms.utm_content || null,
      utm_term: utms.utm_term || null,
      utm_placement: utms.utm_placement || null,
      utm_geo: utms.utm_geo || null,
      fbc: fbc || null,
      fbp: fbp || null,
    };

    fetch(`${TRACKING_URL}/api/track`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(payload),
    }).catch((err) => {
      console.error("[tracking] Failed to send page view:", err);
    });
  }, []);

  return null;
}
