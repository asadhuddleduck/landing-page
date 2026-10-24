"use client";

import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";

const faqs: { question: string; highlight: string; answer: string }[] = [
  {
    question: "How does the waitlist work?",
    highlight: "waitlist",
    answer:
      "Tell us about your business and we read every one ourselves. We only take on a handful of new clients at a time, and only businesses we're confident we can help, so not everyone gets a spot.",
  },
  {
    question: "Who is this for?",
    highlight: "Who is this for",
    answer:
      "Local businesses people visit in person: restaurants, cafés, gyms, salons, clinics, dental practices, shops. If your customers walk through a door, we can help. We don't currently work with online-only shops or software companies.",
  },
  {
    question: "How do I jump the queue?",
    highlight: "jump the queue",
    answer:
      "After you join, you'll see seven short questions about how content fits into your business right now. Answering them shows us you're serious and helps us get to you sooner.",
  },
  {
    question: "When will I hear back?",
    highlight: "hear back",
    answer:
      "We aim to respond to every signup within a few working days. If we have capacity for you, we'll book a short call to walk through what working together looks like and you can decide whether to move forward.",
  },
  {
    question: "What does working with you look like?",
    highlight: "working with you",
    answer:
      "We get to know your business and your area, plan the campaigns, make the ads from your own photos and videos, then run them on Instagram and Facebook and keep adjusting them while they run. You deal with the same small team from the first call onwards, and you always know where your money is going.",
  },
  {
    question: "We have multiple locations. Does that matter?",
    highlight: "multiple locations",
    answer:
      "It helps. Each location gets its own targeting and ads built for the people nearby. Mention it in the form. Groups with several sites often get seen sooner because there's more to win on both sides.",
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
