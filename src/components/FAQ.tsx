"use client";

import { useState } from "react";

const faqs = [
  {
    question: "What is the AI Ad Engine Pilot?",
    answer:
      "The Pilot is a 4-week managed advertising programme where our AI builds, launches, and optimises Meta ad campaigns for your F&B business. You get a dedicated account manager and real-time dashboard to track results.",
  },
  {
    question: "How long does the pilot run?",
    answer:
      "The pilot runs for 4 weeks from the day your first campaign goes live. This gives us enough data to demonstrate real results and optimise your campaigns.",
  },
  {
    question: "What platforms do you advertise on?",
    answer:
      "We run campaigns on Meta platforms — Facebook and Instagram. These are the most effective channels for F&B businesses to reach local customers.",
  },
  {
    question: "Do I need to provide my own ad creative?",
    answer:
      "No. Our AI generates ad creative tailored to your brand and audience. We handle everything from copy to visuals. You just approve and we launch.",
  },
  {
    question: "What happens after the pilot ends?",
    answer:
      "After the pilot, you can continue with a monthly management plan or take the insights and run campaigns yourself. There are no contracts or lock-ins.",
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
                  maxHeight: isOpen ? "200px" : "0px",
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
