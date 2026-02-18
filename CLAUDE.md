# Landing Page - Huddle Duck AI Ad Engine Pilot

## What This Is
Self-serve landing page for Huddle Duck's AI Ad Engine Pilot (£497 one-time).
Hosted at `start.huddleduck.co.uk`. Uses an ElevenLabs AI chat agent as the primary sales interaction.

## Tech Stack
- Next.js 16 (App Router, TypeScript, React 19)
- Tailwind CSS v4 (`@tailwindcss/postcss`)
- `@vercel/analytics`
- ElevenLabs convai widget (custom element, dynamically injected via `useEffect`)
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
  components/
    Header.tsx             # Sticky header with duck logo + F&B badge (server)
    HeroSection.tsx        # Hero headline with gradient text (server)
    InfoAnimation.tsx      # 3-step process cards (server, placeholder for Framer Motion)
    ElevenLabsChat.tsx     # ElevenLabs widget (client, useEffect injection)
    CheckoutSection.tsx    # Pricing card + CTA button (server, placeholder for Stripe)
    SocialProof.tsx        # 3 testimonial cards (server, placeholder content)
    FAQ.tsx                # 5-item expandable accordion (client, useState)
    Footer.tsx             # Footer with logo + copyright (server)
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

### Currently in `.env.local`
| Variable | Purpose |
|---|---|
| `CLOUDFLARE_API_KEY` | Cloudflare Global API Key (for DNS management) |
| `CLOUDFLARE_EMAIL` | Cloudflare account email |
| `CLOUDFLARE_ZONE_ID` | Zone ID for huddleduck.co.uk |

### Needed in Future Sessions (from build plan)
| Variable | Purpose | Session |
|---|---|---|
| `STRIPE_SECRET_KEY` | Stripe checkout (sk_live_...) | Session 2 |
| `NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY` | Stripe.js browser-side (pk_live_...) | Session 2 |
| `STRIPE_WEBHOOK_SECRET` | Webhook signature verification (whsec_...) | Session 2 |
| `LOOPS_API_KEY` | Loops.so email automation | Session 2 |
| `NOTION_TOKEN` | Notion API for task creation | Session 2 |
| `META_ACCESS_TOKEN` | Meta CAPI for purchase events | Session 2 |
| `META_PIXEL_ID` | Meta Pixel ID (1780686211962897) | Session 3 |
| `TURSO_DATABASE_URL` | Turso DB for purchase records | Session 2 |
| `TURSO_AUTH_TOKEN` | Turso auth | Session 2 |

### Key Values (from build plan)
- `NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY`: `pk_live_51OMBLhEMAaEi0IogAHJ7Vy2sy82By2Pxg7GXmPwLPYAwoaFBJiLjkjJVbfs2DnshMtUPgIXR27yUN1ewlRiu7Kmg00wmjNr9FG`
- `LOOPS_API_KEY`: `567fd8f6b85095600f14e9179b8d8dae`
- `META_PIXEL_ID`: `1780686211962897`
- ElevenLabs Agent ID: `4f58a5783e990de16e22e8effd8ba103118c603a76f123afbde18a66f4e1466e`
- Akmal's Notion User ID: `ac601ede-0d62-4107-b59e-21c0530b5348`
- Notion Actions DB data source: `collection://2c384fd7-bc4e-813d-99c4-000b9a6385c8`
- Cloudflare Zone ID: `253840e28c6c8ec53828f5929bc45732`
- `NOTION_TOKEN` and `META_ACCESS_TOKEN`: copy from `client-dashboards/.env.local`
- `STRIPE_SECRET_KEY`: provided in build plan (sk_live_...)

## DNS
- Domain: `start.huddleduck.co.uk`
- CNAME: `start` → `cname.vercel-dns.com` (DNS only, not proxied)
- Cloudflare Zone ID: `253840e28c6c8ec53828f5929bc45732`
- Nameservers: `adelaide.ns.cloudflare.com`, `phil.ns.cloudflare.com`

## Session Plan
- **Session 1** (DONE): Project scaffold, design system, all components, ElevenLabs widget, deploy
- **Session 2**: Stripe checkout + post-purchase automation (Loops, Notion task, Meta CAPI, Turso)
- **Session 3**: Attribution tracking, Meta Pixel, GDPR consent, SEO, polish
- **Session 4**: Landing page copy, info animation (Framer Motion), social proof content

## Build Plan
Full build plan at `~/.claude/plans/effervescent-tumbling-crystal.md`
