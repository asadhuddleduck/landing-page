import { createHash } from "node:crypto";
import type { Client } from "@libsql/client";
import type { Application, Effect } from "./service.ts";
import { salesCrm } from "../sales-crm.ts";

const hash = (v: string) => createHash("sha256").update(v.trim().toLowerCase()).digest("hex");
export function createAgencyDispatch(db: Client, fetcher: typeof fetch = fetch) {
  return async function dispatch(effect: Effect, app: Application): Promise<string> {
    if (app.isTest) return "internal-test-no-dispatch";
    if (effect.kind === "notion") {
      const marker = `AGENCY_APPLICATION:${app.id}`;
      const booking = (await db.execute({ sql: "SELECT state FROM agency_bookings WHERE application_id=?", args: [app.id] })).rows[0];
      const notes = `${marker}\nQualification: ${app.qualified ? "3+ open locations; booking available" : "manual review"}\nCurrently open locations: ${app.data.openLocations}\nRole: ${app.data.role}\nDecision authority: ${app.data.decisionMaker}\nMarketing spend: ${app.data.marketingSpend}\nMain challenge: ${app.data.challenge}\nStart: ${app.data.startTiming}\nInstagram: ${app.data.instagram}\nAttribution: ${JSON.stringify(app.data.attribution)}`;
      const pageId = await salesCrm(fetcher).agency({ applicationId: app.id, knownPageId: app.notionPageId,
        business: app.data.businessName, name: app.data.personName, email: app.email, phone: app.data.phone,
        locations: app.data.openLocations, instagram: app.data.instagram, notes, createdAt: app.createdAt,
        booked: booking?.state === "accepted" });
      await db.execute({ sql: "UPDATE agency_applications SET notion_page_id=? WHERE id=?", args: [pageId, app.id] });
      return JSON.stringify({ pageId, source: marker });
    }
    const token = process.env.AGENCY_META_ACCESS_TOKEN ?? process.env.META_ACCESS_TOKEN;
    const pixel = process.env.AGENCY_META_PIXEL_ID ?? process.env.META_PIXEL_ID;
    if (!token || !pixel) throw new Error("Agency conversion tracking is not configured");
    const data = app.data as typeof app.data & { userAgent?: string; ipAddress?: string };
    const attribution = data.attribution;
    const eventName = effect.kind === "meta_schedule" ? "Schedule" : "Lead";
    const eventId = eventName === "Lead" ? `agency_application_${app.id}` : `agency_booking_${String(effect.payload.uid)}`;
    const response = await fetcher(`https://graph.facebook.com/v25.0/${encodeURIComponent(pixel)}/events`, {
      method: "POST", signal: AbortSignal.timeout(15000), headers: { Authorization: `Bearer ${token}`, "Content-Type": "application/json" },
      body: JSON.stringify({ data: [{ event_name: eventName, event_id: eventId, event_time: Math.floor(Date.now() / 1000), action_source: "website", event_source_url: "https://huddleduck.co.uk/workwithus-waitlist", user_data: {
        em: [hash(app.email)], ph: [hash(app.data.phone.replace(/\D/g, ""))],
        ...(data.userAgent ? { client_user_agent: data.userAgent } : {}), ...(data.ipAddress ? { client_ip_address: data.ipAddress } : {}),
        ...(attribution.fbc ? { fbc: attribution.fbc } : {}), ...(attribution.fbp ? { fbp: attribution.fbp } : {}),
      }, custom_data: { content_name: "Huddle Duck agency enquiry", content_category: "agency_queue_retest" } }] }),
    });
    const receipt = await response.json().catch(() => null);
    if (!response.ok || receipt?.events_received !== 1) throw new Error("Agency conversion receipt missing");
    return JSON.stringify({ eventName, eventId, received: receipt.events_received });
  };
}
