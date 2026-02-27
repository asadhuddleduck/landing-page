"use client";

import { useChat } from "@ai-sdk/react";
import { DefaultChatTransport } from "ai";
import type { UIMessage } from "ai";
import { useRef, useState, useCallback, useEffect, useMemo } from "react";
import { track } from "@vercel/analytics";
import { getVisitorId, getStoredUtms } from "@/lib/visitor";
import { PricingCard, TestimonialCard, CTACard, ComparisonCard, TimelineCard } from "./ChatCards";

function StreamingText({ text, isStreaming }: { text: string; isStreaming: boolean }) {
  const prevLenRef = useRef(0);
  const [settledLen, setSettledLen] = useState(0);

  useEffect(() => {
    if (!isStreaming) {
      setSettledLen(text.length);
      prevLenRef.current = text.length;
    }
  }, [isStreaming, text.length]);

  useEffect(() => {
    if (isStreaming && text.length > prevLenRef.current) {
      const prev = prevLenRef.current;
      prevLenRef.current = text.length;
      const timer = setTimeout(() => setSettledLen(prev), 350);
      return () => clearTimeout(timer);
    }
  }, [text, isStreaming]);

  if (!isStreaming) {
    return <span>{text}</span>;
  }

  const settled = text.slice(0, settledLen);
  const fresh = text.slice(settledLen);

  return (
    <>
      <span>{settled}</span>
      {fresh && <span className="streaming-fade-in">{fresh}</span>}
      <span className="streaming-cursor" />
    </>
  );
}

/** Extract concatenated text from a UIMessage's parts array. */
function getMessageText(msg: UIMessage): string {
  return msg.parts
    .filter((p): p is { type: "text"; text: string } => p.type === "text")
    .map((p) => p.text)
    .join("");
}

// Animated placeholder phrases — two pools that alternate:
// 1. Frustration-style answers (match the greeting question about ad frustrations)
// 2. Business-description answers (show the AI what kind of context is helpful)
// This gives visitors two mental models for how to respond.
const PLACEHOLDER_FRUSTRATIONS = [
  "We spend a lot but foot traffic hasn't changed...",
  "I don't know if our ads actually bring people in...",
  "We tried boosting posts but nothing happened...",
  "Our agency just sends reports, no real results...",
  "We get likes but nobody actually visits...",
  "Ads feel like throwing money into a black hole...",
  "I don't even know who's seeing our ads...",
  "We stopped ads because they weren't working...",
  "Competitors seem to be everywhere, we're invisible...",
  "Every platform wants more money but can't show results...",
];
const PLACEHOLDER_CUISINES = [
  "burger restaurants", "sushi restaurants", "pizza places", "cafes",
  "fine dining restaurants", "bakeries", "steakhouses", "noodle bars",
  "taco shops", "shawarma spots", "Thai restaurants", "Indian restaurants",
  "brunch spots", "dessert parlours", "chicken shops", "seafood restaurants",
  "kebab restaurants", "patisseries", "coffee shops", "ice cream shops",
  "ramen shops", "Greek restaurants", "Mediterranean grills", "BBQ joints",
];
const PLACEHOLDER_COUNTRIES = [
  "the UK", "England", "Scotland", "Ireland", "Wales", "the UAE",
  "the US", "Canada", "Australia", "Singapore", "Saudi Arabia",
  "Qatar", "Kuwait", "Malaysia", "France", "Germany", "Spain",
  "Italy", "the Netherlands", "Sweden", "Japan", "South Korea",
];

let placeholderFlip = false;
function buildPlaceholder(): string {
  placeholderFlip = !placeholderFlip;
  if (placeholderFlip) {
    return PLACEHOLDER_FRUSTRATIONS[Math.floor(Math.random() * PLACEHOLDER_FRUSTRATIONS.length)];
  }
  const count = Math.floor(Math.random() * 19) + 2;
  const cuisine = PLACEHOLDER_CUISINES[Math.floor(Math.random() * PLACEHOLDER_CUISINES.length)];
  const country = PLACEHOLDER_COUNTRIES[Math.floor(Math.random() * PLACEHOLDER_COUNTRIES.length)];
  return `I run ${count} ${cuisine} in ${country}...`;
}

interface ChatMessage {
  role: "user" | "agent";
  text: string;
  id: number;
}

let msgIdCounter = 0;

