"use client";

import { useConversation } from "@elevenlabs/react";
import { useEffect, useRef, useState, useCallback } from "react";
import { track } from "@vercel/analytics";
import { getVisitorId, getStoredUtms } from "@/lib/visitor";

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

interface ElevenLabsChatProps {
  onConversationEnd?: (outcome: string) => void;
}

export default function ElevenLabsChat({ onConversationEnd }: ElevenLabsChatProps) {
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [input, setInput] = useState("");
  const [hasStarted, setHasStarted] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  const conversation = useConversation({
    onMessage: useCallback(({ message, role }: { message: string; role: "user" | "agent"; source: string }) => {
      setMessages((prev) => {
        // Deduplicate — if last message has the same role, update it (streaming)
        const last = prev[prev.length - 1];
        if (last && last.role === role) {
          return [...prev.slice(0, -1), { role, text: message }];
        }
        return [...prev, { role, text: message }];
      });
    }, []),
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

  // Auto-scroll to bottom when messages change
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

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
        // Send the first message if provided
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

  const handleSuggestion = useCallback(
    (text: string) => {
      if (conversation.status !== "connected") {
        startConversation(text);
      } else {
        conversation.sendUserMessage(text);
      }
    },
    [conversation, startConversation]
  );

  const isConnecting = conversation.status === "connecting";
  const isConnected = conversation.status === "connected";
  const showSuggestions = messages.length === 0 && !isConnecting;

  return (
    <div className="ai-chat">
      {/* Messages area */}
      <div className="ai-chat-messages">
        {messages.length === 0 && !isConnecting && (
          <div className="ai-chat-welcome">
            <div className="ai-chat-welcome-orb">
              <div className="ai-chat-orb-core" />
              <div className="ai-chat-orb-ring" />
            </div>
            <p className="ai-chat-welcome-text">
              Ask me anything about growing your F&B brand
            </p>
          </div>
        )}

        {isConnecting && messages.length === 0 && (
          <div className="ai-chat-connecting">
            <div className="ai-chat-typing">
              <span /><span /><span />
            </div>
          </div>
        )}

        {messages.map((msg, i) => (
          <div
            key={i}
            className={`ai-chat-msg ai-chat-msg-${msg.role}`}
          >
            {msg.role === "agent" && (
              <div className="ai-chat-msg-avatar">
                <div className="ai-chat-msg-avatar-dot" />
              </div>
            )}
            <div className="ai-chat-msg-bubble">
              {msg.text}
            </div>
          </div>
        ))}

        {isConnected && conversation.isSpeaking && (
          <div className="ai-chat-msg ai-chat-msg-agent">
            <div className="ai-chat-msg-avatar">
              <div className="ai-chat-msg-avatar-dot ai-chat-msg-avatar-speaking" />
            </div>
            <div className="ai-chat-msg-bubble ai-chat-typing-bubble">
              <div className="ai-chat-typing">
                <span /><span /><span />
              </div>
            </div>
          </div>
        )}

        <div ref={messagesEndRef} />
      </div>

      {/* Suggestion chips */}
      {showSuggestions && (
        <div className="ai-chat-suggestions">
          <button
            onClick={() => handleSuggestion("I run a multi-location restaurant brand — how can you help?")}
            className="ai-chat-chip"
          >
            How can you help my restaurant?
          </button>
          <button
            onClick={() => handleSuggestion("What kind of results do your clients get?")}
            className="ai-chat-chip"
          >
            What results do clients get?
          </button>
          <button
            onClick={() => handleSuggestion("How does the AI Ad Engine pilot work?")}
            className="ai-chat-chip"
          >
            How does the pilot work?
          </button>
        </div>
      )}

      {/* Input bar */}
      <div className="ai-chat-input-bar">
        <input
          ref={inputRef}
          type="text"
          className="ai-chat-input"
          placeholder={isConnected ? "Type a message..." : "Ask about growing your F&B brand..."}
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
          <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <line x1="22" y1="2" x2="11" y2="13" />
            <polygon points="22 2 15 22 11 13 2 9 22 2" />
          </svg>
        </button>
      </div>
    </div>
  );
}
