"use client";

import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";

const faqs: { question: string; highlight: string; answer: string }[] = [
  {
    question: "What do I get for £497?",
    highlight: "£497",
    answer:
      "A fully managed 3-week advertising campaign. The AI researches your audience, produces ad creative from your existing content, builds and launches your campaigns, and optimises them weekly. At the end, you get a full performance report and a strategy review call. Think of it as a mutual trial. You see real results, and we both decide if ongoing management is the right fit.",
  },
  {
    question: "Is ad spend included in the price?",
    highlight: "ad spend included",
    answer:
      "The £497 covers strategy, creative production, and campaign management. Ad spend is separate. You pay Meta directly. We recommend a minimum of £10 per location per day. So for a single location, your total investment is £497 plus roughly £210 in ad spend over the 3 weeks.",
  },
  {
    question: "How is this different from a marketing agency?",
    highlight: "different from a marketing agency",
    answer:
      "A traditional agency charges £2,000 to £5,000 per month, takes weeks to onboard, and runs the same playbook for every client. The AI deep-researches your specific audience, competitors, and local market before a single ad goes live. You get a strategy built on data, not guesswork. The Trial is £497 for 3 weeks of fully managed campaigns. Compare that to a single month with a traditional agency.",
  },
  {
    question: "What happens when the trial ends?",
    highlight: "when the trial ends",
    answer:
      "Two options. You can upgrade to AI Ad Engine Unlimited at £1,300 per month for ongoing AI-managed campaigns, monthly reports, and strategy calls. Month-to-month, cancel any time. Or you take the insights from your performance report and run things yourself. Either way, your £497 Trial fee is fully credited if you upgrade within 30 days.",
  },
  {
    question: "Is there a long-term contract?",
    highlight: "long-term contract",
    answer:
      "No. The Trial is a one-time payment. If you upgrade to Unlimited, it's month-to-month. No lock-in, no cancellation fees, no notice period. You stay because the results make sense, not because of a contract.",
  },
  {
    question: "We have multiple locations. Does the price change?",
    highlight: "multiple locations",
    answer:
      "Same price, whether you have 2 locations or 200. Each location gets its own targeting and campaigns tailored to its local audience. Start with a Trial or Unlimited plan and we scale from there.",
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
                  <span>
                    {(() => {
                      const idx = faq.question.indexOf(faq.highlight);
                      if (idx === -1) return faq.question;
                      const before = faq.question.slice(0, idx);
                      const after = faq.question.slice(idx + faq.highlight.length);
                      return (
                        <>
                          {before}
                          <strong className="faq-highlight">{faq.highlight}</strong>
                          {after}
                        </>
                      );
                    })()}
                  </span>
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
