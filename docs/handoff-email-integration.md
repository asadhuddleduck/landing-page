# Handoff: Chat Email Capture > Email Marketing Integration

## What Changed (6 Mar 2026 deploy)

The AI sales chat now collects visitor emails during conversation. Haiku extracts them from the transcript and stores them in Turso. A Lead event fires to Meta CAPI when we capture contact info.

Previously: 0 emails captured across 61 conversations.
Now: every qualifying conversation will attempt to collect an email.

## Where Emails Live Now

### 1. Chat-collected emails (NEW)
- **Database:** Turso `landing-page`, table `conversations`
- **Column:** `visitor_email` (TEXT, extracted by Haiku from transcript)
- **When populated:** After conversation save (5-min inactivity, page leave, or warm exit)
- **Query:** `SELECT conversation_id, visitor_email, business_name, is_fb, buying_intent, conversation_outcome FROM conversations WHERE visitor_email != '' ORDER BY created_at DESC`
- **Volume:** Low initially. Depends on how often visitors share their email in chat.

### 2. Checkout emails (existing)
- **Database:** Turso `landing-page`, table `checkouts`
- **Column:** `email` (from Stripe checkout form)
- **When populated:** When someone fills in the checkout form (before payment)
- **These already feed into:** abandoned cart cron (`/api/cron/abandoned-cart`) via Resend

### 3. Purchase emails (existing)
- **Database:** Turso `landing-page`, table `purchases`
- **Column:** `email` (from Stripe webhook after payment)
- **When populated:** After successful payment

### 4. Duck-emails contacts (existing, separate system)
- **Database:** Turso `duck-emails`
- **Table:** `contacts` (266 contacts, sourced from Notion leads)
- **Sends via:** Resend Broadcasts API

## What Needs Building

### A. Sync chat emails into duck-emails (or whatever email system you use)

When `visitor_email` is populated in a conversation:
1. Check if they're F&B (`is_fb = 1`)
2. Check if they're not already in your email list
3. Add them with context: business_name, location_count, conversation_outcome, buying_intent

**Option 1: Direct sync in save route**
Add to `/api/chat/save/route.ts` after extraction, inside the `if (extracted)` block. POST to duck-emails API or INSERT directly into duck-emails Turso DB.

**Option 2: Cron job**
New cron that queries `conversations WHERE visitor_email != '' AND created_at > last_sync` and syncs to email system. Simpler, decoupled.

**Option 3: Webhook/event**
Fire an internal event that duck-emails listens to. Most flexible but most complex.

Recommendation: Option 1 (direct sync). The email is already extracted in the save route. Just add a fetch() call to duck-emails API right next to the Lead CAPI event, inside the `if (hasContactInfo && ext.is_fb)` block. No reason to delay with a cron.

### B. Suppress purchasers from marketing emails (CRITICAL)

When someone buys (payment_intent.succeeded or checkout.session.completed):
1. The webhook at `/api/webhook/stripe/route.ts` fires
2. It calls `handlePaymentIntentPurchase` or `handlePurchase` in `onboarding.ts`
3. Email is stored in `purchases` table

**The integration point:** After purchase is recorded, remove or tag the buyer in your email system so they stop receiving marketing/nurture emails.

Current state: `onboarding.ts` does 4 things post-purchase (Turso, Resend confirmation, Notion task, Meta CAPI). A 5th step should suppress them from marketing.

**Implementation options:**

If using duck-emails (Resend Broadcasts):
- Add a `suppressed` or `purchased` boolean column to duck-emails contacts table
- In onboarding.ts, after purchase, UPDATE the contact as suppressed
- Duck-emails broadcast query excludes suppressed contacts

If using Loops.so:
- Call Loops API to update contact property `purchased = true`
- Use segment exclusion in Loops to skip purchasers

If using Resend Audiences:
- Remove the contact from the marketing audience
- Or add them to a "Customers" audience with different content

### C. Email content segmentation (nice-to-have)

Chat emails come with rich context that checkout emails don't:
- `buying_intent` (1-5): How close they were to buying
- `conversation_outcome`: qualified, nurture, not_qualified, dropped_off, booked
- `business_name`, `location_count`: Business size
- `main_challenge`: What they're struggling with

Use this for segmented nurture sequences:
- Intent 4-5 + no purchase = hot lead, send case study + direct CTA
- Intent 2-3 + qualified = warm lead, send educational content
- Nurture outcome = drip sequence over 2 weeks

## Data Flow Diagram

```
Visitor chats on start.huddleduck.co.uk
        |
        v
/api/chat/save --> Haiku extracts visitor_email
        |
        v
    Turso: conversations.visitor_email
        |
        +---> Meta CAPI "Lead" event (hashed email)
        +---> Slack notification (shows email)
        +---> [NEW] Sync to email marketing system

Visitor buys via Stripe
        |
        v
/api/webhook/stripe --> onboarding.ts
        |
        v
    Turso: purchases.email
        |
        +---> Resend: purchase confirmation
        +---> Notion: task for Akmal
        +---> Meta CAPI: Purchase event
        +---> [NEW] Suppress from marketing emails
```

## Key Files

| File | Purpose |
|---|---|
| `src/app/api/chat/save/route.ts` | Where emails are extracted and Lead CAPI fires |
| `src/lib/onboarding.ts` | Post-purchase orchestrator (add suppression here) |
| `src/app/api/webhook/stripe/route.ts` | Stripe webhook handler |
| `src/app/api/cron/abandoned-cart/route.ts` | Existing email cron (pattern to follow) |

## Turso Quick Reference

```sql
-- Chat emails collected (new)
SELECT visitor_email, business_name, buying_intent, conversation_outcome
FROM conversations WHERE visitor_email != '' ORDER BY created_at DESC;

-- Checkout emails (existing)
SELECT email, name, created_at FROM checkouts ORDER BY created_at DESC;

-- Purchasers to suppress
SELECT email, name, tier, created_at FROM purchases ORDER BY created_at DESC;

-- Cross-reference: who chatted AND bought?
SELECT c.visitor_email, p.email, p.tier, p.created_at
FROM conversations c
JOIN purchases p ON c.visitor_email = p.email
WHERE c.visitor_email != '';
```

## Priority Order

1. **Suppress purchasers from marketing** (prevents annoying paying customers)
2. **Sync chat emails to marketing** (new lead source)
3. **Segment by intent/outcome** (nice-to-have, increases conversion)
