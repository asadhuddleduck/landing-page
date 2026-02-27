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
**Rationale:** If we return 4xx/5xx, Stripe retries the webhook exponentially for up to 3 days. This creates "retry storms" that re-trigger downstream side effects (duplicate Notion tasks, duplicate Resend emails, duplicate CAPI events). Errors are logged to Vercel for manual investigation. The atomic dedup in Turso (see below) is the safety net for any edge case where the webhook does get replayed.

### payment_intent.succeeded skips PIs without metadata.tier
**Decision:** When the webhook receives a `payment_intent.succeeded` event, it checks `paymentIntent.metadata?.tier`. If missing, it logs and skips the event.
**Rationale:** When a Checkout Session completes (Unlimited subscription flow), Stripe fires both `checkout.session.completed` AND `payment_intent.succeeded` for the underlying PaymentIntent. The Checkout Session PI does NOT have our custom `tier` metadata because we only set metadata on the Session object, not the PI. Our `/api/create-payment-intent` route (Trial flow) always sets `metadata.tier = "trial"`. So checking for `tier` metadata is a reliable way to distinguish "this PI came from our inline flow" vs "this PI was created by a Checkout Session" and prevents double-processing the same purchase.

### Atomic dedup: INSERT ON CONFLICT DO NOTHING + rowsAffected check
**Decision:** Both `handlePurchase` and `handlePaymentIntentPurchase` use `INSERT INTO purchases (...) ON CONFLICT(stripe_session_id) DO NOTHING` followed by checking `insertResult.rowsAffected === 0`.
**Rationale:** This is an atomic dedup gate — a single SQL statement that either inserts (first time) or silently no-ops (duplicate). It is NOT a SELECT-then-INSERT pattern, which would have a race condition if two webhook deliveries arrive simultaneously. If `rowsAffected === 0`, the function returns early and none of the downstream side effects (Resend, Notion, CAPI) fire. This means webhook replays are completely safe.


## Post-Purchase Orchestration

### Promise.allSettled (not Promise.all) for downstream services
**Decision:** After the Turso INSERT succeeds, the webhook calls Resend, Notion, and Meta CAPI via `Promise.allSettled([...])`.
**Rationale:** `Promise.all` would reject the entire batch if any single service fails. If Notion is down, we would lose the Resend email AND the CAPI event. `Promise.allSettled` runs all three independently — each can fail without affecting the others. Results are logged individually for observability.

### Turso INSERT happens BEFORE the allSettled block
**Decision:** The Turso `INSERT ... ON CONFLICT DO NOTHING` runs first, as a standalone `await`. Only if it succeeds (and `rowsAffected > 0`) do the downstream services fire.
**Rationale:** Turso serves as the atomic dedup gate. If it's inside the `allSettled` block, a Turso failure would not prevent Resend/Notion/CAPI from firing, which breaks the "only fire side effects once" guarantee. By running Turso first and early-returning on duplicates, the downstream services are protected from both replays and partial failures.

### Downstream services: Turso, Resend, Notion, Meta CAPI — none blocks the others
**Decision:** The four downstream services are independent:
1. **Turso** — purchase record (dedup gate, runs first)
2. **Resend** — branded purchase confirmation email
3. **Notion** — create task in Actions DB for Akmal
4. **Meta CAPI** — Purchase conversion event
**Rationale:** Each service has its own error handling and logging. A Notion outage should never delay or prevent the customer's purchase confirmation email. A CAPI failure should never prevent the Notion task from being created.


## Email Provider

### Resend replaces Loops for transactional email
**Decision:** All transactional email (purchase confirmations, abandoned cart nudges) is sent via Resend. Loops has been fully removed.
**Rationale:** Loops was unreliable — email delivery failures were silent and unrecoverable. Resend provides a simpler API, branded HTML templates controlled in code, and clear error reporting. Turso + Notion already handle contact/purchase tracking, so Loops' CRM features were redundant.

