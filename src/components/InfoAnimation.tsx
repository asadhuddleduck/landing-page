"use client";

import { motion } from "framer-motion";

const steps = [
  {
    number: 1,
    title: "Research Your Avatar",
    description:
      "AI analyses your locations, competitors, and audience to build a detailed customer avatar — the foundation of every campaign.",
    tag: "AI-accelerated",
  },
  {
    number: 2,
    title: "Build Creative & Copy",
    description:
      "AI generates ad copy, voiceover scripts, and video creative from your existing content. Our specialists review and refine every asset before it goes live.",
    tag: "AI + human review",
  },
  {
    number: 3,
    title: "Launch Campaign",
    description:
      "Campaigns go live on Meta — Facebook and Instagram — with targeting built from your avatar research. Every ad is engineered to drive a clear next step.",
    tag: "Done for you",
  },
  {
    number: 4,
    title: "Optimise Weekly",
    description:
      "Budgets shift to top performers. Underperforming ads get recycled into new variations. Fresh creative enters the rotation every week.",
    tag: "AI-accelerated",
  },
  {
    number: 5,
    title: "Track & Report",
    description:
      "A transparent tracking report shows exactly what ran, what the data says, and recommended next steps. Followed by a strategy review call.",
    tag: "Human-led",
  },
];

const stepVariant = {
  hidden: { opacity: 0, y: 30, scale: 0.97 },
  visible: { opacity: 1, y: 0, scale: 1 },
};

const headingVariant = {
  hidden: { opacity: 0, y: 20 },
  visible: { opacity: 1, y: 0 },
};

export default function InfoAnimation() {
  return (
    <section className="relative z-10 py-12 px-4 md:py-20 md:px-6 max-w-3xl mx-auto">
      {/* Section heading with gradient accent */}
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
          How It Works
        </h2>
        <div
          className="mt-3 mx-auto h-1 w-16 rounded-full"
          style={{ background: "var(--gradient-accent)" }}
        />
      </motion.div>

      <div className="relative">
        {/* Glowing timeline connector */}
        <div
          className="absolute left-5 top-5 bottom-5 w-px hidden md:block"
          style={{
            background: "linear-gradient(to bottom, var(--viridian), rgba(30, 186, 143, 0.05))",
            boxShadow: "0 0 8px rgba(30, 186, 143, 0.3)",
          }}
        />

        <div className="space-y-6 md:space-y-8">
          {steps.map((step, index) => (
            <motion.div
              key={step.number}
              variants={stepVariant}
              initial="hidden"
              whileInView="visible"
              viewport={{ once: true, margin: "-60px" }}
              transition={{
                duration: 0.55,
                ease: [0.16, 1, 0.3, 1],
                delay: index * 0.12,
              }}
              className="flex flex-col md:flex-row gap-3 md:gap-6 items-center md:items-start"
            >
              {/* Step number circle with glow */}
              <div className="flex-shrink-0 relative">
                <div
                  className="w-10 h-10 rounded-full flex items-center justify-center text-sm font-bold relative z-10"
                  style={{
                    background: "var(--viridian)",
                    color: "var(--night-deep)",
                    boxShadow: "0 0 20px rgba(30, 186, 143, 0.4), 0 0 40px rgba(30, 186, 143, 0.15)",
                  }}
                >
                  {step.number}
                </div>
              </div>

              {/* Step card — glassmorphic */}
              <div className="glass-card flex-1 w-full p-5 md:p-6 transition-all duration-300 hover:-translate-y-0.5">
                <div className="flex flex-col sm:flex-row sm:items-center gap-2 sm:gap-3 mb-2">
                  <h3
                    className="text-base md:text-lg font-bold"
                    style={{ color: "var(--text-primary)" }}
                  >
                    {step.title}
                  </h3>
                  <span
                    className="self-start text-xs font-semibold px-3 py-1 rounded-full"
                    style={{
                      background: "var(--viridian-glow)",
                      color: "var(--viridian)",
                      border: "1px solid rgba(30, 186, 143, 0.2)",
                    }}
                  >
                    {step.tag}
                  </span>
                </div>
                <p
                  className="text-sm leading-relaxed"
                  style={{ color: "var(--text-secondary)" }}
                >
                  {step.description}
                </p>
              </div>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}
