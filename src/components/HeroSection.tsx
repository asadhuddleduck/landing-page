"use client";

import { motion } from "framer-motion";

const fadeUp = {
  hidden: { opacity: 0, y: 20 },
  visible: { opacity: 1, y: 0 },
};

export default function HeroSection() {
  return (
    <section className="relative z-10 min-h-[100dvh] flex flex-col items-center justify-center px-4 md:px-6 text-center">
      {/* Small label */}
      <motion.p
        className="text-[10px] md:text-xs uppercase tracking-[0.25em] font-medium mb-10 md:mb-14"
        style={{ color: "var(--text-muted)" }}
        variants={fadeUp}
        initial="hidden"
        animate="visible"
        transition={{ duration: 0.5, ease: [0.16, 1, 0.3, 1], delay: 0.1 }}
      >
        AI-Powered Advertising
      </motion.p>

      {/* Singularity orb */}
      <motion.div
        className="singularity mb-12 md:mb-16"
        initial={{ opacity: 0, scale: 0.8 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ duration: 0.8, ease: [0.16, 1, 0.3, 1], delay: 0.2 }}
      >
        <div className="singularity-glow" />
        <div className="singularity-core" />
        <div className="singularity-ring" />
        <div className="singularity-ring-outer" />
      </motion.div>

      {/* Serif headline */}
      <motion.h1
        className="font-serif text-4xl md:text-5xl lg:text-7xl font-black tracking-tight leading-[1.05]"
        style={{ color: "var(--text-primary)" }}
        variants={fadeUp}
        initial="hidden"
        animate="visible"
        transition={{ duration: 0.6, ease: [0.16, 1, 0.3, 1], delay: 0.5 }}
      >
        Your AI Ad Engine
      </motion.h1>

      {/* One line of body copy */}
      <motion.p
        className="mt-5 md:mt-6 text-sm md:text-base max-w-md mx-auto leading-relaxed"
        style={{ color: "var(--text-secondary)" }}
        variants={fadeUp}
        initial="hidden"
        animate="visible"
        transition={{ duration: 0.5, ease: [0.16, 1, 0.3, 1], delay: 0.7 }}
      >
        3-week managed pilot for multi-location F&B. £497.
      </motion.p>

      {/* Single CTA */}
      <motion.div
        variants={fadeUp}
        initial="hidden"
        animate="visible"
        transition={{ duration: 0.5, ease: [0.16, 1, 0.3, 1], delay: 0.9 }}
      >
        <a
          href="#checkout"
          className="checkout-btn inline-block mt-8 md:mt-10 px-8 py-3.5 rounded-full text-white font-semibold text-sm md:text-base tracking-tight transition-all duration-300 hover:scale-105"
        >
          Start Your Pilot
        </a>
      </motion.div>
    </section>
  );
}
