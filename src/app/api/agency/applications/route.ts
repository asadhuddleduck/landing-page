import { after } from "next/server";
import { applicationSchema, digest, issueBookingToken, sourceAttribution } from "@/lib/agency/core";
import { agencyService, checkOrigin, failure, isInternalTest, jsonBody } from "@/lib/agency/runtime";
export const runtime = "nodejs";
export const maxDuration = 30;
export async function POST(request: Request) {
  try {
    checkOrigin(request);
    const parsed = applicationSchema.safeParse(await jsonBody(request));
    if (!parsed.success) return Response.json({ ok: false, error: "Please check the highlighted details.", issues: parsed.error.issues.map(i => ({ field: i.path.join("."), message: i.message })) }, { status: 400 });
    if (parsed.data.website_url_confirm) return Response.json({ ok: true, qualified: false });
    const input = { ...parsed.data, attribution: sourceAttribution(parsed.data.attribution) };
    const ip = request.headers.get("x-forwarded-for")?.split(",")[0]?.trim();
    const service = agencyService();
    const app = await service.submit(input, { isTest: isInternalTest(request), ipHash: ip ? digest(ip) : undefined, ipAddress: ip, userAgent: request.headers.get("user-agent") ?? undefined });
    const token = app.qualified ? issueBookingToken(app.id, process.env.AGENCY_BOOKING_SECRET ?? "") : null;
    after(async () => { await service.flush(4); });
    return Response.json({ ok: true, qualified: app.qualified, bookingToken: token, eventId: app.isTest ? null : `agency_application_${app.id}` }, { headers: { "Cache-Control": "no-store" } });
  } catch (error) { return failure(error); }
}
