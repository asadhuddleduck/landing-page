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
    <section className="relative z-10 py-16 px-6">
      <div className="max-w-3xl mx-auto text-center">
        <h2 className="text-3xl md:text-4xl font-black tracking-tight mb-4" style={{ color: "var(--text-primary)" }}>
          Talk to Our{" "}
          <span
            className="bg-clip-text text-transparent"
            style={{ backgroundImage: "linear-gradient(135deg, var(--viridian), var(--sandstorm))" }}
          >
            AI Assistant
          </span>
        </h2>
        <p className="mb-8 max-w-xl mx-auto" style={{ color: "var(--text-secondary)" }}>
          Have questions about the AI Ad Engine Pilot? Our AI assistant knows
          everything about our service. Ask it anything — by text or voice.
        </p>

        {isLoading && !hasError && (
          <div className="flex justify-center">
            <div
              className="w-16 h-16 rounded-full animate-pulse"
              style={{ background: "rgba(30, 186, 143, 0.2)" }}
            />
          </div>
        )}

        {hasError && (
          <div
            className="rounded-2xl p-6 max-w-sm mx-auto"
            style={{ background: "var(--night-card)" }}
          >
            <p className="text-sm mb-3" style={{ color: "var(--text-secondary)" }}>
              Our AI assistant is temporarily unavailable. Get in touch directly:
            </p>
            <a
              href="mailto:hello@huddleduck.co.uk"
              className="inline-block px-4 py-2 rounded-lg text-sm font-semibold transition-all duration-200"
              style={{ background: "var(--viridian)", color: "white" }}
            >
              Email us
            </a>
          </div>
        )}

        {!hasError && <div ref={widgetRef} className="flex justify-center" />}
      </div>
    </section>
  );
}
