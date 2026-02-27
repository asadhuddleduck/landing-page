import { Client } from "@notionhq/client";

const ACTIONS_DB_ID = "2c384fd7-bc4e-81a1-b469-e33afbf19157";
const LEADS_DB_ID = "2cb84fd7-bc4e-8011-a8bc-000b1c94a169";
const AKMAL_USER_ID = "ac601ede-0d62-4107-b59e-21c0530b5348";

/**
 * Create a task in the Notion Actions DB when a purchase is made.
 * Assigns to Akmal with today's Do date and "Not started" status.
 */
export async function createPurchaseTask(params: {
  email: string;
  name?: string | null;
  tier?: "trial" | "unlimited";
}): Promise<string> {
  const notion = new Client({ auth: process.env.NOTION_TOKEN?.trim() });

  const tier = params.tier ?? "trial";
  const displayName = params.name ?? params.email;
  const taskTitle = tier === "unlimited"
    ? `New Unlimited subscription: ${displayName}`
    : `New Trial purchase: ${displayName}`;
  const taskDescription = tier === "unlimited"
    ? "Follow up with new AI Ad Engine Unlimited subscriber. Send welcome message, schedule onboarding call."
    : "Follow up with new AI Ad Engine Trial customer. Send welcome message, schedule onboarding call.";

  const today = new Date().toISOString().split("T")[0];

  const page = await notion.pages.create({
    parent: { database_id: ACTIONS_DB_ID },
    properties: {
      Task: {
        title: [{ text: { content: taskTitle } }],
      },
      Status: {
        status: { name: "Not started" },
      },
      "Do date": {
        date: { start: today },
      },
      Driver: {
        people: [{ object: "user", id: AKMAL_USER_ID }],
      },
      "Client/Projects": {
        relation: [{ id: "2c384fd7bc4e81e9b06ae98eac3cd14e" }],
      },
      Outcome: {
        rich_text: [
          {
            text: {
              content: taskDescription,
            },
          },
        ],
      },
    },
  });

  console.log(`[notion] Task created: ${taskTitle} (${page.id})`);
  return page.id;
}

/**
 * Upsert a customer into the Leads DB when a purchase is made.
 * If a lead with this email exists, update Pipeline Stage to "Won" and Value.
 * If not, create a new lead entry.
 */
export async function upsertLeadAsWon(params: {
  email: string;
  name?: string | null;
  phone?: string | null;
  amount: number;
}): Promise<string> {
  const notion = new Client({ auth: process.env.NOTION_TOKEN?.trim() });

  const existing = await notion.dataSources.query({
    data_source_id: LEADS_DB_ID,
    filter: {
      property: "Email",
      email: { equals: params.email },
    },
    page_size: 1,
  });

  const displayName = params.name ?? params.email;

  if (existing.results.length > 0) {
    const pageId = existing.results[0].id;
    await notion.pages.update({
      page_id: pageId,
      properties: {
        "Pipeline Stage": {
          status: { name: "Won" },
        },
        Value: {
          number: params.amount,
        },
      },
    });
    console.log(`[notion] Lead updated to Won: ${params.email} (${pageId})`);
    return pageId;
  }

  const page = await notion.pages.create({
    parent: { database_id: LEADS_DB_ID },
    properties: {
      Name: {
        title: [{ text: { content: displayName } }],
      },
      Email: {
        email: params.email,
      },
      ...(params.phone
        ? {
            Phone: {
              rich_text: [{ text: { content: params.phone } }],
            },
          }
        : {}),
      Value: {
        number: params.amount,
      },
      "Pipeline Stage": {
        status: { name: "Won" },
      },
    },
  });

  console.log(`[notion] New lead created as Won: ${params.email} (${page.id})`);
  return page.id;
}
