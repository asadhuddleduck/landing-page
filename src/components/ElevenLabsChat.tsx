"use client";

import { useConversation } from "@elevenlabs/react";
import { useRef, useState, useCallback, useEffect } from "react";
import { track } from "@vercel/analytics";
import { getVisitorId, getStoredUtms } from "@/lib/visitor";
import { PricingCard, TestimonialCard, CTACard } from "./ChatCards";

const AGENT_ID = "agent_4501khrpmw5ceq8v78xbwzjjjh58";

const GREETING_MESSAGE = "Tell me about your restaurants. I'll show you exactly how the pilot would work for your brand.";

// Animated placeholder phrases — randomly assembled from parts
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

function buildPlaceholder(): string {
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
    .replace(/\[(calm|casual|excited|empathetic|confident|warm|genuine|understanding)\]\s*/gi, "")
    .replace(/\u2014/g, " - ")
    .replace(/\u2013/g, "-")
    .trim();
}

// Detect which rich card to show for an agent message
function detectCard(text: string): "pricing" | "testimonial" | "cta" | null {
  const lower = text.toLowerCase();
  if (lower.includes("checkout") || lower.includes("right below") || lower.includes("go ahead")) {
    return "cta";
  }
  if (lower.includes("497") || (lower.includes("pilot") && lower.includes("£"))) {
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

interface ElevenLabsChatProps {
  onConversationEnd?: (outcome: string) => void;
  onTypingChange?: (isTyping: boolean) => void;
}

export default function ElevenLabsChat({ onConversationEnd, onTypingChange }: ElevenLabsChatProps) {
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [input, setInput] = useState("");
  const [hasStarted, setHasStarted] = useState(false);
  const [shownCards, setShownCards] = useState<Set<string>>(new Set());
  const inputRef = useRef<HTMLInputElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);

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

  const conversation = useConversation({
    onMessage: useCallback(
      ({ message, role }: { message: string; role: "user" | "agent"; source: string }) => {
        const cleanText = role === "agent" ? cleanAgentText(message) : message;
        setMessages((prev) => {
          // Skip SDK echo of user messages we already added locally
          if (role === "user") {
            const last = prev[prev.length - 1];
            if (last && last.role === "user" && last.text === cleanText) {
              return prev;
            }
          }
          // Agent messages: the SDK fires onMessage twice for the same turn
          // (exact duplicate). Skip if identical to the last agent message.
          if (role === "agent" && prev.length > 0) {
            const last = prev[prev.length - 1];
            if (last.role === "agent" && last.text === cleanText) {
              return prev; // exact duplicate, skip
            }
          }
          return [...prev, { role, text: cleanText, id: msgIdCounter++ }];
        });
      },
      []
    ),
    onConnect: useCallback(() => {
      track("conversation_started");
    }, []),
    onDisconnect: useCallback(() => {
      localStorage.setItem("hd_has_chatted", "true");
      track("conversation_ended");
      try {
        const existing = localStorage.getItem("hd_prev_conversation");
        if (!existing) {
          localStorage.setItem(
            "hd_prev_conversation",
            JSON.stringify({ prev_outcome: "COMPLETED" })
          );
        }
      } catch {
        /* non-critical */
      }
      onConversationEnd?.("COMPLETED");
    }, [onConversationEnd]),
    onError: useCallback((message: string) => {
      track("widget_error", { reason: message });
    }, []),
  });

  const startConversation = useCallback(
    async (firstMessage?: string) => {
      if (hasStarted) return;
      setHasStarted(true);
      try {
        await conversation.startSession({
          agentId: AGENT_ID,
          connectionType: "websocket",
          dynamicVariables: getDynamicVariables(),
          overrides: {
            conversation: { textOnly: true },
          },
        });
        if (firstMessage) {
          conversation.sendUserMessage(firstMessage);
        }
      } catch {
        setHasStarted(false);
        track("widget_error", { reason: "start_failed" });
      }
    },
    [conversation, hasStarted]
  );

  const handleSend = useCallback(() => {
    const text = input.trim();
    if (!text) return;
    setInput("");

    // Dismiss the greeting with exit animation
    if (showGreeting) {
      setGreetingExiting(true);
      // After exit animation, hide greeting and add user message
      setTimeout(() => {
        setShowGreeting(false);
        setGreetingExiting(false);
        setMessages((prev) => [...prev, { role: "user", text, id: msgIdCounter++ }]);
        // Re-focus after greeting exit re-render to keep mobile keyboard open
        requestAnimationFrame(() => inputRef.current?.focus());
      }, 300);
    } else {
      // Already in conversation - just add user message (it enters with animation)
      setMessages((prev) => [...prev, { role: "user", text, id: msgIdCounter++ }]);
    }

    if (conversation.status !== "connected") {
      startConversation(text).then(() => {
        // Re-focus input after first message — the hasStarted transition
        // can cause mobile keyboards to dismiss during re-render
        requestAnimationFrame(() => inputRef.current?.focus());
      });
    } else {
      conversation.sendUserMessage(text);
    }

    // Keep keyboard open on iOS: refocus immediately + after React re-render
    inputRef.current?.focus();
    requestAnimationFrame(() => {
      inputRef.current?.focus();
    });
  }, [input, conversation, startConversation, showGreeting]);

  // Send a preset message from qualifier buttons
  const sendPreset = useCallback((text: string) => {
    setInput("");
    onTypingChange?.(false);
    setMessages((prev) => [...prev, { role: "user", text, id: msgIdCounter++ }]);

    if (conversation.status !== "connected") {
      startConversation(text).then(() => {
        requestAnimationFrame(() => inputRef.current?.focus());
      });
    } else {
      conversation.sendUserMessage(text);
    }
    inputRef.current?.focus();
  }, [conversation, startConversation, onTypingChange]);

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
      if (conversation.status === "connected") {
        conversation.sendUserActivity();
      }
    },
    [conversation, onTypingChange]
  );

  const markCardShown = useCallback((cardType: string) => {
    setShownCards((prev) => new Set(prev).add(cardType));
  }, []);

  const isConnecting = conversation.status === "connecting";
  const isConnected = conversation.status === "connected";

  // Derive what to show:
  // - Find the last user message (always visible at top once it exists)
  // - All agent messages after the last user message (stack below)
  const lastUserIdx = (() => {
    for (let i = messages.length - 1; i >= 0; i--) {
      if (messages[i].role === "user") return i;
    }
    return -1;
  })();

  const lastUserMsg = lastUserIdx >= 0 ? messages[lastUserIdx] : null;

  // Agent messages: everything after the last user message
  const agentMessages: ChatMessage[] = [];
  if (lastUserIdx >= 0) {
    for (let i = lastUserIdx + 1; i < messages.length; i++) {
      if (messages[i].role === "agent") {
        agentMessages.push(messages[i]);
      }
    }
  }

  // Detect card for the last agent message
  const lastAgentMsg = agentMessages.length > 0 ? agentMessages[agentMessages.length - 1] : null;
  const cardType = lastAgentMsg ? detectCard(lastAgentMsg.text) : null;
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

  return (
    <div className="two-msg" ref={containerRef}>
      {/* Prominent prompt — shown before conversation starts */}
      {!hasStarted && (
        <div className="chat-prompt">
          <p className="chat-prompt-text">Tell us about your brand</p>
          <p className="chat-prompt-payoff">This AI will map out your campaign</p>
          <div className="chat-prompt-buttons">
            <button
              className="chat-prompt-btn chat-prompt-btn--yes"
              onClick={() => sendPreset("I run a food and drink business")}
            >
              I sell food or drink
            </button>
            <button
              className="chat-prompt-btn chat-prompt-btn--no"
              onClick={() => sendPreset("I don't run a food business, but I'm curious how this works")}
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

      {/* Typing indicator - waiting for first agent response */}
      {(isConnecting || (isConnected && waitingForResponse)) && (
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
      {!showGreeting && agentMessages.map((msg) => (
        <div
          key={`a-${msg.id}`}
          className="two-msg-card two-msg-agent two-msg-enter"
        >
          <div className="two-msg-agent-indicator">
            <div className="two-msg-agent-dot" />
            <span className="two-msg-agent-label">Ads AI</span>
          </div>
          <div className="two-msg-text">{msg.text}</div>
        </div>
      ))}

      {/* Rich card below the AI message */}
      {shouldShowCard && cardType === "pricing" && (
        <PricingCard onShow={() => markCardShown("pricing")} />
      )}
      {shouldShowCard && cardType === "testimonial" && lastAgentMsg && (
        <TestimonialCard
          text={lastAgentMsg.text}
          onShow={() => markCardShown("testimonial")}
        />
      )}
      {shouldShowCard && cardType === "cta" && (
        <CTACard onShow={() => markCardShown("cta")} />
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
          readOnly={isConnecting}
          autoComplete="off"
          enterKeyHint="send"
          data-form-type="other"
          onContextMenu={(e) => e.preventDefault()}
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
