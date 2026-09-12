import { Client as NotionClient } from "@notionhq/client";
import { db } from "./db";
import { reportError } from "./error-reporting";
import { sendConversionEvent } from "./meta-capi";

const WAITLIST_DATA_SOURCE_ID = "35284fd7-bc4e-80a7-b3c5-000b5932cd01";
const WAITLIST_DB_ID = "35284fd7-bc4e-80fc-abb3-dd5c57232a49";
const SOURCE = "start.huddleduck.co.uk";

const notion = () => new NotionClient({ auth: process.env.NOTION_TOKEN?.trim() });

const rt = (s: string | null | undefined) =>
  s ? { rich_text: [{ text: { content: s.slice(0, 2000) } }] } : { rich_text: [] };
const sel = (name: string | null | undefined) =>
  name ? { select: { name } } : { select: null };

export interface Stage1Input {
  personName: string;
  email: string;
  phone?: string;
  whatsapp?: string;
  businessName: string;
  instagram?: string;
  tiktok?: string;
  city?: string;
  briefInfo?: string;
  utmSource?: string;
  utmMedium?: string;
  utmCampaign?: string;
  userAgent?: string;
  ipHash?: string;
  fbc?: string;
  fbp?: string;
  ipAddress?: string;
}

export interface Stage1Result {
  ok: boolean;
  signupId: number;
  email: string;
}

export async function submitWaitlist(input: Stage1Input): Promise<Stage1Result> {
  // 1. Turso insert (write-ahead log — even if Notion fails we keep the record)
  const insert = await db.execute({
    sql: `INSERT INTO waitlist_signups (
      person_name, email, phone, whatsapp, business_name,
      instagram, tiktok, city, brief_info,
      stage, source,
      utm_source, utm_medium, utm_campaign,
      user_agent, ip_hash
    ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, 'Joined', ?, ?, ?, ?, ?, ?)`,
    args: [
      input.personName,
      input.email.toLowerCase(),
      input.phone ?? null,
      input.whatsapp ?? null,
      input.businessName,
      input.instagram ?? null,
      input.tiktok ?? null,
      input.city ?? null,
      input.briefInfo ?? null,
      SOURCE,
      input.utmSource ?? null,
      input.utmMedium ?? null,
      input.utmCampaign ?? null,
      input.userAgent ?? null,
      input.ipHash ?? null,
    ],
  });

  const signupId = Number(insert.lastInsertRowid ?? 0);

  // 2. Notion page (best-effort — log if fails, never throw to caller)
  try {
    const created = await notion().pages.create({
      parent: { database_id: WAITLIST_DB_ID },
      properties: {
        "Person name": { title: [{ text: { content: input.personName } }] },
        Email: { email: input.email.toLowerCase() },
        ...(input.phone ? { Phone: { phone_number: input.phone } } : {}),
        ...(input.whatsapp ? { WhatsApp: { phone_number: input.whatsapp } } : {}),
        "Business name": rt(input.businessName),
        ...(input.instagram ? { Instagram: { url: input.instagram } } : {}),
        ...(input.tiktok ? { TikTok: { url: input.tiktok } } : {}),
        City: rt(input.city),
        "Brief info": rt(input.briefInfo),
        Stage: sel("Joined"),
        Source: sel(SOURCE),
        "UTM source": rt(input.utmSource),
        "UTM medium": rt(input.utmMedium),
        "UTM campaign": rt(input.utmCampaign),
      },
    });

    await db.execute({
      sql: "UPDATE waitlist_signups SET notion_page_id = ? WHERE id = ?",
      args: [created.id, signupId],
    });
  } catch (err) {
    await reportError(err, {
      route: "/api/waitlist",
      severity: "warning",
      extra: { signupId, step: "notion-create" },
    });
  }

  // 3. Meta CAPI Lead event (best-effort)
  try {
    await sendConversionEvent({
      eventName: "Lead",
      eventId: `waitlist_${signupId}`,
      eventSourceUrl: "https://start.huddleduck.co.uk",
      email: input.email,
      phone: input.phone,
      ipAddress: input.ipAddress,
      userAgent: input.userAgent,
      fbc: input.fbc,
      fbp: input.fbp,
      contentName: input.businessName,
      contentCategory: "waitlist_join",
    });
  } catch (err) {
    await reportError(err, {
      route: "/api/waitlist",
      severity: "warning",
      extra: { signupId, step: "capi-lead" },
    });
  }

  return { ok: true, signupId, email: input.email.toLowerCase() };
}

