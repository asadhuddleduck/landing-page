"use client";

import { useState } from "react";
import ElevenLabsChat from "./ElevenLabsChat";

export default function HeroChatSection() {
  const [, setChatOutcome] = useState("");

  return (
    <section className="hero">
      <h1 className="hero-headline">What happens when AI runs your ads?</h1>
      <p className="hero-directive">Tell it about your food business. Watch what happens.</p>

      <div className="hero-chat">
        <ElevenLabsChat onConversationEnd={(outcome) => setChatOutcome(outcome)} />
      </div>
    </section>
  );
}
