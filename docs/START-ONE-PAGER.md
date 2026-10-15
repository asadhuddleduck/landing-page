# Huddle Duck client one-pager

Approved scope, 15 October 2026: a reusable client sales page at
https://huddleduck.co.uk/start. The first handoff is Burger & Sauce. Asad asked
for a finished link and a message to forward, not an automated outbound send.

## Offer and sequence

- £1,300 + VAT per month, all locations, month to month, no lock-in.
- Advertising spend is separate and paid directly to Meta.
- The existing GoCardless link in `src/lib/huddle-start.ts` sets up authorisation
  only. No payment is taken at that step. Future amount and timing are confirmed
  before collection. Do not add a subscription, payment collection or purchase event.
- Customer sets up Direct Debit, messages business WhatsApp, then has a strategy
  call. Huddle Duck prepares campaign planning and copywriting documents covering
  hooks, visuals, voiceover, captions, CTA and comment/DM follow-up. Creative uses
  client-supplied content, followed by campaign launch, management and optimisation.
- Fresh filming, ordinary social posting and Meta account troubleshooting are
  separate. SuperPulse local awareness is included.
- All contact links use the business number +44 7706 428225.

## Copy and evidence

Primary buyer: the marketing manager/director of a restaurant group. Lead with
their pressure to support branches, defend spend and meet deadlines. Use specific
emotional recognition followed by the concrete service. Keep British English,
real proof, no invented urgency or promises, and no em or en dashes.

Proof is explicitly client-reported: Dough Club's 12,000 followers before opening,
Shakedown's 4,000+ Newcastle launch attendees and Chai Green's 676 franchise
enquiries, plus Adam's Burger & Sauce quote. Sources are the retained public
`CaseStudies.tsx` and the AI Ad Engine training source. These are historical
outcomes, not a guarantee. Do not carry over the Phat Buns Uber Eats spike as
AI Ad Engine proof. The page's illustrated campaign document shows the service
structure, not a fabricated client result.

## Refreshed identity

Retain the authentic Huddle Duck wordmarks. Use viridian #1EBA8F, deep ink
#08140F, paper #F6F7F2 and quiet sage #E9EDE5. Sandstorm #F7CE46 remains a
small accent/selection colour. Local Inter refines typography; its OFL is shipped
alongside it. Oversized type, clear rules, asymmetric editorial layouts and space
carry the design. Avoid adding glow panels, decorative dashboards or card grids.

Every primary progression action reuses `PrimaryAction`. Its `coin.css` is copied
unchanged from SuperPulse editorial-1.2; only scoped variables change colours.
Geometry and motion: 20px corners, 2px dark-green edge, 5px base, 4px press,
3.2-second pulse/shine and 520ms entrance. Reduced motion, disabled and busy states
stay still. Secondary links remain quiet. Do not import SuperPulse product prices
or branding with the button treatment.

## Hosting and checks

The source began from the authenticated production commit 1caf7c7. Preserve
the waitlist, HatchFlow email ownership and five-minute reconciliation cron.
The public site now serves directly at https://huddleduck.co.uk/start. The apex
domain belongs to this same Vercel project, with Cloudflare managing DNS. The
old apex and www redirects to the start subdomain are disabled; www redirects
to the apex. Keep the old start subdomain working for existing links. Canonical,
Open Graph URLs, sitemap and robots use the apex. Do not restore the old redirect.

Check desktop/mobile layout, keyboard use, reduced motion, authorisation and
WhatsApp destinations, metadata, social image, sitemap and existing homepage.
Never complete a live mandate or submit forms as a test. Compile and typecheck;
lint the changed code and report existing unrelated full-repo lint failures.
This retained worktree uses a dependency symlink, so local production compilation
uses `npm run build -- --webpack`. The remote build uses the ordinary build script.
Deploy from a clean committed tree, then verify the public route and record the
actual source and deployment evidence.

