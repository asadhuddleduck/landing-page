import { agencyService, applicationId, failure } from "@/lib/agency/runtime";
import { AgencyInputError } from "@/lib/agency/service";
export const runtime = "nodejs";
export const dynamic = "force-dynamic";
export async function GET(request: Request) {
  try {
    const service = agencyService(), id = applicationId(request), app = await service.application(id);
    if (!app?.qualified) throw new AgencyInputError(403, "Please complete your enquiry first.");
    const booking = await service.booking(id);
    return Response.json({ ok: true, slots: booking?.state === "accepted" ? [] : await service.slots(), timeZone: "Europe/London", durationMinutes: 30, booking: booking ? { status: booking.state, start: booking.start, end: booking.end, meetingUrl: booking.meetingUrl } : null }, { headers: { "Cache-Control": "no-store" } });
  } catch (error) { return failure(error); }
}