function getDynamicVariables(): Record<string, string> {
  const visitorId = getVisitorId();
  const utms = getStoredUtms();
  const returningVisitor = localStorage.getItem("hd_has_chatted") === "true";

  const prevData = localStorage.getItem("hd_prev_conversation");
  let prevVars: Record<string, string> = {
    prev_business_name: "",
    prev_challenge: "",
    prev_outcome: "",
    prev_location_count: "",
  };
  if (prevData) {
    try {
      prevVars = { ...prevVars, ...JSON.parse(prevData) };
    } catch {
      /* ignore */
    }
  }

  return {
    visitor_id: visitorId,
    utm_source: utms.utm_source || "",
    utm_medium: utms.utm_medium || "",
    utm_campaign: utms.utm_campaign || "",
    page_url: typeof window !== "undefined" ? window.location.href : "",
    returning_visitor: returningVisitor ? "true" : "false",
    ...prevVars,
  };
}

// Clean agent text: strip emotion tags (TTS-only) and em/en dashes (brand rule)
function cleanAgentText(text: string): string {
  return text
    .replace(/\[[a-z]+\]/gi, " ")
    .replace(/\s{2,}/g, " ")
    .replace(/\u2014/g, " - ")
    .replace(/\u2013/g, "-")
    .trim();
}

// Detect which rich card to show for an agent message
function detectCard(text: string): "pricing" | "testimonial" | "cta" | "comparison" | "timeline" | null {
  const lower = text.toLowerCase();
  if (lower.includes("checkout") || lower.includes("right below") || lower.includes("go ahead")) {
    return "cta";
  }
  if (lower.includes("497") || (lower.includes("trial") && lower.includes("£"))) {
    return "pricing";
  }
  if (
    lower.includes("phat buns") ||
    lower.includes("burger & sauce") ||
    lower.includes("burger and sauce") ||
    lower.includes("676")
  ) {
    return "testimonial";
  }
  if (lower.includes("agency") && /£|cost|expensive|cheaper|charge|paying|price|spend/.test(lower)) {
    return "comparison";
  }
  if (lower.includes("72 hours") && (/3 week/.test(lower) || /three week/.test(lower))) {
    return "timeline";
  }
  return null;
}

/* ── Power-bar colour helpers ── */
function lerpColor(a: string, b: string, t: number): string {
  const parse = (hex: string) => [
    parseInt(hex.slice(1, 3), 16),
    parseInt(hex.slice(3, 5), 16),
    parseInt(hex.slice(5, 7), 16),
  ];
  const [r1, g1, b1] = parse(a);
  const [r2, g2, b2] = parse(b);
  return `rgb(${Math.round(r1 + (r2 - r1) * t)},${Math.round(g1 + (g2 - g1) * t)},${Math.round(b1 + (b2 - b1) * t)})`;
}

function getPowerBarColor(chars: number): string {
  if (chars <= 12) return "#E53935";
  if (chars <= 30) return lerpColor("#E53935", "#FB8C00", (chars - 12) / 18);
  if (chars <= 50) return lerpColor("#FB8C00", "#1EBA8F", (chars - 30) / 20);
  if (chars <= 80) return "#1EBA8F";
  if (chars <= 120) return "#F7CE46";
  return "#0A6E9E"; // Night Forest blue for supernova
}

function getPowerBarLabel(zone: string): string {
  switch (zone) {
    case "red": return "keep going...";
    case "mid": return "nice, tell me more";
    case "green": return "great detail!";
    case "gold": return "amazing brief ✦";
    case "supernova": return "perfect brief ✦✦";
    default: return "";
  }
}

interface AiSalesChatProps {
  onConversationEnd?: (outcome: string) => void;
  onTypingChange?: (isTyping: boolean) => void;
}

