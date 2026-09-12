import { db } from "@/lib/db";
import { authenticateEmailCallback } from "@/lib/hatchflow-email";
import { landingPageEmailSource } from "@/lib/email-source";

export async function POST(request: Request) {
  if (!authenticateEmailCallback(request, process.env.HATCHFLOW_EMAIL_SECRET)) return Response.json({ error: "Unauthorized" }, { status: 401 });
  const body = await request.json().catch(() => null);
  if (!body || typeof body.receiptId !== "string" || !body.receiptId) return Response.json({ error: "Receipt id required" }, { status: 400 });
  await landingPageEmailSource(db).recordReceipt(body);
  return Response.json({ ok: true });
}
