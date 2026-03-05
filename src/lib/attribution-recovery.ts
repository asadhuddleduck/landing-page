import { createClient } from "@libsql/client";

/**
 * Attribution recovery: queries the attribution-tracker DB to recover
 * UTMs and fbc when they're missing from the current purchase session.
 *
 * This handles the cross-browser scenario (e.g., user clicks ad in
 * Facebook in-app browser, then completes purchase in Safari).
 * We match by IP address to find the original ad click.
 */

let atClient: ReturnType<typeof createClient> | null = null;

function getAtClient() {
  if (!atClient) {
    const url = process.env.ATTRIBUTION_TRACKER_DB_URL;
    const token = process.env.ATTRIBUTION_TRACKER_DB_TOKEN;
    if (!url || !token) return null;
    atClient = createClient({ url, authToken: token });
  }
  return atClient;
}

interface RecoveredAttribution {
  utm_source: string;
  utm_medium: string;
  utm_campaign: string;
  utm_content: string;
  fbc: string | null;
}

/**
 * Look up the attribution-tracker contacts table by IP address
 * to find the original ad click with UTM data and construct fbc from the page URL's fbclid.
 */
export async function recoverAttributionByIp(
  ip: string
): Promise<RecoveredAttribution | null> {
  const client = getAtClient();
  if (!client) return null;

  try {
    // Find the most recent contact from this IP that has UTM data
    const result = await client.execute({
      sql: `SELECT utm_source, utm_medium, utm_campaign, utm_content
            FROM contacts
            WHERE ip_address = ? AND utm_source IS NOT NULL AND utm_source != ''
            ORDER BY created_at DESC LIMIT 1`,
      args: [ip],
    });

    if (result.rows.length === 0) return null;

    const row = result.rows[0];

    // Try to find the fbclid from the page_url in events for this IP
    const eventsResult = await client.execute({
      sql: `SELECT e.page_url
            FROM events e
            JOIN contacts c ON e.contact_id = c.id
            WHERE c.ip_address = ? AND e.page_url LIKE '%fbclid=%'
            ORDER BY e.created_at DESC LIMIT 1`,
      args: [ip],
    });

    let fbc: string | null = null;
    if (eventsResult.rows.length > 0) {
      const pageUrl = eventsResult.rows[0].page_url as string;
      try {
        const url = new URL(pageUrl);
        const fbclid = url.searchParams.get("fbclid");
        if (fbclid) {
          const timestamp = Date.now();
          fbc = `fb.1.${timestamp}.${fbclid}`;
        }
      } catch { /* invalid URL, skip */ }
    }

    return {
      utm_source: (row.utm_source as string) || "",
      utm_medium: (row.utm_medium as string) || "",
      utm_campaign: (row.utm_campaign as string) || "",
      utm_content: (row.utm_content as string) || "",
      fbc,
    };
  } catch (err) {
    console.error("[attribution-recovery] Failed to query attribution-tracker:", err);
    return null;
  }
}

/**
 * Update the attribution-tracker contact to "customer" status by email.
 * Creates a new contact if none exists, or upgrades existing one.
 */
export async function markContactAsCustomer(
  email: string,
  ip?: string
): Promise<void> {
  const client = getAtClient();
  if (!client) return;

  try {
    // Try to find by email first, then by IP
    const result = await client.execute({
      sql: `SELECT id, status FROM contacts WHERE ip_address = ? AND (utm_source IS NOT NULL AND utm_source != '') ORDER BY created_at DESC LIMIT 1`,
      args: [ip || ""],
    });

    if (result.rows.length > 0) {
      const contactId = result.rows[0].id as string;
      const currentStatus = result.rows[0].status as string;
      const statusRank: Record<string, number> = { anonymous: 0, lead: 1, booked: 2, customer: 3 };
      if ((statusRank[currentStatus] || 0) < 3) {
        await client.execute({
          sql: `UPDATE contacts SET status = 'customer', email = COALESCE(NULLIF(email, ''), ?), updated_at = datetime('now') WHERE id = ?`,
          args: [email, contactId],
        });
        console.log(`[attribution-recovery] Updated contact ${contactId} to customer`);
      }
    }
  } catch (err) {
    console.error("[attribution-recovery] Failed to update contact:", err);
  }
}
