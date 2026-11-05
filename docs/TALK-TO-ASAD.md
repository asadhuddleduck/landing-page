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

UI: shared raised buttons use green, violet and gold tokens matching the offer. Tier icons adapt Extra Love's layered floating and twinkling treatment using green, violet and gold faceted gems, increasing from one to three. Reduced motion and busy states stop animation. Use a minimum panel height per viewport and let longer content expand into the page. Do not create an internal scrollbar around the package cards or clip their content. Preserve £5/day to £2 million/month wording.

Consulting setup uses CONSULT_STRIPE_SECRET_KEY, CONSULT_STRIPE_PUBLISHABLE_KEY, CONSULT_STRIPE_ACCOUNT_ID, CONSULT_STRIPE_WEBHOOK_SECRET and CONSULT_BOOKING_TOKEN_KEY. HUDDLE_STRIPE_ACCOUNT_ID identifies historical orders. Existing global Stripe credentials remain assigned to Huddle Duck client services. Keep new checkout disabled until consulting credentials are verified.

## Stripe planner and sandbox verification, 4 November 2026

The official Stripe plugin was already installed for Claude Code and was enabled. The Stripe MCP server was registered for Codex. The official MCP implementation planner was invoked using the separately supplied sandbox credential, and accepted guide iguide_61VhTk8ajJIdpKDFX41LOqiIQBhVG with embedded Checkout as the recommended integration shape. Persistent OAuth authorization was completed later the same day and the official MCP confirmed live access to Asad Social Media Ltd.

Sandbox account acct_1UY4BTLOqiIQBhVG is distinct from the live company account acct_1UY49ELVFRVnEz6h. Never deploy sandbox credentials into the public checkout. The sandbox script requires a sk_test credential and checks its exact account before creating objects. It verified 25000, 50000, 250000 GBP minor-unit totals and a FAMILY250 discounted total of zero, all with zero tax. The four verification Checkout Sessions were then expired. This checks real Stripe sandbox objects; it does not claim a live payment or completed card checkout.

Run with a private, ignored environment file containing STRIPE_SANDBOX_SECRET_KEY:

    node --env-file=.env.stripe-sandbox.local scripts/verify-consultation-sandbox.mjs

Asad submitted the final company activation on 4 November 2026. Stripe now shows the live Asad Social Media Ltd dashboard. Monzo ending 2344 is the payout destination; included Radar Lite is selected, with tax calculation and climate contributions off. The dedicated restricted API key is prepared with 13 permissions. Stripe still requests a separate identity check before creating it; no live website secret has been issued or deployed yet. Do not enable tax collection: the owner's current instruction is that this consulting business is not VAT registered. The final services agreement and any identity verification requiring the account holder must be completed by Asad.

Paid consultations request a post-payment invoice and explicitly supply the receipt email. Complimentary invitations use a zero-total Checkout Session without a paid invoice. Customer creation is explicit so both paths have a durable Stripe customer record. The new company identity, invoice footer and support email remain separate from Huddle Duck.


## Live provisioning readback, 4 November 2026

The official Stripe MCP OAuth connection is authenticated to the live company account only. The native account readback has charges_enabled and payouts_enabled true, with no currently_due, past_due or pending_verification requirements. Three live products and fixed GBP prices, the product-scoped 100 percent invitation coupon, FAMILY250, and the dedicated signed webhook have been created. Their IDs and the webhook secret are in ignored private configuration and the Vercel production environment. The live publishable key is also configured. Huddle Duck's global Stripe credentials are unchanged.

The remaining cutover blocker is CONSULT_STRIPE_SECRET_KEY. Do not enable checkout or substitute the MCP OAuth access token. Asad asked to stop requesting new verification links after repeated attempts; preserve the current Stripe flow and do not send another request. Once a live restricted website key exists, verify its account against the company account, set it in Vercel production, deploy the clean tree, check the public promo and calendar APIs, and verify the rendered checkout. Do not make a live charge as a test.
