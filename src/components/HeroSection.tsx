export default function HeroSection() {
  return (
    <section className="hero">
      <p className="hero-label">For Multi-Location F&B</p>

      <div className="singularity" style={{ marginBottom: 48 }}>
        <div className="singularity-glow" />
        <div className="singularity-core" />
        <div className="singularity-ring" />
        <div className="singularity-ring-outer" />
      </div>

      <h1 className="hero-headline">Make sure everyone within 3km knows about you</h1>

      <p className="hero-body">
        AI that researches your audience, creates the strategy, and runs your
        ads — using your real content, not AI slop.
      </p>

      <a href="#checkout" className="hero-cta">
        Start Your Pilot — £497
      </a>
    </section>
  );
}
