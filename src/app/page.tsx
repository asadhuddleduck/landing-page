import HeroChatSection from "@/components/HeroChatSection";
import CheckoutSection from "@/components/CheckoutSection";
import FAQ from "@/components/FAQ";
import LogoStrip from "@/components/LogoStrip";
import ConvergenceBackground from "@/components/ConvergenceBackground";
import StickyCheckoutBar from "@/components/StickyCheckoutBar";

export default function Home() {
  return (
    <>
      <ConvergenceBackground />

      {/* eslint-disable-next-line @next/next/no-img-element */}
      <img src="/duck-logo.png" alt="Huddle Duck" className="site-brand" />

      <main>
        <HeroChatSection />
        <CheckoutSection />
        <FAQ />
        <LogoStrip />
      </main>

      <footer className="lp-footer">
        <div className="lp-footer-links">
          <span>&copy; {new Date().getFullYear()} Huddle Duck Ltd</span>
          <span className="lp-footer-sep">|</span>
          <a href="/privacy">Privacy Policy</a>
        </div>
      </footer>

      <StickyCheckoutBar />
    </>
  );
}
