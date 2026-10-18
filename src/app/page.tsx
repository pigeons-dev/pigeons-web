import { Hero } from "@/components/home/hero";
import { Features } from "@/components/home/features";
import { HowItWorks } from "@/components/home/how-it-works";
import { Examples } from "@/components/home/examples";
import { BottomCta } from "@/components/home/bottom-cta";

export default function Home() {
  return (
    <>
      <Hero />
      <Features />
      <HowItWorks />
      <Examples />
      <BottomCta />
    </>
  );
}
