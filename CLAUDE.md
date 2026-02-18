# Landing Page - Huddle Duck AI Ad Engine Pilot

## What This Is
Self-serve landing page for Huddle Duck's AI Ad Engine Pilot (£497 one-time).
Hosted at `start.huddleduck.co.uk`. Uses an ElevenLabs AI chat agent as the primary sales interaction.

## Tech Stack
- Next.js 16 (App Router, TypeScript, React 19)
- Tailwind CSS v4 (`@tailwindcss/postcss`)
- `@vercel/analytics`
- Stripe (checkout + webhooks, `stripe` SDK v20 with `createFetchHttpClient()`)
- ElevenLabs convai widget (custom element, dynamically injected via `useEffect`)
- Turso/LibSQL (purchase records, lazy proxy pattern)
- Loops.so (email automation via API)
- Notion API (task creation in Actions DB)
- Meta Conversions API (server-side purchase events via `facebook-nodejs-business-sdk`)
- Meta Pixel (client-side pixel events via `fbevents.js`, deduplicated with CAPI)
- Attribution tracking (visitor cookies + UTMs, POSTs to attribution-tracker API)
- Hosting: Vercel
- DNS: Cloudflare (`start.huddleduck.co.uk` CNAME → `cname.vercel-dns.com`)

## Design System
Dark theme ported from `client-dashboards`. CSS custom properties in `globals.css`:
- Primary brand: viridian `#1EBA8F`
- Accent: sandstorm `#F7CE46`
- Backgrounds: night-deep `#001E2B`, night `#00334B`, night-card `#002639`
- Text: primary `#F0F4F8`, secondary `#8BA3B8`, muted `#5A7A94`

## File Map
```
src/
  app/
    globals.css            # Design system CSS variables + animations
    layout.tsx             # Root layout, Inter font, metadata/OG tags
    page.tsx               # Main page assembling all sections
    success/page.tsx       # Post-purchase thank you page (server, fetches Stripe session)
    api/
      checkout/route.ts    # POST: creates Stripe Checkout Session (£497)
      webhook/stripe/route.ts  # POST: handles checkout.session.completed webhook
  components/
    Header.tsx             # Sticky header with duck logo + F&B badge (server)
    HeroSection.tsx        # Hero headline with gradient text (server)
    InfoAnimation.tsx      # 3-step process cards (server, placeholder for Framer Motion)
    ElevenLabsChat.tsx     # ElevenLabs widget (client, loading/error states, 10s timeout)
    CheckoutSection.tsx    # Pricing card + checkout button (client, visitor_id + pixel events)
    SocialProof.tsx        # 3 testimonial cards (server, placeholder content)
    FAQ.tsx                # 5-item expandable accordion (client, useState)
    Footer.tsx             # Footer with logo + copyright (server)
    MetaPixel.tsx          # Meta Pixel base code + trackPixelEvent export (client)
    TrackingScript.tsx     # Attribution tracking POST to /api/track (client)
    SuccessPixel.tsx       # Purchase pixel event on /success page (client)
    CookieNotice.tsx       # Soft "We use cookies" dismissible banner (client)
  lib/
    db.ts                  # Turso lazy proxy (from client-dashboards)
    stripe.ts              # Stripe client (fetchHttpClient for Vercel compat)
    loops.ts               # Loops.so API wrapper (from attribution-tracker)
    meta-capi.ts           # Meta Conversions API (from attribution-tracker)
    notion.ts              # Notion task creation in Actions DB
    onboarding.ts          # Post-purchase orchestrator (Promise.allSettled)
    visitor.ts             # Cookie utilities: getVisitorId, getStoredUtms, getFbCookies
public/
  duck-logo.png            # Huddle Duck logo
  favicon.png              # Favicon (dark background)
  og-image.jpg             # OG image for social sharing
```

## ElevenLabs Integration
- Agent ID: `4f58a5783e990de16e22e8effd8ba103118c603a76f123afbde18a66f4e1466e`
- Loaded via: `useEffect` dynamically creates `<script>` tag and `<elevenlabs-convai>` custom element
- Script URL: `https://unpkg.com/@elevenlabs/convai-widget-embed`
- The widget renders as a floating orb in the bottom-right corner of the page

## Environment Variables

