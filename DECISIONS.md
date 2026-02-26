# Design Decisions Log

Decisions made for the landing-page project that should NOT be revisited without discussion.


## Payment Architecture

### Trial uses inline PaymentIntent + PaymentElement; Unlimited uses Checkout Session redirect
**Decision:** Two separate Stripe flows coexist. Trial (£497 one-time) creates a PaymentIntent via `/api/create-payment-intent` and renders a `<PaymentElement>` inline on the page. Unlimited (£1,300/mo subscription) creates a Checkout Session via `/api/checkout` and redirects to Stripe's hosted page.
**Rationale:**
- Stripe's `mode: "subscription"` requires a Checkout Session — you cannot create a recurring subscription from a raw PaymentIntent
- The Trial flow stays inline to reduce friction (no redirect away from the page), which matters for a one-time £497 impulse purchase
- The Unlimited flow redirects because Stripe's hosted Checkout handles subscription-specific UX (payment method saving, recurring disclosure, SCA compliance) better than we could build
- Both flows converge in the same webhook handler and downstream orchestration

### Customer dedup: lookup by email before creating
**Decision:** Both `/api/checkout` and `/api/create-payment-intent` call `stripe.customers.list({ email, limit: 1 })` before creating a new customer. If found, the existing customer is updated with the latest name/phone.
**Rationale:** Without this, repeat visitors (e.g. someone who abandoned checkout and returns) would create duplicate Stripe customers. Deduping by email keeps a single customer record per person, which matters for Stripe's subscription management, receipt history, and future upsells.


## Webhook Design

### Webhook always returns 200 (even on errors)
**Decision:** The Stripe webhook handler at `/api/webhook/stripe` catches all errors from `handlePurchase` / `handlePaymentIntentPurchase` and still returns `{ received: true }` with status 200.
**Rationale:** If we return 4xx/5xx, Stripe retries the webhook exponentially for up to 3 days. This creates "retry storms" that re-trigger downstream side effects (duplicate Notion tasks, duplicate Loops emails, duplicate CAPI events). Errors are logged to Vercel for manual investigation. The atomic dedup in Turso (see below) is the safety net for any edge case where the webhook does get replayed.

### payment_intent.succeeded skips PIs without metadata.tier
**Decision:** When the webhook receives a `payment_intent.succeeded` event, it checks `paymentIntent.metadata?.tier`. If missing, it logs and skips the event.
**Rationale:** When a Checkout Session completes (Unlimited subscription flow), Stripe fires both `checkout.session.completed` AND `payment_intent.succeeded` for the underlying PaymentIntent. The Checkout Session PI does NOT have our custom `tier` metadata because we only set metadata on the Session object, not the PI. Our `/api/create-payment-intent` route (Trial flow) always sets `metadata.tier = "trial"`. So checking for `tier` metadata is a reliable way to distinguish "this PI came from our inline flow" vs "this PI was created by a Checkout Session" and prevents double-processing the same purchase.

### Atomic dedup: INSERT ON CONFLICT DO NOTHING + rowsAffected check
**Decision:** Both `handlePurchase` and `handlePaymentIntentPurchase` use `INSERT INTO purchases (...) ON CONFLICT(stripe_session_id) DO NOTHING` followed by checking `insertResult.rowsAffected === 0`.
**Rationale:** This is an atomic dedup gate — a single SQL statement that either inserts (first time) or silently no-ops (duplicate). It is NOT a SELECT-then-INSERT pattern, which would have a race condition if two webhook deliveries arrive simultaneously. If `rowsAffected === 0`, the function returns early and none of the downstream side effects (Loops, Notion, CAPI) fire. This means webhook replays are completely safe.


## Post-Purchase Orchestration

### Promise.allSettled (not Promise.all) for downstream services
**Decision:** After the Turso INSERT succeeds, the webhook calls Loops, Notion, and Meta CAPI via `Promise.allSettled([...])`.
**Rationale:** `Promise.all` would reject the entire batch if any single service fails. If Notion is down, we would lose the Loops email AND the CAPI event. `Promise.allSettled` runs all three independently — each can fail without affecting the others. Results are logged individually for observability.

