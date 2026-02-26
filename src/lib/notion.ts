import { Client } from "@notionhq/client";

const ACTIONS_DB_ID = "2c384fd7-bc4e-81a1-b469-e33afbf19157";
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
