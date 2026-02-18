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
      "You can upgrade to ongoing management — month-to-month, no long-term contracts. Your £497 Pilot fee is fully credited when you upgrade within 30 days. Or you can take the insights from your tracking report and run campaigns yourself.",
  },
];

export default function FAQ() {
  const [openIndex, setOpenIndex] = useState<number | null>(null);

  return (
    <section className="section">
      <div className="faq-section">
        <h2 className="faq-title">Questions</h2>

        <div className="faq-list">
          {faqs.map((faq, i) => {
            const isOpen = openIndex === i;
            return (
              <div key={i} className={`faq-item${isOpen ? " open" : ""}`}>
                <button
                  className="faq-question"
                  onClick={() => setOpenIndex(isOpen ? null : i)}
                >
                  <span>{faq.question}</span>
                  <svg
                    className="faq-chevron"
                    fill="none"
                    viewBox="0 0 24 24"
                    stroke="currentColor"
                    strokeWidth={2}
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      d="M19 9l-7 7-7-7"
                    />
                  </svg>
                </button>

                <AnimatePresence initial={false}>
                  {isOpen && (
                    <motion.div
                      initial={{ height: 0, opacity: 0 }}
                      animate={{ height: "auto", opacity: 1 }}
                      exit={{ height: 0, opacity: 0 }}
                      transition={{ duration: 0.3, ease: [0.16, 1, 0.3, 1] }}
                      style={{ overflow: "hidden" }}
                    >
                      <p className="faq-answer">{faq.answer}</p>
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
}
