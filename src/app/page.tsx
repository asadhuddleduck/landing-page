import Header from "@/components/Header";
import HeroWaitlist from "@/components/HeroWaitlist";
import SocialProof from "@/components/SocialProof";
import CaseStudies from "@/components/CaseStudies";
import FounderSection from "@/components/FounderSection";
import FAQ from "@/components/FAQ";
import Footer from "@/components/Footer";
import ConvergenceBackground from "@/components/ConvergenceBackground";
import LogoStrip from "@/components/LogoStrip";
import WaitlistForm from "@/components/WaitlistForm";

export default function Home() {
  return (
    <>
      <Header />
      <ConvergenceBackground />

      <main>
        <HeroWaitlist />

        <section className="section" aria-label="Trusted by">
          <LogoStrip />
        </section>

        <SocialProof />
        <CaseStudies />
        <FounderSection />

        <section className="section" aria-label="Join the waitlist">
          <WaitlistForm variant="inline" />
        </section>

        <FAQ />
      </main>

      <Footer />
    </>
  );
}
