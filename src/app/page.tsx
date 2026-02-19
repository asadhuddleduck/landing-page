import HeroChatSection from "@/components/HeroChatSection";
import CheckoutSection from "@/components/CheckoutSection";
import ConvergenceBackground from "@/components/ConvergenceBackground";

export default function Home() {
  return (
    <>
      <ConvergenceBackground />

      <main>
        <HeroChatSection />
        <CheckoutSection />
      </main>
    </>
  );
}
