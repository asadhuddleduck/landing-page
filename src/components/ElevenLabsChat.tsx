"use client";

import { useEffect, useRef, useState } from "react";
import { track } from "@vercel/analytics";
import { getVisitorId, getStoredUtms } from "@/lib/visitor";

const AGENT_ID = "agent_4501khrpmw5ceq8v78xbwzjjjh58";

/** Build dynamic variables for the ElevenLabs agent. */
function buildWidgetVars(): string {
  const visitorId = getVisitorId();
  const utms = getStoredUtms();
  const returningVisitor = localStorage.getItem("hd_has_chatted") === "true";

  const vars = {
    visitor_id: visitorId,
    utm_source: utms.utm_source || "",
    utm_medium: utms.utm_medium || "",
    utm_campaign: utms.utm_campaign || "",
    page_url: window.location.href,
    returning_visitor: returningVisitor ? "true" : "false",
  };

  return btoa(JSON.stringify(vars));
}

export default function ElevenLabsChat() {
  const widgetRef = useRef<HTMLDivElement>(null);
  const loadedRef = useRef(false);
  const [isLoading, setIsLoading] = useState(true);
  const [hasError, setHasError] = useState(false);

  useEffect(() => {
    const script = document.createElement("script");
    script.src = "https://unpkg.com/@elevenlabs/convai-widget-embed";
    script.async = true;

    const timeout = setTimeout(() => {
      if (!loadedRef.current) {
        setHasError(true);
        setIsLoading(false);
        track("widget_error", { reason: "timeout" });
      }
    }, 10000);

    script.onload = () => {
      clearTimeout(timeout);
      loadedRef.current = true;
      if (widgetRef.current && !widgetRef.current.querySelector("elevenlabs-convai")) {
        const widget = document.createElement("elevenlabs-convai");
        widget.setAttribute("agent-id", AGENT_ID);

        // Pass dynamic variables (visitor_id, UTMs, returning_visitor)
        try {
          widget.setAttribute("dynamic-variables", buildWidgetVars());
        } catch {
          // Non-critical — agent works without vars
        }

        widgetRef.current.appendChild(widget);

        // Listen for conversation lifecycle events
        widget.addEventListener("elevenlabs-convai:conversation-started", () => {
          track("conversation_started");
        });

        widget.addEventListener("elevenlabs-convai:conversation-ended", () => {
          localStorage.setItem("hd_has_chatted", "true");
          track("conversation_ended");
        });
      }
      setIsLoading(false);
      track("widget_loaded");
    };

    script.onerror = () => {
      clearTimeout(timeout);
      setHasError(true);
      setIsLoading(false);
      track("widget_error", { reason: "script_error" });
    };

    document.body.appendChild(script);

    return () => {
      clearTimeout(timeout);
      script.remove();
    };
  }, []);

  return (
    <section className="section">
      <div className="chat-section">
        <h2 className="chat-heading">Ask the AI that runs F&B campaigns</h2>
        <p className="chat-subheading">It&apos;s analysed thousands of food &amp; drink campaigns. Ask it anything.</p>

        {hasError && (
          <div className="chat-error">
            <p className="chat-error-text">
              Our AI assistant is temporarily unavailable.
            </p>
            <a href="mailto:hello@huddleduck.co.uk" className="chat-error-cta">
              Email us
            </a>
          </div>
        )}

        {!hasError && (
          <div className="chat-placeholder">
            {/* Icon */}
            <div className="chat-placeholder-icon">
              <svg fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M12 18.75a6 6 0 006-6v-1.5m-6 7.5a6 6 0 01-6-6v-1.5m6 7.5v3.75m-3.75 0h7.5M12 15.75a3 3 0 01-3-3V4.5a3 3 0 116 0v8.25a3 3 0 01-3 3z" />
              </svg>
            </div>

            <p className="chat-placeholder-title">F&B Ad Strategist</p>
            <p className="chat-placeholder-desc">
              Talk naturally or type your questions.
            </p>

            {/* Feature list */}
            <div className="chat-placeholder-features">
              <div className="chat-placeholder-feature">
                <span className="chat-placeholder-feature-dot" />
                How is this different from a marketing agency?
              </div>
              <div className="chat-placeholder-feature">
                <span className="chat-placeholder-feature-dot" />
                What does the AI actually do?
              </div>
              <div className="chat-placeholder-feature">
                <span className="chat-placeholder-feature-dot" />
                Will my ads look like AI made them?
              </div>
            </div>

            {/* Loading indicator or widget */}
            {isLoading ? (
              <div className="chat-loading">
                <div className="chat-loading-dot" />
                <span className="chat-loading-text">Loading voice assistant...</span>
              </div>
            ) : (
              <div ref={widgetRef} style={{ display: "flex", justifyContent: "center", marginTop: 20 }} />
            )}
          </div>
        )}
      </div>
    </section>
  );
}
