# Landing Page - Huddle Duck AI Ad Engine

## What This Is
Self-serve landing page for Huddle Duck's AI Ad Engine. Two tiers:
- **Trial**: £497 one-time (3-week managed campaign)
- **Unlimited**: £1,300/month (ongoing management, month-to-month)

Hosted at `start.huddleduck.co.uk`. Uses a DIY AI sales chat (Vercel AI SDK + Anthropic Claude Sonnet) as the primary sales interaction.

## Tech Stack
- Next.js 16 (App Router, TypeScript, React 19)
- Tailwind CSS v4 (`@tailwindcss/postcss`)
- `@vercel/analytics`
- Stripe (PaymentIntent for Trial, Checkout Session for Unlimited subscriptions)
- Vercel AI SDK v6 (`ai`, `@ai-sdk/anthropic`, `@ai-sdk/react`) — streaming chat with Anthropic Claude Sonnet
- Turso/LibSQL (purchase records + conversation transcripts, lazy proxy pattern)
- Resend (transactional email: purchase confirmations, abandoned cart nudges)
- Notion API (task creation in Actions DB)
- Meta Conversions API (server-side purchase events via `facebook-nodejs-business-sdk`)
- Meta Pixel (client-side pixel events via `fbevents.js`, deduplicated with CAPI)
- Attribution tracking (visitor cookies + UTMs, POSTs to attribution-tracker API)
- Hosting: Vercel
- DNS: Cloudflare (`start.huddleduck.co.uk` CNAME -> `cname.vercel-dns.com`)

## Design System
Dark theme. CSS custom properties in `globals.css`:
- Background: near-black `#050505` / `#0A0A0A`
- Primary brand: viridian `#1EBA8F`
- Accent: sandstorm `#F7CE46`
- Text: primary `#FFFFFF`, secondary `#999999`, muted `#555555`
- Borders: `rgba(255,255,255,0.08)`
- Fonts: Lato (body via `--font-primary`) + Caveat (handwritten accent via `--font-accent`)
- Cards: `rgba(255,255,255,0.03)` bg, `rgba(255,255,255,0.08)` border

## File Map
```
src/
  app/
    globals.css              # Design system CSS variables + animations
    layout.tsx               # Root layout, Lato + Caveat fonts, metadata/OG, AggregateOffer JSON-LD
    page.tsx                 # Main page assembling all sections
    sitemap.ts               # / and /privacy (success excluded)
    robots.ts                # Allow all crawlers
    success/page.tsx         # Post-purchase page (handles both session_id and payment_intent params)
    privacy/page.tsx         # Privacy policy (static)
    api/
      checkout/route.ts      # POST: creates Stripe Checkout Session (Unlimited subscription or Trial payment)
      create-payment-intent/route.ts  # POST: creates PaymentIntent for Trial inline payment
      webhook/stripe/route.ts         # POST: handles checkout.session.completed + payment_intent.succeeded
      chat/route.ts                   # POST: AI chat streaming endpoint (Anthropic Claude via Vercel AI SDK)
      chat/save/route.ts              # POST: saves conversation transcript to Turso + Haiku extraction
      cron/abandoned-cart/route.ts    # GET: nudge abandoned checkouts via Resend (hourly cron)
      cron/reconcile/route.ts         # GET: cross-ref Stripe events with Turso, re-run missing (every 6h)
  components/
    Header.tsx               # Minimal header with logo + brand text (server)
    HeroChatSection.tsx      # Hero section with AI chat integration (client)
    ElevenLabsChat.tsx       # AI sales chat interface — Vercel AI SDK useChat + streaming (client)
    ChatCards.tsx             # Pricing card, testimonial cards, CTA card shown during/after chat (client)
    LogoStrip.tsx             # Client brand logo carousel (server)
    ConvergenceBackground.tsx # Animated background canvas (client)
    SocialProof.tsx           # 3 animated stats: locations, rating, years (client)
    CaseStudies.tsx           # 7 case study cards with expand/collapse (client)
    FounderSection.tsx        # Founder profile section (server)
    CheckoutSection.tsx       # Two-tier pricing cards + contact form + payment flow (client)
    PaymentForm.tsx           # Stripe PaymentElement for inline Trial payment (client)
    StickyCheckoutCTA.tsx     # Sticky bottom bar CTA after scrolling past checkout (client)
    FAQ.tsx                   # 6-item accordion with highlighted key phrases (client)
    Footer.tsx                # Minimal footer (server)
    MetaPixel.tsx             # Meta Pixel base code + trackPixelEvent export (client)
    TrackingScript.tsx        # Attribution tracking POST to /api/track (client)
    SuccessPixel.tsx          # Purchase pixel event on /success page (client)
    CookieNotice.tsx          # Soft "We use cookies" dismissible banner (client)
  lib/
    db.ts                    # Turso lazy proxy (from client-dashboards)
    stripe.ts                # Stripe client (fetchHttpClient for Vercel compat)
    email.ts                 # Resend transactional email (purchase confirmation, abandoned cart)
    meta-capi.ts             # Meta Conversions API (from attribution-tracker)
    notion.ts                # Notion task creation in Actions DB
    onboarding.ts            # Post-purchase orchestrator (Promise.allSettled, atomic dedup)
    visitor.ts               # Cookie utilities: getVisitorId, getStoredUtms, getFbCookies
public/
  duck-logo.png              # Huddle Duck logo
  favicon.png                # Favicon (dark background)
  og-image.jpg               # OG image for social sharing
  logos/                     # Client brand logos for case studies + logo strip
```

