# Talk to Asad

Personal consultation route: /talk-to-asad. Created 4 November 2026.

## Offer

Consulting is provided by Asad Social Media Ltd, company number 11747989, separately from Huddle Duck Ltd. Company number, active status and registered office were checked against Companies House on 4 November 2026 (https://find-and-update.company-information.service.gov.uk/company/11747989). All prices GBP, paid once: clarity £250 for 20 minutes; deep £500 for 60 minutes plus one 20-minute catch-up within 30 days; advisory £2,500 for ten 60-minute calls within 90 days of first call. First-call guarantee: full refund requested within 24 hours of first call, cancelling remaining sessions. Refund requests and written recaps are personally handled by Asad. Preparation is optional: one question and up to three links.

FAMILY250 gives 100% off clarity only. This is a reusable owner-requested code, not a single-redemption invitation. Stripe owns code validity. Do not expose it in public page copy. Other new invitation codes should normally have max_redemptions=1 and use the same product-scoped coupon.

## Fulfilment

New Cal event types use the existing owner and schedule, private visibility, mandatory confirmation, and Google Meet. Old consult and consult-follow-up event types remain unchanged. Server alone confirms entitlement-backed bookings. Server-priced embedded Stripe Checkout supports paid and zero-total orders. No plan or value sent by the browser overrides Stripe prices.

A Turso order stores its Stripe session and a hash plus encrypted copy of its management token. New tokens use CONSULT_BOOKING_TOKEN_KEY, version 2. Legacy version 1 tokens retain the original Huddle Duck key for decryption until migrated. Orders carry stripe_account_id; never infer the merchant from the domain. Management tokens are links in the URL fragment, removed into session storage immediately. Analytics are disabled on the consultation route to keep these tokens out of tracking.

A temporary Cal reservation precedes payment. Payment finalisation releases it and confirms the booking. A lost slot retains the paid order and permits another choice without repayment. Ambiguous Cal writes keep a creating record; reconciliation looks up the original metadata before another write. Never delete creating rows to retry without checking the provider. Reconciliation runs from Stripe's signed webhook, the management page and a five-minute authenticated cron.

Legacy Huddle Duck orders retain their existing confirmation transport. New consulting orders use Cal booking confirmations and the consulting Stripe receipt; do not send them through the Huddle Duck VAT footer. Cal handles calendar invitations. Asad replies to preparation notes and supplies the written recap. Remaining sessions use the same authenticated page. Rescheduling should preserve one entitlement; timely cancellation restores it. Late changes go to Asad. Monitor creating calls and paid orders with no accepted first call.

## Environment and operations

Run the setup script only with authorised live credentials and from this checkout. It creates/reuses the new products and event types, writing configuration IDs to ignored .vercel/consultation-setup.json and .env.local. Deploy the CONSULT_CAL_20_ID, CONSULT_CAL_60_ID and CONSULT_PRODUCT_/CONSULT_PRICE_ variables for CLARITY, DEEP and ADVISORY. Uses existing CAL_API_KEY, AGENCY_CAL_OWNER_ID, STRIPE_SECRET_KEY, STRIPE_WEBHOOK_SECRET, NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY, TURSO_* and HatchFlow email settings. Never commit their values.

## Checks

node --experimental-vm-modules --test tests/consultation.test.mjs
npm run typecheck
npm run build -- --webpack

Use synthetic orders and stubbed providers for payment/booking tests. Live read-only checks cover availability, product prices, coupon scope, owner identity, confirmation settings and the rendered page. Do not create a real customer booking or charge merely to test.

UI: shared raised buttons use green, violet and gold tokens matching the offer. Tier icons adapt Extra Love's layered floating and twinkling treatment using green, violet and gold faceted gems, increasing from one to three. Reduced motion and busy states stop animation. Keep panel height stable per viewport. Preserve £5/day to £2 million/month wording.

Consulting setup uses CONSULT_STRIPE_SECRET_KEY, CONSULT_STRIPE_PUBLISHABLE_KEY, CONSULT_STRIPE_ACCOUNT_ID, CONSULT_STRIPE_WEBHOOK_SECRET and CONSULT_BOOKING_TOKEN_KEY. HUDDLE_STRIPE_ACCOUNT_ID identifies historical orders. Existing global Stripe credentials remain assigned to Huddle Duck client services. Keep new checkout disabled until consulting credentials are verified.

## Stripe planner and sandbox verification, 4 November 2026

The official Stripe plugin was already installed for Claude Code and was enabled. The Stripe MCP server was registered for Codex. The official MCP implementation planner was invoked using the separately supplied sandbox credential, and accepted guide iguide_61VhTk8ajJIdpKDFX41LOqiIQBhVG with embedded Checkout as the recommended integration shape. Persistent OAuth authorization remains separate from this verified per-session MCP connection.

Sandbox account acct_1UY4BTLOqiIQBhVG is distinct from the live company account acct_1UY49ELVFRVnEz6h. Never deploy sandbox credentials into the public checkout. The sandbox script requires a sk_test credential and checks its exact account before creating objects. It verified 25000, 50000, 250000 GBP minor-unit totals and a FAMILY250 discounted total of zero, all with zero tax. The four verification Checkout Sessions were then expired. This checks real Stripe sandbox objects; it does not claim a live payment or completed card checkout.

Run with a private, ignored environment file containing STRIPE_SANDBOX_SECRET_KEY:

    node --env-file=.env.stripe-sandbox.local scripts/verify-consultation-sandbox.mjs

The company verification form has accepted the existing ASAD SOCIAL MEDIA LTD business and Monzo bank details. Included Radar Lite was selected. Tax extras, climate extras and final review still require completion in the company account. Do not enable tax collection: the owner's current instruction is that this consulting business is not VAT registered. The final services agreement and any identity verification requiring the account holder must be completed by Asad.
