"use client";

import { useEffect, useRef } from "react";

const AGENT_ID = "4f58a5783e990de16e22e8effd8ba103118c603a76f123afbde18a66f4e1466e";

export default function ElevenLabsChat() {
  const widgetRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    // Load the ElevenLabs convai widget script
    const script = document.createElement("script");
    script.src = "https://unpkg.com/@elevenlabs/convai-widget-embed";
    script.async = true;
    document.body.appendChild(script);

    // Create the custom element after script loads
    script.onload = () => {
      if (widgetRef.current && !widgetRef.current.querySelector("elevenlabs-convai")) {
        const widget = document.createElement("elevenlabs-convai");
        widget.setAttribute("agent-id", AGENT_ID);
        widgetRef.current.appendChild(widget);
      }
    };

    return () => {
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

        <div ref={widgetRef} className="flex justify-center" />
      </div>
    </section>
  );
}
