"use client";

import { motion } from "framer-motion";

const metrics = [
  { number: "15+", label: "locations", brand: "Phat Buns" },
  { number: "12,000", label: "followers", brand: "Dough Club" },
  { number: "4,000+", label: "attendees", brand: "Shakedown" },
  { number: "676", label: "enquiries", brand: "F&B Franchise" },
];

const fadeUp = {
  hidden: { opacity: 0, y: 15 },
  visible: { opacity: 1, y: 0 },
};

export default function SocialProof() {
  return (
    <section className="relative z-10 section-spacing">
      <motion.div
        className="max-w-4xl mx-auto grid grid-cols-2 md:grid-cols-4 gap-8 md:gap-4"
        initial="hidden"
        whileInView="visible"
        viewport={{ once: true, margin: "-50px" }}
        transition={{ staggerChildren: 0.1 }}
      >
        {metrics.map((m) => (
          <motion.div
            key={m.brand}
            className="text-center"
            variants={fadeUp}
            transition={{ duration: 0.5, ease: [0.16, 1, 0.3, 1] }}
          >
            <p
              className="font-serif text-3xl md:text-4xl font-bold"
              style={{ color: "var(--text-primary)" }}
            >
              {m.number}
            </p>
            <p
              className="text-xs md:text-sm mt-1"
              style={{ color: "var(--text-muted)" }}
            >
              {m.label}
            </p>
            <p
              className="text-[10px] md:text-xs mt-2 font-medium"
              style={{ color: "var(--viridian)" }}
            >
              {m.brand}
            </p>
          </motion.div>
        ))}
      </motion.div>
    </section>
  );
}
