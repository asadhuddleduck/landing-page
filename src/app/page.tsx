import HeroChatSection from "@/components/HeroChatSection";
import CheckoutSection from "@/components/CheckoutSection";

export default function Home() {
  return (
    <>
      {/* Animated background orbs */}
      <div className="bg-effects">
        <div className="bg-orb bg-orb-1" />
        <div className="bg-orb bg-orb-2" />
        <div className="bg-orb bg-orb-3" />
      </div>

      <main>
        <HeroChatSection />
        <CheckoutSection />
      </main>
    </>
  );
}
