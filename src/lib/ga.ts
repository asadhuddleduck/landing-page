/**
 * GA4 event helper — fires gtag events if available.
 * Safe to call server-side or before gtag loads (no-ops silently).
 */
export function gtagEvent(eventName: string, params?: Record<string, unknown>) {
  if (typeof window !== "undefined" && typeof window.gtag === "function") {
    window.gtag("event", eventName, params);
  }
}
