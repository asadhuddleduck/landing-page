import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { submitPriority } from "@/lib/waitlist";
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

const optionalText = (max: number) =>
  z
    .string()
    .trim()
    .max(max)
    .optional()
    .transform((v) => (v && v.length > 0 ? v : undefined));

const optionalNumber = z
  .union([z.number(), z.string()])
  .optional()
  .transform((v) => {
    if (v === undefined || v === null || v === "") return undefined;
    const n = typeof v === "number" ? v : Number(v);
    return Number.isFinite(n) ? n : undefined;
  });

const stage2Schema = z.object({
  email: z.string().trim().email().max(254),
  postingRegularly: z.enum(["Yes", "Sometimes", "No"]).optional(),
  usesCopyrightedMusic: z.enum(["Yes", "Mix", "No", "Unsure"]).optional(),
  monthlyContentSpendGbp: optionalNumber,
  hoursPerWeekOnContent: optionalNumber,
  teamSizeOnContent: optionalNumber,
  contentAlreadyWorking: z.enum(["Yes", "Somewhat", "No"]).optional(),
  anythingElse: optionalText(2000),
  website_url_confirm: z.string().optional(),
});

export async function POST(req: NextRequest) {
  let body: unknown;
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ ok: false, error: "Invalid JSON" }, { status: 400 });
  }

  const parsed = stage2Schema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json(
      { ok: false, error: "Validation failed", issues: parsed.error.issues.map((i) => i.message) },
      { status: 400 },
    );
  }

  if (parsed.data.website_url_confirm && parsed.data.website_url_confirm.length > 0) {
    return NextResponse.json({ ok: true });
  }

  const ip = req.headers.get("x-forwarded-for")?.split(",")[0]?.trim() || "unknown";
  if (isRateLimited(ip)) {
    return NextResponse.json({ ok: false, error: "Rate limit exceeded" }, { status: 429 });
  }

  try {
    const result = await submitPriority({
      email: parsed.data.email,
      postingRegularly: parsed.data.postingRegularly,
      usesCopyrightedMusic: parsed.data.usesCopyrightedMusic,
      monthlyContentSpendGbp: parsed.data.monthlyContentSpendGbp,
      hoursPerWeekOnContent: parsed.data.hoursPerWeekOnContent,
      teamSizeOnContent: parsed.data.teamSizeOnContent,
      contentAlreadyWorking: parsed.data.contentAlreadyWorking,
      anythingElse: parsed.data.anythingElse,
    });

    if (!result.matched) {
      return NextResponse.json(
        { ok: false, error: "We couldn't find your waitlist signup. Please join the waitlist first." },
        { status: 404 },
      );
    }

    return NextResponse.json({ ok: true });
  } catch (err) {
    await reportError(err, {
      route: "/api/waitlist/priority",
      severity: "critical",
      extra: { email: parsed.data.email },
    });
    return NextResponse.json({ ok: false, error: "Failed to save" }, { status: 500 });
  }
}
