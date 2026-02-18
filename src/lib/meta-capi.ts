import crypto from "crypto";

/**
 * Meta Conversions API (CAPI) — sends server-side events to Meta
 * so your ad campaigns can optimise for real conversions.
 *
 * Uses facebook-nodejs-business-sdk under the hood.
 * Requires: META_ACCESS_TOKEN, META_PIXEL_ID in env vars.
 */

// The SDK doesn't ship proper ESM — use require-style import
// eslint-disable-next-line @typescript-eslint/no-require-imports
const bizSdk = require("facebook-nodejs-business-sdk");

const {
  EventRequest,
  ServerEvent,
  UserData,
  CustomData,
} = bizSdk;

// --- Helpers ---

function sha256(value: string): string {
  return crypto
    .createHash("sha256")
    .update(value.toLowerCase().trim())
    .digest("hex");
}

function getPixelId(): string {
  const id = process.env.META_PIXEL_ID;
  if (!id) throw new Error("META_PIXEL_ID env var is not set");
  return id;
}

function getAccessToken(): string {
  const token = process.env.META_ACCESS_TOKEN;
  if (!token) throw new Error("META_ACCESS_TOKEN env var is not set");
  return token;
}

// --- Public API ---

export interface CAPIEventInput {
  /** Meta standard event name: Lead, Purchase, Schedule, ViewContent, CompleteRegistration, etc. */
  eventName: string;

  /** URL where the event occurred */
  eventSourceUrl?: string;

  /** Unique event ID for deduplication with the Meta Pixel */
  eventId?: string;

  // User matching data (at least one required for good match rates)
  email?: string | null;
  phone?: string | null;
  ipAddress?: string | null;
  userAgent?: string | null;

  /** Facebook click ID from _fbc cookie */
  fbc?: string | null;
  /** Facebook browser ID from _fbp cookie */
  fbp?: string | null;

  // Custom data
  currency?: string;
  value?: number;
}

/**
 * Send a conversion event to Meta's Conversions API.
 *
 * Call this from webhook handlers after saving the event to Turso.
 * The event is sent asynchronously — errors are logged, not thrown,
 * so it never blocks the webhook response.
 */
export async function sendConversionEvent(
  input: CAPIEventInput
): Promise<void> {
  try {
    const accessToken = getAccessToken();
    const pixelId = getPixelId();

    // Initialise the API (idempotent — safe to call multiple times)
    bizSdk.FacebookAdsApi.init(accessToken);

    // Build user data with hashed PII
    const userData = new UserData();

    if (input.email) {
      userData.setEmail(sha256(input.email));
    }
    if (input.phone) {
      // Remove non-digits, then hash
      const cleaned = input.phone.replace(/\D/g, "");
      userData.setPhone(sha256(cleaned));
    }
    if (input.ipAddress) {
      userData.setClientIpAddress(input.ipAddress);
    }
    if (input.userAgent) {
      userData.setClientUserAgent(input.userAgent);
    }
    if (input.fbc) {
      userData.setFbc(input.fbc);
    }
    if (input.fbp) {
      userData.setFbp(input.fbp);
    }

    // Build the server event
    const serverEvent = new ServerEvent();
    serverEvent.setEventName(input.eventName);
    serverEvent.setEventTime(Math.floor(Date.now() / 1000));
    serverEvent.setActionSource("website");
    serverEvent.setUserData(userData);

    if (input.eventSourceUrl) {
      serverEvent.setEventSourceUrl(input.eventSourceUrl);
    }

    if (input.eventId) {
      serverEvent.setEventId(input.eventId);
    }

    // Add custom data (value, currency) if provided
    if (input.value !== undefined || input.currency) {
      const customData = new CustomData();
      if (input.value !== undefined) customData.setValue(input.value);
      if (input.currency) customData.setCurrency(input.currency);
      serverEvent.setCustomData(customData);
    }

    // Fire the event
    const eventRequest = new EventRequest(accessToken, pixelId);
    eventRequest.setEvents([serverEvent]);

    const response = await eventRequest.execute();
    console.log(
      `[meta-capi] ${input.eventName} sent — events_received: ${response?.events_received}`
    );
  } catch (err) {
    // Log but don't throw — CAPI should never block the main flow
    console.error(`[meta-capi] Failed to send ${input.eventName}:`, err);
  }
}
