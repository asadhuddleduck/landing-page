# Landing Page — Huddle Duck AI Ad Engine Trial

Conversion-focused sales page for Huddle Duck's AI Ad Engine Trial (£497 one-time). Targets multi-location restaurant chains with an AI chat agent that qualifies visitors, an inline Stripe checkout, and post-purchase orchestration across four downstream services. Live at `start.huddleduck.co.uk`.

## Tech Stack

- **Framework:** Next.js 16 (App Router, TypeScript, React 19)
- **Styling:** Tailwind CSS v4
- **Payments:** Stripe (inline PaymentElement + webhooks)
- **AI Chat:** ElevenLabs Conversational AI (WebSocket, CLOSER workflow)
- **Email:** Resend (purchase confirmations, abandoned cart nudges)
- **CRM:** Notion API (purchase task creation in Actions DB)
- **Attribution:** Meta Conversions API (server) + Meta Pixel (browser, deduplicated)
- **Database:** Turso (LibSQL/SQLite)
- **Animation:** Framer Motion v12 (FAQ accordion)
- **Analytics:** Vercel Analytics
- **Hosting:** Vercel
- **DNS:** Cloudflare (start.huddleduck.co.uk CNAME → cname.vercel-dns.com)

## User Journey

```
Visitor lands
  └─ TrackingScript: capture UTMs + visitor_id cookie → POST /api/track → Meta Pixel PageView
       │
       ├─ ElevenLabsChat (WebSocket)
       │    └─ CLOSER workflow qualifies visitor → contextual cards injected inline
       │
       ├─ CheckoutSection: email/name/phone form
       │    └─ POST /api/create-payment-intent → Stripe PaymentElement → confirmPayment
       │
       └─ /success redirect
            └─ Stripe webhook: payment_intent.succeeded → Promise.allSettled:
                 ├─ Turso: INSERT OR REPLACE purchase record
                 ├─ Resend: branded purchase confirmation email
                 ├─ Notion: create task in Actions DB for Akmal
                 └─ Meta CAPI: Purchase event (deduped via shared event_id with SuccessPixel)
```

## Project Structure

```
src/
  app/
    layout.tsx                      # Root layout: fonts, OG metadata, JSON-LD, analytics
    page.tsx                        # Main page: Hero → Chat → Checkout → FAQ
    globals.css                     # Full design system (~28KB)
    robots.ts                       # SEO: allows all crawlers
    sitemap.ts                      # SEO: /, /privacy, /success
    success/page.tsx                # Post-purchase thank you page
    privacy/page.tsx                # UK GDPR privacy policy
    api/
      checkout/route.ts             # POST — legacy Stripe Checkout Session
      create-payment-intent/route.ts # POST — creates Stripe Customer + PaymentIntent
      webhook/stripe/route.ts       # POST — handles payment_intent.succeeded
      webhook/elevenlabs/route.ts   # POST — stores conversation data (HMAC verified)
      cron/abandoned-cart/route.ts  # GET — hourly: nudge abandoned checkouts via Resend
      cron/reconcile/route.ts       # GET — every 6h: cross-ref Stripe events with Turso purchases
  components/
    ConvergenceBackground.tsx       # Canvas particle animation (streaks + motes)
    HeroChatSection.tsx             # Hero headline + mounts ElevenLabsChat
    ElevenLabsChat.tsx              # AI chat widget (text-only, WebSocket, power bar, cards)
    ChatCards.tsx                   # Contextual cards: Pricing, Testimonial, CTA
    LogoStrip.tsx                   # 13 client brand logos
    CheckoutSection.tsx             # Multi-step inline checkout (idle → details → paying → done)
    PaymentForm.tsx                 # Stripe PaymentElement with dark theme
    FAQ.tsx                         # 7-item Framer Motion accordion
    CookieNotice.tsx                # Soft dismiss banner (no consent gating)
    MetaPixel.tsx                   # Meta Pixel init + trackPixelEvent helper
    TrackingScript.tsx              # UTM capture + visitor_id + posts to attribution-tracker
    SuccessPixel.tsx                # Purchase pixel event on /success (dedup with CAPI)
  lib/
    db.ts                           # Turso lazy proxy
    stripe.ts                       # Stripe client (createFetchHttpClient for Vercel compat)
    email.ts                        # Resend transactional email
    meta-capi.ts                    # Meta CAPI: hashed PII, never throws
    notion.ts                       # Creates purchase task in Notion Actions DB
    onboarding.ts                   # Post-purchase orchestrator (4 services via Promise.allSettled)
    visitor.ts                      # Cookie utils: visitor_id, UTMs, FB cookies
public/
  duck-logo.png                     # Brand mark
  og-image.jpg                      # 1200x630 social share image
  logos/                            # 14 client brand logos for LogoStrip
```

