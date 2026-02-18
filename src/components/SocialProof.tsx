const testimonials = [
  {
    headline: "Their Uber Eats Rep Called After One Week",
    description:
      "We ran launch campaigns for Phat Buns across multiple locations. The client reported order volume spiked within 3 days of going live.",
    brand: "Phat Buns",
    detail: "15+ locations — international burger brand",
  },
  {
    headline: "12,000 Followers Before They Sold a Single Pizza",
    description:
      "We built a pre-launch audience campaign for Dough Club before doors opened. The client reported selling out for weeks — and replicated the strategy for locations 2 and 3.",
    brand: "Dough Club",
    detail: "Multi-location pizza brand",
  },
  {
    headline: "1 Location to 5. AI Ad Engine on Every Launch.",
    description:
      "We ran the AI Ad Engine on every new location opening for Shakedown. The client reported 4,000+ people attended their Newcastle launch — a city where nobody had heard of them.",
    brand: "Shakedown",
    detail: "Grew from 1 to 5 locations",
  },
  {
    headline: "676 Franchise Enquiries at £12.56 Each",
    description:
      "We ran a franchise recruitment campaign using the AI Ad Engine. The client reported 676 enquiries from 1.27M impressions on a controlled test budget.",
    brand: "F&B Franchise",
    detail: "Confidential cafe franchise brand",
  },
];

export default function SocialProof() {
  return (
    <section className="relative z-10 py-20 px-6 max-w-5xl mx-auto">
      <h2
        className="text-3xl md:text-4xl font-black text-center tracking-tight mb-12"
        style={{ color: "var(--text-primary)" }}
      >
        Track Record
      </h2>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {testimonials.map((t) => (
          <div
            key={t.brand}
            className="info-card p-6 rounded-2xl transition-all duration-300 hover:-translate-y-1"
          >
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

            <div className="flex items-center gap-2">
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
          </div>
        ))}
      </div>
    </section>
  );
}
