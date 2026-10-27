import { after } from "next/server";
import { z } from "zod";
import { agencyService, applicationId, checkOrigin, failure, jsonBody } from "@/lib/agency/runtime";
import { AgencyInputError } from "@/lib/agency/service";
export const runtime = "nodejs";
export const maxDuration = 30;
function receipt(booking: Awaited<ReturnType<ReturnType<typeof agencyService>["booking"]>>) {
  return booking ? { status: booking.state, start: booking.start, end: booking.end, meetingUrl: booking.meetingUrl } : null;
}
export async function POST(request: Request) {
  try {
    checkOrigin(request);
    const id = applicationId(request), input = z.object({ start: z.string().datetime({ offset: true }) }).safeParse(await jsonBody(request));
    if (!input.success) throw new AgencyInputError(400, "Please choose a valid time.");
    const service = agencyService(), booking = await service.book(id, input.data.start), app = await service.application(id);
    after(async () => { await service.flush(4); });
    return Response.json({ ok: true, booking: receipt(booking), eventId: booking.state === "accepted" && !app?.isTest ? `agency_booking_${booking.uid}` : null }, { status: ["attempting", "uncertain", "pending"].includes(booking.state) ? 202 : 200, headers: { "Cache-Control": "no-store" } });
  } catch (error) { return failure(error); }
}
export async function GET(request: Request) {
  try { const service = agencyService(), booking = await service.reconcile(applicationId(request)); return Response.json({ ok: true, booking: receipt(booking) }, { headers: { "Cache-Control": "no-store" } }); }
  catch (error) { return failure(error); }
}