### Turso INSERT happens BEFORE the allSettled block
**Decision:** The Turso `INSERT ... ON CONFLICT DO NOTHING` runs first, as a standalone `await`. Only if it succeeds (and `rowsAffected > 0`) do the downstream services fire.
**Rationale:** Turso serves as the atomic dedup gate. If it's inside the `allSettled` block, a Turso failure would not prevent Loops/Notion/CAPI from firing, which breaks the "only fire side effects once" guarantee. By running Turso first and early-returning on duplicates, the downstream services are protected from both replays and partial failures.

### Downstream services: Turso, Loops, Notion, Meta CAPI — none blocks the others
**Decision:** The four downstream services are independent:
1. **Turso** — purchase record (dedup gate, runs first)
2. **Loops** — addContact + triggerEvent("purchase_completed") + sendTransactional (purchase confirmation email)
3. **Notion** — create task in Actions DB for Akmal
4. **Meta CAPI** — Purchase conversion event
**Rationale:** Each service has its own error handling and logging. A Notion outage should never delay or prevent the customer's purchase confirmation email. A CAPI failure should never prevent the Notion task from being created.


## Pricing

### Hardcoded amounts: 497/1300 in onboarding.ts, 49700 in create-payment-intent
**Decision:** The prices £497 (trial) and £1,300 (unlimited) are hardcoded in the source code. The PaymentIntent amount is 49700 (pence). The Loops/CAPI events use pounds (497/1300).
**Rationale:** Prices change extremely rarely (business decision, not a config thing). Hardcoding avoids an extra Stripe API call to look up the Price object's amount. If prices change, you update the code AND the Stripe Price — they must stay in sync regardless.

### Stripe Price IDs in env vars (not hardcoded)
**Decision:** `STRIPE_PRICE_ID` (trial) and `STRIPE_UNLIMITED_PRICE_ID` (unlimited) are stored as environment variables. The actual Price ID strings are NOT in the source code.
**Rationale:** Price IDs differ between Stripe test mode and live mode. Env vars let us use test prices locally and live prices in production without code changes.

### Turso stores pence (raw Stripe amounts); Loops/CAPI use pounds
**Decision:** `purchases.amount_total` stores the value exactly as Stripe returns it (e.g. 49700 for £497). Loops and CAPI events use human-readable pounds (497, 1300).
**Rationale:** Turso stores the source-of-truth value from Stripe (useful for reconciliation). Loops event properties and CAPI custom_data need human-readable values because they show up in email templates and Meta's Events Manager.


## Meta Tracking

### Browser pixel + server CAPI with shared event_id for dedup
**Decision:** Every Purchase event is sent twice — once from the browser (Meta Pixel `fbq("track", "Purchase", ...)`) and once from the server (Meta CAPI). Both use the same `event_id` so Meta deduplicates them.
**Rationale:** This is Meta's recommended "Redundant Setup." The browser pixel catches users with ad blockers disabled; the server CAPI catches everyone regardless. Meta uses the shared `event_id` to count it as one event. Without both, you either lose signal (CAPI-only misses some browser data) or lose coverage (Pixel-only misses ad-blocked users).

### event_id format: "stripe_{session_id}" or "stripe_{pi_id}"
**Decision:** The event_id is `stripe_` prefixed with either the Checkout Session ID (for unlimited) or the PaymentIntent ID (for trial).
**Rationale:** These IDs are globally unique (Stripe guarantees it), deterministic (same ID on success page and webhook), and traceable back to Stripe for debugging. The `stripe_` prefix avoids any accidental collision with other event ID formats.

