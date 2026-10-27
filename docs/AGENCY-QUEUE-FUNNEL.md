# Agency queue campaign funnel

Approved 27 October 2026. Agency acquisition is separate from the SuperPulse annual service campaign.

The public route is `/workwithus-waitlist`. Its native form writes to the existing Turso database in separate `agency_*` tables. Food brands with at least three currently open locations can choose a 30-minute call through the dedicated Cal.com event. Spend is an enquiry answer, not a qualification threshold. Other enquiries receive the free audit route and remain saved for review.

## Configuration and rollout

Server-only settings: `CAL_API_KEY`, `AGENCY_CAL_EVENT_TYPE_ID`, `AGENCY_CAL_OWNER_ID`, `AGENCY_BOOKING_SECRET`, `AGENCY_CAL_WEBHOOK_SECRET`, `AGENCY_INTERNAL_TEST_KEY`, `AGENCY_NOTION_TOKEN`, `AGENCY_META_PIXEL_ID`, `AGENCY_META_ACCESS_TOKEN` (or existing `META_ACCESS_TOKEN`), Turso settings and `CRON_SECRET`. Do not expose values in client code, source or logs.

1. Run `npm run test:agency`, `npm run test:email`, typecheck, scoped lint and production build.
2. Deploy a clean committed tree with the production settings configured.
3. Register an event-scoped Cal webhook at `/api/agency/cal/webhook` for creation, confirmation, rejection, cancellation and rescheduling. Preserve existing account-wide webhooks.
4. Verify the live route, signature rejection and authorization, then a controlled internal application and booking using the secret `x-agency-test-key` header. Internal applications never dispatch Meta or CRM effects. Cancel the test booking and verify canonical provider readback. Never test on a prospect.
5. Confirm CRM and conversion receipts before paid launch. Production reconciliation runs every five minutes with cron bearer authentication.

`scripts/agency-operations.mjs` supports `migrate`, aggregate `status` and a private CSV `export`. Run using `node --env-file=.env.local --experimental-strip-types`. Export requires an explicit destination outside this repository. The application lazily creates the additive schema as well.

## Receipt and recovery behavior

Applications are identified by a unique submission key. A repeat with changed details is rejected. The database saves the enquiry before integrations run. CRM and Meta side effects have stable IDs, persistent leases and retry receipts. The reconciliation job restores missing base effects after interruption. CRM entries carry `AGENCY_APPLICATION:<uuid>` in the existing legacy CRM answers property, so uncertain writes can be reconciled before another create. CRM writes for one application are serialized. The old property name does not introduce a Tally dependency.

Booking is reserved atomically for one application before the create request. An uncertain response remains pending and is reconciled through its stored UID or scoped provider metadata. Empty list readback never causes an automatic second create. Canonical readback must match the dedicated event, organizer, application, operation, attendee and 30-minute duration. Signed webhooks re-fetch the canonical booking before changing local state. A delayed old cancellation cannot undo a reschedule. Failed definite requests may choose another live slot.

Lead fires after a valid saved application. Schedule fires only after an accepted canonical booking. Browser and CAPI share stable IDs. UTMs, campaign/ad-set/ad IDs, available Meta cookies, visitor identity, first touch and referrer are retained with the application. Phone/email are hashed for CAPI. No contact details are exposed through public lookup routes.

## Daily sales follow-up

Asad owns new enquiries in the existing agency Leads CRM. Check new qualified enquiries with no accepted booking and arrange their call using current prospect-access policy. Review unknown booking operations before offering another time. Do not send a free calendar link in outbound messages. This funnel does not authorize an automated message sequence or marketing subscription. Cal owns calendar invitations and reschedule/cancel notices; other email transport remains with HatchFlow.

Review the aggregate `status` output and CRM each working day. Persistent retry or unknown booking states need investigation. Conversion and CRM outages do not remove applications from the primary database. Compare 30/60/90-day client outcomes by application identity and dates; incomplete historic attribution remains a correlation.

## Shared action style

The page reuses `components/huddle/coin.css` and `PrimaryAction.module.css` for progression actions, including busy, disabled and reduced-motion states. Page styles are scoped. Keep the existing homepage and client one-pager separate.
