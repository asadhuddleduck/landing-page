# Shared sales CRM

Agency enquiries and retained purchase events use the existing combined Notion
sales database configured by `SALES_CRM_DATABASE_ID`. The same database receives
SuperPulse audit snapshots from that product's existing CRM connection.

`src/lib/sales-crm.ts` owns this site's writes. Keep `Business` as the title,
`Contact` as rich text, `Phone` as a phone number and `Status` as a select.
Agency source facts use `Agency application ID`, `Agency enquiry`,
`Enquiry offer` and `First recorded`. The application ID recovers uncertain
creates. An email match also needs the same business before records are joined.
Ambiguous matches stop for review.

`Next step`, `Follow-up` and `Offer` are manually maintained sales decisions.
Never replace them during a source refresh. `Next action` supplies a suggested
action from the stage when `Next step` is empty. Old dates and New labels do not
prove that a lead has never been contacted. The original agency records, call
notes and offers remain linked as history.

An accepted booking may advance New, Tried to call or Qualified to Call booked.
It does not reopen Won, Closed or another manually chosen stage. Existing audit
contact facts are retained when joining an agency enquiry to the same business.

Verification: `node --experimental-strip-types --test tests/sales-crm.test.mjs
tests/agency.test.mjs`, TypeScript and the production build. Do not create a
synthetic live lead to test the integration.
