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
}): Promise<string> {
  const notion = new Client({ auth: process.env.NOTION_TOKEN?.trim() });

  const taskTitle = params.name
    ? `New purchase: ${params.name}`
    : `New purchase: ${params.email}`;

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
      Outcome: {
        rich_text: [
          {
            text: {
              content:
                "Follow up with new AI Ad Engine Pilot customer. Send welcome message, schedule onboarding call.",
            },
          },
        ],
      },
    },
  });

  console.log(`[notion] Task created: ${taskTitle} (${page.id})`);
  return page.id;
}
