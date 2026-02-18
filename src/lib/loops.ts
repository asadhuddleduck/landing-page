/**
 * Loops.so API wrapper: email marketing automation.
 *
 * Trigger automation sequences from code by sending events.
 * Build the actual email sequences in the Loops dashboard.
 *
 * Requires: LOOPS_API_KEY in env vars.
 */

const LOOPS_BASE = "https://app.loops.so/api/v1";

function getApiKey(): string {
  const key = process.env.LOOPS_API_KEY;
  if (!key) throw new Error("LOOPS_API_KEY env var is not set");
  return key;
}

function headers(): HeadersInit {
  return {
    Authorization: `Bearer ${getApiKey()}`,
    "Content-Type": "application/json",
  };
}

// --- Public API ---

export interface LoopsContactInput {
  email: string;
  firstName?: string | null;
  lastName?: string | null;
  source?: string | null;
  utmSource?: string | null;
  utmMedium?: string | null;
  utmCampaign?: string | null;
  /** Any additional custom properties defined in Loops */
  [key: string]: unknown;
}

/**
 * Create or update a contact in Loops.
 * If the email already exists, the contact is updated with the new properties.
 */
export async function addContact(input: LoopsContactInput): Promise<void> {
  try {
    const body: Record<string, unknown> = {
      email: input.email,
    };

    if (input.firstName) body.firstName = input.firstName;
    if (input.lastName) body.lastName = input.lastName;
    if (input.source) body.source = input.source;
    if (input.utmSource) body.utm_source = input.utmSource;
    if (input.utmMedium) body.utm_medium = input.utmMedium;
    if (input.utmCampaign) body.utm_campaign = input.utmCampaign;

    const res = await fetch(`${LOOPS_BASE}/contacts/create`, {
      method: "POST",
      headers: headers(),
      body: JSON.stringify(body),
    });

    if (!res.ok) {
      const text = await res.text();
      console.error(`[loops] addContact failed (${res.status}):`, text);
      return;
    }

    console.log(`[loops] Contact added/updated: ${input.email}`);
  } catch (err) {
    console.error("[loops] addContact error:", err);
  }
}

/**
 * Send an event to Loops, which triggers any automation
 * sequences that listen for this event name.
 */
export async function triggerEvent(
  email: string,
  eventName: string,
  eventProperties?: Record<string, unknown>
): Promise<void> {
  try {
    const body: Record<string, unknown> = {
      email,
      eventName,
    };

    if (eventProperties) {
      body.eventProperties = eventProperties;
    }

    const res = await fetch(`${LOOPS_BASE}/events/send`, {
      method: "POST",
      headers: headers(),
      body: JSON.stringify(body),
    });

    if (!res.ok) {
      const text = await res.text();
      console.error(`[loops] triggerEvent failed (${res.status}):`, text);
      return;
    }

    console.log(`[loops] Event "${eventName}" sent for ${email}`);
  } catch (err) {
    console.error("[loops] triggerEvent error:", err);
  }
}

/**
 * Send a transactional email (one-off, not part of an automation).
 * You create the transactional template in the Loops dashboard first,
 * then reference it by its transactionalId.
 */
export async function sendTransactional(
  email: string,
  transactionalId: string,
  dataVariables?: Record<string, string>
): Promise<void> {
  try {
    const body: Record<string, unknown> = {
      email,
      transactionalId,
    };

    if (dataVariables) {
      body.dataVariables = dataVariables;
    }

    const res = await fetch(`${LOOPS_BASE}/transactional`, {
      method: "POST",
      headers: headers(),
      body: JSON.stringify(body),
    });

    if (!res.ok) {
      const text = await res.text();
      console.error(`[loops] sendTransactional failed (${res.status}):`, text);
      return;
    }

    console.log(`[loops] Transactional "${transactionalId}" sent to ${email}`);
  } catch (err) {
    console.error("[loops] sendTransactional error:", err);
  }
}