### fbc/fbp cookies flow: browser -> API route -> Stripe metadata -> webhook -> CAPI
**Decision:** The browser reads `_fbc` and `_fbp` cookies (set by Meta Pixel), sends them to the `/api/checkout` or `/api/create-payment-intent` route, which stores them in Stripe metadata. The webhook later reads them from metadata and passes them to CAPI.
**Rationale:** The webhook handler runs asynchronously (no browser context), so it cannot read cookies. Stripe metadata is the bridge — it carries browser-only data (cookies, IP, user-agent) from the checkout request through to the asynchronous webhook. This gives CAPI the best possible match data for accurate attribution.

### client_ip and client_ua stored in Stripe metadata for CAPI
**Decision:** The API routes extract `x-forwarded-for` (IP) and `user-agent` from the request headers and store them in Stripe session/PI metadata as `client_ip` and `client_ua`.
**Rationale:** Same reason as fbc/fbp — the webhook has no access to the original browser's IP or user-agent. These improve CAPI's Event Match Quality score, which directly affects how well Meta can attribute conversions to ad clicks. `client_ua` is sliced to 500 chars to stay within Stripe's 500-char metadata value limit.


## ElevenLabs Agent

### Agent ID: agent_4501khrpmw5ceq8v78xbwzjjjh58
**Decision:** The ElevenLabs conversational AI agent is the primary sales interaction on the landing page. It runs in text-only mode via WebSocket.
**Rationale:** A conversational agent qualifies prospects better than a static form. It can adapt to the visitor's business, handle objections, and guide them to checkout. Text-only mode avoids audio permission prompts and works in all environments.

### System prompt managed via API (PATCH /v1/convai/agents/{id})
**Decision:** The agent's system prompt is updated programmatically via the ElevenLabs API, not through their dashboard.
**Rationale:** Keeps the prompt version-controlled locally (in `docs/agent-prompts/base-prompt.md`), enables CI/CD-style updates, and avoids manual dashboard edits that are hard to track or revert.

### 6 KB docs: product, pricing, differentiation, ideal-client, case-studies, faq
**Decision:** Knowledge base documents are uploaded separately and attached to the agent via API.
**Rationale:** KB docs let the agent answer detailed questions without bloating the system prompt. They are separate files because ElevenLabs retrieves them via RAG — the agent only pulls relevant chunks, not the entire corpus.

### ElevenLabs variables use {{_var_}} format (underscores); local files use {{ var }}
**Decision:** When sending prompts to ElevenLabs API, variables must be in `{{_variable_name_}}` format. Local markdown files use `{{ variable_name }}` for readability.
**Rationale:** ElevenLabs requires the underscore-wrapped format for dynamic variable interpolation. The local files use a cleaner format that gets transformed before upload.

### Single consolidated prompt + opener override node (not 8 subagent nodes)
**Decision:** The agent uses one monolithic system prompt with an opener override node, not the original 8-node CLOSER workflow.
**Rationale:** The 8-node workflow was fragile — edge transitions broke conversations, and maintaining 8 separate prompts was error-prone. A single prompt with clear behavioral sections (open, clarify, label, overview, sell, explain, reinforce, warm exit) achieves the same flow without the complexity of node transitions.

### When updating: MUST re-upload KB docs AND update system prompt
**Decision:** KB doc uploads and system prompt updates are separate API operations. Both must be done when making content changes.
**Rationale:** ElevenLabs does not have a "sync all" endpoint. If you update the system prompt but forget to re-upload changed KB docs (or vice versa), the agent will have inconsistent knowledge.


## ElevenLabs Webhook

### Conversation data stored in Turso `conversations` table
**Decision:** The `/api/webhook/elevenlabs` endpoint receives conversation-end webhooks and stores them in Turso with data collection fields, dynamic variables, and transcript.
**Rationale:** Conversation data (visitor name, email, phone, business details, objections raised, conversation outcome) is valuable for sales follow-up and funnel analysis. Storing in Turso makes it queryable alongside purchase data.

### HMAC-SHA256 signature verification with 5-minute timestamp tolerance
**Decision:** Webhook payloads are verified using the `ElevenLabs-Signature` header (format: `t=<timestamp>,v0=<signature>`). Timestamps older than 5 minutes are rejected.
**Rationale:** Prevents replay attacks and ensures webhook payloads are authentic. The 5-minute window accounts for network latency while limiting the replay window.

