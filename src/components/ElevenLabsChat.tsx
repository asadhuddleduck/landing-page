"use client";

import { useConversation } from "@elevenlabs/react";
import { useEffect, useRef, useState, useCallback } from "react";
import { track } from "@vercel/analytics";
import { getVisitorId, getStoredUtms } from "@/lib/visitor";
import { PricingCard, TestimonialCard, CTACard } from "./ChatCards";

const AGENT_ID = "agent_4501khrpmw5ceq8v78xbwzjjjh58";

interface ChatMessage {
  role: "user" | "agent";
  text: string;
}

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
  // Fake initial message so the AI "speaks first"
  const [messages, setMessages] = useState<ChatMessage[]>([
    {
      role: "agent",
      text: "Hey! I help F&B brands fill their locations with paid ads. Tell me about your business and I'll show you what we can do.",
    },
  ]);
  const [input, setInput] = useState("");
  const [hasStarted, setHasStarted] = useState(false);
  const [isAgentTyping, setIsAgentTyping] = useState(false);
  const [shownCards, setShownCards] = useState<Set<string>>(new Set());
  const messagesContainerRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);
  const typingTimeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  const conversation = useConversation({
    onMessage: useCallback(
      ({ message, role }: { message: string; role: "user" | "agent"; source: string }) => {
        if (role === "agent") {
          // Show typing indicator briefly before revealing message
          setIsAgentTyping(true);
          if (typingTimeoutRef.current) clearTimeout(typingTimeoutRef.current);
          typingTimeoutRef.current = setTimeout(() => {
            setIsAgentTyping(false);
            setMessages((prev) => {
              // Dedup: if last message has the same role, update it (streaming)
              const last = prev[prev.length - 1];
              if (last && last.role === role) {
                return [...prev.slice(0, -1), { role, text: message }];
              }
              return [...prev, { role, text: message }];
            });
          }, 400);
        } else {
          // User messages appear immediately
          setMessages((prev) => {
            const last = prev[prev.length - 1];
            if (last && last.role === role) {
              return [...prev.slice(0, -1), { role, text: message }];
            }
            return [...prev, { role, text: message }];
          });
        }
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

  // Auto-scroll the messages container (not the page)
  useEffect(() => {
    const container = messagesContainerRef.current;
    if (container) {
      container.scrollTo({ top: container.scrollHeight, behavior: "smooth" });
    }
  }, [messages, isAgentTyping]);

  // Cleanup typing timeout on unmount
  useEffect(() => {
    return () => {
      if (typingTimeoutRef.current) clearTimeout(typingTimeoutRef.current);
    };
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

  // Mark a card as shown so it only appears once
  const markCardShown = useCallback((cardType: string) => {
    setShownCards((prev) => new Set(prev).add(cardType));
  }, []);

  const isConnecting = conversation.status === "connecting";
  const isConnected = conversation.status === "connected";

  // Progress bar: fills based on conversation depth
  const messageCount = messages.length;
  const progress =
    messageCount <= 1
      ? 0
      : messageCount <= 3
        ? 15
        : messageCount <= 5
          ? 35
          : messageCount <= 7
            ? 55
            : messageCount <= 9
              ? 75
              : 90;

  return (
    <div className="ai-chat">
      {/* Progress bar */}
      {progress > 0 && (
        <div className="ai-chat-progress">
          <div className="ai-chat-progress-bar" style={{ width: `${progress}%` }} />
        </div>
      )}

      {/* Messages area */}
      <div ref={messagesContainerRef} className="ai-chat-messages">
        {isConnecting && messages.length <= 1 && (
          <div className="ai-chat-connecting">
            <div className="ai-chat-typing">
              <span />
              <span />
              <span />
            </div>
          </div>
        )}

        {messages.map((msg, i) => {
          // Determine if this agent message should show a rich card
          const cardType =
            msg.role === "agent" && i > 0 ? detectCard(msg.text) : null;
          const shouldShowCard = cardType && !shownCards.has(cardType);

          return (
            <div key={i}>
              <div
                className={`ai-chat-msg ai-chat-msg-${msg.role}`}
              >
                {msg.role === "agent" && (
                  <div className="ai-chat-msg-avatar">
                    <div className="ai-chat-msg-avatar-dot" />
                  </div>
                )}
                <div className="ai-chat-msg-bubble">{msg.text}</div>
              </div>

              {/* Rich card below the message */}
              {shouldShowCard && cardType === "pricing" && (
                <PricingCard onShow={() => markCardShown("pricing")} />
              )}
              {shouldShowCard && cardType === "testimonial" && (
                <TestimonialCard
                  text={msg.text}
                  onShow={() => markCardShown("testimonial")}
                />
              )}
              {shouldShowCard && cardType === "cta" && (
                <CTACard onShow={() => markCardShown("cta")} />
              )}
            </div>
          );
        })}

        {/* Typing indicator */}
        {(isAgentTyping || (isConnected && conversation.isSpeaking)) && (
          <div className="ai-chat-msg ai-chat-msg-agent">
            <div className="ai-chat-msg-avatar">
              <div className="ai-chat-msg-avatar-dot ai-chat-msg-avatar-speaking" />
            </div>
            <div className="ai-chat-msg-bubble ai-chat-typing-bubble">
              <div className="ai-chat-typing">
                <span />
                <span />
                <span />
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Input bar */}
      <div className="ai-chat-input-bar">
        <input
          ref={inputRef}
          type="text"
          className="ai-chat-input"
          placeholder={
            isConnected
              ? "Type a message..."
              : "e.g. I run 5 burger restaurants in London..."
          }
          value={input}
          onChange={handleInputChange}
          onKeyDown={handleKeyDown}
          disabled={isConnecting}
        />
        <button
          className="ai-chat-send"
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
