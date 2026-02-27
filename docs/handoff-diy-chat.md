# Extra Notes for DIY Chat Agent Migration

Things you might not have thought about when planning the move from ElevenLabs to a Vercel-hosted chat agent.

## 1. The prompt and KB docs are your spec

The entire sales brain lives in these local files — use them as-is for your system prompt and RAG/context:

- `docs/agent-prompts/base-prompt-v3.md` — the system prompt (~1,500 tokens, already optimised)
- `docs/kb-01-product.txt` through `docs/kb-09-example-conversations.txt` — 9 knowledge base docs

The prompt was just restructured to ElevenLabs' Personality→Goal→Guardrails→Flow→Variables format, but that structure works well for any LLM. The `# Guardrails` heading is just a markdown heading — the rules underneath are universal.

## 2. Dynamic variables are injected client-side

`ElevenLabsChat.tsx:62-91` has `getDynamicVariables()` which builds a context object from:
- `_vid` cookie (visitor ID from `lib/visitor.ts`)
- `_utms` cookie (first-touch UTMs)
- `localStorage: hd_has_chatted` (returning visitor flag)
- `localStorage: hd_prev_conversation` (previous conversation context: business name, challenge, outcome, location count)

The prompt uses `{{ visitor_id }}`, `{{ returning_visitor }}`, `{{ prev_business_name }}` etc. Your new API route needs to accept these from the client and interpolate them into the system prompt before sending to the LLM.

## 3. The ElevenLabs webhook saves conversation data to Turso

`src/app/api/webhook/elevenlabs/route.ts` writes to a `conversations` table in Turso. It captures:
- Structured data from ElevenLabs "data collection" (business_name, location_count, main_challenge, visitor_email, etc.)
- Full transcript
- UTMs and visitor_id from dynamic variables

With DIY, you'll need to decide: do you still want to persist conversations? If yes, you can write to Turso at conversation end (or per-message). The `conversations` table schema already exists.

## 4. ElevenLabs SDK features you'll be replacing

The `useConversation` hook from `@elevenlabs/react` currently handles:
- WebSocket connection to ElevenLabs (text-only mode)
- `sendUserMessage()` / `sendUserActivity()` (typing indicator signal)
- `onMessage` callback with dedup (SDK fires duplicates — see lines 300-315)
- `onConnect` / `onDisconnect` / `onError` lifecycle
- `connectionType: "websocket"` with `textOnly: true` override

Your DIY replacement is simpler: just POST to your own API route and stream the response. No WebSocket needed unless you want real-time streaming. A simple fetch + ReadableStream or SSE is enough.

## 5. Non-F&B gate is client-side only

The "No, just looking" button (line 508-520) never hits ElevenLabs at all. It sets `nonFnb=true`, adds a canned warm-exit message, fires `track("non_fnb_exit")`, and makes the input read-only. This stays 100% client-side regardless of backend.

## 6. Rich cards are triggered by keyword detection

`detectCard()` (line 104-121) scans agent messages for keywords and shows inline UI cards:
- "checkout" / "right below" / "go ahead" → CTA card (scroll to checkout)
- "497" / ("trial" + "£") → Pricing card
- "phat buns" / "burger and sauce" / "676" → Testimonial card

These render as `<PricingCard>`, `<TestimonialCard>`, `<CTACard>` from `ChatCards.tsx`. This logic doesn't touch ElevenLabs — it just reads the agent's response text. So it works the same with any backend.

## 7. The power bar and placeholder animation are input-only

The typing power bar (lines 123-153, 486-491, 601-624) and the animated placeholder typewriter (lines 172-216) are purely cosmetic input UX. They have zero dependency on ElevenLabs. Keep them as-is.

## 8. Conversation tracking events

The component fires Vercel Analytics events:
- `conversation_started` — on first connection
- `conversation_ended` — on disconnect
- `non_fnb_exit` — when visitor clicks "No, just looking"
- `widget_error` — on connection/runtime errors

Plus localStorage persistence:
- `hd_has_chatted: "true"` — set on disconnect, used for returning visitor detection
- `hd_prev_conversation` — JSON with prev_outcome, potentially prev_business_name etc.

Your DIY agent needs to set these same localStorage values at conversation end, otherwise returning visitor logic breaks.

## 9. Things ElevenLabs was doing that you now own

- **Rate limiting** — ElevenLabs had concurrency limits built in. Your Vercel API route has none. Consider edge-level rate limiting or at minimum per-visitor throttling.
- **Conversation timeout** — ElevenLabs auto-disconnected after idle. You'll need your own timeout logic (client-side timer that closes the conversation after X minutes of inactivity).
- **Message dedup** — The SDK fired duplicate messages (lines 300-315 handle this). Your own streaming response won't have this problem, but watch for React strict mode double-renders.
- **Data collection / analysis** — ElevenLabs extracted structured data (business_name, location_count, is_fb, etc.) via its Analysis tab post-conversation. If you want this, add a final LLM call at conversation end that extracts structured data from the transcript.

## 10. The `cleanAgentText()` function

Lines 94-101 strip ElevenLabs-specific artifacts:
- Emotion tags like `[excited]` that leaked from TTS mode
- Em/en dashes (brand rule: use hyphens)

With DIY, emotion tags won't exist. But the em-dash cleaning is still useful since Claude sometimes uses em dashes. Keep the dash replacement, drop the bracket regex if you want.

## 11. What to delete when migration is complete

- `@elevenlabs/react` from package.json (it's already flagged as unused dep)
- `ELEVENLABS_API_KEY` and `ELEVENLABS_WEBHOOK_SECRET` env vars
- `src/app/api/webhook/elevenlabs/route.ts` (the webhook handler)
- The ElevenLabs agent itself (agent_4501khrpmw5ceq8v78xbwzjjjh58) — delete via API or dashboard
- KB docs on ElevenLabs (9 docs, IDs in CLAUDE.md) — delete via API
- References in CLAUDE.md (agent ID, KB doc IDs, ElevenLabs integration section)

## 12. Model choice matters

The ElevenLabs agent runs Claude Sonnet 4.5. GLM-4.5-Air and Gemini 2.0 Flash were both tested and rejected (too repetitive, poor instruction following for the sales flow). Sonnet is the only model that followed the Give-While-You-Take framework well. If you're picking a model for the DIY version, start with Sonnet.
