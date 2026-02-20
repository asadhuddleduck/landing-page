"use client";

import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";

const faqs = [
  {
    question: "What is the AI Ad Engine Pilot?",
    answer:
      "A 3-week managed advertising engagement. The AI researches your customer avatar, produces ad creative (copy, voiceover, video), builds and launches campaigns, optimises weekly, and delivers a tracking report with a strategy review. Think of it as a mutual trial. You see what I can do, and I learn whether your business is a fit for ongoing management.",
  },
  {
    question: "How long does the pilot run?",
    answer:
      "The managed campaign runs for 3 weeks from launch day. Before that, there is a research and creative production phase where the AI builds your avatar and assets. After the 3-week run, you receive a full tracking report and strategy review call.",
  },
  {
    question: "What platforms do you advertise on?",
    answer:
      "Meta (Facebook and Instagram), but not the way most agencies use it. Most agencies run standard Meta ads, which rarely work for food businesses. The AI uses Meta\u2019s API as a delivery vehicle to reach a specific customer avatar at scale. The strategy is the avatar research and targeting. Meta is just how it gets delivered.",
  },
  {
    question: "Do I need to provide ad creative or a budget?",
    answer:
      "All creative (ad copy, voiceover scripts, and video assets) is produced as part of the Pilot. The AI repurposes your existing content into conversion-focused ad variations. You do need to cover your own ad spend separately, with a minimum of £10 per location per day to Meta. The £497 Pilot fee covers strategy, production, and management.",
  },
  {
    question: "Will my ads look like they were made by AI?",
    answer:
      "No. The AI never generates content from scratch. Your customers can spot that instantly and it erodes trust. Instead, it takes your existing social media content and remakes it into conversion-focused ad variations. Your food, your brand, your voice. The AI handles the research, targeting, and optimisation. The creative is always built from real content.",
  },
  {
    question: "How is this different from hiring a marketing agency?",
    answer:
      "A traditional agency charges £2,000 to 5,000 per month, takes weeks to onboard, and runs generic playbooks. The AI deep-researches your specific audience, competitors, and market before a single ad goes live. You get a strategy built on data, not guesswork, at a fraction of the cost. The Pilot is £497 for 3 weeks of fully managed campaigns. Compare that to a single billboard, a TV commercial, or a month with a traditional agency.",
  },
  {
    question: "What happens after the pilot ends?",
    answer:
      "You can upgrade to ongoing management. Month-to-month, no long-term contracts. Your £497 Pilot fee is fully credited when you upgrade within 30 days. Or you can take the insights from your tracking report and run campaigns yourself.",
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
