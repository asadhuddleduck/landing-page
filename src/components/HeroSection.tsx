export default function HeroSection() {
  return (
    <section
      className="relative z-10 pt-24 pb-16 px-6 text-center max-w-4xl mx-auto"
      style={{ animation: "heroReveal 0.6s var(--ease-premium) backwards" }}
    >
      <h1 className="text-5xl md:text-6xl lg:text-7xl font-black tracking-tight leading-tight">
        Your{" "}
        <span
          className="bg-clip-text text-transparent"
          style={{ backgroundImage: "linear-gradient(135deg, var(--viridian), var(--sandstorm))" }}
        >
          AI-Powered
        </span>{" "}
        Ad Engine for F&B
      </h1>

      <p
        className="mt-6 text-lg md:text-xl max-w-2xl mx-auto leading-relaxed"
        style={{ color: "var(--text-secondary)" }}
      >
        We build, manage, and optimise Meta ad campaigns that fill seats and
        drive orders. Powered by AI. Built for restaurants, cafes, and food
        brands.
      </p>

      <div className="mt-8 flex items-center justify-center gap-2">
        <span
          className="w-2 h-2 rounded-full animate-pulse"
          style={{ background: "var(--viridian)" }}
        />
        <span className="text-sm" style={{ color: "var(--text-muted)" }}>
          Trusted by F&B brands across the UK
        </span>
      </div>
    </section>
  );
}
