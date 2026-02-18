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

const headingVariant = {
  hidden: { opacity: 0, y: 20 },
  visible: { opacity: 1, y: 0 },
};

const itemVariant = {
  hidden: { opacity: 0, y: 20 },
  visible: { opacity: 1, y: 0 },
};

export default function FAQ() {
  const [openIndex, setOpenIndex] = useState<number | null>(null);

  return (
    <section className="relative z-10 py-12 px-4 md:py-20 md:px-6 max-w-3xl mx-auto">
      <motion.div
        className="text-center mb-12 md:mb-16"
        variants={headingVariant}
        initial="hidden"
        whileInView="visible"
        viewport={{ once: true, margin: "-50px" }}
        transition={{ duration: 0.5, ease: [0.16, 1, 0.3, 1] }}
      >
        <h2
          className="text-3xl md:text-4xl lg:text-5xl font-black tracking-tight"
          style={{ color: "var(--text-primary)" }}
        >
          Frequently Asked Questions
        </h2>
        <div
          className="mt-3 mx-auto h-1 w-16 rounded-full"
          style={{ background: "var(--gradient-accent)" }}
        />
      </motion.div>

      <div className="space-y-3">
        {faqs.map((faq, i) => {
          const isOpen = openIndex === i;
          return (
            <motion.div
              key={i}
              variants={itemVariant}
              initial="hidden"
              whileInView="visible"
              viewport={{ once: true, margin: "-40px" }}
              transition={{
                duration: 0.45,
                ease: [0.16, 1, 0.3, 1],
                delay: i * 0.06,
              }}
              className="glass-card overflow-hidden transition-all duration-300"
              style={{
                borderColor: isOpen ? "var(--border-bright)" : undefined,
                boxShadow: isOpen
                  ? "0 0 30px rgba(30, 186, 143, 0.1), 0 8px 30px rgba(0, 0, 0, 0.2)"
                  : undefined,
              }}
            >
              <button
                className="w-full px-5 py-4 md:px-6 md:py-5 flex items-center justify-between text-left cursor-pointer min-h-[48px]"
                onClick={() => setOpenIndex(isOpen ? null : i)}
              >
                <span
                  className="font-semibold text-sm md:text-base pr-4"
                  style={{ color: "var(--text-primary)" }}
                >
                  {faq.question}
                </span>
                <span
                  className="flex-shrink-0 w-6 h-6 rounded-full flex items-center justify-center text-sm font-bold transition-all duration-300"
                  style={{
                    background: isOpen ? "var(--viridian-glow)" : "transparent",
                    color: isOpen ? "var(--viridian)" : "var(--text-muted)",
                    border: `1px solid ${isOpen ? "rgba(30, 186, 143, 0.3)" : "var(--border)"}`,
                  }}
                >
                  <svg
                    className="w-3.5 h-3.5 transition-transform duration-300"
                    style={{ transform: isOpen ? "rotate(180deg)" : "rotate(0deg)" }}
                    fill="none"
                    viewBox="0 0 24 24"
                    stroke="currentColor"
                    strokeWidth={2.5}
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
                      className="px-5 pb-4 md:px-6 md:pb-5 text-sm leading-relaxed"
                      style={{ color: "var(--text-secondary)" }}
                    >
                      {faq.answer}
                    </p>
                  </motion.div>
                )}
              </AnimatePresence>
            </motion.div>
          );
        })}
      </div>
    </section>
  );
}