## Page Order
Header -> HeroChatSection (with ElevenLabsChat + LogoStrip) -> SocialProof -> CaseStudies -> FounderSection -> CheckoutSection -> FAQ -> Footer

## AI Chat Integration
- **Model:** Claude Sonnet (`claude-sonnet-4-6`) via Anthropic API, configurable via `ANTHROPIC_MODEL` env var
- **SDK:** Vercel AI SDK v6 — `useChat` hook on client, `streamText` on server
- **Prompt:** `docs/agent-prompts/base-prompt-v3.md` — 6-phase sales flow (Hook, Qualify, Discovery, Reflection, Offer, Soft Close)
- **Knowledge base:** 9 text files in `docs/` (kb-01 through kb-09) — loaded into system message at module scope, ~10k tokens
- **Prompt caching:** System prompt + KB docs cached via Anthropic ephemeral caching (90% cost reduction after first message)
- **Extraction:** Claude Haiku (`claude-haiku-4-5`) extracts business_name, location_count, etc. from transcripts on save
- **Dynamic variables:** visitor_id, UTMs, returning_visitor context — interpolated server-side via `{{ variable }}` placeholders
- **Card detection:** PricingCard, TestimonialCard, CTACard triggered by keywords in agent responses (see `ChatCards.tsx`)
- **Conversation persistence:** Transcript saved to Turso `conversations` table on 5-min inactivity, page leave, or warm exit
- **Cost:** ~$0.05-0.10/conversation with prompt caching
- **Handoff doc:** `docs/handoff-chat-closing.md` — comprehensive guide for teams optimizing chat closing rates

## Environment Variables

### In `.env.local` and Vercel
| Variable | Purpose |
|---|---|
| `STRIPE_SECRET_KEY` | Stripe API (sk_live_...) |
| `NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY` | Stripe.js browser-side (pk_live_...) |
| `STRIPE_PRICE_ID` | Stripe Price ID for £497 Trial product |
| `STRIPE_UNLIMITED_PRICE_ID` | Stripe Price ID for £1,300/mo Unlimited subscription |
| `STRIPE_WEBHOOK_SECRET` | Webhook signature verification (whsec_...) |
| `RESEND_API_KEY` | Resend transactional email |
| `CRON_SECRET` | Vercel cron authentication |
| `NOTION_TOKEN` | Notion API for task creation |
| `META_ACCESS_TOKEN` | Meta CAPI for purchase events |
| `META_PIXEL_ID` | Meta Pixel ID (1780686211962897) |
| `TURSO_DATABASE_URL` | Turso DB for purchase records |
| `TURSO_AUTH_TOKEN` | Turso auth |
| `NEXT_PUBLIC_TRACKING_URL` | Attribution tracker Vercel URL |
| `ANTHROPIC_API_KEY` | Anthropic API for AI chat |
| `ANTHROPIC_MODEL` | Model ID (default: `claude-sonnet-4-6`) |
| `CLOUDFLARE_API_KEY` | Cloudflare Global API Key (DNS management) |
| `CLOUDFLARE_EMAIL` | Cloudflare account email |
| `CLOUDFLARE_ZONE_ID` | Zone ID for huddleduck.co.uk |

