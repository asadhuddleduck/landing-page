"use client";

import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";

const faqs: { question: string; highlight: string; answer: string }[] = [
  {
    question: "How does the waitlist work?",
    highlight: "waitlist",
    answer:
      "You tell us about your business, we review every applicant by hand, and we onboard new clients in waves as capacity opens up. We only take on businesses we believe we can move the needle for, so not every applicant gets a spot.",
  },
  {
    question: "Who is this for?",
    highlight: "Who is this for",
    answer:
      "Local businesses with a physical presence — restaurants, cafés, gyms, salons, clinics, dental practices, retail. If your customers walk through a door, we can help. We don't currently work with pure e-commerce or B2B SaaS.",
  },
  {
    question: "How do I jump the queue?",
    highlight: "jump the queue",
    answer:
      "After joining the waitlist you'll see a short follow-up form — seven questions about how content currently fits into your business. Answering it tells us you're serious and gives us the context to prioritise you ahead of less-engaged signups.",
  },
  {
    question: "When will I hear back?",
    highlight: "hear back",
    answer:
      "We aim to respond to every signup within a few working days. If we have capacity for you, we'll book a short call to walk through what working together looks like and you can decide whether to move forward.",
  },
  {
    question: "How is this different from a marketing agency?",
    highlight: "different from a marketing agency",
    answer:
      "Traditional agencies onboard slowly, run a generic playbook, and charge thousands per month regardless of results. We use AI to do deep research on your specific audience, competitors, and local market before a single ad goes live — strategy built on data, not guesswork.",
  },
  {
    question: "We have multiple locations. Does that matter?",
    highlight: "multiple locations",
    answer:
      "It helps. Each location gets its own targeting and creative tailored to its local audience. Mention it in the brief info field — multi-location operators often jump the queue because the upside is bigger on both sides.",
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
