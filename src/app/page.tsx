import Header from "@/components/Header";
import HeroSection from "@/components/HeroSection";
import InfoAnimation from "@/components/InfoAnimation";
import ElevenLabsChat from "@/components/ElevenLabsChat";
import CheckoutSection from "@/components/CheckoutSection";
import SocialProof from "@/components/SocialProof";
import FAQ from "@/components/FAQ";
import Footer from "@/components/Footer";

export default function Home() {
  return (
    <>
      {/* Layered animated background */}
      <div className="bg-effects">
        <div className="aurora-mesh" />
        <div className="bg-orb bg-orb-1" />
        <div className="bg-orb bg-orb-2" />
        <div className="dot-grid" />
      </div>

      <Header />

      <main>
        <HeroSection />
        <ElevenLabsChat />
        <InfoAnimation />
        <SocialProof />
        <CheckoutSection />
        <FAQ />
      </main>

      <Footer />
    </>
  );
}