Local verification on 15 October: production build and TypeScript pass; changed
TypeScript files pass ESLint with no warnings. Browser checks pass at 1440, 820,
390 and 320px widths, including image loading, no horizontal overflow, FAQ pointer
and keyboard use, reduced motion, four identical authorisation destinations,
business WhatsApp and the 1200 x 630 social image. Existing homepage still renders
the waitlist. The full-repository lint has six pre-existing errors in privacy,
CookieNotice, MetaPixel, useCurrency, db and stripe; these files are unchanged.
The initial default local Turbopack build fails on the retained dependency symlink;
the complete webpack production build succeeds. The deployment build installs
normal dependencies and uses the default production build.

The first live browser pass exposed a pre-existing duplicated, newline-separated
Google Analytics ID in production configuration, causing the provider's inline
script to fail on both routes. The root layout now extracts one valid measurement
ID before passing it to the existing analytics component. No live environment
setting, sender or integration ownership was changed.
Regression verification built with a synthetic duplicated ID on two lines, then
opened both `/start` and `/` in a browser: one valid inline analytics script and
no page errors on either route.

## SuperPulse logo bar

Asad requested the same logo-bar design as SuperPulse. `ClientLogoBar` reuses the
deployed SuperPulse 87b7d680 layout: two full-width monochrome rows with opposing
82s/68s loops, faded edges, optical logo sizing and mobile scaling. It uses the
12 restaurant marks already represented by Huddle Duck, copied as local WebPs.
Repeated runs keep each lane wider than the viewport. Copies are hidden from
assistive technology. Owner decision, 15 October: the bar is passive on desktop
and mobile. Hover, focus, click and tap must never pause it. No links, keyboard
stops, image dragging or pointer controls. Reduced motion hides the copies and
shows all marks in static wrapped rows, with no scrolling interaction. No
client-feed API is added. The surrounding surface uses Huddle Duck sage.

## Simple economics and founder letter

Asad requested two further sections: simple fee/payback examples and a long
personal P.S., P.P.S. and P.P.P.S. with quiet text links. They sit before the
investment card and at the bottom of the main page respectively.

The numbers are derived from `campaign-economics.ts` and the same monthly fee
used by the price card. £42/day and £1.75/hour are rounded using a 31-day month
and 24-hour days, excluding VAT. The actual monthly price remains in the
investment card. Do not present the daily approximation as an annual average.

Copy refinement, 15 October: Asad asked for short everyday wording in the fee
section. Do not use formal "illustration" or "example" labels in the rendered
section. Lead with the simple idea, use conditional language such as "could"
and "if", and keep the actual cost and referral assumptions readable. The
expandable workings carry the timing and detailed calculation. Use "left after
the cost of each order" instead of contribution, and "ad views" instead of
impressions. This wording change does not turn the assumed numbers into results.

The loyalty maths assumes five new regulars from month one, four friends
each from month two (20), and two friends each from month three (40). All 65
make three visits per month from their start date. A £20 sale leaves £10 after
variable costs. That produces 2,040 visits and £20,400 contribution over the
year, covering £15,600 annual service fees. Ad spend and fixed overheads remain
separate. The original five alone would not cover the fee; referrals and repeat
visits are explicit assumptions. Keep the short cost note and workings.

The franchise illustration assumes one completed sale contributing £20,000
after other acquisition/onboarding costs. It describes a scenario, not a result
or a forecast, and an enquiry is distinguished from a completed deal.

Asad chose a labelled illustration while the 10,000% comparative claim lacks a
specific substantiated campaign comparison. The £100 media example assumes £5
per 1,000 digital impressions, 10p per printed/delivered leaflet and £20 per
1,000 estimated billboard impressions. These produce 20,000 ad impressions,
1,000 leaflet deliveries and 5,000 estimated billboard impressions. They are
different metrics, not unique customer counts. These prices are illustrative,
not supplier quotes, and exclude the service fee. Do not turn the example into
a historical performance claim or add the 10,000% number without evidence.

The founder letter builds trust around responsibility, brand knowledge and
candid communication. Its first-person intentions were explicitly requested
by Asad. Do not add invented personal history or testimonials. Inline CTAs are
quiet green underlined links, as he requested, with no payment at setup and
the same verified GoCardless/business WhatsApp destinations.
