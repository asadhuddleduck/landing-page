const steps = [
  {
    icon: "🚀",
    title: "AI Strategy",
    description:
      "Our AI analyses your market, competitors, and audience to craft the perfect campaign strategy.",
    delay: "200ms",
  },
  {
    icon: "⚡",
    title: "Launch & Optimise",
    description:
      "Campaigns go live with continuous AI optimisation. Budgets shift automatically to top performers.",
    delay: "400ms",
  },
  {
    icon: "📊",
    title: "Results Dashboard",
    description:
      "Track every pound spent. Real-time dashboard shows exactly what's working.",
    delay: "600ms",
  },
];

export default function InfoAnimation() {
  return (
    <section className="relative z-10 py-16 px-6 max-w-5xl mx-auto">
      <h2
        className="text-3xl md:text-4xl font-black text-center tracking-tight mb-12"
        style={{ color: "var(--text-primary)" }}
      >
        How It Works
      </h2>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {steps.map((step) => (
          <div
            key={step.title}
            className="info-card p-8 rounded-2xl transition-all duration-300 hover:-translate-y-1"
            style={{
              animation: `fadeSlideUp 0.5s var(--ease-premium) ${step.delay} backwards`,
            }}
          >
            <span className="text-4xl mb-4 block">{step.icon}</span>
            <h3
              className="text-lg font-bold mb-2"
              style={{ color: "var(--text-primary)" }}
            >
              {step.title}
            </h3>
            <p
              className="text-sm leading-relaxed"
              style={{ color: "var(--text-secondary)" }}
            >
              {step.description}
            </p>
          </div>
        ))}
      </div>
    </section>
  );
}
