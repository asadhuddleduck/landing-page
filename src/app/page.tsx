import HeroChatSection from "@/components/HeroChatSection";
import CheckoutSection from "@/components/CheckoutSection";
import LogoStrip from "@/components/LogoStrip";
import ConvergenceBackground from "@/components/ConvergenceBackground";
import StickyCheckoutBar from "@/components/StickyCheckoutBar";

export default function Home() {
  return (
    <>
      <ConvergenceBackground />

      <main>
        <HeroChatSection />
        <CheckoutSection />
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
