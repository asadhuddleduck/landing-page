"use client";

import { useConversation } from "@elevenlabs/react";
import { useEffect, useRef, useState, useCallback, useMemo } from "react";
import { track } from "@vercel/analytics";
import { getVisitorId, getStoredUtms } from "@/lib/visitor";
import { PricingCard, TestimonialCard, CTACard } from "./ChatCards";

const AGENT_ID = "agent_4501khrpmw5ceq8v78xbwzjjjh58";
const INITIAL_MESSAGE =
  "We built something that changes how F&B brands advertise. Most don't know it exists yet. Tell me about your business.";

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

interface ElevenLabsChatProps {
  onConversationEnd?: (outcome: string) => void;
}

export default function ElevenLabsChat({ onConversationEnd }: ElevenLabsChatProps) {
  const [messages, setMessages] = useState<ChatMessage[]>([
    { role: "agent", text: INITIAL_MESSAGE, id: msgIdCounter++ },
  ]);
  const [input, setInput] = useState("");
  const [hasStarted, setHasStarted] = useState(false);
  const [shownCards, setShownCards] = useState<Set<string>>(new Set());
  const [transitioning, setTransitioning] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);

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
          // For agent messages: if the last message is also agent, check if it's
          // a streaming update (same message growing) or a new separate message
          const last = prev[prev.length - 1];
          if (last && last.role === "agent" && role === "agent") {
            // If the new text starts with the old text, it's streaming - update in place
            if (cleanText.startsWith(last.text.substring(0, Math.min(last.text.length, 20)))) {
              return [...prev.slice(0, -1), { role, text: cleanText, id: last.id }];
            }
            // Otherwise it's a genuinely new agent message - append it
            return [...prev, { role, text: cleanText, id: msgIdCounter++ }];
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

  // On mobile, scroll input into view when keyboard opens
  const handleFocus = useCallback(() => {
    setTimeout(() => {
      inputRef.current?.scrollIntoView({ behavior: "smooth", block: "center" });
    }, 300);
  }, []);

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

    // Trigger exit animation on current messages
    setTransitioning(true);

    // After exit animation, add user message and clear transition
    setTimeout(() => {
      setMessages((prev) => [...prev, { role: "user", text, id: msgIdCounter++ }]);
      setTransitioning(false);
    }, 250);

    if (conversation.status !== "connected") {
      startConversation(text);
    } else {
      conversation.sendUserMessage(text);
    }
  }, [input, conversation, startConversation]);

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
      setInput(e.target.value);
      if (conversation.status === "connected") {
        conversation.sendUserActivity();
      }
    },
    [conversation]
  );

  const markCardShown = useCallback((cardType: string) => {
    setShownCards((prev) => new Set(prev).add(cardType));
  }, []);

  const isConnecting = conversation.status === "connecting";
  const isConnected = conversation.status === "connected";

  // Derive visible messages: latest user message + all agent messages since that user message
  const { lastUserMsg, agentMessages } = useMemo(() => {
    let lastUser: ChatMessage | null = null;
    let lastUserIdx = -1;

    // Find the last user message
    for (let i = messages.length - 1; i >= 0; i--) {
      if (messages[i].role === "user") {
        lastUser = messages[i];
        lastUserIdx = i;
        break;
      }
    }

    // Collect all agent messages after the last user message
    // (or all agent messages if no user message yet)
    const agents: ChatMessage[] = [];
    const startIdx = lastUserIdx >= 0 ? lastUserIdx + 1 : 0;
    for (let i = startIdx; i < messages.length; i++) {
      if (messages[i].role === "agent") {
        agents.push(messages[i]);
      }
    }

    // If no agent messages after user, include the initial/last agent before user
    if (agents.length === 0 && lastUserIdx < 0) {
      for (let i = messages.length - 1; i >= 0; i--) {
        if (messages[i].role === "agent") {
          agents.push(messages[i]);
          break;
        }
      }
    }

    return { lastUserMsg: lastUser, agentMessages: agents };
  }, [messages]);

  // Detect card for the last agent message
  const lastAgentMsg = agentMessages.length > 0 ? agentMessages[agentMessages.length - 1] : null;
  const cardType = lastAgentMsg && messages.length > 1 ? detectCard(lastAgentMsg.text) : null;
  const shouldShowCard = cardType && !shownCards.has(cardType);

  return (
    <div className="two-msg">
      {/* User's latest message (top) */}
      {lastUserMsg && (
        <div
          key={`u-${lastUserMsg.id}`}
          className={`two-msg-card two-msg-user ${transitioning ? "two-msg-exit" : "two-msg-enter"}`}
        >
          <div className="two-msg-text">{lastUserMsg.text}</div>
        </div>
      )}

      {/* AI messages (all since last user message) */}
      {!transitioning && agentMessages.map((msg, idx) => (
        <div
          key={`a-${msg.id}`}
          className={`two-msg-card two-msg-agent two-msg-enter${idx === 0 ? "-delayed" : ""}`}
        >
          <div className="two-msg-agent-indicator">
            <div className="two-msg-agent-dot" />
            <span className="two-msg-agent-label">Huddle Duck AI</span>
          </div>
          <div className="two-msg-text">{msg.text}</div>
        </div>
      ))}

      {/* Typing indicator */}
      {isConnected && conversation.isSpeaking && (
        <div className="two-msg-card two-msg-agent two-msg-typing">
          <div className="two-msg-agent-indicator">
            <div className="two-msg-agent-dot two-msg-agent-dot-speaking" />
          </div>
          <div className="ai-chat-typing">
            <span />
            <span />
            <span />
          </div>
        </div>
      )}

      {/* Connecting state */}
      {isConnecting && (
        <div className="two-msg-card two-msg-agent two-msg-typing">
          <div className="ai-chat-typing">
            <span />
            <span />
            <span />
          </div>
        </div>
      )}

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
          className="two-msg-input"
          placeholder={
            isConnected
              ? "Type a message..."
              : "e.g. I run 5 burger restaurants in London..."
          }
          value={input}
          onChange={handleInputChange}
          onKeyDown={handleKeyDown}
          disabled={isConnecting}
          autoComplete="off"
          autoCorrect="off"
          autoCapitalize="off"
          spellCheck={false}
          data-form-type="other"
          onContextMenu={(e) => e.preventDefault()}
          onFocus={handleFocus}
        />
        <button
          className="two-msg-send"
          onClick={handleSend}
          disabled={!input.trim() || isConnecting}
          aria-label="Send message"
        >
          <svg
            width="18"
            height="18"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
          >
            <line x1="22" y1="2" x2="11" y2="13" />
            <polygon points="22 2 15 22 11 13 2 9 22 2" />
          </svg>
        </button>
      </div>
    </div>
  );
}