export interface Stage2Input {
  email: string;
  postingRegularly?: "Yes" | "Sometimes" | "No";
  usesCopyrightedMusic?: "Yes" | "Mix" | "No" | "Unsure";
  monthlyContentSpendGbp?: number;
  hoursPerWeekOnContent?: number;
  teamSizeOnContent?: number;
  contentAlreadyWorking?: "Yes" | "Somewhat" | "No";
  anythingElse?: string;
}

export interface Stage2Result {
  ok: boolean;
  matched: boolean;
}

export async function submitPriority(input: Stage2Input): Promise<Stage2Result> {
  const email = input.email.toLowerCase();

  const existing = await db.execute({
    sql: `SELECT id, notion_page_id FROM waitlist_signups
          WHERE email = ?
          ORDER BY id DESC LIMIT 1`,
    args: [email],
  });

  if (existing.rows.length === 0) {
    return { ok: false, matched: false };
  }

  const row = existing.rows[0];
  const signupId = Number(row.id);
  const notionPageId = (row.notion_page_id ?? null) as string | null;

  await db.execute({
    sql: `UPDATE waitlist_signups SET
            posting_regularly = ?,
            uses_copyrighted_music = ?,
            monthly_content_spend_gbp = ?,
            hours_per_week_on_content = ?,
            team_size_on_content = ?,
            content_already_working = ?,
            anything_else = ?,
            stage = 'Priority applied',
            priority_submitted_at = strftime('%Y-%m-%dT%H:%M:%fZ', 'now')
          WHERE id = ?`,
    args: [
      input.postingRegularly ?? null,
      input.usesCopyrightedMusic ?? null,
      input.monthlyContentSpendGbp ?? null,
      input.hoursPerWeekOnContent ?? null,
      input.teamSizeOnContent ?? null,
      input.contentAlreadyWorking ?? null,
      input.anythingElse ?? null,
      signupId,
    ],
  });

  if (notionPageId) {
    try {
      await notion().pages.update({
        page_id: notionPageId,
        properties: {
          Stage: sel("Priority applied"),
          ...(input.postingRegularly ? { "Posting regularly": sel(input.postingRegularly) } : {}),
          ...(input.usesCopyrightedMusic ? { "Uses copyrighted music": sel(input.usesCopyrightedMusic) } : {}),
          ...(typeof input.monthlyContentSpendGbp === "number"
            ? { "Monthly content spend (GBP)": { number: input.monthlyContentSpendGbp } }
            : {}),
          ...(typeof input.hoursPerWeekOnContent === "number"
            ? { "Hours per week on content": { number: input.hoursPerWeekOnContent } }
            : {}),
          ...(typeof input.teamSizeOnContent === "number"
            ? { "Team size on content": { number: input.teamSizeOnContent } }
            : {}),
          ...(input.contentAlreadyWorking ? { "Content already working": sel(input.contentAlreadyWorking) } : {}),
          "Anything else": rt(input.anythingElse),
        },
      });
    } catch (err) {
      await reportError(err, {
        route: "/api/waitlist/priority",
        severity: "warning",
        extra: { signupId, notionPageId, step: "notion-update" },
      });
    }
  }

  return { ok: true, matched: true };
}

export { WAITLIST_DATA_SOURCE_ID, WAITLIST_DB_ID };