## Environment Variables

```bash
# Stripe
STRIPE_SECRET_KEY=sk_live_...
NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY=pk_live_...
STRIPE_PRICE_ID=price_...
STRIPE_WEBHOOK_SECRET=whsec_...

# Resend
RESEND_API_KEY=...

# Cron
CRON_SECRET=...

# Notion
NOTION_TOKEN=secret_...

# Meta
META_ACCESS_TOKEN=...
META_PIXEL_ID=...

# Turso
TURSO_DATABASE_URL=libsql://landing-page-...turso.io
TURSO_AUTH_TOKEN=...

# Attribution
NEXT_PUBLIC_TRACKING_URL=https://attribution-tracker.vercel.app

# ElevenLabs
ELEVENLABS_WEBHOOK_SECRET=...

# Cloudflare (DNS management only)
CLOUDFLARE_API_KEY=...
CLOUDFLARE_EMAIL=...
CLOUDFLARE_ZONE_ID=...
```

## Local Development

```bash
npm install
npm run dev
```

Open http://localhost:3000. Requires a `.env.local` file with the variables above.

## API Endpoints

| Endpoint | Method | Purpose |
|---|---|---|
| `/api/checkout` | POST | Legacy: create Stripe Checkout Session, return redirect URL |
| `/api/create-payment-intent` | POST | Create Stripe Customer + PaymentIntent, return clientSecret |
| `/api/webhook/stripe` | POST | Handle `payment_intent.succeeded` — trigger 4 downstream services |
| `/api/webhook/elevenlabs` | POST | Store ElevenLabs conversation data (HMAC-SHA256 verified) |
| `/api/cron/abandoned-cart` | GET | Hourly: nudge abandoned checkouts via Resend |
| `/api/cron/reconcile` | GET | Every 6h: cross-ref Stripe events with Turso purchases |

## Deployment

Deployed to Vercel via GitHub integration. Push to `main` auto-deploys to production.

```bash
npm run build          # verify locally before deploying
git push               # triggers Vercel auto-deploy
```

DNS: `start.huddleduck.co.uk` CNAME → `cname.vercel-dns.com` (Cloudflare, DNS-only).

## Key Features

- Inline Stripe checkout with PaymentElement — no redirect to Stripe-hosted page
- ElevenLabs CLOSER workflow: 8-node AI sales agent (Opener → Clarify → Label → Overview → Sell → Explain → Reinforce → Warm Exit)
- Contextual chat cards injected by keyword detection during conversation
- Post-purchase orchestration via `Promise.allSettled` — partial failures never block the success page
- Meta Pixel + CAPI deduplication using shared `event_id: stripe_{payment_intent_id}`
- First-touch UTM attribution via cookies, forwarded to attribution-tracker
- Soft cookie notice (no consent gating — standard UK small business approach)
- JSON-LD structured data (Organization + Product schemas) for SEO
- Abandoned cart recovery: hourly cron nudges incomplete checkouts via Resend
- Webhook reconciliation: 6-hourly cron cross-refs Stripe events with Turso
- Design: near-black (#050505) background, viridian (#1EBA8F) primary, sandstorm (#F7CE46) accent

## Database

Turso DB `landing-page` — three tables:
- `purchases` — Stripe payment records (keyed on `stripe_session_id`, includes UTMs + visitor_id)
- `conversations` — ElevenLabs chat transcripts and qualification data
- `checkouts` — Tracks checkout starts for abandoned cart recovery (payment_intent_id, email, nudged_at)

## Legacy Components

The following components are on disk but not mounted in `page.tsx`. They are artefacts from earlier design iterations: `HeroSection.tsx`, `HeroAnimation.tsx`, `InfoAnimation.tsx`, `SocialProof.tsx`, `StickyCheckoutBar.tsx`, `StickyCheckoutCTA.tsx`, `Header.tsx`.
