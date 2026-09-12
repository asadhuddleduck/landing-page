# Huddle Duck landing page

The production site at `start.huddleduck.co.uk` runs the current waitlist and priority application experience. `src/app/page.tsx` assembles the page; `HeroWaitlist`, `WaitlistForm` and `PriorityForm` own its forms. Waitlist submissions are stored in Turso and passed to the existing Notion and attribution integrations.

Email goes through HatchFlow. This app keeps immutable source jobs, checks current business eligibility and records provider acceptance before advancing email state. HatchFlow controls sending identities, pacing, suppression, legal footers and replies. See [email operations](docs/HATCHFLOW-EMAIL.md).

The retained Stripe webhook and onboarding modules handle existing payment events. The former checkout and chat pages are absent. The old abandoned-cart and payment-reconciliation routes are retained but unscheduled. `vercel.json` adds only the five-minute email receipt/suppression reconciliation schedule.

```sh
npm run dev
npm run test:email
npm run typecheck
npm run lint
npm run build
```

Configure existing Turso, Notion, Stripe, attribution and monitoring integrations through the deployed environment. Email-specific names and placeholders are in `.env.example`; no provider sending key belongs in this app. Marketing requires separately verified permission and remains held when none exists.

This release preserves the recovered production waitlist source. See [baseline evidence](docs/DEPLOYED-BASELINE-2026-09-12.md). Later unrelated local work remains in the original repository. The old site descriptions and bulk email scripts are retained as non-executable historical text under `docs/email-archive/`.
