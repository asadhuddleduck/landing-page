const features = [
  "Full AI campaign strategy",
  "4 weeks of managed Meta ads",
  "Real-time results dashboard",
  "Weekly AI optimisation reports",
  "Dedicated account manager",
];

export default function CheckoutSection() {
  return (
    <section className="relative z-10 py-20 px-6">
      <div className="checkout-card max-w-lg mx-auto p-10 rounded-3xl relative overflow-hidden">
        {/* Top accent bar */}
        <div
          className="absolute top-0 left-0 right-0 h-1"
          style={{ background: "var(--gradient-accent)" }}
        />

        <p
          className="text-sm font-semibold uppercase tracking-wider mb-2"
          style={{ color: "var(--viridian)" }}
        >
          AI Ad Engine Pilot
        </p>

        <div className="flex items-baseline gap-1 mb-1">
          <span className="text-3xl font-bold" style={{ color: "var(--text-secondary)" }}>
            £
          </span>
          <span className="text-6xl font-black" style={{ color: "var(--text-primary)" }}>
            497
          </span>
        </div>
        <p className="text-base font-semibold" style={{ color: "var(--text-muted)" }}>
          one-time payment
        </p>

        <ul className="mt-8 space-y-3">
          {features.map((feature) => (
            <li key={feature} className="flex items-center gap-3 text-sm" style={{ color: "var(--text-secondary)" }}>
              <svg
                className="w-5 h-5 flex-shrink-0"
                style={{ color: "var(--viridian)" }}
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
                strokeWidth={2.5}
              >
                <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
              </svg>
              {feature}
            </li>
          ))}
        </ul>

        <button className="checkout-btn mt-10 w-full py-4 rounded-xl text-white font-bold text-lg tracking-tight cursor-pointer transition-all duration-300">
          Start Your Pilot
        </button>

        <p className="mt-4 text-center text-xs" style={{ color: "var(--text-muted)" }}>
          30-day money-back guarantee. No contracts.
        </p>
      </div>
    </section>
  );
}
