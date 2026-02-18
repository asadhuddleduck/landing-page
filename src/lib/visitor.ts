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
    vid = crypto.randomUUID();
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

/** Read Meta's _fbc and _fbp cookies (set by Meta Pixel). */
export function getFbCookies(): { fbc: string | null; fbp: string | null } {
  return {
    fbc: getCookie("_fbc"),
    fbp: getCookie("_fbp"),
  };
}
