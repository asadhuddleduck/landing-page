# V2 Chat Agent: Deployment Guide

## What is V2?

V2 is a completely new AI sales chat system built on Cole Gordon's "Closers Into Leaders" methodology. It replaces the V1 6-phase sales flow with an 8-phase Cole Gordon closer that uses the 7 Beliefs framework (Pain, Doubt, Cost, Desire, Money, Support, Trust) to guide F&B brand owners toward purchasing the AI Ad Engine.

**V2 is NOT an add-on to V1.** It has its own standalone prompt, knowledge base, and example conversations. V1 continues to exist and serve production traffic behind a feature flag.

---

## V2 KB Files

All V2 files live in `docs/v2/`:

| File | Size | Purpose |
|------|------|---------|
| `v2-base-prompt.md` | 27KB (~7k tokens) | V2 system prompt: 8-phase flow, 7-belief tracking, response rules, vocabulary bans, mid-pitch deferral, LTV estimation, selective mirroring, short answer nudging, "I don't know" handling |
| `v2-kb-sales-methodology.txt` | 118KB (~30k tokens) | Cole Gordon framework: philosophy, discovery, pitch, closing, depth probing techniques |
| `v2-kb-objection-handling.txt` | 57KB (~14k tokens) | Full objection handling with IF/THEN conditional branching, 12+ objection types |
| `v2-kb-product-context.txt` | 38KB (~10k tokens) | Product, pricing, case studies, FAQ, tracking rules, 7 Beliefs mapped to Huddle Duck |
| `v2-kb-examples.txt` | 103KB (~26k tokens) | 7 annotated example conversations with realistic short visitor messages |
| `V2-DEPLOYMENT-GUIDE.md` | 7KB | This file |
| `V2-FEEDBACK-LOG.md` | 6KB | Test session feedback, 9 issues documented with fixes |

