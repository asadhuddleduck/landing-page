CANARY-TOP-LANDINGPAGE-73A1

# Huddle Duck landing page

Production Next.js site for `start.huddleduck.co.uk`. The current working tree
is centered on the waitlist experience. Older chat and checkout pages are absent. Do not recreate deleted flows
from historical documentation.

## Before editing

- Inspect `git status`, the relevant current files, `package.json`, and
  `vercel.json`. Preserve all unrelated dirty work and deletions.
- Read `DECISIONS.md` for decisions that still match current code. Treat
  `docs/agent/project-reference-2026-07-16.md` and older handoffs as historical;
  verify every claim against the source before acting.
- Resolve sibling workspace projects through `HD_WORKSPACE` or paths relative
  to this repository. Never add the former workspace directory name.

## Safety boundaries

- Do not send live email, trigger a drip, move money, create Stripe objects,
  alter DNS, mutate production data, deploy, or change live environment values
  as a validation step.
- Stripe webhook signatures and cron authentication must remain enforced.
  Preserve idempotency for any external side effect and deduplicate before
  email, database, Notion, attribution, or conversion calls.
- Keep secrets and customer data out of source, fixtures, docs, diffs, and
  logs. Document environment variable names only, never values.
- Avoid exposing private conversation, purchase, waitlist, contact, or tracking
  data through public routes or client bundles.
- Keep the site accessible, responsive, and respectful of reduced-motion
  preferences. Reuse the current design system in `src/app/globals.css`.
- `globals.css` may contain parallel user work. Make the smallest scoped change;
  never reorganize unrelated rules.

## Current structure

- `src/app/page.tsx`: current page assembly.
- `src/components/HeroWaitlist.tsx`, `WaitlistForm.tsx`, and related components:
  waitlist UI.
- `src/app/api/waitlist/`: waitlist endpoints.
- `src/app/api/webhook/stripe/route.ts`: retained payment webhook; inspect its
  current callers before changing it.
- `src/app/api/cron/`: scheduled external-side-effect paths.
- `src/lib/`: integration and orchestration code.
- `DECISIONS.md`: decision history, not a substitute for current source.

## Validation

Run checks appropriate to the change, normally:

```bash
npm run lint
npm run build
```

Use local or synthetic inputs. Review the final diff and confirm no deleted
feature was accidentally restored, no live identifier or secret entered Git,
and no outbound or production mutation occurred during testing.

## Email ownership

Read `docs/HATCHFLOW-EMAIL.md`. All email transport and replies belong to HatchFlow. Marketing requires verified permission and fresh dispatch eligibility. Queued work never advances native state. Preserve existing unsubscribe links, suppression and immutable source identities. Never restore archived direct provider scripts or old reminder schedules.

## Client one-pager and refreshed branding

`/start` is the reusable client one-pager, separate from the waitlist homepage.
Read `docs/START-ONE-PAGER.md` before changing its offer, flow or design.
Its shared primary action is `src/components/huddle/PrimaryAction.tsx`.
It uses an exact copy of SuperPulse editorial-1.2 `coin.css`, with Huddle Duck
colour variables. Preserve the 20px corners, 2px edge, 5px raised base, press,
shine and reduced-motion/busy/disabled states. Reuse it for progression actions
rather than making a separate page animation. This route's premium refresh uses
local Inter, Huddle Duck green, deep ink, quiet paper surfaces and generous space.
Keep its styles scoped and preserve the existing homepage.

CANARY-END-LANDINGPAGE-73A1
