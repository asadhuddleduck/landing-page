import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import crypto from "crypto";
import { submitWaitlist } from "@/lib/waitlist";
import { reportError } from "@/lib/error-reporting";

export const runtime = "nodejs";
export const maxDuration = 30;

const rateLimitMap = new Map<string, { count: number; windowStart: number }>();
const RATE_LIMIT_MAX = 20;
const RATE_LIMIT_WINDOW_MS = 60 * 60 * 1000;

function isRateLimited(ip: string): boolean {
  if (ip === "unknown") return false;
  const now = Date.now();
  const entry = rateLimitMap.get(ip);
  if (!entry || now - entry.windowStart > RATE_LIMIT_WINDOW_MS) {
    rateLimitMap.set(ip, { count: 1, windowStart: now });
    return false;
  }
  entry.count++;
  return entry.count > RATE_LIMIT_MAX;
}

setInterval(() => {
  const now = Date.now();
  for (const [k, e] of rateLimitMap) {
    if (now - e.windowStart > RATE_LIMIT_WINDOW_MS) rateLimitMap.delete(k);
  }
}, 10 * 60 * 1000).unref();

const optionalUrl = z
  .string()
  .trim()
  .max(500)
  .optional()
  .transform((v) => (v && v.length > 0 ? v : undefined));

const optionalText = (max: number) =>
  z
    .string()
    .trim()
    .max(max)
    .optional()
    .transform((v) => (v && v.length > 0 ? v : undefined));

const stage1Schema = z.object({
  personName: z.string().trim().min(1).max(120),
  email: z.string().trim().email().max(254),
  phone: optionalText(40),
  whatsapp: optionalText(40),
  businessName: z.string().trim().min(1).max(200),
  instagram: optionalUrl,
  tiktok: optionalUrl,
  city: optionalText(120),
  briefInfo: optionalText(1000),
  utmSource: optionalText(120),
  utmMedium: optionalText(120),
  utmCampaign: optionalText(120),
  fbc: optionalText(500),
  fbp: optionalText(500),
  // Honeypot — accept anything in the schema; handler short-circuits if filled
  website_url_confirm: z.string().optional(),
});

function hashIp(ip: string): string {
  return crypto.createHash("sha256").update(ip).digest("hex").slice(0, 32);
}

export async function POST(req: NextRequest) {
  let body: unknown;
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ ok: false, error: "Invalid JSON" }, { status: 400 });
  }

  const parsed = stage1Schema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json(
      { ok: false, error: "Validation failed", issues: parsed.error.issues.map((i) => i.message) },
      { status: 400 },
    );
  }

  // Honeypot — silently 200 to fool bots
  if (parsed.data.website_url_confirm && parsed.data.website_url_confirm.length > 0) {
    return NextResponse.json({ ok: true });
  }

  const ip = req.headers.get("x-forwarded-for")?.split(",")[0]?.trim() || "unknown";
  if (isRateLimited(ip)) {
    return NextResponse.json({ ok: false, error: "Rate limit exceeded" }, { status: 429 });
  }

  const userAgent = req.headers.get("user-agent") ?? undefined;

  try {
    const result = await submitWaitlist({
      personName: parsed.data.personName,
      email: parsed.data.email,
      phone: parsed.data.phone,
      whatsapp: parsed.data.whatsapp,
      businessName: parsed.data.businessName,
      instagram: parsed.data.instagram,
      tiktok: parsed.data.tiktok,
      city: parsed.data.city,
      briefInfo: parsed.data.briefInfo,
      utmSource: parsed.data.utmSource,
      utmMedium: parsed.data.utmMedium,
      utmCampaign: parsed.data.utmCampaign,
      fbc: parsed.data.fbc,
      fbp: parsed.data.fbp,
      ipAddress: ip === "unknown" ? undefined : ip,
      ipHash: ip === "unknown" ? undefined : hashIp(ip),
      userAgent,
    });

    return NextResponse.json({ ok: true, signupId: result.signupId });
  } catch (err) {
    await reportError(err, {
      route: "/api/waitlist",
      severity: "critical",
      extra: { email: parsed.data.email },
    });
    return NextResponse.json({ ok: false, error: "Failed to save" }, { status: 500 });
  }
}
