"use client";

import { useEffect, useRef, useState } from "react";
import { motion } from "framer-motion";
import { track } from "@vercel/analytics";

const AGENT_ID = "4f58a5783e990de16e22e8effd8ba103118c603a76f123afbde18a66f4e1466e";

const suggestions = [
  "How does the pilot work?",
  "What results have you seen?",
  "What does £497 include?",
];

const fadeUp = {
  hidden: { opacity: 0, y: 20 },
  visible: { opacity: 1, y: 0 },
};

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
    <section id="ai-chat" className="relative z-10 py-16 px-4 md:py-24 md:px-6">
      {/* Background radial glow */}
      <div
        className="absolute inset-0 pointer-events-none"
        aria-hidden="true"
        style={{
          background: "radial-gradient(ellipse 60% 40% at 50% 50%, rgba(30, 186, 143, 0.06) 0%, transparent 70%)",
        }}
      />

      {/* Floating particles */}
      <div className="absolute inset-0 pointer-events-none" aria-hidden="true">
        <div
          className="particle particle-viridian w-1 h-1 opacity-30"
          style={{ top: "10%", left: "15%", animation: "dot-float-2 9s ease-in-out infinite" }}
        />
        <div
          className="particle particle-sandstorm w-1.5 h-1.5 opacity-20"
          style={{ top: "20%", right: "20%", animation: "dot-float-1 11s ease-in-out infinite" }}
        />
        <div
          className="particle particle-viridian w-1 h-1 opacity-25"
          style={{ bottom: "15%", left: "25%", animation: "dot-float-3 10s ease-in-out infinite" }}
        />
        <div
          className="particle particle-viridian w-1.5 h-1.5 opacity-20"
          style={{ bottom: "25%", right: "12%", animation: "dot-float-2 13s ease-in-out infinite", animationDelay: "-4s" }}
        />
      </div>

      <div className="relative max-w-3xl mx-auto text-center">
        {/* Heading */}
        <motion.h2
          className="text-3xl md:text-4xl lg:text-5xl font-black tracking-tight mb-4"
          style={{ color: "var(--text-primary)" }}
          variants={fadeUp}
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, margin: "-50px" }}
          transition={{ duration: 0.5, ease: [0.16, 1, 0.3, 1] }}
        >
          Ask Our{" "}
          <span
            className="bg-clip-text text-transparent text-glow"
            style={{ backgroundImage: "linear-gradient(135deg, var(--viridian), var(--sandstorm))" }}
          >
            AI Anything
          </span>
        </motion.h2>

        <motion.p
          className="mb-10 text-base md:text-lg max-w-lg mx-auto"
          style={{ color: "var(--text-secondary)" }}
          variants={fadeUp}
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, margin: "-50px" }}
          transition={{ duration: 0.5, ease: [0.16, 1, 0.3, 1], delay: 0.1 }}
        >
          Voice or text. It knows everything about the AI Ad Engine Pilot.
        </motion.p>

        {/* Widget area with glow ring */}
        <motion.div
          className="relative inline-block"
          variants={fadeUp}
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, margin: "-50px" }}
          transition={{ duration: 0.5, ease: [0.16, 1, 0.3, 1], delay: 0.2 }}
        >
          {/* Glow ring behind widget */}
          <div
            className="absolute -inset-4 rounded-full opacity-60 pointer-events-none"
            style={{ animation: "glow-pulse 4s ease-in-out infinite" }}
            aria-hidden="true"
          />

          {isLoading && !hasError && (
            <div className="flex flex-col items-center gap-3">
              {/* Concentric ring loading animation */}
              <div className="relative w-20 h-20">
                <div
                  className="absolute inset-0 rounded-full"
                  style={{
                    border: "2px solid var(--viridian)",
                    opacity: 0.3,
                    animation: "ring-pulse 2s ease-out infinite",
                  }}
                />
                <div
                  className="absolute inset-2 rounded-full"
                  style={{
                    border: "2px solid var(--viridian)",
                    opacity: 0.5,
                    animation: "ring-pulse 2s ease-out infinite 0.4s",
                  }}
                />
                <div
                  className="absolute inset-4 rounded-full"
                  style={{
                    background: "var(--viridian-glow)",
                    animation: "glow-pulse 2s ease-in-out infinite",
                  }}
                />
              </div>
              <span className="text-sm" style={{ color: "var(--text-muted)" }}>
                Connecting to AI...
              </span>
            </div>
          )}

          {hasError && (
            <div className="glass-card p-6 max-w-sm mx-auto">
              <p className="text-sm mb-3" style={{ color: "var(--text-secondary)" }}>
                Our AI assistant is temporarily unavailable. Get in touch directly:
              </p>
              <a
                href="mailto:hello@huddleduck.co.uk"
                className="inline-block px-5 py-2.5 rounded-lg text-sm font-semibold transition-all duration-200 hover:scale-105"
                style={{ background: "var(--gradient-accent)", color: "white" }}
              >
                Email us
              </a>
            </div>
          )}

          {!hasError && <div ref={widgetRef} className="flex justify-center" />}
        </motion.div>

        {/* Suggestion chips */}
        <motion.div
          className="mt-8 flex flex-wrap justify-center gap-2"
          variants={fadeUp}
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, margin: "-50px" }}
          transition={{ duration: 0.5, ease: [0.16, 1, 0.3, 1], delay: 0.4 }}
        >
          {suggestions.map((s) => (
            <span
              key={s}
              className="px-4 py-2 rounded-full text-xs md:text-sm font-medium transition-all duration-200 cursor-default"
              style={{
                background: "var(--glass-bg)",
                backdropFilter: "blur(10px)",
                border: "1px solid var(--border)",
                color: "var(--text-secondary)",
              }}
            >
              &ldquo;{s}&rdquo;
            </span>
          ))}
        </motion.div>
      </div>
    </section>
  );
}
