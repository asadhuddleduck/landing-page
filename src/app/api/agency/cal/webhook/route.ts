import { after } from "next/server";
import { verifyWebhook } from "@/lib/agency/core";
import { createAgencyCal } from "@/lib/agency/cal";
import { agencyService, failure } from "@/lib/agency/runtime";
export const runtime = "nodejs";
export const maxDuration = 30;
export async function POST(request: Request) {
  const body = await request.text();
  if (body.length > 200000 || !verifyWebhook(body, request.headers.get("x-cal-signature-256"), process.env.AGENCY_CAL_WEBHOOK_SECRET ?? "")) return Response.json({ error: "invalid_signature" }, { status: 401 });
  try {
    const event = JSON.parse(body);
    if (!["BOOKING_CREATED", "BOOKING_CONFIRMED", "BOOKING_RESCHEDULED", "BOOKING_CANCELLED", "BOOKING_REJECTED", "BOOKING_REQUESTED"].includes(event.triggerEvent)) return Response.json({ received: true, ignored: true });
    const uid = event.payload?.uid;
    if (typeof uid !== "string" || !uid || uid.length > 200) return Response.json({ error: "invalid_event" }, { status: 400 });
    const cal = createAgencyCal({ apiKey: process.env.CAL_API_KEY ?? "", eventTypeId: Number(process.env.AGENCY_CAL_EVENT_TYPE_ID), ownerId: process.env.AGENCY_CAL_OWNER_ID ?? "" });
    const canonical = await cal.get(uid), service = agencyService();
    await service.applyMeeting(canonical);
    after(async () => { await service.flush(4); });
    return Response.json({ received: true });
  } catch (error) { return failure(error); }
}
