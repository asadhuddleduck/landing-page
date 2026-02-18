"use client";

import { useEffect, useRef, useState, useCallback } from "react";
import { track } from "@vercel/analytics";
import { getVisitorId, getStoredUtms } from "@/lib/visitor";

const AGENT_ID = "agent_4501khrpmw5ceq8v78xbwzjjjh58";

/** Build dynamic variables for the ElevenLabs agent. */
function buildWidgetVars(): string {
  const visitorId = getVisitorId();
  const utms = getStoredUtms();
  const returningVisitor = localStorage.getItem("hd_has_chatted") === "true";

  // Conversation memory — pass previous session data if available
  const prevData = localStorage.getItem("hd_prev_conversation");
  let prevVars = {
    prev_business_name: "",
    prev_challenge: "",
    prev_outcome: "",
    prev_location_count: "",
  };
  if (prevData) {
    try {
      prevVars = { ...prevVars, ...JSON.parse(prevData) };
    } catch {
      // ignore corrupt data
    }
  }

  const vars = {
    visitor_id: visitorId,
    utm_source: utms.utm_source || "",
    utm_medium: utms.utm_medium || "",
    utm_campaign: utms.utm_campaign || "",
    page_url: window.location.href,
    returning_visitor: returningVisitor ? "true" : "false",
    ...prevVars,
  };

  return btoa(JSON.stringify(vars));
}

interface ElevenLabsChatProps {
  onConversationEnd?: (outcome: string) => void;
}

export default function ElevenLabsChat({ onConversationEnd }: ElevenLabsChatProps) {
  const widgetRef = useRef<HTMLDivElement>(null);
  const loadedRef = useRef(false);
  const [hasError, setHasError] = useState(false);

  const handleConversationEnd = useCallback(() => {
    localStorage.setItem("hd_has_chatted", "true");
    track("conversation_ended");

    // Save conversation details for memory on next visit
    const outcome = "COMPLETED";
    try {
      const existing = localStorage.getItem("hd_prev_conversation");
      if (!existing) {
        localStorage.setItem(
          "hd_prev_conversation",
          JSON.stringify({ prev_outcome: outcome })
        );
      }
    } catch {
      // non-critical
    }

    onConversationEnd?.(outcome);
  }, [onConversationEnd]);

  useEffect(() => {
    const script = document.createElement("script");
    script.src = "https://unpkg.com/@elevenlabs/convai-widget-embed";
    script.async = true;

    const timeout = setTimeout(() => {
      if (!loadedRef.current) {
        setHasError(true);
        track("widget_error", { reason: "timeout" });
      }
    }, 15000);

    script.onload = () => {
      clearTimeout(timeout);
      loadedRef.current = true;
      if (widgetRef.current && !widgetRef.current.querySelector("elevenlabs-convai")) {
        const widget = document.createElement("elevenlabs-convai");
        widget.setAttribute("agent-id", AGENT_ID);
        widget.setAttribute("variant", "expanded");
        widget.setAttribute("dismissible", "false");

        // Brand orb colours
        widget.setAttribute("avatar-orb-color-1", "#1EBA8F");
        widget.setAttribute("avatar-orb-color-2", "#00334B");

        // Pass dynamic variables (visitor_id, UTMs, returning_visitor, memory)
        try {
          widget.setAttribute("dynamic-variables", buildWidgetVars());
        } catch {
          // Non-critical — agent works without vars
        }

        widgetRef.current.appendChild(widget);

        widget.addEventListener("elevenlabs-convai:conversation-started", () => {
          track("conversation_started");
        });

        widget.addEventListener("elevenlabs-convai:conversation-ended", () => {
          handleConversationEnd();
        });
      }
      track("widget_loaded");
    };

    script.onerror = () => {
      clearTimeout(timeout);
      setHasError(true);
      track("widget_error", { reason: "script_error" });
    };

    document.body.appendChild(script);

    return () => {
      clearTimeout(timeout);
      script.remove();
    };
  }, [handleConversationEnd]);

  if (hasError) {
    return (
      <div className="chat-container">
        <div className="chat-error">
          <p className="chat-error-text">
            Our AI assistant is temporarily unavailable.
          </p>
          <a href="mailto:hello@huddleduck.co.uk" className="chat-error-cta">
            Email us
          </a>
        </div>
      </div>
    );
  }

  return (
    <div className="chat-container">
      <div ref={widgetRef} className="chat-widget-wrapper" />
    </div>
  );
}