### In `.env.local` and Vercel
| Variable | Purpose |
|---|---|
| `CLOUDFLARE_API_KEY` | Cloudflare Global API Key (for DNS management) |
| `CLOUDFLARE_EMAIL` | Cloudflare account email |
| `CLOUDFLARE_ZONE_ID` | Zone ID for huddleduck.co.uk |
| `STRIPE_SECRET_KEY` | Stripe checkout (sk_live_...) |
| `NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY` | Stripe.js browser-side (pk_live_...) |
| `STRIPE_PRICE_ID` | Stripe Price ID for £497 product |
| `STRIPE_WEBHOOK_SECRET` | Webhook signature verification (whsec_...) |
| `LOOPS_API_KEY` | Loops.so email automation |
| `NOTION_TOKEN` | Notion API for task creation |
| `META_ACCESS_TOKEN` | Meta CAPI for purchase events |
| `META_PIXEL_ID` | Meta Pixel ID (1780686211962897) |
| `TURSO_DATABASE_URL` | Turso DB for purchase records |
| `TURSO_AUTH_TOKEN` | Turso auth |
| `NEXT_PUBLIC_TRACKING_URL` | Attribution tracker Vercel URL |

### Key Values
- `STRIPE_PRICE_ID`: `price_1T25qbEMAaEi0IoguZpHE4GB` (£497 GBP, one-time)
- Stripe Product ID: `prod_U062C0TCKDiq7U` ("AI Ad Engine Pilot")
- Stripe Webhook ID: `we_1T25xGEMAaEi0IogUV98EJTE`
- `META_PIXEL_ID`: `1780686211962897`
- ElevenLabs Agent ID: `4f58a5783e990de16e22e8effd8ba103118c603a76f123afbde18a66f4e1466e`
- Akmal's Notion User ID: `ac601ede-0d62-4107-b59e-21c0530b5348`
- Notion Actions DB ID: `2c384fd7-bc4e-81a1-b469-e33afbf19157`
- Notion Actions DB data source: `collection://2c384fd7-bc4e-813d-99c4-000b9a6385c8`
- Cloudflare Zone ID: `253840e28c6c8ec53828f5929bc45732`
- Turso DB: `landing-page` (URL: `libsql://landing-page-asadhuddleduck.aws-eu-west-1.turso.io`)
- `NEXT_PUBLIC_TRACKING_URL`: `https://attribution-tracker.vercel.app`

## DNS
- Domain: `start.huddleduck.co.uk`
- CNAME: `start` → `cname.vercel-dns.com` (DNS only, not proxied)
- Cloudflare Zone ID: `253840e28c6c8ec53828f5929bc45732`
- Nameservers: `adelaide.ns.cloudflare.com`, `phil.ns.cloudflare.com`

## Stripe Integration
- **Checkout flow**: Button click → POST `/api/checkout` → Stripe Checkout Session → redirect to Stripe → `/success?session_id=...`
- **Webhook**: `checkout.session.completed` → fires 4 downstream actions via `Promise.allSettled`:
  1. Turso: `INSERT OR REPLACE` purchase record (idempotent)
  2. Loops: `addContact` + `triggerEvent("purchase_completed")`
  3. Notion: create task in Actions DB for Akmal
  4. Meta CAPI: `Purchase` event with `stripe_{session_id}` for dedup
- **Stripe SDK**: Must use `Stripe.createFetchHttpClient()` on Vercel (default node:http fails)
- **Webhook endpoint**: `https://start.huddleduck.co.uk/api/webhook/stripe`

## Turso Database
- DB name: `landing-page`
- Table: `purchases` (stripe_session_id UNIQUE, email, name, phone, amount_total, currency, UTMs, visitor_id)
- Query: `turso db shell landing-page "SELECT * FROM purchases"`

## Session Plan
- **Session 1** (DONE): Project scaffold, design system, all components, ElevenLabs widget, deploy
- **Session 2** (DONE): Stripe checkout, post-purchase automation (Loops, Notion task, Meta CAPI, Turso)
- **Session 3** (DONE): Attribution tracking, Meta Pixel, cookie notice, SEO, production polish
- **Session 4**: Landing page copy, info animation (Framer Motion), social proof content

## Attribution & Tracking
- **Visitor ID**: `_vid` cookie (365 days, `crypto.randomUUID()`) — created by `visitor.ts`
- **UTMs**: First-touch UTMs stored in `_utms` cookie (JSON), never overwritten
- **TrackingScript**: POSTs page views to `NEXT_PUBLIC_TRACKING_URL/api/track` with visitor_id, UTMs, _fbc/_fbp
- **Meta Pixel**: `fbevents.js` injected on load. Fires PageView, InitiateCheckout, Purchase
- **CAPI dedup**: Purchase pixel uses `event_id: stripe_{session_id}` matching server-side CAPI in onboarding.ts
- **Attribution tracker**: Deployed at `https://attribution-tracker.vercel.app` (separate Turso DB: `attribution-tracker`)
- **Cookie notice**: Soft banner with "Got it" button, stored in localStorage, no consent gating

## SEO
- `robots.ts` — allows all crawlers, points to sitemap
- `sitemap.ts` — lists `/` and `/success`
- JSON-LD structured data in layout.tsx (Organization + Product schemas)
- Full OG/Twitter metadata in layout.tsx

## Build Plan
Full build plan at `~/.claude/plans/effervescent-tumbling-crystal.md`
