/**
 * Visitor cookie utilities.
 * Manages _vid (visitor ID), _utms (first-touch UTMs), and reads Meta cookies.
 * Used by TrackingScript.tsx and CheckoutSection.tsx.
 */

const VID_COOKIE = "_vid";
const UTM_COOKIE = "_utms";
const COOKIE_DAYS = 365;

function setCookie(name: string, value: string, days: number): void {
  const d = new Date();
  d.setTime(d.getTime() + days * 86400000);
  document.cookie = `${name}=${encodeURIComponent(value)};expires=${d.toUTCString()};path=/;SameSite=Lax`;
}

function getCookie(name: string): string | null {
  const match = document.cookie.match(new RegExp(`(^| )${name}=([^;]+)`));
  return match ? decodeURIComponent(match[2]) : null;
}

/** Get or create a persistent visitor ID cookie (365 days). */
export function getVisitorId(): string {
  let vid = getCookie(VID_COOKIE);
  if (!vid) {
    vid = typeof crypto.randomUUID === "function"
      ? crypto.randomUUID()
      : `${Date.now()}-${Math.random().toString(36).slice(2, 11)}`;
    setCookie(VID_COOKIE, vid, COOKIE_DAYS);
  }
  return vid;
}

/** Read stored first-touch UTM parameters from cookie. */
export function getStoredUtms(): Record<string, string> {
  const raw = getCookie(UTM_COOKIE);
  if (raw) {
    try {
      return JSON.parse(raw);
    } catch {
      // Corrupted cookie. Ignore
    }
  }
  return {};
}

/** Store first-touch UTMs. Only writes if no UTMs are already stored. */
export function storeFirstTouchUtms(utms: Record<string, string>): void {
  const existing = getCookie(UTM_COOKIE);
  if (!existing && Object.keys(utms).length > 0) {
    setCookie(UTM_COOKIE, JSON.stringify(utms), COOKIE_DAYS);
  }
}

/**
 * Construct _fbc from fbclid URL param if Meta Pixel hasn't set it yet.
 * Format: fb.1.{timestamp_ms}.{fbclid}
 * Also stores fbclid in the _utms cookie for persistence.
 */
export function ensureFbcFromUrl(): void {
  if (typeof window === "undefined") return;
  const existing = getCookie("_fbc");
  if (existing) return;

  const params = new URLSearchParams(window.location.search);
  const fbclid = params.get("fbclid");
  if (!fbclid) return;

  const fbc = `fb.1.${Date.now()}.${fbclid}`;
  setCookie("_fbc", fbc, COOKIE_DAYS);

  // Also persist fbclid in _utms so it survives even if _fbc cookie is lost
  const raw = getCookie(UTM_COOKIE);
  if (raw) {
    try {
      const utms = JSON.parse(raw);
      if (!utms.fbclid) {
        utms.fbclid = fbclid;
        setCookie(UTM_COOKIE, JSON.stringify(utms), COOKIE_DAYS);
      }
    } catch { /* ignore */ }
  }
}

/**
 * Read Meta's _fbc and _fbp cookies.
 * Falls back to constructing _fbc from stored fbclid if Meta Pixel hasn't set it.
 */
export function getFbCookies(): { fbc: string | null; fbp: string | null } {
  let fbc = getCookie("_fbc");

  // Fallback: construct from stored fbclid if _fbc cookie was lost (cross-session)
  if (!fbc) {
    const stored = getStoredUtms();
    if (stored.fbclid) {
      fbc = `fb.1.${Date.now()}.${stored.fbclid}`;
      setCookie("_fbc", fbc, COOKIE_DAYS);
    }
  }

  return {
    fbc,
    fbp: getCookie("_fbp"),
  };
}
