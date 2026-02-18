"use client";

import { useState } from "react";
import ElevenLabsChat from "./ElevenLabsChat";
import StickyCheckoutCTA from "./StickyCheckoutCTA";

export default function HeroChatSection() {
  const [chatOutcome, setChatOutcome] = useState("");

  return (
    <>
      <section className="hero">
        <p className="hero-label">For Multi-Location F&B</p>

        <div className="singularity">
          <div className="singularity-glow" />
          <div className="singularity-core" />
          <div className="singularity-ring" />
          <div className="singularity-ring-outer" />
        </div>

        <h1 className="hero-headline">Make sure everyone within 3km knows about you</h1>

        {/* Chat widget: the main interaction */}
        <div className="hero-chat">
          <ElevenLabsChat onConversationEnd={(outcome) => setChatOutcome(outcome)} />
        </div>
      </section>

      <StickyCheckoutCTA chatOutcome={chatOutcome} />
    </>
  );
}
