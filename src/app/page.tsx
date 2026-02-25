import Header from "@/components/Header";
import HeroChatSection from "@/components/HeroChatSection";
import SocialProof from "@/components/SocialProof";
import CaseStudies from "@/components/CaseStudies";
import FounderSection from "@/components/FounderSection";
import CheckoutSection from "@/components/CheckoutSection";
import FAQ from "@/components/FAQ";
import Footer from "@/components/Footer";
import StickyCheckoutCTA from "@/components/StickyCheckoutCTA";
import ConvergenceBackground from "@/components/ConvergenceBackground";


export default function Home() {
  return (
    <>
      <Header />
      <ConvergenceBackground />

      <main>
        <HeroChatSection />
        <CheckoutSection />
        <SocialProof />
        <CaseStudies />
        <FounderSection />
        <FAQ />
      </main>

      <Footer />
      <StickyCheckoutCTA />
    </>
  );
}
