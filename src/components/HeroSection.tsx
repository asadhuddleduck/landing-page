export default function HeroSection() {
  return (
    <section className="hero">
      <p className="hero-label">AI-Accelerated Advertising</p>

      <div className="singularity" style={{ marginBottom: 48 }}>
        <div className="singularity-glow" />
        <div className="singularity-core" />
        <div className="singularity-ring" />
        <div className="singularity-ring-outer" />
      </div>

      <h1 className="hero-headline">Your AI Ad Engine</h1>

      <p className="hero-body">
        3-week managed pilot for multi-location F&B. £497.
      </p>

      <a href="#checkout" className="hero-cta">
        Start Your Pilot
      </a>
    </section>
  );
}
