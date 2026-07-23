import { RentOnboardingFlow } from "@/components/onboarding/RentOnboardingFlow";
import { SEO } from "@/components/SEO";
import { StructuredData } from "@/components/StructuredData";

export default function RentOnboarding() {
  return (
    <>
      <SEO
        title="Rent a Tesla in Los Angeles | Long-Term Discounts & Full FSD | Teslys"
        description="Rent a Tesla with Full Self-Driving included. Discounted weekly and monthly rates. Return at any battery level — no recharge fees."
        keywords="rent a Tesla Los Angeles, long term Tesla rental, Tesla with FSD, Tesla monthly rental"
        canonical="https://teslys.app/rent"
      />
      <StructuredData type="organization" />
      <RentOnboardingFlow />
    </>
  );
}
