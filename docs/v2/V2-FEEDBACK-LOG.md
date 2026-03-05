# V2 Feedback Log

## Test Session 1 — 4 Mar 2026

### Issue 1: Over-mirroring
**Problem:** Everything the visitor says gets repeated back. Feels unnatural.
**Example:** Visitor says "doner" -> AI says "Doner kebab. Are you running one location or a few?"
**Fix:** Reduce mirroring frequency. Cole Gordon teaches selective mirroring (use their exact words on key pain points to show you heard them), not parroting every single answer. Mirror only when acknowledging pain, challenges, or goals. For simple factual answers (food type, location count), just move on.

### Issue 2: Nudging short answers
**Problem:** If someone keeps giving 1-3 word answers, the AI should nudge them to give more. The page gamifies typing more, but the AI should help too.
**Fix:** Add nudging rules to the prompt. After 3+ consecutive short answers (under 5 words), use varied techniques: "give me a bit more on that", "what does that look like day to day?", "paint me the picture". NOT just "tell me more" repeatedly.

### Issue 3: "I don't know" handling
**Problem:** When visitors say "I don't know", the AI should encourage them to take their best guess.
**User's real-world test:** Told his wife "even if you feel like you don't know, go ahead and take your best guess and always try to answer."
**Fix:** Add "I don't know" handling to the prompt. Respond with encouragement: "that's ok, just take your best guess" or "no wrong answers here, what comes to mind first?" This aligns with Cole Gordon's approach of getting prospects to commit to SOMETHING (consistency bias).

### Issue 4: Pitch stuck at "Three steps"
**Problem:** AI said "Three steps." and stopped. Visitor didn't know what to do next. Should the steps follow automatically?
**Screenshot:** Image 11 — "Right. So here's how I'd get you from £4k a week to building the sales proof you need for franchising. Three steps."
**Fix:** The three-pillar pitch should either: (a) deliver all three steps in one message (within the 60-word pitch pillar limit), or (b) say "Three steps. Want me to walk you through them?" to get explicit buy-in before continuing. Currently it just stops.

### Issue 5: "Before I get to the investment" — price already visible
**Problem:** AI says "before I get to the investment" but the pricing is already visible on the landing page. The visitor already knows it's £497.
**Fix:** Remove the build-up/reveal framing for price. Instead, reference the price they've already seen: "You've seen the Trial is £497. Here's what that actually gets you." or frame the value comparison without pretending the price is a reveal.

### Issue 6: Agency comparison pricing is wrong + currency
**Problem:** AI compares to "agencies charging £1,500-£2,000" but that's roughly what WE charge (£1,300/mo Unlimited). The comparison should be to much more expensive agencies.
**Also:** Currency should adapt per location. US visitors should see USD, UAE should see AED/USD.
**Fix:**
- Change agency comparison to higher numbers: "Most agencies charge £2,500-£5,000/month on retainer plus setup fees" (which is true for managed social/PPC).
- Currency is already handled by `detected_currency` dynamic variable. Check if the KB scripts use hardcoded £ symbols that should use the detected currency instead.

### Issue 7: ROI estimation — flow into it
**Problem:** When visitor asks "how much will I make back?", the AI asks about tracking (good CG technique), but needs to flow into offering an estimate calculation.
**User's vision:** "I think we need to flow into it and tell them we can calculate an estimate."
**Fix:** After the tracking question, offer to calculate a rough estimate: "I can actually work out a rough estimate for you. I just need a few numbers." This positions the AI as helpful rather than evasive.

### Issue 8: Double message / nudge timer
**Problem:** "Any questions about the Trial? I'm here." popped up as a second AI message while the visitor was still thinking. This is the inactivity nudge timer firing too early.
**Also:** The nudge card won't go away after it appears.
**Fix:** This is a code issue in `AiSalesChat.tsx`, not a KB issue. The nudge timer needs to be longer for V2 (longer conversations = more thinking time). And the nudge should disappear when the visitor starts typing.

### Issue 9: ROI/tracking response — complete rethink
**Problem:** The AI currently says tracking ad-to-purchase is "impossible" in F&B. User no longer wants to say this.
**New approach the user wants:**
1. Offer to calculate an ROI estimate: "I can work out a rough estimate. I need some numbers from you."
2. Ask for their existing data:
   - Current ad results (spend, reach)
   - Social media visitors / profile visitors / followers
   - How many of those come in and how they track it
   - AOV (average order value)
   - LTV (lifetime value)
3. Reverse engineer an estimate from those numbers
4. Be upfront: "This is just an estimate. The whole reason we have a trial and aren't locking you into a year contract is so you can see how AI impacts your business."
5. Worst-case fallback if they push harder: "What do you usually get from your current ads? We typically see about a 30% bump."

**This replaces the current tracking/ROI script entirely.** The old "nobody can track footfall" line is being retired. The new approach is more collaborative and less confrontational.

---

## Priority Order for Fixes

### Must-fix before deploy:
- Issue 9 (ROI rethink — biggest business impact)
- Issue 6 (wrong agency comparison + currency)
- Issue 5 (price already visible)
- Issue 4 (pitch stuck at three steps)
- Issue 1 (over-mirroring)

### Should-fix:
- Issue 8 (double message / nudge timer — code fix)
- Issue 2 (nudging short answers)
- Issue 3 ("I don't know" handling)

### Nice-to-have:
- Issue 7 (ROI estimation flow — partially covered by Issue 9)
