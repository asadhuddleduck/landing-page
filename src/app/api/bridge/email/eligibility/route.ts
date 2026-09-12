import { db } from "@/lib/db";
import { stripe } from "@/lib/stripe";
import { authenticateEmailCallback } from "@/lib/hatchflow-email";
import { landingPageEligibility, landingPageEmailSource } from "@/lib/email-source";

export async function POST(request: Request) {
  if (!authenticateEmailCallback(request, process.env.HATCHFLOW_EMAIL_SECRET)) return Response.json({ error: "Unauthorized" }, { status: 401 });
  const body = await request.json().catch(() => null);
  if (!body || body.source !== "landing-page" || typeof body.sourceJobId !== "string") return Response.json({ error: "Invalid source job" }, { status: 400 });
  const saved = await landingPageEmailSource(db).getJob(body.sourceJobId);
  if (!saved || saved.request.to !== body.to || saved.request.category !== body.category || saved.request.contentVersion !== body.contentVersion) {
    return Response.json({ eligible: false, reason: "saved_job_mismatch" });
  }
  return Response.json(await landingPageEligibility(db, saved.request, async sessionId => {
    const session = await stripe.checkout.sessions.retrieve(sessionId);
    return session.payment_status === "paid" || session.payment_status === "no_payment_required";
  }));
}
