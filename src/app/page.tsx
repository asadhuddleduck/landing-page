import HeroChatSection from "@/components/HeroChatSection";
import CheckoutSection from "@/components/CheckoutSection";
import FAQ from "@/components/FAQ";
import ConvergenceBackground from "@/components/ConvergenceBackground";


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
      </main>

      <footer className="lp-footer">
        <div className="lp-footer-links">
          <span>&copy; {new Date().getFullYear()} Huddle Duck Ltd</span>
          <span className="lp-footer-sep">|</span>
          <a href="/privacy">Privacy Policy</a>
        </div>
      </footer>

    </>
  );
}
