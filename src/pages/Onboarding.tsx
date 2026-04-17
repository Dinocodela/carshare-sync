import { OnboardingFlow } from "@/components/onboarding/OnboardingFlow";
import { SEO } from "@/components/SEO";
import { StructuredData } from "@/components/StructuredData";

export default function Onboarding() {
  return (
    <>
      <SEO 
        title="Welcome to Teslys - Get Started with Tesla Car Sharing"
        description="Turn your Tesla into a passive income stream with Teslys car sharing. We handle everything—rentals, cleaning, and guest support—so you can relax and earn."
        keywords="Tesla car sharing onboarding, get started Tesla rental, Tesla passive income setup"
        canonical="https://teslys.app/onboarding"
      />
      <StructuredData type="organization" />
      <StructuredData type="website" />
      <OnboardingFlow />
    </>
  );
}
