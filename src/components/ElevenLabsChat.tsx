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

        {isLoading && !hasError && (
          <div className="chat-loading">
            <div className="chat-loading-dot" />
            <span className="chat-loading-text">Connecting...</span>
          </div>
        )}

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
          <div ref={widgetRef} style={{ display: "flex", justifyContent: "center" }} />
        )}
      </div>
    </section>
  );
}
