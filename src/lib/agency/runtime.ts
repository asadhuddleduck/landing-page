import { db } from "../db";
import { createAgencyCal } from "./cal.ts";
import { createAgencyDispatch } from "./effects.ts";
import { createAgencyService } from "./service.ts";
import { AgencyInputError } from "./service.ts";
import { readBookingToken, equalSecret } from "./core.ts";

let service: ReturnType<typeof createAgencyService> | null = null;
export function agencyService() {
  if (!service) service = createAgencyService({ db, cal: createAgencyCal({ apiKey: process.env.CAL_API_KEY ?? "", eventTypeId: Number(process.env.AGENCY_CAL_EVENT_TYPE_ID), ownerId: process.env.AGENCY_CAL_OWNER_ID ?? "" }), dispatch: createAgencyDispatch(db) });
  return service;
}
export function applicationId(request: Request): string {
  const token = request.headers.get("authorization")?.replace(/^Bearer /i, "") ?? "";
  const id = readBookingToken(token, process.env.AGENCY_BOOKING_SECRET ?? "");
  if (!id) throw new AgencyInputError(401, "Please submit your enquiry again to choose a time.");
  return id;
}
export function isInternalTest(request: Request): boolean {
  return equalSecret(request.headers.get("x-agency-test-key") ?? "", process.env.AGENCY_INTERNAL_TEST_KEY ?? "");
}
export async function jsonBody(request: Request): Promise<unknown> {
  if (Number(request.headers.get("content-length") ?? 0) > 32768) throw new AgencyInputError(413, "The request is too large.");
  const body = await request.text();
  if (body.length > 32768) throw new AgencyInputError(413, "The request is too large.");
  try { return JSON.parse(body); } catch { throw new AgencyInputError(400, "Please check your form and try again."); }
}
export function checkOrigin(request: Request) {
  const origin = request.headers.get("origin");
  if (origin && new URL(origin).host !== new URL(request.url).host) throw new AgencyInputError(403, "Please submit the form on our website.");
}
export function failure(error: unknown): Response {
  if (error instanceof AgencyInputError) return Response.json({ ok: false, error: error.message }, { status: error.status, headers: { "Cache-Control": "no-store" } });
  console.error("Agency request failed", error instanceof Error ? error.name : "unknown");
  return Response.json({ ok: false, error: "We could not complete that step. Your saved enquiry is safe. Please try again shortly." }, { status: 503, headers: { "Cache-Control": "no-store" } });
}
