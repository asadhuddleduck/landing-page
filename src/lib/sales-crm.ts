type Rich = { plain_text?: string; text?: { content?: string } };
type Property = { title?: Rich[]; rich_text?: Rich[]; select?: { name: string } | null; multi_select?: { name: string }[]; email?: string | null; phone_number?: string | null; number?: number | null; date?: { start: string } | null };
type Page = { id: string; archived?: boolean; parent?: { database_id?: string }; properties?: Record<string, Property> };
type Reply = Page & { results?: Page[]; has_more?: boolean; next_cursor?: string };
const text = (p?: Property) => (p?.title ?? p?.rich_text ?? []).map(t => t.plain_text ?? t.text?.content ?? "").join("");
const rt = (value: string) => ({ rich_text: Array.from({ length: Math.max(1, Math.ceil(value.length / 1900)) }, (_, i) => ({ type: "text", text: { content: value.slice(i * 1900, (i + 1) * 1900) } })) });
const normalized = (value: string) => value.trim().toLowerCase().replace(/\s+/g, " ");

export function salesCrm(fetcher: typeof fetch = fetch) {
  const databaseId = process.env.SALES_CRM_DATABASE_ID?.trim();
  const token = (process.env.AGENCY_NOTION_TOKEN ?? process.env.NOTION_TOKEN)?.trim();
  if (!databaseId || !/^[0-9a-f-]{32,36}$/i.test(databaseId) || !token) throw new Error("Sales CRM is not configured");
  async function request(path: string, method = "GET", body?: unknown): Promise<Reply> {
    const response = await fetcher(`https://api.notion.com/v1/${path}`, {
      method, signal: AbortSignal.timeout(15000),
      headers: { Authorization: `Bearer ${token}`, "Notion-Version": "2022-06-28", "Content-Type": "application/json" },
      ...(body ? { body: JSON.stringify(body) } : {}),
    });
    if (!response.ok) throw new Error(`Sales CRM request failed (${response.status})`);
    return response.json();
  }
  async function query(filter: unknown): Promise<Page[]> {
    const rows: Page[] = [];
    let cursor: string | undefined;
    do {
      const result = await request(`databases/${databaseId}/query`, "POST", { filter, page_size: 100, ...(cursor ? { start_cursor: cursor } : {}) });
      rows.push(...result.results ?? []);
      cursor = result.has_more ? result.next_cursor : undefined;
    } while (cursor);
    return rows;
  }
  async function write(page: Page | null, properties: Record<string, unknown>): Promise<string> {
    const result = await request(page ? `pages/${page.id}` : "pages", page ? "PATCH" : "POST", {
      ...(!page ? { parent: { database_id: databaseId } } : {}), properties, notifications: { mode: "silent" },
    });
    if (typeof result.id !== "string") throw new Error("Sales CRM receipt missing");
    return result.id;
  }
  return {
    async agency(input: { applicationId: string; knownPageId: string | null; business: string; name: string; email: string; phone: string; locations: number; instagram: string; notes: string; createdAt: string; booked: boolean }): Promise<string> {
      let page: Page | null = null;
      if (input.knownPageId) {
        const known = await request(`pages/${input.knownPageId}`);
        if (!known.archived && known.parent?.database_id?.replace(/-/g, "") === databaseId!.replace(/-/g, "")) page = known;
      }
      if (!page) {
        const matches = await query({ property: "Agency application ID", rich_text: { equals: input.applicationId } });
        if (matches.length > 1) throw new Error("Duplicate agency CRM application needs review");
        page = matches[0] ?? null;
      }
      if (!page) {
        const matches = (await query({ property: "Email", email: { equals: input.email } }))
          .filter(p => normalized(text(p.properties?.Business)) === normalized(input.business));
        if (matches.length > 1) throw new Error("Duplicate business contacts need review");
        page = matches[0] ?? null;
      }
      const props = page?.properties ?? {};
      const origins = new Set((props["Enquiry offer"]?.multi_select ?? []).map(x => x.name));
      if (text(props["Source lead ID"])) origins.add("SuperPulse");
      origins.add("Huddle Duck");
      const properties: Record<string, unknown> = {
        "Agency application ID": rt(input.applicationId), "Agency enquiry": rt(input.notes),
        "Enquiry offer": { multi_select: [...origins].map(name => ({ name })) },
      };
      if (!page) {
        properties.Business = { title: [{ text: { content: input.business } }] };
        properties.Status = { select: { name: input.booked ? "Call booked" : "New" } };
        properties.Offer = { select: { name: "Huddle Duck" } };
      } else if (input.booked && ["New", "Tried to call", "Qualified"].includes(props.Status?.select?.name ?? "")) {
        properties.Status = { select: { name: "Call booked" } };
      }
      if (!text(props.Contact)) properties.Contact = rt(input.name);
      if (!props.Email?.email) properties.Email = { email: input.email };
      if (!props.Phone?.phone_number) properties.Phone = { phone_number: input.phone || null };
      if (props.Locations?.number == null) properties.Locations = { number: input.locations };
      if (!text(props.Instagram)) properties.Instagram = rt(input.instagram);
      if (!props["First recorded"]?.date) properties["First recorded"] = { date: { start: input.createdAt } };
      return write(page, properties);
    },
    async purchase(input: { email: string; name?: string | null; phone?: string | null; amount: number }): Promise<string> {
      const matches = await query({ property: "Email", email: { equals: input.email } });
      if (matches.length > 1) throw new Error("Multiple sales CRM contacts match this payment; review required");
      const page = matches[0] ?? null;
      const properties: Record<string, unknown> = { Status: { select: { name: "Won" } }, Value: { number: input.amount } };
      if (!page) Object.assign(properties, {
        Business: { title: [{ text: { content: input.name || input.email } }] }, Contact: rt(input.name || input.email),
        Email: { email: input.email }, Phone: { phone_number: input.phone || null },
      });
      return write(page, properties);
    },
  };
}