### Abandoned cart recovery via Turso + Resend cron
**Decision:** When a PaymentIntent is created, the checkout is recorded in a `checkouts` Turso table. An hourly cron queries for checkouts older than 1 hour with no matching purchase record, verifies the PaymentIntent is truly unpaid via `stripe.paymentIntents.retrieve()`, sends a branded nudge email via Resend, and marks them as nudged to prevent re-sending. Stale rows older than 30 days are cleaned up each run.
**Rationale:** Replaces the previous Loops `checkout_started` event + automation. Self-hosted approach: no external dependency for abandoned cart logic, full control over timing and content, and the data lives in Turso alongside purchases for easy querying. The Stripe PI status check prevents a race condition where a customer who just paid (but whose webhook hasn't completed yet) receives an abandoned cart nudge. The 30-day cleanup prevents unbounded table growth.


## Webhook Reconciliation

### Stripe event reconciliation cron every 6 hours
**Decision:** A cron job at `/api/cron/reconcile` fetches the last 24 hours of Stripe `checkout.session.completed` and `payment_intent.succeeded` events, cross-references them with the Turso `purchases` table, and re-runs `handlePurchase`/`handlePaymentIntentPurchase` for any missing records.
**Rationale:** Webhook delivery can fail silently (network issues, cold start timeouts, Vercel function errors). The reconciliation cron is a safety net that catches any purchases that fell through. The onboarding functions are idempotent (INSERT ON CONFLICT DO NOTHING), so re-running them for existing purchases is a no-op.


## Pricing

### Hardcoded amounts: 497/1300 in onboarding.ts, 49700 in create-payment-intent
**Decision:** The prices £497 (trial) and £1,300 (unlimited) are hardcoded in the source code. The PaymentIntent amount is 49700 (pence). The Resend emails and CAPI events use pounds (497/1300).
**Rationale:** Prices change extremely rarely (business decision, not a config thing). Hardcoding avoids an extra Stripe API call to look up the Price object's amount. If prices change, you update the code AND the Stripe Price — they must stay in sync regardless.

### Stripe Price IDs in env vars (not hardcoded)
**Decision:** `STRIPE_PRICE_ID` (trial) and `STRIPE_UNLIMITED_PRICE_ID` (unlimited) are stored as environment variables. The actual Price ID strings are NOT in the source code.
**Rationale:** Price IDs differ between Stripe test mode and live mode. Env vars let us use test prices locally and live prices in production without code changes.

### Turso stores pence (raw Stripe amounts); Resend/CAPI use pounds
**Decision:** `purchases.amount_total` stores the value exactly as Stripe returns it (e.g. 49700 for £497). Resend emails and CAPI events use human-readable pounds (497, 1300).
**Rationale:** Turso stores the source-of-truth value from Stripe (useful for reconciliation). Resend email templates and CAPI custom_data need human-readable values because they show up in emails and Meta's Events Manager.


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


## AI Sales Chat (Vercel AI SDK + Anthropic)

### Replaced ElevenLabs with direct Anthropic API (Feb 2026)
**Decision:** The landing page chat was migrated from ElevenLabs Conversational AI (WebSocket, $0.32/conversation) to direct Anthropic API calls via Vercel AI SDK (HTTP streaming, ~$0.05-0.10/conversation).
**Rationale:** ElevenLabs cost ~£112/month for a text-only chat — the platform fee added zero value since voice/TTS features weren't used. Direct API calls with prompt caching reduce costs by 75-85%. The prompt, KB docs, and all UX logic stayed the same.

### System prompt + 9 KB docs stuffed into system message (no RAG)
**Decision:** The system prompt (`docs/agent-prompts/base-prompt-v3.md`) and all 9 KB docs (`docs/kb-01` through `kb-09`) are concatenated into a single system message (~10k tokens).
**Rationale:** 10k tokens is well within the 200k context window. Stuffing everything into the system message with Anthropic's prompt caching is cheaper and more reliable than RAG. Every KB doc is always available to the agent — no retrieval misses.

### Prompt caching via Anthropic ephemeral cache control
**Decision:** The system message (prompt + KB) has `providerOptions.anthropic.cacheControl: { type: "ephemeral" }`, enabling Anthropic's automatic prompt caching.
**Rationale:** The system message is identical across all conversations. Caching reduces input token costs by ~90% after the first message in a 5-minute window. At 333 conversations/month, this saves ~$80-100/month vs uncached.

### Dynamic variables interpolated server-side via regex
**Decision:** `{{ variable_name }}` placeholders in the prompt are replaced via simple regex before sending to Anthropic. Variables (visitor_id, UTMs, returning visitor context) are sent from the client in `dynamicVariables`.
**Rationale:** Simple, no dependencies, no format conversion. The client sends variables on every request; the server interpolates before building the system message.

### Conversation persistence via client-side triggers + server extraction
**Decision:** Conversations are saved to Turso via `POST /api/chat/save` triggered by: 5-min inactivity timeout, page leave (`sendBeacon`), or warm exit keyword detection. A follow-up Haiku call extracts structured fields (business_name, location_count, is_fb, etc.).
**Rationale:** Client-side triggers ensure conversations are saved even on tab close. `sendBeacon` is fire-and-forget and reliable. Haiku extraction (~$0.003/conversation) gives structured data for funnel analysis without complicating the chat flow.

### Model configurable via ANTHROPIC_MODEL env var
**Decision:** The chat model is set via `ANTHROPIC_MODEL` env var (default: `claude-sonnet-4-6`). Extraction uses `claude-haiku-4-5`.
**Rationale:** When a new Sonnet drops, change the env var in Vercel — no code changes, no redeploy needed.

### Max 150 output tokens per response
**Decision:** `maxOutputTokens: 150` in the streaming endpoint.
**Rationale:** The prompt already enforces <25 words per message. The token limit is a safety net against runaway responses. 150 tokens is generous for 25 words but prevents the model from ignoring the instruction.


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
2. **Documentation** (`docs/kb-*.txt`, `docs/agent-prompts/*.md`) — changes take effect on next deploy
3. **Stripe Dashboard** — product names, price amounts
4. **Resend** — email templates in `src/lib/email.ts`
5. **CLAUDE.md** and **README.md**
6. **Vercel env vars** — if new ones added
7. **~/.claude/CLAUDE.md** — global project registry


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

### Checkout start recorded in Turso for abandoned cart recovery
**Decision:** The `/api/create-payment-intent` endpoint (Trial flow) records the checkout in a Turso `checkouts` table after creating the PaymentIntent. An hourly cron checks for abandoned checkouts (older than 1 hour with no matching purchase) and sends a nudge email via Resend.
**Rationale:** This captures the user's email at the moment they enter payment details, enabling abandoned cart recovery. The checkout record is fire-and-forget (`.catch()` only logs) so DB failures never break the checkout flow. The hourly cron handles the nudge logic — no external automation dependency.


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
