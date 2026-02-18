"use client";

import { useEffect, useRef, useState } from "react";
import { motion } from "framer-motion";
import { track } from "@vercel/analytics";

const AGENT_ID = "4f58a5783e990de16e22e8effd8ba103118c603a76f123afbde18a66f4e1466e";

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
    <section id="ai-chat" className="relative z-10 section-spacing">
      <div className="max-w-3xl mx-auto text-center">
        {/* Heading */}
        <motion.h2
          className="font-serif text-3xl md:text-4xl lg:text-5xl font-bold tracking-tight mb-4"
          style={{ color: "var(--text-primary)" }}
          variants={fadeUp}
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, margin: "-50px" }}
          transition={{ duration: 0.5, ease: [0.16, 1, 0.3, 1] }}
        >
          Talk to Our AI
        </motion.h2>

        <motion.p
          className="mb-12 md:mb-16 text-sm md:text-base"
          style={{ color: "var(--text-secondary)" }}
          variants={fadeUp}
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, margin: "-50px" }}
          transition={{ duration: 0.5, ease: [0.16, 1, 0.3, 1], delay: 0.1 }}
        >
          Ask anything about the pilot. Voice or text.
        </motion.p>

        {/* Widget area */}
        <motion.div
          variants={fadeUp}
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, margin: "-50px" }}
          transition={{ duration: 0.5, ease: [0.16, 1, 0.3, 1], delay: 0.2 }}
        >
          {isLoading && !hasError && (
            <div className="flex items-center justify-center gap-3">
              <div
                className="w-2 h-2 rounded-full animate-pulse"
                style={{ background: "var(--viridian)" }}
              />
              <span className="text-sm" style={{ color: "var(--text-muted)" }}>
                Connecting...
              </span>
            </div>
          )}

          {hasError && (
            <div className="card p-6 max-w-sm mx-auto">
              <p className="text-sm mb-3" style={{ color: "var(--text-secondary)" }}>
                Our AI assistant is temporarily unavailable.
              </p>
              <a
                href="mailto:hello@huddleduck.co.uk"
                className="checkout-btn inline-block px-5 py-2.5 rounded-full text-sm font-semibold text-white transition-all duration-200 hover:scale-105"
              >
                Email us
              </a>
            </div>
          )}

          {!hasError && <div ref={widgetRef} className="flex justify-center" />}
        </motion.div>
      </div>
    </section>
  );
}
