import WaitlistForm from "./WaitlistForm";

export default function HeroWaitlist() {
  return (
    <section className="hero">
      <h1 className="hero-headline">AI ads for local businesses, done for you.</h1>
      <p className="hero-sub">
        We&apos;re onboarding new clients in waves. Tell us about your business —
        if it&apos;s a fit, we&apos;ll bring you in.
      </p>
      <div className="hero-chat">
        <WaitlistForm variant="hero" />
      </div>
    </section>
  );
}
