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
  hidden: { opacity: 0, x: -20 },
  visible: { opacity: 1, x: 0 },
};

export default function InfoAnimation() {
  return (
    <section className="relative z-10 py-16 px-6 max-w-3xl mx-auto">
      <h2
        className="text-3xl md:text-4xl font-black text-center tracking-tight mb-12"
        style={{ color: "var(--text-primary)" }}
      >
        How It Works
      </h2>

      <div className="relative">
        {/* Timeline connector line */}
        <div
          className="absolute left-5 top-5 bottom-5 w-0.5 hidden md:block"
          style={{ background: "var(--border)" }}
        />

        <div className="space-y-8">
          {steps.map((step, index) => (
            <motion.div
              key={step.number}
              variants={stepVariant}
              initial="hidden"
              whileInView="visible"
              viewport={{ once: true, margin: "-50px" }}
              transition={{
                duration: 0.5,
                ease: [0.16, 1, 0.3, 1],
                delay: index * 0.15,
              }}
              className="flex gap-4 md:gap-6 items-start"
            >
              {/* Step number circle */}
              <div
                className="flex-shrink-0 w-10 h-10 rounded-full flex items-center justify-center text-sm font-bold relative z-10"
                style={{
                  background: "var(--viridian)",
                  color: "var(--night-deep)",
                }}
              >
                {step.number}
              </div>

              {/* Step card */}
              <div
                className="info-card flex-1 p-6 rounded-2xl transition-all duration-300 hover:-translate-y-0.5"
              >
                <div className="flex items-center gap-3 mb-2">
                  <h3
                    className="text-lg font-bold"
                    style={{ color: "var(--text-primary)" }}
                  >
                    {step.title}
                  </h3>
                  <span
                    className="text-xs font-semibold px-2 py-0.5 rounded-full"
                    style={{
                      background: "var(--viridian-glow)",
                      color: "var(--viridian)",
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