### Always returns 200 (even on DB errors)
**Decision:** Like the Stripe webhook, the ElevenLabs webhook always returns 200.
**Rationale:** Same reasoning — prevents retry storms. A failed DB insert is logged for investigation but should not cause ElevenLabs to re-deliver the webhook repeatedly.


## Notion Tasks

### Assigned to Akmal (not Asad)
**Decision:** Purchase tasks are created with `Driver: Akmal` (user ID: `ac601ede-0d62-4107-b59e-21c0530b5348`).
**Rationale:** Akmal is the account manager who handles customer onboarding. Asad (founder) should not be the bottleneck for follow-ups.

### Client/Projects relation set to "Admin & Client Tasks"
**Decision:** All purchase tasks use the relation `2c384fd7bc4e81e9b06ae98eac3cd14e` (Admin & Client Tasks).
**Rationale:** Tasks without a Client/Projects relation do not appear in the daily view. This is a Notion DB filter constraint — the relation MUST be set or the task is invisible.

### Task includes tier-specific title and description
**Decision:** Trial purchases create "New Trial purchase: {name}" and Unlimited creates "New Unlimited subscription: {name}".
**Rationale:** Akmal needs to know at a glance which product was purchased so he can tailor the onboarding (trial = 3-week setup, unlimited = ongoing relationship).


## Terminology

### Product names: "AI Ad Engine Trial" (£497) and "AI Ad Engine Unlimited" (£1,300/mo)
**Decision:** These are the only acceptable product names. Internal tier values are `"trial"` and `"unlimited"`.
**Rationale:** Consistency across Stripe, emails, Notion tasks, analytics, and the UI.

### NEVER use "Pilot" or "Retainer"
**Decision:** "Pilot" was the old name and is retired. "Retainer" sounds like an agency service, not a product.
**Rationale:** Huddle Duck is an AI tool company, not a marketing agency. Language must reflect the product model, not the legacy agency model.


## External System Checklist

### When making product/pricing/terminology changes, update ALL of these:
1. **Source code** (`src/`) — components, API routes, lib files
2. **Documentation** (`docs/kb-*.txt`, `docs/agent-prompts/*.md`)
3. **ElevenLabs agent** — system prompt via API + re-upload KB docs
4. **Stripe Dashboard** — product names, price amounts
5. **Loops** — transactional email templates
6. **CLAUDE.md** and **README.md**
7. **Vercel env vars** — if new ones added
8. **~/.claude/CLAUDE.md** — global project registry


## CSS / Design

### globals.css has parallel workstreams — only append, never rewrite
**Decision:** Multiple Claude sessions may edit globals.css concurrently. Only append new rules at the end; never reorganise, delete, or rewrite sections you did not create.
**Rationale:** Incident: committing the full file shipped broken CSS from a WIP parallel session. Use `git add -p src/app/globals.css` to stage only your hunks.

### Dark theme: near-black #050505, viridian #1EBA8F, sandstorm #F7CE46
**Decision:** The "Singularity Aesthetic" redesign (Session 6) uses pure near-black `#050505` as the base background, not the original night-deep navy tones.
**Rationale:** OLED-friendly, ultra-minimal aesthetic. The subtle radial glow (`.bg-glow`) provides depth without compromising the dark feel.

### Badge shine sweep animation: badgeShineSweep keyframe (3s cycle)
**Decision:** The "NEW" badge on the Trial pricing card has a CSS-only shine sweep animation.
**Rationale:** Draws the eye to the primary product without JavaScript overhead. Pure CSS animation for performance.

### Stripe PaymentElement styled with "night" theme
**Decision:** The `<PaymentElement>` uses Stripe's `night` theme with custom variables matching the landing page's design system (viridian primary, near-black backgrounds, rgba white borders).
**Rationale:** The payment form must feel native to the page, not like an embedded third-party widget. The `appearance` object in `PaymentForm.tsx` precisely matches the site's CSS variables.


