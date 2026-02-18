"use client";

import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";

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

const fadeUp = {
  hidden: { opacity: 0, y: 15 },
  visible: { opacity: 1, y: 0 },
};

export default function FAQ() {
  const [openIndex, setOpenIndex] = useState<number | null>(null);

  return (
    <section className="relative z-10 section-spacing max-w-3xl mx-auto">
      <motion.h2
        className="font-serif text-3xl md:text-4xl lg:text-5xl font-bold tracking-tight text-center mb-12 md:mb-16"
        style={{ color: "var(--text-primary)" }}
        variants={fadeUp}
        initial="hidden"
        whileInView="visible"
        viewport={{ once: true, margin: "-50px" }}
        transition={{ duration: 0.5, ease: [0.16, 1, 0.3, 1] }}
      >
        Questions
      </motion.h2>

      <div className="space-y-2">
        {faqs.map((faq, i) => {
          const isOpen = openIndex === i;
          return (
            <div
              key={i}
              className="overflow-hidden rounded-2xl transition-colors duration-300"
              style={{
                background: "var(--bg-surface)",
                border: `1px solid ${isOpen ? "var(--border-bright)" : "var(--border)"}`,
              }}
            >
              <button
                className="w-full px-5 py-5 md:px-6 md:py-6 flex items-center justify-between text-left cursor-pointer min-h-[48px]"
                onClick={() => setOpenIndex(isOpen ? null : i)}
              >
                <span
                  className="font-medium text-sm md:text-base pr-4"
                  style={{ color: "var(--text-primary)" }}
                >
                  {faq.question}
                </span>
                <span
                  className="flex-shrink-0 text-sm transition-transform duration-300"
                  style={{
                    color: isOpen ? "var(--viridian)" : "var(--text-muted)",
                    transform: isOpen ? "rotate(180deg)" : "rotate(0deg)",
                  }}
                >
                  <svg
                    className="w-4 h-4"
                    fill="none"
                    viewBox="0 0 24 24"
                    stroke="currentColor"
                    strokeWidth={2}
                  >
                    <path strokeLinecap="round" strokeLinejoin="round" d="M19 9l-7 7-7-7" />
                  </svg>
                </span>
              </button>

              <AnimatePresence initial={false}>
                {isOpen && (
                  <motion.div
                    initial={{ height: 0, opacity: 0 }}
                    animate={{ height: "auto", opacity: 1 }}
                    exit={{ height: 0, opacity: 0 }}
                    transition={{ duration: 0.3, ease: [0.16, 1, 0.3, 1] }}
                    className="overflow-hidden"
                  >
                    <p
                      className="px-5 pb-5 md:px-6 md:pb-6 text-sm leading-relaxed"
                      style={{ color: "var(--text-secondary)" }}
                    >
                      {faq.answer}
                    </p>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>
          );
        })}
      </div>
    </section>
  );
}
