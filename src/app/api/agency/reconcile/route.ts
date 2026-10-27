import { equalSecret } from "@/lib/agency/core";
import { agencyService, failure } from "@/lib/agency/runtime";
export const runtime = "nodejs";
export const maxDuration = 60;
export async function GET(request: Request) {
  if (!equalSecret(request.headers.get("authorization")?.replace(/^Bearer /i, "").trim() ?? "", process.env.CRON_SECRET?.trim() ?? "")) return Response.json({ error: "unauthorised" }, { status: 401 });
  try { const service = agencyService(); await service.recover(); const effects = await service.flush(10); return Response.json({ ok: true, effects }); }
  catch (error) { return failure(error); }
}
