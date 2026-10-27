import { randomUUID } from "node:crypto";
import type { Client } from "@libsql/client";
import { digest, qualifies, QUALIFICATION_VERSION, type ApplicationInput } from "./core.ts";
import { AgencyCalError, type AgencyCal, type AgencyMeeting } from "./cal.ts";

export const AGENCY_SCHEMA = [
  `CREATE TABLE IF NOT EXISTS agency_applications (id TEXT PRIMARY KEY, submission_key TEXT NOT NULL UNIQUE, request_hash TEXT NOT NULL, email TEXT NOT NULL, business_name TEXT NOT NULL, qualified INTEGER NOT NULL, qualification_version TEXT NOT NULL, data TEXT NOT NULL, is_test INTEGER NOT NULL DEFAULT 0, created_at TEXT NOT NULL, notion_page_id TEXT)`,
  `CREATE TABLE IF NOT EXISTS agency_bookings (application_id TEXT PRIMARY KEY REFERENCES agency_applications(id), operation_key TEXT NOT NULL UNIQUE, state TEXT NOT NULL, start TEXT NOT NULL, uid TEXT UNIQUE, end TEXT, meeting_url TEXT, updated_at TEXT NOT NULL, attempted_at TEXT NOT NULL)`,
  `CREATE TABLE IF NOT EXISTS agency_effects (id TEXT PRIMARY KEY, application_id TEXT NOT NULL, kind TEXT NOT NULL, payload TEXT NOT NULL, state TEXT NOT NULL DEFAULT 'queued', attempts INTEGER NOT NULL DEFAULT 0, lease_until INTEGER NOT NULL DEFAULT 0, next_at INTEGER NOT NULL DEFAULT 0, receipt TEXT, updated_at TEXT NOT NULL)`,
  `CREATE TABLE IF NOT EXISTS agency_booking_receipts (id TEXT PRIMARY KEY, application_id TEXT NOT NULL, uid TEXT NOT NULL, status TEXT NOT NULL, observed_at TEXT NOT NULL)`,
  `CREATE TABLE IF NOT EXISTS agency_rate_limits (key TEXT PRIMARY KEY, count INTEGER NOT NULL, window INTEGER NOT NULL)`,
];
export type Application = { id: string; qualified: boolean; data: ApplicationInput; isTest: boolean; email: string; createdAt: string; notionPageId: string | null };
export type Booking = { applicationId: string; state: string; uid: string | null; start: string; end: string | null; meetingUrl: string | null; operationKey: string; attemptedAt: string };
export type Effect = { id: string; applicationId: string; kind: string; payload: Record<string, unknown> };
export class AgencyInputError extends Error {
  readonly status: number;
  constructor(status: number, message: string) { super(message); this.status = status; }
}
export function createAgencyService(config: {
  db: Client; cal: AgencyCal; now?: () => number;
  dispatch?: (effect: Effect, application: Application) => Promise<string>;
}) {
  const db = config.db, now = config.now ?? Date.now;
  let initialized: Promise<void> | null = null;
  const timestamp = () => new Date(now()).toISOString();
  function init(): Promise<void> {
    if (!initialized) initialized = db.batch(AGENCY_SCHEMA.map(sql => ({ sql, args: [] })), "write").then(() => undefined).catch(error => { initialized = null; throw error; });
    return initialized;
  }
  async function application(id: string): Promise<Application | null> {
    await init(); const row = (await db.execute({ sql: "SELECT * FROM agency_applications WHERE id=?", args: [id] })).rows[0];
    return row ? { id: String(row.id), qualified: Boolean(row.qualified), data: JSON.parse(String(row.data)), isTest: Boolean(row.is_test), email: String(row.email), createdAt: String(row.created_at), notionPageId: row.notion_page_id ? String(row.notion_page_id) : null } : null;
  }
  async function booking(id: string): Promise<Booking | null> {
    await init(); const r = (await db.execute({ sql: "SELECT * FROM agency_bookings WHERE application_id=?", args: [id] })).rows[0];
    return r ? { applicationId: id, state: String(r.state), uid: r.uid ? String(r.uid) : null, start: String(r.start), end: r.end ? String(r.end) : null, meetingUrl: r.meeting_url ? String(r.meeting_url) : null, operationKey: String(r.operation_key), attemptedAt: String(r.attempted_at) } : null;
  }
  async function queue(id: string, app: string, kind: string, payload: Record<string, unknown> = {}): Promise<void> {
    await db.execute({ sql: "INSERT INTO agency_effects(id,application_id,kind,payload,updated_at) VALUES(?,?,?,?,?) ON CONFLICT(id) DO NOTHING", args: [id, app, kind, JSON.stringify(payload), timestamp()] });
  }
  async function ensureApplicationEffects(app: Application): Promise<Application> {
    if (!app.isTest) {
      await queue(`lead:${app.id}`, app.id, "meta_lead");
      await queue(`crm:${app.id}`, app.id, "notion");
    }
    return app;
  }
  async function submit(input: ApplicationInput, context: { ipHash?: string; isTest?: boolean; userAgent?: string; ipAddress?: string } = {}): Promise<Application> {
    await init(); const requestHash = digest(JSON.stringify(input));
    const previous = (await db.execute({ sql: "SELECT id,request_hash FROM agency_applications WHERE submission_key=?", args: [input.submissionKey] })).rows[0];
    if (previous) {
      if (String(previous.request_hash) !== requestHash) throw new AgencyInputError(409, "This submission has already been saved. Start a fresh enquiry to change the details.");
      return ensureApplicationEffects((await application(String(previous.id)))!);
    }
    if (context.ipHash && !context.isTest) {
      const window = Math.floor(now() / 3600000);
      const rate = await db.execute({ sql: "INSERT INTO agency_rate_limits(key,count,window) VALUES(?,1,?) ON CONFLICT(key) DO UPDATE SET count=CASE WHEN window=excluded.window THEN count+1 ELSE 1 END, window=excluded.window RETURNING count", args: [context.ipHash, window] });
      if (Number(rate.rows[0]?.count) > 20) throw new AgencyInputError(429, "Please try again later.");
    }
    const id = randomUUID();
    const data = { ...input, userAgent: context.userAgent?.slice(0, 1000), ipAddress: context.ipAddress };
    const result = await db.execute({ sql: "INSERT INTO agency_applications(id,submission_key,request_hash,email,business_name,qualified,qualification_version,data,is_test,created_at) VALUES(?,?,?,?,?,?,?,?,?,?) ON CONFLICT(submission_key) DO NOTHING", args: [id, input.submissionKey, requestHash, input.email, input.businessName, qualifies(input) ? 1 : 0, QUALIFICATION_VERSION, JSON.stringify(data), context.isTest ? 1 : 0, timestamp()] });
    if (!result.rowsAffected) {
      const row = (await db.execute({ sql: "SELECT id,request_hash FROM agency_applications WHERE submission_key=?", args: [input.submissionKey] })).rows[0];
      if (!row || row.request_hash !== requestHash) throw new AgencyInputError(409, "Submission details changed. Please start a fresh enquiry.");
      return ensureApplicationEffects((await application(String(row.id)))!);
    }
    return ensureApplicationEffects((await application(id))!);
  }
  async function applyMeeting(meeting: AgencyMeeting): Promise<Booking> {
    const app = await application(meeting.applicationId), current = await booking(meeting.applicationId);
    if (!app || !current || !app.qualified || meeting.email !== app.email || current.operationKey !== meeting.operationKey) throw new AgencyInputError(403, "Booking does not match this application.");
    // A delayed cancellation for an old UID must not undo a later reschedule.
    if (current.uid && current.uid !== meeting.uid) {
      const latest = await config.cal.get(current.uid);
      if (latest.rescheduledToUid !== meeting.uid) {
        if (meeting.rescheduledToUid === current.uid) return applyMeeting(latest);
        return current;
      }
    }
    if (meeting.rescheduledToUid) return applyMeeting(await config.cal.get(meeting.rescheduledToUid));
    await db.execute({ sql: "UPDATE agency_bookings SET state=?,uid=?,start=?,end=?,meeting_url=?,updated_at=? WHERE application_id=? AND operation_key=?", args: [meeting.status, meeting.uid, meeting.start, meeting.end, meeting.meetingUrl, timestamp(), app.id, current.operationKey] });
    await db.execute({ sql: "INSERT INTO agency_booking_receipts(id,application_id,uid,status,observed_at) VALUES(?,?,?,?,?) ON CONFLICT(id) DO NOTHING", args: [digest(JSON.stringify([meeting.uid, meeting.status, meeting.start, meeting.end, meeting.updatedAt])), app.id, meeting.uid, meeting.status, timestamp()] });
    if (!app.isTest) {
      if (meeting.status === "accepted") await queue(`schedule:${meeting.uid}`, app.id, "meta_schedule", { uid: meeting.uid });
      await queue(`crm-booking:${meeting.uid}:${meeting.status}:${meeting.start}`, app.id, "notion");
    }
    return (await booking(app.id))!;
  }
  async function reconcile(id: string): Promise<Booking | null> {
    const app = await application(id), current = await booking(id);
    if (!app || !current) return null;
    if (current.uid) return applyMeeting(await config.cal.get(current.uid));
    const found = await config.cal.find(app.email, app.id, current.operationKey);
    if (found) return applyMeeting(found);
    // An uncertain create is never replayed just because list readback found nothing.
    return current;
  }
  async function book(id: string, start: string): Promise<Booking> {
    const app = await application(id);
    if (!app?.qualified) throw new AgencyInputError(403, "Please complete the agency qualification first.");
    let current = await booking(id);
    if (current && current.state !== "failed") return current.state === "accepted" || current.state === "cancelled" ? current : (await reconcile(id))!;
    const normalized = new Date(start).toISOString();
    const available = await config.cal.slots(now());
    if (!available.includes(normalized)) throw new AgencyInputError(409, "That time is no longer available. Please choose another time.");
    const operation = randomUUID();
    const reservation = await db.execute({ sql: "INSERT INTO agency_bookings(application_id,operation_key,state,start,updated_at,attempted_at) VALUES(?,?,'attempting',?,?,?) ON CONFLICT(application_id) DO UPDATE SET operation_key=excluded.operation_key,state='attempting',start=excluded.start,uid=NULL,end=NULL,meeting_url=NULL,updated_at=excluded.updated_at,attempted_at=excluded.attempted_at WHERE state='failed'", args: [id, operation, normalized, timestamp(), timestamp()] });
    if (!reservation.rowsAffected) return (await booking(id))!;
    try {
      const created = await config.cal.create({ start: normalized, name: app.data.personName, email: app.email, phone: app.data.phone, applicationId: id, operationKey: operation });
      if (created.applicationId !== id || created.operationKey !== operation || created.email !== app.email || Date.parse(created.start) !== Date.parse(normalized)) throw new AgencyCalError(true);
      await db.execute({ sql: "UPDATE agency_bookings SET uid=? WHERE application_id=? AND operation_key=?", args: [created.uid, id, operation] });
      current = await applyMeeting(await config.cal.get(created.uid));
      return current;
    } catch (error) {
      const uncertain = !(error instanceof AgencyCalError) || error.uncertain;
      await db.execute({ sql: "UPDATE agency_bookings SET state=?,updated_at=? WHERE application_id=? AND operation_key=? AND state='attempting'", args: [uncertain ? "uncertain" : "failed", timestamp(), id, operation] });
      if (uncertain) return (await booking(id))!;
      throw new AgencyInputError(503, "We could not book that time. Please try another time or contact us.");
    }
  }
  async function flush(limit = 6): Promise<{ accepted: number; pending: number }> {
    await init(); if (!config.dispatch) return { accepted: 0, pending: 0 };
    const rows = (await db.execute({ sql: "SELECT id,application_id,kind,payload FROM agency_effects WHERE state!='accepted' AND next_at<=? AND lease_until<? ORDER BY updated_at LIMIT ?", args: [now(), now(), limit] })).rows;
    let accepted = 0, pending = 0;
    for (const row of rows) {
      const claim = await db.execute({ sql: "UPDATE agency_effects AS target SET state='sending',lease_until=?,attempts=attempts+1 WHERE id=? AND state!='accepted' AND lease_until<? AND (kind!='notion' OR NOT EXISTS(SELECT 1 FROM agency_effects AS other WHERE other.application_id=target.application_id AND other.kind='notion' AND other.state='sending' AND other.lease_until>?))", args: [now() + 60000, String(row.id), now(), now()] });
      if (!claim.rowsAffected) continue;
      const app = await application(String(row.application_id)); if (!app) continue;
      try {
        const receipt = await config.dispatch({ id: String(row.id), applicationId: app.id, kind: String(row.kind), payload: JSON.parse(String(row.payload)) }, app);
        await db.execute({ sql: "UPDATE agency_effects SET state='accepted',receipt=?,lease_until=0,updated_at=? WHERE id=?", args: [receipt, timestamp(), String(row.id)] }); accepted++;
      } catch {
        await db.execute({ sql: "UPDATE agency_effects SET state='retry',next_at=?,lease_until=0,updated_at=? WHERE id=?", args: [now() + 300000, timestamp(), String(row.id)] }); pending++;
      }
    }
    return { accepted, pending };
  }
  async function recover(): Promise<void> {
    await init();
    const applications = (await db.execute("SELECT id FROM agency_applications WHERE is_test=0 AND (NOT EXISTS(SELECT 1 FROM agency_effects WHERE id='lead:'||agency_applications.id) OR NOT EXISTS(SELECT 1 FROM agency_effects WHERE id='crm:'||agency_applications.id)) LIMIT 25")).rows;
    for (const row of applications) await ensureApplicationEffects((await application(String(row.id)))!);
    const rows = (await db.execute("SELECT application_id FROM agency_bookings WHERE state IN ('attempting','uncertain','pending') LIMIT 10")).rows;
    for (const row of rows) { try { await reconcile(String(row.application_id)); } catch { /* Remains visible and eligible for the next reconciliation. */ } }
  }
  return { init, application, booking, submit, book, reconcile, applyMeeting, flush, recover, slots: () => config.cal.slots(now()) };
}
export type AgencyService = ReturnType<typeof createAgencyService>;
