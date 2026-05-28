import { TrendingUp } from "lucide-react";
import { WelcomeShell } from "./WelcomeShell";

export default function WelcomeInvestor() {
  return (
    <WelcomeShell
      role="investor"
      Icon={TrendingUp}
      tagline="Investor workspace"
      title="Invest in the Tesla fleet"
      intro="Buy into individual Tesla vehicles in our managed fleet. $50,000 per vehicle returns $1,000/month for 50 months — plus 50% of the resale upside. Track every dollar in real time."
      bullets={[
        { title: "Browse vehicles", body: "See available Teslas, terms, and projected returns." },
        { title: "Invest in minutes", body: "Secure Stripe checkout — fees absorbed on us." },
        { title: "Track returns", body: "Monthly payouts, lifetime totals, resale projections." },
        { title: "Stay informed", body: "Statements, tax docs, and notifications when you're paid." },
      ]}
      ctaLabel="Explore investments"
    />
  );
}