## Success Page

### noindex/nofollow
**Decision:** The `/success` page has `robots: { index: false, follow: false }`.
**Rationale:** This page contains no useful content for search engines. It should not appear in search results.

### Handles both session_id and payment_intent query params
**Decision:** The success page checks for `?payment_intent=` first (Trial inline flow), then `?session_id=` (Unlimited Checkout Session flow).
**Rationale:** Each payment flow redirects with a different query parameter. The success page must handle both. PaymentIntent is checked first because it is the more common flow (Trial is the default/primary product).

### Shows "No order found" fallback
**Decision:** If accessed without valid params, or if the Stripe API call fails, the page shows a friendly "No order found" message with a link back to home.
**Rationale:** Bots, expired links, or manual URL tampering should not see a broken page or error stack trace.

### Server component fetches Stripe data directly
**Decision:** The success page is a server component that calls `stripe.checkout.sessions.retrieve()` or `stripe.paymentIntents.retrieve()` directly — no API route intermediary.
**Rationale:** Server components can call Stripe directly because the secret key is available server-side. An API route would add unnecessary latency and complexity for a simple data fetch.


## Rate Limiting

### In-memory Map (resets on cold start, per-instance)
**Decision:** Rate limiting uses a simple `Map<string, { count, resetAt }>` in module scope. 5 requests per 10 minutes per IP.
**Rationale:** This is NOT a security boundary. It is basic bot protection to prevent accidental spam (e.g. a user rapidly clicking the checkout button). It resets when Vercel cold-starts the function and is per-instance (not shared across instances). For real DDoS protection, use Vercel's WAF or Cloudflare.

### Applied to both /api/checkout and /api/create-payment-intent
**Decision:** Both checkout endpoints share the same rate limit pattern (but separate Maps, since they are separate route modules).
**Rationale:** Both endpoints create Stripe resources (customers, sessions, PaymentIntents) that cost money to process. Rate limiting prevents runaway API calls from a single IP.


## Double-Click Prevention

### useRef guard (submitting.current) — synchronous check, not useState
**Decision:** `CheckoutSection.tsx` uses a `useRef(false)` flag (`submitting.current`) to prevent duplicate form submissions, separate from the `loading` useState.
**Rationale:** `useState` updates are asynchronous — two rapid clicks can both read `loading === false` before either setState takes effect. `useRef` is synchronous — the first click sets `submitting.current = true` immediately, and the second click sees it as `true` and returns early. The `loading` state is for UI (disabling the button), the ref is for logic (preventing duplicate API calls).


## Keyboard Accessibility

### Pricing tier cards: role="radiogroup" + role="radio"
**Decision:** The tier selector (Trial / Unlimited) uses `role="radiogroup"` on the container and `role="radio"` on each card, with `tabIndex={0}`, `aria-checked`, and Enter/Space key handlers.
**Rationale:** Pricing cards are interactive (click to select) but are `<div>`s, not native `<input type="radio">`. ARIA roles make them accessible to screen readers and keyboard navigation. Enter and Space trigger selection, matching native radio behaviour.


## Checkout Flow (Abandoned Cart Recovery)

### checkout_started event fires from create-payment-intent (not from checkout route)
**Decision:** The `/api/create-payment-intent` endpoint (Trial flow) fires a non-blocking `addContact` + `triggerEvent("checkout_started")` to Loops after creating the PaymentIntent.
**Rationale:** This captures the user's email at the moment they enter payment details, enabling abandoned cart recovery emails via Loops automations. It is fire-and-forget (`.catch()` only logs) so Loops failures never break the checkout flow. The Checkout Session flow (Unlimited) does not fire this event because the user is about to be redirected to Stripe's hosted page — the email is already captured.


## Visitor Tracking

