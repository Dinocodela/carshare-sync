import { OnboardingFlow } from "@/components/onboarding/OnboardingFlow";
import { SEO } from "@/components/SEO";

export default function Onboarding() {
  return (
    <>
      <SEO 
        title="Welcome to Teslys"
        description="Turn your Tesla into a passive income stream with Teslys car sharing"
      />
      <OnboardingFlow />
    </>
  );
}
