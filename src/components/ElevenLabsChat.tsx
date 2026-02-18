"use client";

import { useEffect, useRef, useState } from "react";
import { track } from "@vercel/analytics";

const AGENT_ID = "4f58a5783e990de16e22e8effd8ba103118c603a76f123afbde18a66f4e1466e";

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
        widgetRef.current.appendChild(widget);
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
        <h2 className="chat-heading">Talk to Our AI</h2>
        <p className="chat-subheading">Ask anything about the pilot. Voice or text.</p>

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

            <p className="chat-placeholder-title">AI Ad Consultant</p>
            <p className="chat-placeholder-desc">
              Powered by ElevenLabs voice AI. Talk naturally or type your questions.
            </p>

            {/* Feature list */}
            <div className="chat-placeholder-features">
              <div className="chat-placeholder-feature">
                <span className="chat-placeholder-feature-dot" />
                How does the 3-week pilot work?
              </div>
              <div className="chat-placeholder-feature">
                <span className="chat-placeholder-feature-dot" />
                What results can I expect?
              </div>
              <div className="chat-placeholder-feature">
                <span className="chat-placeholder-feature-dot" />
                How much should I budget for ad spend?
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