**Total V2 context: ~87k tokens** (vs V1's ~10k tokens). The deployment guide and feedback log are not loaded into the chat context.

Source files (raw material) are preserved at:
- `/Users/asadshah/Claude Code Folder/cole-gordon-kb/processed/` (12 enriched files, 549KB)
- `/Users/asadshah/Claude Code Folder/cole-gordon-kb/raw/` (146 raw transcripts + docs, 86 audio files)
- `/Users/asadshah/Claude Code Folder/cole-gordon-kb/output/v2/` (original V2 output + quality review)

---

## Code Changes Made

### 1. `src/app/api/chat/route.ts`
- Loads BOTH V1 and V2 prompts + KB files at module scope (cached on cold start)
- Determines chat version from: `dynamicVariables.chat_version` (URL param) > `CHAT_PROMPT_VERSION` env var > default `"v3"`
- When `chatVersion === "v4"`: uses V2 prompt + V2 KB, `maxOutputTokens: 400`
- When V1 (default): uses V1 prompt + V1 KB, `maxOutputTokens: 200`

### 2. `src/components/AiSalesChat.tsx`
- Reads `?chatv=v4` from the page URL via `URLSearchParams`
- Passes `chat_version` in `dynamicVariables` to the chat API

### 3. `src/app/api/chat/save/route.ts`
- Reads `chat_version` from `dynamicVariables` (defaults to `"v3"`)
- Stores it in the `chat_version` column on the `conversations` table

### 4. Turso Database
- Added `chat_version TEXT DEFAULT 'v3'` column to `conversations` table
- All existing V1 conversations default to `v3`
- V2 test conversations are tagged `v4` for easy cleanup

---

## How to Test Locally

1. Start the dev server:
   ```
   cd /Users/asadshah/Claude\ Code\ Folder/landing-page
   npm run dev
   ```

2. Open in browser with V2 flag:
   ```
   http://localhost:3000?chatv=v4
   ```

3. Without `?chatv=v4`, you get V1 (unchanged).

---

## Anthropic API Rate Limits

### Tier Upgrade (4 Mar 2026)
- Was: **Free Tier** (10k ITPM, 5 RPM) - too low for V2's 87k token context
- Upgraded to: **Tier 2** ($40 credit purchase, 450k ITPM, 1k RPM)
- Org ID: `bedadcc7-1011-4af8-a4a0-bfaf937bd712`

### Prompt Caching Impact
- First message of a new conversation: ~87k tokens (cache creation, counts against ITPM)
- Subsequent messages: ~50-100 uncached tokens (cache reads are FREE against ITPM)
- Estimated cost per conversation: $0.05-0.10 (similar to V1 due to caching)

### Scaling Considerations
| Concurrent New Chats (same minute) | ITPM Used | Tier 2 (450k) | Tier 3 (800k) | Tier 4 (2M) |
|-------------------------------------|-----------|----------------|----------------|-------------|
| 1 | 87k | OK | OK | OK |
| 5 | 435k | OK (tight) | OK | OK |
| 6 | 522k | Over | OK | OK |
| 10 | 870k | Over | Over | OK |
| 23 | 2.0M | Over | Over | OK |

After the first message, ongoing conversations use negligible ITPM. Tier 2 handles typical early-stage traffic. Upgrade path: Tier 3 ($200 cumulative) or Tier 4 ($400 cumulative).

---

## Deploy to Production

When V2 testing is complete and you're happy with it:

### Option A: URL-param testing in production (recommended first step)
1. Deploy the code changes to Vercel (git push)
2. Test on production with `https://start.huddleduck.co.uk?chatv=v4`
3. Regular visitors get V1 (no `?chatv` param = V1 default)

### Option B: Make V2 the default for everyone
1. Set `CHAT_PROMPT_VERSION=v4` in Vercel env vars
2. Redeploy
3. All visitors get V2 regardless of URL param

---

## Rollback to V1

### Quick rollback (production, V2 is default)
- Remove `CHAT_PROMPT_VERSION` env var from Vercel (or set to `v3`)
- Redeploy. All visitors immediately get V1.

### Full rollback (remove V2 entirely)
1. Revert changes to `route.ts`, `AiSalesChat.tsx`, `save/route.ts`
2. Delete `docs/v2/` directory
3. The `chat_version` column in Turso is harmless and can stay

### V1 files are UNTOUCHED
- `docs/agent-prompts/base-prompt-v3.md` - V1 system prompt (unchanged)
- `docs/kb-01-product.txt` through `docs/kb-09-example-conversations.txt` - V1 KB (unchanged)

---

## Clean Up Test Data

Delete all V2 test conversations before going live:
```sql
DELETE FROM conversations WHERE chat_version = 'v4'
```

This leaves all V1 production conversations intact.

---

## V1 vs V2 Comparison

| Aspect | V1 | V2 |
|--------|----|----|
| System prompt | base-prompt-v3.md | v2-base-prompt.md |
| KB files | 9 files (kb-01 to kb-09) | 4 files (methodology, objections, product, examples) |
| Total tokens | ~10k | ~87k |
| Sales framework | 6-phase (Hook, Qualify, Discovery, Reflection, Offer, Soft Close) | 8-phase Cole Gordon (Opener, Qualify, Isolate Problem, Discovery, Desired Situation, Transition, Pitch, Committing) |
| Max response | 25 words (200 output tokens) | 50 words (400 output tokens) |
| Target exchanges | 8-12 | 15-25 |
| Objection handling | Basic scripts | Full conditional branching, IF/THEN decision trees |
| Methodology | Generic consultative sales | Cole Gordon 7 Beliefs framework |
| Probing techniques | Basic "tell me more" | 18 varied depth probing techniques |
| ROI handling | Deflects ("nobody can track footfall") | LTV-based estimation using visitor's own numbers (AOV, return visits) |
| Mid-pitch questions | Answers immediately (breaks pitch flow) | Defers and resumes ("great question, let me finish this then I'll come back to it") |
| Example conversations | 3 generic | 7 detailed with realistic short visitor messages |

---

## Test Session Fixes Applied (5 Mar 2026)

The following fixes from `V2-FEEDBACK-LOG.md` have been applied to the V2 prompt and code:

| Fix | Location | Status |
|-----|----------|--------|
| Mid-pitch deferral (defer visitor questions during three-pillar pitch) | `v2-base-prompt.md` Phase 5 | Done |
| LTV-based ROI estimation (replaced "collaborative estimation" / "10% more customers") | `v2-base-prompt.md` ROI section | Done |
| Selective mirroring (mirror pain/goals, not factual answers) | `v2-base-prompt.md` Response Rules | Done |
| "I don't know" handling (best-guess encouragement) | `v2-base-prompt.md` Response Rules | Done |
| Short answer nudging (depth probes after 3+ short answers) | `v2-base-prompt.md` Response Rules | Done |
| Agency comparison: £2,500-5,000 (was £1,500-2,000) | `v2-base-prompt.md` + `v2-kb-product-context.txt` + `v2-kb-objection-handling.txt` | Done |
| Price framing: no build-up, reference visitor already saw £497 on page | `v2-base-prompt.md` Pillar 3 | Done |
| Nudge timer: 120s (was 60s), clears on typing | `AiSalesChat.tsx` line 608 | Done |

---

## Key Dates

- **4 Mar 2026**: V2 KB built (6 Opus agents, 2 phases), local setup complete
- **4 Mar 2026**: Anthropic API upgraded from Free Tier to Tier 2 ($40 deposit)
- **5 Mar 2026**: Test Session 1 + 2 fixes applied (9 issues, all resolved in prompt and code)
- **TBD**: V2 testing complete, deployed to production
- **TBD**: V2 becomes default (or V1 retired)
