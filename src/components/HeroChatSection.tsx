"use client";

import { useState } from "react";
import HeroAnimation from "./HeroAnimation";
import ElevenLabsChat from "./ElevenLabsChat";

export default function HeroChatSection() {
  const [, setChatOutcome] = useState("");

  return (
    <section className="hero">
      <h1 className="hero-headline">What happens when AI runs your ads?</h1>

      <HeroAnimation />

      <div className="hero-chat">
        <ElevenLabsChat onConversationEnd={(outcome) => setChatOutcome(outcome)} />
      </div>
    </section>
  );
}
