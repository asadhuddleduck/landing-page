import Header from "@/components/Header";
import HeroSection from "@/components/HeroSection";
import ElevenLabsChat from "@/components/ElevenLabsChat";
import CheckoutSection from "@/components/CheckoutSection";
import SocialProof from "@/components/SocialProof";
import FAQ from "@/components/FAQ";
import Footer from "@/components/Footer";

export default function Home() {
  return (
    <>
      {/* Single subtle background glow */}
      <div className="bg-effects">
        <div className="bg-glow" />
      </div>

      <Header />

      <main>
        <HeroSection />
        <ElevenLabsChat />
        <SocialProof />
        <CheckoutSection />
        <FAQ />
      </main>

      <Footer />
    </>
  );
}
