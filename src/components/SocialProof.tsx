"use client";

import { motion } from "framer-motion";

const testimonials = [
  {
    metric: "15+",
    metricLabel: "locations",
    headline: "Their Uber Eats Rep Called After One Week",
    description:
      "We ran launch campaigns for Phat Buns across multiple locations. The client reported order volume spiked within 3 days of going live.",
    brand: "Phat Buns",
    detail: "International burger brand",
  },
  {
    metric: "12,000",
    metricLabel: "followers",
    headline: "12,000 Followers Before They Sold a Single Pizza",
    description:
      "We built a pre-launch audience campaign for Dough Club before doors opened. The client reported selling out for weeks — and replicated the strategy for locations 2 and 3.",
    brand: "Dough Club",
    detail: "Multi-location pizza brand",
  },
  {
    metric: "4,000+",
    metricLabel: "attendees",
    headline: "1 Location to 5. AI Ad Engine on Every Launch.",
    description:
      "We ran the AI Ad Engine on every new location opening for Shakedown. The client reported 4,000+ people attended their Newcastle launch — a city where nobody had heard of them.",
    brand: "Shakedown",
    detail: "Grew from 1 to 5 locations",
  },
  {
    metric: "676",
    metricLabel: "enquiries",
    headline: "676 Franchise Enquiries at £12.56 Each",
    description:
      "We ran a franchise recruitment campaign using the AI Ad Engine. The client reported 676 enquiries from 1.27M impressions on a controlled test budget.",
    brand: "F&B Franchise",
    detail: "Confidential cafe franchise brand",
  },
];

const cardVariant = {
  hidden: { opacity: 0, y: 30, scale: 0.97 },
  visible: { opacity: 1, y: 0, scale: 1 },
};

const headingVariant = {
  hidden: { opacity: 0, y: 20 },
  visible: { opacity: 1, y: 0 },
};

export default function SocialProof() {
  return (
    <section className="relative z-10 py-12 px-4 md:py-20 md:px-6 max-w-5xl mx-auto">
      {/* Section heading */}
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
          Track Record
        </h2>
        <div
          className="mt-3 mx-auto h-1 w-16 rounded-full"
          style={{ background: "var(--gradient-accent)" }}
        />
      </motion.div>

      {/* Staggered card grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 md:gap-6">
        {testimonials.map((t, index) => (
          <motion.div
            key={t.brand}
            variants={cardVariant}
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true, margin: "-60px" }}
            transition={{
              duration: 0.55,
              ease: [0.16, 1, 0.3, 1],
              delay: index * 0.1,
            }}
            className={`glass-card p-5 md:p-6 transition-all duration-300 hover:-translate-y-1 ${
              index % 2 === 1 ? "md:translate-y-4" : ""
            }`}
          >
            {/* Metric highlight */}
            <div className="mb-3">
              <span
                className="text-3xl md:text-4xl font-black bg-clip-text text-transparent"
                style={{
                  backgroundImage: "linear-gradient(135deg, var(--viridian), var(--sandstorm))",
                }}
              >
                {t.metric}
              </span>
              <span
                className="ml-2 text-sm font-medium"
                style={{ color: "var(--text-muted)" }}
              >
                {t.metricLabel}
              </span>
            </div>

            <h3
              className="text-base font-bold mb-3 leading-snug"
              style={{ color: "var(--text-primary)" }}
            >
              {t.headline}
            </h3>

            <p
              className="text-sm leading-relaxed mb-4"
              style={{ color: "var(--text-secondary)" }}
            >
              {t.description}
            </p>

            {/* Brand footer with accent line */}
            <div
              className="pt-3 flex items-center gap-2"
              style={{ borderTop: "1px solid var(--border)" }}
            >
              <span
                className="w-1 h-4 rounded-full"
                style={{ background: "var(--viridian)" }}
              />
              <span
                className="text-sm font-bold"
                style={{ color: "var(--viridian)" }}
              >
                {t.brand}
              </span>
              <span className="text-xs" style={{ color: "var(--text-muted)" }}>
                — {t.detail}
              </span>
            </div>
          </motion.div>
        ))}
      </div>
    </section>
  );
}
