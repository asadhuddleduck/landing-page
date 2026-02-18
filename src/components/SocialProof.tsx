const testimonials = [
  {
    quote:
      "The AI Ad Engine completely transformed our footfall. We saw results within the first week.",
    name: "John D.",
    business: "The Local Bistro",
    metric: "+340% reach in 4 weeks",
  },
  {
    quote:
      "We went from guessing to knowing exactly what works. The dashboard alone is worth it.",
    name: "Sarah M.",
    business: "Cloud Kitchen Co.",
    metric: "3.2x return on ad spend",
  },
  {
    quote:
      "Completely hands-off for us. They handle everything and we just watch the orders come in.",
    name: "Ali R.",
    business: "Spice Street",
    metric: "450+ new customers in 30 days",
  },
];

export default function SocialProof() {
  return (
    <section className="relative z-10 py-20 px-6 max-w-5xl mx-auto">
      <h2
        className="text-3xl md:text-4xl font-black text-center tracking-tight mb-12"
        style={{ color: "var(--text-primary)" }}
      >
        What Our Clients Say
      </h2>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {testimonials.map((t) => (
          <div
            key={t.name}
            className="info-card p-6 rounded-2xl transition-all duration-300 hover:-translate-y-1"
          >
            <p
              className="text-sm leading-relaxed mb-6 italic"
              style={{ color: "var(--text-secondary)" }}
            >
              &ldquo;{t.quote}&rdquo;
            </p>

            <p className="text-sm font-bold" style={{ color: "var(--text-primary)" }}>
              {t.name}
            </p>
            <p className="text-xs" style={{ color: "var(--text-muted)" }}>
              {t.business}
            </p>

            <span
              className="mt-3 inline-block px-3 py-1 rounded-full text-xs font-bold"
              style={{
                background: "var(--viridian-glow)",
                color: "var(--viridian)",
              }}
            >
              {t.metric}
            </span>
          </div>
        ))}
      </div>
    </section>
  );
}