### _vid cookie: 365-day persistent visitor ID
**Decision:** `visitor.ts` creates a `_vid` cookie with `crypto.randomUUID()` that persists for 365 days.
**Rationale:** Links anonymous page views to eventual purchases. The visitor ID flows through the entire funnel: page view -> TrackingScript -> checkout API -> Stripe metadata -> webhook -> Turso purchase record.

### _utms cookie: first-touch only, never overwritten
**Decision:** UTM parameters are stored in `_utms` cookie on first visit. If the cookie already exists, new UTMs are ignored.
**Rationale:** First-touch attribution — we want to know which ad/campaign originally brought the visitor, even if they return later via a different UTM. This matches Meta's attribution model (click-through attribution window).

### _fbc/_fbp cookies read (not written) by visitor.ts
**Decision:** `getFbCookies()` only reads `_fbc` and `_fbp` — the Meta Pixel sets them.
**Rationale:** These are Meta's proprietary cookies. Writing them ourselves would corrupt Meta's tracking. We only read them to pass through to CAPI for improved Event Match Quality.


## Stripe SDK

### Stripe.createFetchHttpClient() required for Vercel
**Decision:** The Stripe client in `stripe.ts` is initialised with `httpClient: Stripe.createFetchHttpClient()`.
**Rationale:** Vercel's Edge/Serverless runtime does not support Node.js's native `http` module. Stripe's default HTTP client uses `http`, which fails silently or throws. The fetch-based client works in all Vercel runtimes.

### Lazy proxy pattern (same as db.ts)
**Decision:** `stripe.ts` exports a `Proxy` object that defers Stripe client creation until first property access.
**Rationale:** Consistent with the Turso lazy proxy pattern used across all Huddle Duck projects. Avoids initialising the Stripe client at module import time (which would fail if env vars are not yet available, e.g. during build).


## SEO

### JSON-LD structured data: Organization + Product
**Decision:** `layout.tsx` includes JSON-LD with `@graph` containing an Organization schema and a Product schema with `AggregateOffer` (£497-£1,300).
**Rationale:** Helps Google understand the page is selling a product with specific pricing, which can enable rich snippets in search results.

### sitemap.ts includes / but success page is excluded
**Decision:** The sitemap lists only the root page. The /success page has `noindex` and is not in the sitemap.
**Rationale:** The success page is a post-purchase confirmation with no SEO value.


## Cookie Consent

### Soft banner, no reject button, no consent gating
**Decision:** `CookieNotice.tsx` shows a dismissible "We use cookies" banner with a single "Got it" button. No reject option. No consent gating (cookies are set regardless).
**Rationale:** Standard UK small business approach. The site uses first-party cookies (visitor ID, UTMs) and third-party tracking (Meta Pixel). A full GDPR consent management platform would be overkill for a single landing page. The banner informs visitors that cookies are in use.


## Fonts

### Lato + Caveat (not Playfair Display + Inter)
**Decision:** The production layout uses Lato (body/headlines, weights 400/700/900) and Caveat (handwritten accent font). The CLAUDE.md mentions Playfair Display + Inter from the Session 6 redesign, but the actual shipped code uses Lato + Caveat.
**Rationale:** Lato is a clean, highly legible sans-serif that works well at all sizes. Caveat adds personality for accent text (annotations, callouts). The font choice evolved during design iterations.


## Meta Pixel SDK

### facebook-nodejs-business-sdk imported via require() (not ESM import)
**Decision:** `meta-capi.ts` uses `const bizSdk = require("facebook-nodejs-business-sdk")` instead of an ESM import.
**Rationale:** The Facebook SDK does not ship proper ESM exports. An `import` statement would fail at build time. The `require()` approach works because Next.js server-side code runs in a Node.js context where CommonJS is supported.

### PII hashed with SHA-256 before sending to CAPI
**Decision:** Email and phone are SHA-256 hashed (lowercase, trimmed) before being set on `UserData`.
**Rationale:** Meta requires PII to be hashed for privacy. The hashing happens server-side so raw PII never leaves the server to Meta. IP address and user-agent are sent unhashed (Meta's requirement — they need raw values for these fields).
