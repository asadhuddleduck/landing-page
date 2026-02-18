"use client";

import { useState } from "react";

const faqs = [
  {
    question: "What is the AI Ad Engine Pilot?",
    answer:
      "A 3-week managed advertising engagement where we research your customer avatar, produce ad creative (copy, voiceover, video), build and launch Meta campaigns, optimise weekly, and deliver a tracking report with a strategy review. Think of it as a mutual trial — you see what we can do, and we see if your business is a fit for ongoing management.",
  },
  {
    question: "How long does the pilot run?",
    answer:
      "The managed campaign runs for 3 weeks from launch day. Before that, there is a research and creative production phase where we build your avatar and assets. After the 3-week run, you receive a full tracking report and strategy review call.",
  },
  {
    question: "What platforms do you advertise on?",
    answer:
      "We run campaigns on Meta — Facebook and Instagram. These are the most effective paid channels for F&B businesses targeting local customers. We handle all targeting, creative, and budget allocation.",
  },
  {
    question: "Do I need to provide ad creative or a budget?",
    answer:
      "We produce all creative — ad copy, voiceover scripts, and video assets — as part of the Pilot. We repurpose your existing content into conversion-focused ad variations. You do need to cover your own ad spend separately, with a minimum of £10 per location per day to Meta. The £497 Pilot fee covers our strategy, production, and management work.",
  },
  {
    question: "What happens after the pilot ends?",
    answer:
      "You can upgrade to ongoing management at £1,200 per month — month-to-month, no long-term contracts. Your £497 Pilot fee is credited toward the first month if you upgrade within 30 days. Or you can take the insights from your tracking report and run campaigns yourself.",
  },
];

export default function FAQ() {
  const [openIndex, setOpenIndex] = useState<number | null>(null);

  return (
    <section className="relative z-10 py-20 px-6 max-w-3xl mx-auto">
      <h2
        className="text-3xl md:text-4xl font-black text-center tracking-tight mb-12"
        style={{ color: "var(--text-primary)" }}
      >
        Frequently Asked Questions
      </h2>

      <div className="space-y-3">
        {faqs.map((faq, i) => {
          const isOpen = openIndex === i;
          return (
            <div
              key={i}
              className="rounded-2xl overflow-hidden transition-all duration-300"
              style={{
                background: "var(--gradient-card)",
                border: `1px solid ${isOpen ? "var(--border-bright)" : "var(--border)"}`,
              }}
            >
              <button
                className="w-full px-6 py-5 flex items-center justify-between text-left cursor-pointer"
                onClick={() => setOpenIndex(isOpen ? null : i)}
              >
                <span
                  className="font-semibold text-sm md:text-base"
                  style={{ color: "var(--text-primary)" }}
                >
                  {faq.question}
                </span>
                <svg
                  className="w-5 h-5 flex-shrink-0 transition-transform duration-300"
                  style={{
                    color: "var(--text-muted)",
                    transform: isOpen ? "rotate(180deg)" : "rotate(0deg)",
                  }}
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                  strokeWidth={2}
                >
                  <path strokeLinecap="round" strokeLinejoin="round" d="M19 9l-7 7-7-7" />
                </svg>
              </button>

              <div
                className="overflow-hidden transition-all duration-300"
                style={{
                  maxHeight: isOpen ? "500px" : "0px",
                  opacity: isOpen ? 1 : 0,
                }}
              >
                <p
                  className="px-6 pb-5 text-sm leading-relaxed"
                  style={{ color: "var(--text-secondary)" }}
                >
                  {faq.answer}
                </p>
              </div>
            </div>
          );
        })}
      </div>
    </section>
  );
}
