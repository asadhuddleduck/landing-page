"use client";

import { motion } from "framer-motion";

const fadeUp = {
  hidden: { opacity: 0, y: 20 },
  visible: { opacity: 1, y: 0 },
};

const scaleIn = {
  hidden: { opacity: 0, scale: 0.9 },
  visible: { opacity: 1, scale: 1 },
};

export default function HeroSection() {
  return (
    <section className="relative z-10 pt-28 pb-12 px-4 md:pt-32 md:pb-16 md:px-6 text-center max-w-4xl mx-auto overflow-hidden">
      {/* Floating ambient particles */}
      <div className="absolute inset-0 pointer-events-none" aria-hidden="true">
        <div
          className="particle particle-viridian w-1.5 h-1.5 opacity-40"
          style={{ top: "15%", left: "10%", animation: "dot-float-1 10s ease-in-out infinite" }}
        />
        <div
          className="particle particle-sandstorm w-1 h-1 opacity-30"
          style={{ top: "25%", right: "15%", animation: "dot-float-2 12s ease-in-out infinite" }}
        />
        <div
          className="particle particle-viridian w-2 h-2 opacity-20"
          style={{ bottom: "20%", left: "20%", animation: "dot-float-3 8s ease-in-out infinite" }}
        />
        <div
          className="particle particle-sandstorm w-1.5 h-1.5 opacity-25"
          style={{ bottom: "30%", right: "10%", animation: "dot-float-1 11s ease-in-out infinite", animationDelay: "-3s" }}
        />
      </div>

      {/* Badge */}
      <motion.div
        variants={fadeUp}
        initial="hidden"
        animate="visible"
        transition={{ duration: 0.5, ease: [0.16, 1, 0.3, 1], delay: 0.1 }}
      >
        <span
          className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full text-xs font-semibold uppercase tracking-wider mb-6"
          style={{
            background: "var(--viridian-soft)",
            color: "var(--viridian)",
            border: "1px solid var(--glass-border)",
          }}
        >
          <span
            className="w-1.5 h-1.5 rounded-full animate-pulse"
            style={{ background: "var(--viridian)" }}
          />
          AI-Powered F&B Advertising
        </span>
      </motion.div>

      {/* Headline */}
      <motion.h1
        className="text-4xl md:text-5xl lg:text-7xl font-black tracking-tight leading-[1.1]"
        variants={fadeUp}
        initial="hidden"
        animate="visible"
        transition={{ duration: 0.6, ease: [0.16, 1, 0.3, 1], delay: 0.25 }}
      >
        <span
          className="bg-clip-text text-transparent text-glow"
          style={{
            backgroundImage: "linear-gradient(135deg, var(--viridian), var(--sandstorm))",
          }}
        >
          AI-Accelerated
        </span>
        <br />
        <span style={{ color: "var(--text-primary)" }}>
          Advertising for
        </span>
        <br className="md:hidden" />{" "}
        <span style={{ color: "var(--text-primary)" }}>
          Multi-Location F&B
        </span>
      </motion.h1>

      {/* Subheadline */}
      <motion.p
        className="mt-5 text-base md:text-lg max-w-xl mx-auto leading-relaxed"
        style={{ color: "var(--text-secondary)" }}
        variants={fadeUp}
        initial="hidden"
        animate="visible"
        transition={{ duration: 0.5, ease: [0.16, 1, 0.3, 1], delay: 0.45 }}
      >
        We handle the advertising. You handle the food.
      </motion.p>

      {/* Dual CTAs */}
      <motion.div
        className="mt-8 flex flex-col sm:flex-row items-center justify-center gap-3"
        variants={scaleIn}
        initial="hidden"
        animate="visible"
        transition={{ type: "spring", stiffness: 200, damping: 20, delay: 0.6 }}
      >
        <a
          href="#checkout"
          className="w-full sm:w-auto inline-block px-8 py-4 rounded-xl text-white font-bold text-lg tracking-tight transition-all duration-300 hover:scale-105 text-center"
          style={{
            background: "var(--gradient-accent)",
            boxShadow: "0 4px 30px rgba(30, 186, 143, 0.3)",
          }}
        >
          Start Your Pilot — £497
        </a>

        <a
          href="#ai-chat"
          className="w-full sm:w-auto inline-block px-8 py-4 rounded-xl font-bold text-lg tracking-tight transition-all duration-300 hover:scale-105 text-center"
          style={{
            background: "transparent",
            border: "1px solid var(--glass-border)",
            color: "var(--viridian)",
            backdropFilter: "blur(10px)",
          }}
        >
          Talk to Our AI
        </a>
      </motion.div>

      {/* Social proof micro-stat */}
      <motion.div
        className="mt-8 flex items-center justify-center gap-2"
        variants={fadeUp}
        initial="hidden"
        animate="visible"
        transition={{ duration: 0.5, ease: [0.16, 1, 0.3, 1], delay: 0.8 }}
      >
        <div className="flex -space-x-1.5">
          {[0.6, 0.5, 0.4, 0.35].map((opacity, i) => (
            <div
              key={i}
              className="w-5 h-5 rounded-full border-2"
              style={{
                borderColor: "var(--night-deep)",
                background: `rgba(30, 186, 143, ${opacity})`,
              }}
            />
          ))}
        </div>
        <span className="text-sm" style={{ color: "var(--text-muted)" }}>
          Powering campaigns for 20+ F&B brands
        </span>
      </motion.div>
    </section>
  );
}