export default function AiSalesChat({ onConversationEnd, onTypingChange }: AiSalesChatProps) {
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [input, setInput] = useState("");
  const [hasStarted, setHasStarted] = useState(false);
  const [nonFnb, setNonFnb] = useState(false);
  const [shownCards, setShownCards] = useState<Set<string>>(new Set());
  const inputRef = useRef<HTMLInputElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);

  // Post-price silence nudge
  const nudgeTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const nudgeFiredRef = useRef(false);
  const [nudgeMessage, setNudgeMessage] = useState<string | null>(null);

  const [showGreeting, setShowGreeting] = useState(false);
  const [greetingExiting, setGreetingExiting] = useState(false);

  // Animated typing placeholder with blinking cursor
  const [placeholderText, setPlaceholderText] = useState("");
  const placeholderRef = useRef({ phrase: "", charIdx: 0, phase: "typing" as "typing" | "hold" | "erasing", holdTick: 0 });

  useEffect(() => {
    // Don't animate once connected
    if (hasStarted) return;

    // Pick first phrase
    placeholderRef.current.phrase = buildPlaceholder();
    placeholderRef.current.charIdx = 0;
    placeholderRef.current.phase = "typing";
    placeholderRef.current.holdTick = 0;

    const interval = setInterval(() => {
      const p = placeholderRef.current;

      if (p.phase === "typing") {
        p.charIdx++;
        setPlaceholderText(p.phrase.slice(0, p.charIdx) + "|");
        if (p.charIdx >= p.phrase.length) {
          p.phase = "hold";
          p.holdTick = 0;
          // Hold for 2s before erasing
          setTimeout(() => { p.phase = "erasing"; }, 2000);
        }
      } else if (p.phase === "hold") {
        p.holdTick++;
        // Blink cursor every ~6 ticks (480ms)
        const showCursor = Math.floor(p.holdTick / 6) % 2 === 0;
        setPlaceholderText(p.phrase + (showCursor ? "|" : ""));
      } else if (p.phase === "erasing") {
        p.charIdx--;
        setPlaceholderText(p.phrase.slice(0, p.charIdx) + "|");
        if (p.charIdx <= 0) {
          // Pick a new phrase
          p.phrase = buildPlaceholder();
          p.charIdx = 0;
          p.phase = "typing";
        }
      }
    }, 80);

    return () => clearInterval(interval);
  }, [hasStarted]);

  // Headline visibility: scroll-aware, bi-directional.
  // - Scroll down past threshold OR focus input (mobile) → fade out slowly
  // - Scroll back near top → snap back in
  // - Re-triggerable in both directions
  const headlineVisibleRef = useRef(true);

  const hideHeadline = useCallback((fast: boolean) => {
    if (!headlineVisibleRef.current) return;
    headlineVisibleRef.current = false;
    const headline = document.querySelector(".hero-headline") as HTMLElement;
    const directive = document.querySelector(".hero-sub") as HTMLElement;
    const dur = fast ? "0.3s" : "0.6s";
    if (headline) {
      headline.style.transition = `opacity ${dur} ease, transform ${dur} ease`;
      headline.style.opacity = "0";
      headline.style.transform = "translateY(-10px)";
    }
    if (directive) {
      directive.style.transition = `opacity ${dur} ease 0.05s, transform ${dur} ease 0.05s`;
      directive.style.opacity = "0";
      directive.style.transform = "translateY(-10px)";
    }
  }, []);

  const showHeadline = useCallback(() => {
    if (headlineVisibleRef.current) return;
    headlineVisibleRef.current = true;
    const headline = document.querySelector(".hero-headline") as HTMLElement;
    const directive = document.querySelector(".hero-sub") as HTMLElement;
    // Snap back in quickly
    if (headline) {
      headline.style.transition = "opacity 0.2s ease, transform 0.2s ease";
      headline.style.opacity = "1";
      headline.style.transform = "translateY(0)";
    }
    if (directive) {
      directive.style.transition = "opacity 0.2s ease 0.03s, transform 0.2s ease 0.03s";
      directive.style.opacity = "1";
      directive.style.transform = "translateY(0)";
    }
  }, []);

  const handleFocus = useCallback(() => {
    // Skip on desktop (no virtual keyboard)
    if (window.innerWidth >= 768) return;
    hideHeadline(true);
  }, [hideHeadline]);

  const handleBlur = useCallback(() => {
    // Don't restore on blur - scroll position controls visibility
  }, []);

  // Scroll-driven headline: hide when scrolled down, show when near top
  // Throttled via requestAnimationFrame to avoid jank on mobile
  useEffect(() => {
    const HIDE_THRESHOLD = 80;  // px scrolled before headline fades
    const SHOW_THRESHOLD = 40;  // px from top to snap headline back
    let scrollTicking = false;

    function onScroll() {
      if (scrollTicking) return;
      scrollTicking = true;
      requestAnimationFrame(() => {
        if (window.innerWidth >= 768) { scrollTicking = false; return; } // desktop: always visible
        const y = window.scrollY;
        if (y > HIDE_THRESHOLD && headlineVisibleRef.current) {
          hideHeadline(false); // slow fade on scroll down
        } else if (y < SHOW_THRESHOLD && !headlineVisibleRef.current) {
          showHeadline(); // snap back when near top
        }
        scrollTicking = false;
      });
    }

    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, [hideHeadline, showHeadline]);

  // --- Vercel AI SDK transport ---
  const conversationIdRef = useRef<string | null>(null);
  const startTimeRef = useRef<number | null>(null);
  const savedRef = useRef(false);
  const inactivityTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  const transport = useMemo(
    () => new DefaultChatTransport({
      api: "/api/chat",
      body: () => ({ dynamicVariables: getDynamicVariables() }),
    }),
    []
  );

  const [chatError, setChatError] = useState(false);

  const { messages: aiMessages, sendMessage, status } = useChat({
    transport,
    onError: (err: Error) => {
      track("widget_error", { reason: err.message });
      setChatError(true);
    },
  });

  const isStreaming = status === "submitted" || status === "streaming";

  // Map AI SDK UIMessages to existing ChatMessage format — derived on every render
  // so streaming token updates are reflected immediately (no stale useEffect).
  // When nonFnb, we use the locally-set messages state instead.
  const displayMessages: ChatMessage[] = nonFnb
    ? messages
    : aiMessages
        .filter((m) => m.role === "user" || m.role === "assistant")
        .map((m, i) => ({
          role: m.role === "assistant" ? ("agent" as const) : ("user" as const),
          text: m.role === "assistant" ? cleanAgentText(getMessageText(m)) : getMessageText(m),
          id: i,
        }));

  // --- Conversation save logic ---
  // useBeacon=true for page unload (fire-and-forget), false for inactivity/warm exit (reads response)
  const saveConversation = useCallback((useBeacon = false) => {
    if (savedRef.current || !conversationIdRef.current || aiMessages.length === 0) return;
    savedRef.current = true;

    const payload = JSON.stringify({
      conversationId: conversationIdRef.current,
      messages: aiMessages.map((m) => ({ role: m.role, content: getMessageText(m) })),
      dynamicVariables: getDynamicVariables(),
      durationSecs: startTimeRef.current ? Math.round((Date.now() - startTimeRef.current) / 1000) : 0,
    });

    if (useBeacon) {
      navigator.sendBeacon("/api/chat/save", payload);
    } else {
      // Use fetch so we can read extracted data for returning visitor personalization
      fetch("/api/chat/save", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: payload,
      })
        .then((res) => res.json())
        .then((data) => {
          if (data?.extracted) {
            try {
              localStorage.setItem(
                "hd_prev_conversation",
                JSON.stringify({
                  prev_outcome: data.extracted.conversation_outcome || "COMPLETED",
                  prev_business_name: data.extracted.business_name || "",
                  prev_challenge: data.extracted.main_challenge || "",
                  prev_location_count: data.extracted.location_count || "",
                })
              );
            } catch {
              /* localStorage blocked */
            }
          }
        })
        .catch(() => {
          /* non-critical — transcript was still sent */
        });
    }

    track("conversation_ended");
    try {
      localStorage.setItem("hd_has_chatted", "true");
      // Set fallback prev_conversation (overwritten by fetch response above when available)
      if (!localStorage.getItem("hd_prev_conversation")) {
        localStorage.setItem(
          "hd_prev_conversation",
          JSON.stringify({ prev_outcome: "COMPLETED" })
        );
      }
    } catch {
      /* non-critical — localStorage may be blocked (Safari private) */
    }
    onConversationEnd?.("COMPLETED");
  }, [aiMessages, onConversationEnd]);

  // Reset inactivity timer on each new message
  useEffect(() => {
    if (aiMessages.length === 0 || savedRef.current) return;

    // Clear previous timer
    if (inactivityTimerRef.current) clearTimeout(inactivityTimerRef.current);

    // Warm exit detection: if agent says goodbye, save immediately
    const lastMsg = aiMessages[aiMessages.length - 1];
    if (lastMsg.role === "assistant" && getMessageText(lastMsg).includes("Good luck with everything")) {
      saveConversation();
      return;
    }

    // 5-minute inactivity timeout
    inactivityTimerRef.current = setTimeout(() => {
      saveConversation();
    }, 5 * 60 * 1000);

    return () => {
      if (inactivityTimerRef.current) clearTimeout(inactivityTimerRef.current);
    };
  }, [aiMessages.length, saveConversation]);

  // beforeunload + visibilitychange save triggers
  useEffect(() => {
    const handleBeforeUnload = () => saveConversation(true);
    const handleVisibilityChange = () => {
      if (document.visibilityState === "hidden") saveConversation(true);
    };

    window.addEventListener("beforeunload", handleBeforeUnload);
    document.addEventListener("visibilitychange", handleVisibilityChange);
    return () => {
      window.removeEventListener("beforeunload", handleBeforeUnload);
      document.removeEventListener("visibilitychange", handleVisibilityChange);
    };
  }, [saveConversation]);

  // Clear nudge timer on user message
  const clearNudgeTimer = useCallback(() => {
    if (nudgeTimerRef.current) {
      clearTimeout(nudgeTimerRef.current);
      nudgeTimerRef.current = null;
    }
  }, []);

  const startConversation = useCallback(
    (firstMessage?: string) => {
      if (hasStarted) return;
      setHasStarted(true);
      conversationIdRef.current = crypto.randomUUID();
      startTimeRef.current = Date.now();
      track("conversation_started");
      if (firstMessage) {
        sendMessage({ text: firstMessage });
      }
    },
    [hasStarted, sendMessage]
  );

  const handleSend = useCallback(() => {
    const text = input.trim();
    if (!text || nonFnb) return;
    setInput("");
    clearNudgeTimer();

    // Dismiss the greeting with exit animation
    if (showGreeting) {
      setGreetingExiting(true);
      // After exit animation, hide greeting and send message
      setTimeout(() => {
        setShowGreeting(false);
        setGreetingExiting(false);
        // Re-focus after greeting exit re-render to keep mobile keyboard open
        requestAnimationFrame(() => inputRef.current?.focus());
      }, 300);
    }

    // Clear any previous error when user sends a new message
    if (chatError) setChatError(false);

    if (!hasStarted) {
      startConversation(text);
      requestAnimationFrame(() => inputRef.current?.focus());
    } else {
      sendMessage({ text });
    }

    // Keep keyboard open on iOS: refocus immediately + after React re-render
    inputRef.current?.focus();
    requestAnimationFrame(() => {
      inputRef.current?.focus();
    });
  }, [input, hasStarted, startConversation, sendMessage, showGreeting, nonFnb, chatError, clearNudgeTimer]);

  // Send a preset message from qualifier buttons
  const sendPreset = useCallback((text: string) => {
    setInput("");
    onTypingChange?.(false);
    clearNudgeTimer();

    if (!hasStarted) {
      startConversation(text);
      requestAnimationFrame(() => inputRef.current?.focus());
    } else {
      sendMessage({ text });
    }
    inputRef.current?.focus();
  }, [hasStarted, startConversation, sendMessage, onTypingChange, clearNudgeTimer]);

  const handleKeyDown = useCallback(
    (e: React.KeyboardEvent) => {
      if (e.key === "Enter" && !e.shiftKey) {
        e.preventDefault();
        handleSend();
      }
    },
    [handleSend]
  );

  const handleInputChange = useCallback(
    (e: React.ChangeEvent<HTMLInputElement>) => {
      const val = e.target.value;
      setInput(val);
      onTypingChange?.(val.length > 0);
    },
    [onTypingChange]
  );

  const markCardShown = useCallback((cardType: string) => {
    setShownCards((prev) => new Set(prev).add(cardType));
  }, []);

  // Start 60s nudge timer when pricing card shown and streaming stops
  useEffect(() => {
    if (shownCards.has("pricing") && !isStreaming && !nudgeFiredRef.current) {
      nudgeTimerRef.current = setTimeout(() => {
        if (!nudgeFiredRef.current) {
          nudgeFiredRef.current = true;
          setNudgeMessage("Any questions about the Trial? I'm here.");
        }
      }, 60000);
      return () => {
        if (nudgeTimerRef.current) clearTimeout(nudgeTimerRef.current);
      };
    }
  }, [shownCards, isStreaming]);

  const isConnecting = isStreaming && aiMessages.length <= 1;
  const isConnected = hasStarted;

  // Derive what to show:
  // - Find the last user message (always visible at top once it exists)
  // - All agent messages after the last user message (stack below)
  const lastUserIdx = (() => {
    for (let i = displayMessages.length - 1; i >= 0; i--) {
      if (displayMessages[i].role === "user") return i;
    }
    return -1;
  })();

  const lastUserMsg = lastUserIdx >= 0 ? displayMessages[lastUserIdx] : null;

  // Agent messages: everything after the last user message
  const agentMessages: ChatMessage[] = [];
  if (lastUserIdx >= 0) {
    for (let i = lastUserIdx + 1; i < displayMessages.length; i++) {
      if (displayMessages[i].role === "agent") {
        agentMessages.push(displayMessages[i]);
      }
    }
  }

  // Detect card for the last agent message
  const lastAgentMsg = agentMessages.length > 0 ? agentMessages[agentMessages.length - 1] : null;
  const cardType = (lastAgentMsg && !isStreaming) ? detectCard(lastAgentMsg.text) : null;
  const shouldShowCard = cardType && !shownCards.has(cardType);

  // Are we waiting for the first agent response after user sent?
  const waitingForResponse = lastUserMsg && agentMessages.length === 0 && !showGreeting;

  // Power-bar derived state (3-stage dopamine ladder)
  // Stage 1: red→green (0-80) easy ramp
  // Stage 2: gold shimmer (80-120) reward
  // Stage 3: Night Forest blue supernova (120+) ultimate hidden final form
  const charCount = input.length;
  const showPowerBar = charCount > 0;
  const fillPercent = Math.min(charCount / 120, 1);
  const powerZone: "red" | "mid" | "green" | "gold" | "supernova" =
    charCount <= 12 ? "red" : charCount <= 50 ? "mid" : charCount <= 80 ? "green" : charCount <= 120 ? "gold" : "supernova";
  const charDisplay = String(charCount).padStart(2, "0");

  // Extract location count from conversation for testimonial matching
  const extractedLocationCount = useMemo(() => {
    for (const m of aiMessages) {
      if (m.role !== "user") continue;
      const text = getMessageText(m);
      const match = text.match(/(\d+)\s*(?:location|spot|restaurant|place)/i);
      if (match) return parseInt(match[1], 10);
    }
    return undefined;
  }, [aiMessages]);

  return (
    <div className="two-msg" ref={containerRef}>
      {/* Prominent prompt — shown before conversation starts */}
      {!hasStarted && (
        <div className="chat-prompt">
          <p className="chat-prompt-text">See what this AI spots in 30 seconds</p>
          <p className="chat-prompt-payoff">No signup. Just tell it about your brand.</p>
          <div className="chat-prompt-buttons">
            <button
              className="chat-prompt-btn chat-prompt-btn--yes"
              onClick={() => sendPreset("I run a food and drink business")}
            >
              I sell food or drink
            </button>
            <button
              className="chat-prompt-btn chat-prompt-btn--no"
              onClick={() => {
                setHasStarted(true);
                setNonFnb(true);
                setMessages([
                  { role: "user", text: "No, just looking", id: msgIdCounter++ },
                  { role: "agent", text: "The AI Ad Engine is built specifically for food and beverage brands. If you know someone who runs a food business, share this page with them.", id: msgIdCounter++ },
                ]);
                track("non_fnb_exit");
              }}
            >
              No, just looking
            </button>
          </div>
        </div>
      )}

      {/* User's latest message (always visible once sent) */}
      {!showGreeting && lastUserMsg && (
        <div
          key={`u-${lastUserMsg.id}`}
          className="two-msg-card two-msg-user two-msg-enter"
        >
          <div className="two-msg-text">{lastUserMsg.text}</div>
        </div>
      )}

      {/* Error state */}
      {chatError && (
        <div className="two-msg-card two-msg-agent two-msg-enter">
          <div className="two-msg-agent-indicator">
            <div className="two-msg-agent-dot" />
            <span className="two-msg-agent-label">Ads AI</span>
          </div>
          <div className="two-msg-text" style={{ color: "var(--text-secondary)" }}>
            Something went wrong — try sending your message again.
          </div>
        </div>
      )}

      {/* Typing indicator - waiting for agent response */}
      {(isStreaming && hasStarted && waitingForResponse) && (
        <div className="two-msg-card two-msg-agent two-msg-typing two-msg-enter">
          <div className="two-msg-agent-indicator">
            <div className="two-msg-agent-dot two-msg-agent-dot-speaking" />
            <span className="two-msg-agent-label">Ads AI</span>
          </div>
          <div className="ai-chat-typing">
            <span />
            <span />
            <span />
          </div>
        </div>
      )}

      {/* AI messages (all since last user message - they stack, never disappear each other) */}
      {!showGreeting && agentMessages.map((msg, idx) => {
        const isLast = idx === agentMessages.length - 1;
        const isActivelyStreaming = isLast && isStreaming;
        return (
          <div
            key={`a-${msg.id}`}
            className={`two-msg-card two-msg-agent two-msg-enter${isActivelyStreaming ? " two-msg-agent--streaming" : ""}`}
          >
            <div className="two-msg-agent-indicator">
              <div className={`two-msg-agent-dot${isActivelyStreaming ? " two-msg-agent-dot--streaming" : ""}`} />
              <span className="two-msg-agent-label">Ads AI</span>
            </div>
            <div className="two-msg-text">
              <StreamingText text={msg.text} isStreaming={isActivelyStreaming} />
            </div>
          </div>
        );
      })}

      {/* Rich card below the AI message */}
      {shouldShowCard && cardType === "pricing" && (
        <PricingCard onShow={() => markCardShown("pricing")} />
      )}
      {shouldShowCard && cardType === "testimonial" && lastAgentMsg && (
        <TestimonialCard
          text={lastAgentMsg.text}
          onShow={() => markCardShown("testimonial")}
          locationCount={extractedLocationCount}
        />
      )}
      {shouldShowCard && cardType === "comparison" && (
        <ComparisonCard
          onShow={() => markCardShown("comparison")}
          locationCount={extractedLocationCount}
        />
      )}
      {shouldShowCard && cardType === "timeline" && (
        <TimelineCard onShow={() => markCardShown("timeline")} />
      )}
      {shouldShowCard && cardType === "cta" && (
        <CTACard onShow={() => markCardShown("cta")} />
      )}

      {/* Post-price silence nudge */}
      {nudgeMessage && (
        <div className="two-msg-card two-msg-agent two-msg-enter">
          <div className="two-msg-agent-indicator">
            <div className="two-msg-agent-dot" />
            <span className="two-msg-agent-label">Ads AI</span>
          </div>
          <div className="two-msg-text">{nudgeMessage}</div>
        </div>
      )}

      {/* Input bar */}
      <div className="two-msg-input-bar">
        <input
          ref={inputRef}
          type="text"
          className={`two-msg-input${hasStarted ? " two-msg-input--active" : ""}`}
          placeholder={
            isConnected
              ? "Type a message..."
              : placeholderText || "\u200B"
          }
          value={input}
          onChange={handleInputChange}
          onKeyDown={handleKeyDown}
          onFocus={handleFocus}
          onBlur={handleBlur}
          readOnly={isConnecting || nonFnb}
          autoComplete="off"
          enterKeyHint="send"
          data-form-type="other"
        />
      </div>

      {/* Power bar */}
      <div className="power-bar-container">
        <div className={`power-bar${showPowerBar ? " power-bar--visible" : ""}${powerZone === "gold" ? " power-bar--gold" : ""}${powerZone === "supernova" ? " power-bar--supernova" : ""}`}>
          <span className="power-bar-count" style={{ color: getPowerBarColor(charCount) }}>{charDisplay}</span>
          <div className="power-bar-track">
            <div
              className="power-bar-fill"
              style={{
                width: `${fillPercent * 100}%`,
                background: powerZone === "supernova"
                  ? "linear-gradient(90deg, #00334B 0%, #0A6E9E 30%, #2AA3D4 60%, #0A6E9E 100%)"
                  : powerZone === "gold"
                    ? "linear-gradient(90deg, #1EBA8F 0%, #F7CE46 60%, #FFE082 100%)"
                    : getPowerBarColor(charCount),
                boxShadow: powerZone === "supernova"
                  ? "0 0 14px rgba(10,110,158,0.7),0 0 30px rgba(10,110,158,0.3)"
                  : `0 0 8px ${getPowerBarColor(charCount)}`,
              }}
            />
            <div className={`power-bar-shimmer${powerZone === "gold" || powerZone === "supernova" ? " power-bar-shimmer--active" : ""}${powerZone === "supernova" ? " power-bar-shimmer--supernova" : ""}`} />
          </div>
          <span className="power-bar-label" style={{ color: getPowerBarColor(charCount) }}>{getPowerBarLabel(powerZone)}</span>
        </div>
      </div>
    </div>
  );
}
