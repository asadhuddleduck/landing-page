export default function HeroSection() {
  return (
    <section
      className="relative z-10 pt-24 pb-16 px-6 text-center max-w-4xl mx-auto"
      style={{ animation: "heroReveal 0.6s var(--ease-premium) backwards" }}
    >
      <h1 className="text-5xl md:text-6xl lg:text-7xl font-black tracking-tight leading-tight">
        <span
          className="bg-clip-text text-transparent"
          style={{ backgroundImage: "linear-gradient(135deg, var(--viridian), var(--sandstorm))" }}
        >
          AI-Accelerated
        </span>{" "}
        Advertising for Multi-Location F&B
      </h1>

      <p
        className="mt-6 text-lg md:text-xl max-w-2xl mx-auto leading-relaxed"
        style={{ color: "var(--text-secondary)" }}
      >
        Campaign research, creative production, and weekly optimisation —
        built at AI speed, finished by F&B specialists.
        We handle the advertising. You handle the food.
      </p>

      <a
        href="#checkout"
        className="inline-block mt-8 px-8 py-4 rounded-xl text-white font-bold text-lg tracking-tight transition-all duration-300 hover:scale-105"
        style={{ background: "var(--gradient-accent)" }}
      >
        Start Your Pilot — £497
      </a>

      <div className="mt-6 flex items-center justify-center gap-2">
        <span
          className="w-2 h-2 rounded-full animate-pulse"
          style={{ background: "var(--viridian)" }}
        />
        <span className="text-sm" style={{ color: "var(--text-muted)" }}>
          Powering campaigns for 5–50+ location F&B brands
        </span>
      </div>
    </section>
  );
}
