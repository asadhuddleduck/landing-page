export type AgencyMeeting = {
  uid: string; status: "accepted" | "pending" | "cancelled"; start: string; end: string;
  meetingUrl: string | null; applicationId: string; operationKey: string; email: string;
  updatedAt: string; rescheduledToUid?: string;
};
type Json = Record<string, unknown>;
const object = (v: unknown): v is Json => Boolean(v && typeof v === "object" && !Array.isArray(v));
export class AgencyCalError extends Error {
  readonly uncertain: boolean;
  readonly status: number;
  constructor(uncertain: boolean, status = 503) { super("Calendar request could not be completed"); this.uncertain = uncertain; this.status = status; }
}
export type CalConfig = { apiKey: string; eventTypeId: number; ownerId: string; fetch?: typeof fetch };
export function createAgencyCal(config: CalConfig) {
  const fetcher = config.fetch ?? fetch;
  async function request(path: string, method = "GET", body?: unknown, version = "2026-02-25"): Promise<Json> {
    if (!config.apiKey || !config.eventTypeId || !config.ownerId) throw new AgencyCalError(false);
    let response: Response;
    try {
      response = await fetcher(`https://api.cal.com/v2${path}`, {
        method, cache: "no-store", signal: AbortSignal.timeout(20000),
        headers: { Authorization: `Bearer ${config.apiKey}`, "Content-Type": "application/json", "cal-api-version": version },
        ...(body === undefined ? {} : { body: JSON.stringify(body) }),
      });
    } catch { throw new AgencyCalError(method !== "GET"); }
    if (!response.ok) throw new AgencyCalError(method !== "GET" && (response.status >= 500 || response.status === 408), response.status);
    const payload: unknown = await response.json().catch(() => null);
    if (!object(payload) || payload.status !== "success" || !("data" in payload)) throw new AgencyCalError(method !== "GET");
    return payload;
  }
  function parse(value: unknown): AgencyMeeting {
    if (!object(value)) throw new AgencyCalError(false);
    const hosts = Array.isArray(value.hosts) ? value.hosts.filter(object) : [];
    if (Number(value.eventTypeId ?? (object(value.eventType) ? value.eventType.id : 0)) !== config.eventTypeId || !hosts.some(h => String(h.id) === config.ownerId)) throw new AgencyCalError(false, 403);
    const metadata = object(value.metadata) ? value.metadata : {};
    const attendees = Array.isArray(value.attendees) ? value.attendees.filter(object) : [];
    const rawStatus = String(value.status).toLowerCase();
    const start = String(value.start), end = String(value.end);
    if (typeof value.uid !== "string" || !Number.isFinite(Date.parse(start)) || !Number.isFinite(Date.parse(end)) || Date.parse(end) - Date.parse(start) !== 30 * 60000) throw new AgencyCalError(false);
    if (!["accepted", "pending", "unconfirmed", "cancelled", "canceled", "rejected"].includes(rawStatus)) throw new AgencyCalError(false);
    const url = typeof value.meetingUrl === "string" ? value.meetingUrl : typeof value.location === "string" ? value.location : null;
    return { uid: value.uid, start, end, status: rawStatus === "accepted" ? "accepted" : ["cancelled", "canceled", "rejected"].includes(rawStatus) ? "cancelled" : "pending",
      meetingUrl: url?.startsWith("https://") ? url : null,
      applicationId: String(metadata.agencyApplicationId ?? ""), operationKey: String(metadata.agencyOperationKey ?? ""),
      email: String(attendees[0]?.email ?? "").toLowerCase(),
      updatedAt: String(value.updatedAt ?? value.createdAt ?? ""),
      ...(typeof value.rescheduledToUid === "string" ? { rescheduledToUid: value.rescheduledToUid } : {}),
    };
  }
  async function get(uid: string): Promise<AgencyMeeting> {
    const result = await request(`/bookings/${encodeURIComponent(uid)}`);
    return parse(result.data);
  }
  async function slots(now = Date.now()): Promise<string[]> {
    const start = new Date(now).toISOString(), end = new Date(now + 3 * 86400000).toISOString();
    const params = new URLSearchParams({ eventTypeId: String(config.eventTypeId), start, end, timeZone: "Europe/London" });
    const result = await request(`/slots?${params}`, "GET", undefined, "2024-09-04");
    if (!object(result.data)) throw new AgencyCalError(false);
    return [...new Set(Object.values(result.data).flatMap(day => Array.isArray(day) ? day : []).map(s => typeof s === "string" ? s : object(s) ? String(s.start ?? s.time ?? "") : "").filter(s => Number.isFinite(Date.parse(s)) && Date.parse(s) >= now + 120 * 60000).map(s => new Date(s).toISOString()))].sort();
  }
  async function create(input: { start: string; name: string; email: string; phone: string; applicationId: string; operationKey: string }): Promise<AgencyMeeting> {
    const result = await request("/bookings", "POST", {
      eventTypeId: config.eventTypeId, start: input.start,
      attendee: { name: input.name, email: input.email, phoneNumber: input.phone, timeZone: "Europe/London", language: "en" },
      bookingFieldsResponses: { attendeePhoneNumber: input.phone },
      metadata: { agencyApplicationId: input.applicationId, agencyOperationKey: input.operationKey, campaign: "hd_agency_queue_20261027" },
    });
    try { return parse(result.data); } catch { throw new AgencyCalError(true); }
  }
  async function find(email: string, applicationId: string, operationKey: string): Promise<AgencyMeeting | null> {
    let cursor = "";
    for (let page = 0; page < 20; page++) {
      const params = new URLSearchParams({ attendeeEmail: email, eventTypeId: String(config.eventTypeId), limit: "100", ...(cursor ? { cursor } : {}) });
      const result = await request(`/bookings?${params}`, "GET", undefined, "2026-05-01");
      if (!Array.isArray(result.data)) throw new AgencyCalError(false);
      for (const row of result.data) {
        try { const meeting = parse(row); if (meeting.applicationId === applicationId && meeting.operationKey === operationKey && meeting.email === email) return meeting; }
        catch (error) { if (!(error instanceof AgencyCalError && error.status === 403)) throw error; }
      }
      const pagination = object(result.pagination) ? result.pagination : {};
      if (!pagination.hasMore) return null;
      if (typeof pagination.nextCursor !== "string" || pagination.nextCursor === cursor) throw new AgencyCalError(false);
      cursor = pagination.nextCursor;
    }
    throw new AgencyCalError(false);
  }
  return { get, slots, create, find };
}
export type AgencyCal = ReturnType<typeof createAgencyCal>;
