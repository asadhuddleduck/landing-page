import { createHash, createHmac, timingSafeEqual } from "node:crypto";
import { z } from "zod";

const text = (max: number) => z.string().trim().max(max);
export const applicationSchema = z.object({
  submissionKey: z.string().uuid(),
  personName: text(120).min(1), email: z.string().trim().email().max(254).transform(v => v.toLowerCase()),
  phone: text(40).min(7).refine(v => /^\+?[\d\s().-]{7,40}$/.test(v), "Enter a valid phone number"),
  businessName: text(200).min(1), instagram: text(300).optional().default(""),
  foodBusiness: z.boolean(), openLocations: z.number().int().min(0).max(10000),
  role: text(160).min(1), decisionMaker: z.enum(["yes", "involved", "no"]),
  marketingSpend: text(100).min(1), challenge: text(2000).min(1), startTiming: text(100).min(1),
  attribution: z.record(z.string().max(60), z.string().max(1000)).optional().default({}),
  website_url_confirm: text(300).optional().default(""),
});
export type ApplicationInput = z.infer<typeof applicationSchema>;
export const QUALIFICATION_VERSION = "agency-food-3-open-locations-v1";
export const qualifies = (input: Pick<ApplicationInput, "foodBusiness" | "openLocations">) => input.foodBusiness && input.openLocations >= 3;
export const digest = (input: string) => createHash("sha256").update(input).digest("hex");
export function equalSecret(a: string, b: string): boolean {
  return Boolean(a && b) && timingSafeEqual(Buffer.from(digest(a)), Buffer.from(digest(b)));
}
export function issueBookingToken(id: string, secret: string, now = Date.now()): string {
  if (secret.length < 32) throw new Error("Agency booking signing key is unavailable");
  const body = `${id}.${Math.floor(now / 1000) + 7 * 86400}`;
  return `${body}.${createHmac("sha256", secret).update(body).digest("base64url")}`;
}
export function readBookingToken(token: string, secret: string, now = Date.now()): string | null {
  if (secret.length < 32 || token.length > 300) return null;
  const [id, expires, signature, extra] = token.split(".");
  if (extra || !id || !/^[\da-f-]{36}$/i.test(id) || !/^\d{10}$/.test(expires ?? "") || Number(expires) <= now / 1000) return null;
  const expected = createHmac("sha256", secret).update(`${id}.${expires}`).digest("base64url");
  return equalSecret(signature ?? "", expected) ? id : null;
}
export function verifyWebhook(body: string, signature: string | null, secret: string): boolean {
  if (!secret || !signature) return false;
  const actual = signature.replace(/^sha256=/, "");
  if (!/^[a-f\d]{64}$/i.test(actual)) return false;
  return timingSafeEqual(Buffer.from(actual, "hex"), createHmac("sha256", secret).update(body).digest());
}
export function sourceAttribution(input: Record<string, string>): Record<string, string> {
  const allowed = ["utm_source", "utm_medium", "utm_campaign", "utm_content", "utm_term", "campaign_id", "adset_id", "ad_id", "fbclid", "fbc", "fbp", "visitor_id", "referrer", "first_touch"];
  return Object.fromEntries(allowed.filter(k => input[k]).map(k => [k, input[k].slice(0, 1000)]));
}
