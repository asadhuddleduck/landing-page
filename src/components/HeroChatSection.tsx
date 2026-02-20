"use client";

import { useState, useCallback } from "react";
import ElevenLabsChat from "./ElevenLabsChat";
import LogoStrip from "./LogoStrip";

export default function HeroChatSection() {
  const [, setChatOutcome] = useState("");
  const [isTyping, setIsTyping] = useState(false);

  const handleTypingChange = useCallback((typing: boolean) => {
    setIsTyping(typing);
  }, []);

  return (
    <section className="hero">
      <h1 className="hero-headline">Your food looks incredible. Your ads don&apos;t.</h1>

      <div className="hero-chat">
        <ElevenLabsChat
          onConversationEnd={(outcome) => setChatOutcome(outcome)}
          onTypingChange={handleTypingChange}
        />
      </div>

      <div className={`hero-logo-wrap${isTyping ? " hero-logo-wrap--hidden" : ""}`}>
        <LogoStrip />
      </div>
    </section>
  );
}
