# Handoff: AI Chat Sales Agent — Closing Optimization

## What This Is

A text-only AI sales chat on [start.huddleduck.co.uk](https://start.huddleduck.co.uk) that qualifies food & beverage business owners and guides them to checkout. Built with Vercel AI SDK + Anthropic Claude Sonnet, replacing a previous ElevenLabs Conversational AI setup.

The chat works. It follows the sales flow, handles objections, and reaches checkout. The next team's job is to make it **close more deals** — better conversion from conversation to payment.

---

## Architecture (What You Need to Know)

```
Browser (AiSalesChat.tsx)              Server (/api/chat/route.ts)
  |                                         |
  |-- useChat() + DefaultChatTransport ---->|
  |   POST /api/chat                        |-- Loads system prompt + 9 KB docs (cached)
  |   body: { messages, dynamicVariables }  |-- Interpolates {{ variables }}
  |                                         |-- streamText() via Anthropic API
  |<--- SSE token stream ------------------|     with prompt caching (90% cost reduction)
  |                                         |
  |-- sendBeacon /api/chat/save ----------->|-- Saves transcript to Turso DB
  |   (on timeout / page leave)             |-- Haiku extracts structured data
```

### Key Files

| File | What It Does |
|---|---|
| `src/components/AiSalesChat.tsx` | Client-side chat UI — all UX logic, message display, input handling, card detection |
| `src/app/api/chat/route.ts` | Streaming endpoint — loads prompt + KB docs, sends to Anthropic, returns SSE stream |
| `src/app/api/chat/save/route.ts` | Persistence — saves transcript to Turso, runs Haiku extraction for structured fields |
| `docs/agent-prompts/base-prompt-v3.md` | **THE PROMPT** — source of truth for the agent's personality, flow, and rules |
| `docs/kb-01-product.txt` through `kb-09-example-conversations.txt` | Knowledge base docs — product info, pricing, case studies, FAQ, objection handling |
| `src/components/ChatCards.tsx` | Rich cards (PricingCard, TestimonialCard, CTACard) triggered by keywords in agent responses |
| `src/app/globals.css` | All chat styling — message cards, animations, streaming effects, power bar |

### Model & Cost

- **Chat model:** Claude Sonnet 4.6 (`claude-sonnet-4-6`) — configurable via `ANTHROPIC_MODEL` env var
- **Extraction model:** Claude Haiku 4.5 — extracts business_name, location_count, etc. from transcripts
- **Cost:** ~$0.05-0.10/conversation with prompt caching (system prompt + KB docs cached for 5 min)
- **Max output tokens:** 150 per response (keeps replies short per the prompt rules)

---

## The Prompt (How the Sales Flow Works)

**Location:** `docs/agent-prompts/base-prompt-v3.md` (119 lines, ~7KB)

### 6-Phase Sales Flow

1. **Hook** — Pattern-interrupt opening. Short, punchy, creates curiosity. Under 20 words.
2. **Pattern-Recognition Qualify** — Identifies if they're F&B, how many locations, what they're currently doing.
3. **Give-While-You-Take Discovery** — Gives insight while gathering info. Uses Sandler Pain Funnel technique.
4. **"That's Right" Reflection** — Mirrors back what they said to build rapport. Gets them to say "that's right."
5. **Offer** — Presents the £497 Trial naturally, as the obvious next step.
6. **Soft Close** — Directs to checkout. "Checkout's below." No hard sell.

### Key Prompt Rules

- Max 25 words per message (first 3 messages under 20)
- Always end with a question (except the close)
- Use "I" not "we" — feels like talking to a person, not a company
- Never say "I understand" (empty validation)
- If not F&B: canned exit message, input locks
- One topic per message — no info dumps

### Dynamic Variables

The prompt uses `{{ variable_name }}` placeholders, interpolated server-side:

| Variable | Source | Purpose |
|---|---|---|
| `visitor_id` | Cookie (`_vid`) | Unique visitor tracking |
| `utm_source`, `utm_medium`, `utm_campaign` | Cookie (`_utms`) | Attribution |
| `page_url` | `window.location.href` | Context |
| `returning_visitor` | localStorage `hd_has_chatted` | "true" if they've chatted before |
| `prev_business_name` | localStorage `hd_prev_conversation` | Personalization for returning visitors |
| `prev_challenge` | localStorage `hd_prev_conversation` | Personalization for returning visitors |
| `prev_outcome` | localStorage `hd_prev_conversation` | What happened last time |
| `prev_location_count` | localStorage `hd_prev_conversation` | Personalization for returning visitors |

---

## Knowledge Base (What the Agent Knows)

9 text files, loaded into the system message (~7k tokens total):

| File | Content |
|---|---|
| `kb-01-product.txt` | What the AI Ad Engine is, what's included, how it works |
| `kb-02-pricing.txt` | £497 Trial, £1,300/mo Unlimited, what's included in each |
| `kb-03-differentiation.txt` | How this differs from agencies, freelancers, DIY ads |
| `kb-04-ideal-client.txt` | F&B, 2+ locations, £500+/mo ad budget, wants growth |
| `kb-05-case-studies.txt` | Phat Buns, Shakedown, Burger & Sauce, Dough Club, Chai Green results |
| `kb-06-faq.txt` | Common questions and answers |
| `kb-07-objection-handling.txt` | Price objections, trust objections, timing objections |
| `kb-08-tracking-attribution.txt` | How tracking/attribution works |
| `kb-09-example-conversations.txt` | Example conversations showing ideal flow |

**To update what the agent knows:** Edit these files directly. Changes take effect on next cold start (or next Vercel deploy). No API calls, no dashboard — just text files.

---

## Card Detection (Visual Aids During Chat)

The agent's responses trigger rich cards based on keywords:

| Card | Trigger Keywords | What It Shows |
|---|---|---|
| **PricingCard** | "497", "trial" + "£" | Trial pricing breakdown |
| **TestimonialCard** | "phat buns", "burger & sauce", "676" | Client testimonial |
| **CTACard** | "checkout", "right below", "go ahead" | CTA button that scrolls to #checkout |

Detection happens in `detectCard()` in `AiSalesChat.tsx`. Each card shows once per conversation (tracked in `shownCards` Set).

**Tip for prompt tuning:** If you want the agent to show a card at a specific point in the flow, make sure the response includes the trigger keyword naturally.

---

## Data Pipeline (What Gets Saved)

### Turso `conversations` Table

Every conversation saves with these fields:

| Field | Source |
|---|---|
| `conversation_id` | Client-generated UUID |
| `agent_id` | `"diy-sonnet-4.6"` |
| `visitor_id` | Cookie |
| `transcript` | Full message history |
| `duration_secs` | Time from first message to save |
| `utm_source/medium/campaign` | Attribution cookies |
| `business_name` | Haiku extraction |
| `location_count` | Haiku extraction |
| `is_fb` | Haiku extraction (food & beverage) |
| `visitor_role` | Haiku extraction |
| `main_challenge` | Haiku extraction |
| `objections_raised` | Haiku extraction |
| `reached_checkout` | Haiku extraction |
| `conversation_outcome` | Haiku extraction |

### Querying Conversations

```bash
turso db shell landing-page "SELECT conversation_id, business_name, location_count, conversation_outcome, duration_secs FROM conversations WHERE agent_id = 'diy-sonnet-4.6' ORDER BY rowid DESC LIMIT 20"
```

```bash
turso db shell landing-page "SELECT transcript FROM conversations WHERE conversation_id = '<id>'"
```

### Save Triggers

- **5-minute inactivity** — no new messages for 5 min
- **Page leave** — `beforeunload` / `visibilitychange` via `navigator.sendBeacon`
- **Warm exit** — agent says "Good luck with everything"
- **Dedup** — `savedRef` flag prevents double-saves

---

## Chat UX Features

| Feature | How It Works |
|---|---|
| **Two-message display** | Only shows latest user message + agent response(s). Previous turns disappear. |
| **Animated placeholders** | Typewriter effect cycles through example messages before first interaction |
| **Power bar** | Character count gamification — color transitions at 12/30/50/80/120 chars |
| **Headline fade** | On mobile, hero headline fades on scroll/focus to make room for chat |
| **Non-F&B gate** | "No, just looking" button → canned exit message, input locks |
| **Streaming animation** | Green dot pulses while AI generates; card glows; text has soft trailing edge |
| **Qualifier buttons** | "I sell food or drink" / "No, just looking" — pre-chat decision fork |

---

## What's Working Well

Based on test conversations:
- Agent follows the 6-phase flow naturally
- Handles pushback/confusion gracefully ("what do you mean?", "what gap?")
- Keeps responses short and punchy
- Reaches checkout within 8-12 exchanges
- Haiku extraction accurately captures business details

## Where to Focus for Better Closing

1. **The offer transition** — "Ready to fix that?" → "The Trial is £497" feels abrupt in some flows. The agent could build more desire before presenting price.

2. **Objection handling depth** — When someone pushes back on price or timing, the agent sometimes moves on too quickly. The prompt's objection section could use more nuanced responses.

3. **Social proof timing** — The agent mentions case studies but doesn't always trigger the TestimonialCard at the optimal moment. Tuning when "Phat Buns" or "676" naturally enters the conversation.

4. **Post-close handholding** — After saying "Checkout's below", if the user doesn't immediately scroll down, there's no follow-up. Consider a gentle nudge.

5. **Returning visitor flow** — The `prev_*` variables exist but the prompt could use stronger returning visitor hooks ("Last time you mentioned your 5 locations in London...").

6. **Example conversations in KB** — `kb-09-example-conversations.txt` shapes the agent's conversational style. Adding more examples of successful closes would help.

---

## How to Change the Agent's Behavior

### Quick changes (prompt tuning):
1. Edit `docs/agent-prompts/base-prompt-v3.md`
2. Changes take effect on next cold start / deploy

### Knowledge updates:
1. Edit the relevant `docs/kb-*.txt` file
2. Same — next cold start / deploy

### Response length:
- `maxOutputTokens: 150` in `src/app/api/chat/route.ts` line 68
- Increase if you want longer responses (but the 25-word prompt rule is the real limiter)

### Model:
- `ANTHROPIC_MODEL` env var in `.env.local` and Vercel
- Currently `claude-sonnet-4-6` — update when new models release

### New card types:
1. Add component in `ChatCards.tsx`
2. Add detection keywords in `detectCard()` in `AiSalesChat.tsx`
3. Add rendering in the JSX below the agent messages

---

## Environment Variables Needed

| Variable | Where | Purpose |
|---|---|---|
| `ANTHROPIC_API_KEY` | `.env.local` + Vercel | Anthropic API access |
| `ANTHROPIC_MODEL` | `.env.local` + Vercel | Model ID (default: `claude-sonnet-4-6`) |
| `TURSO_DATABASE_URL` | `.env.local` + Vercel | Conversation storage |
| `TURSO_AUTH_TOKEN` | `.env.local` + Vercel | Turso auth |

All other env vars (Stripe, Meta, Notion, etc.) are for other parts of the landing page, not the chat.

---

## Tech Stack

- **Framework:** Next.js 16 (App Router, TypeScript, React 19)
- **AI SDK:** Vercel AI SDK v6 (`ai`, `@ai-sdk/anthropic`, `@ai-sdk/react`)
- **Database:** Turso (LibSQL)
- **Styling:** Tailwind CSS v4 + CSS custom properties
- **Hosting:** Vercel
- **Analytics:** Vercel Analytics (`@vercel/analytics`)
