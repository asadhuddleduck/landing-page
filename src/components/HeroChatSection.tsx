"use client";

import { useState } from "react";
import ElevenLabsChat from "./ElevenLabsChat";
import LogoStrip from "./LogoStrip";

export default function HeroChatSection() {
  const [, setChatOutcome] = useState("");

  return (
    <section className="hero">
      <h1 className="hero-headline">Your food looks incredible. Your ads don&apos;t.</h1>

      <div className="hero-chat">
        <ElevenLabsChat
          onConversationEnd={(outcome) => setChatOutcome(outcome)}
        />
      </div>

      <div className="hero-logo-wrap">
        <LogoStrip />
      </div>
    </section>
  );
}
