import WaitlistForm from "./WaitlistForm";

export default function HeroWaitlist() {
  return (
    <section className="hero">
      <h1 className="hero-headline">Local ads that bring people through your door.</h1>
      <p className="hero-sub">
        We&apos;re an ad agency for local businesses. We plan, make and run your
        Instagram and Facebook ads. We only take on a few new clients at a time,
        so tell us about yours and we&apos;ll be in touch if it&apos;s a fit.
      </p>
      <div className="hero-chat">
        <WaitlistForm variant="hero" />
      </div>
    </section>
  );
}