### Key Values
- `STRIPE_PRICE_ID`: `price_1T25qbEMAaEi0IoguZpHE4GB` (£497 GBP, one-time)
- `STRIPE_UNLIMITED_PRICE_ID`: `price_1T52ZXEMAaEi0IogKnHfM4fI` (£1,300 GBP, recurring monthly)
- Stripe Product ID (Trial): `prod_U062C0TCKDiq7U` ("AI Ad Engine Trial")
- Stripe Webhook ID: `we_1T25xGEMAaEi0IogUV98EJTE` (subscribed to: checkout.session.completed, payment_intent.succeeded)
- `META_PIXEL_ID`: `1780686211962897`
- Akmal's Notion User ID: `ac601ede-0d62-4107-b59e-21c0530b5348`
- Notion Actions DB ID: `2c384fd7-bc4e-81a1-b469-e33afbf19157`
- Notion Actions DB data source: `collection://2c384fd7-bc4e-813d-99c4-000b9a6385c8`
- Cloudflare Zone ID: `253840e28c6c8ec53828f5929bc45732`
- Turso DB: `landing-page` (URL: `libsql://landing-page-asadhuddleduck.aws-eu-west-1.turso.io`)
- `NEXT_PUBLIC_TRACKING_URL`: `https://attribution-tracker.vercel.app`

## DNS
- Domain: `start.huddleduck.co.uk`
- CNAME: `start` -> `cname.vercel-dns.com` (DNS only, not proxied)
- Cloudflare Zone ID: `253840e28c6c8ec53828f5929bc45732`
- Nameservers: `adelaide.ns.cloudflare.com`, `phil.ns.cloudflare.com`

## Payment Architecture
Two parallel payment flows:

**Trial (£497 one-time) - Inline:**
Button click -> POST `/api/create-payment-intent` -> PaymentIntent created -> Stripe PaymentElement renders inline -> User pays -> `/success?payment_intent=pi_xxx` -> Webhook: `payment_intent.succeeded` -> `handlePaymentIntentPurchase`

**Unlimited (£1,300/mo subscription) - Redirect:**
Button click -> POST `/api/checkout` -> Checkout Session created (subscription mode) -> Redirect to Stripe hosted page -> `/success?session_id=cs_xxx` -> Webhook: `checkout.session.completed` -> `handlePurchase`

**Webhook dedup:** PaymentIntents from Checkout Sessions are skipped via `metadata.tier` check. Only PIs created by our `/api/create-payment-intent` route have `metadata.tier` set.

**Post-purchase orchestration** (both flows, via `Promise.allSettled`):
1. Turso: Atomic `INSERT ... ON CONFLICT(stripe_session_id) DO NOTHING` (dedup)
2. Resend: branded purchase confirmation email
3. Notion: Create task for Akmal in Actions DB
4. Meta CAPI: `Purchase` event with `stripe_{id}` for pixel dedup

## Turso Database
- DB name: `landing-page`
- Table: `purchases` (stripe_session_id UNIQUE, stripe_customer_id, email, name, phone, amount_total, currency, visitor_id, utm_source, utm_medium, utm_campaign, tier, stripe_subscription_id, recurring, created_at)
- Table: `checkouts` (email, name, payment_intent_id UNIQUE, amount, created_at, nudged_at) — tracks checkout starts for abandoned cart recovery
- Query: `turso db shell landing-page "SELECT * FROM purchases"`

## Attribution & Tracking
- **Visitor ID**: `_vid` cookie (365 days, `crypto.randomUUID()`) - created by `visitor.ts`
- **UTMs**: First-touch UTMs stored in `_utms` cookie (JSON), never overwritten
- **TrackingScript**: POSTs page views to `NEXT_PUBLIC_TRACKING_URL/api/track` with visitor_id, UTMs, _fbc/_fbp
- **Meta Pixel**: `fbevents.js` injected on load. Fires PageView, InitiateCheckout (tier-aware value), Purchase (on success)
- **CAPI dedup**: Purchase pixel uses `event_id: stripe_{id}` matching server-side CAPI in onboarding.ts
- **fbc/fbp passthrough**: Browser cookies -> API route body -> Stripe metadata -> webhook -> Meta CAPI
- **Attribution tracker**: Deployed at `https://attribution-tracker.vercel.app` (separate Turso DB: `attribution-tracker`)
- **Cookie notice**: Soft banner with "Got it" button, stored in localStorage, no consent gating

## SEO
- `robots.ts` - allows all crawlers, points to sitemap
- `sitemap.ts` - lists `/` and `/privacy` (success page excluded)
- JSON-LD: Organization schema + AggregateOffer (lowPrice 497, highPrice 1300, offerCount 2)
- Full OG/Twitter metadata in layout.tsx
- Success page has `robots: { index: false, follow: false }`

## Key Architectural Decisions
See `DECISIONS.md` for 22 documented decisions covering payment flows, webhook design, dedup, pricing, tracking, and external system integration.
