import { Briefcase } from "lucide-react";
import { WelcomeShell } from "./WelcomeShell";

export default function WelcomeHost() {
  return (
    <WelcomeShell
      role="host"
      Icon={Briefcase}
      tagline="Host workspace"
      title="Operate Teslas. Earn together."
      intro="As a host, you operate client-owned Teslas on platforms like Turo and split the profits. Teslys is your back office: trips, earnings, expenses, claims, maintenance — all unified."
      bullets={[
        { title: "Accept cars", body: "Review hosting requests from clients in your area." },
        { title: "Log trips & earnings", body: "Capture every Turo trip with one click." },
        { title: "Track expenses & claims", body: "Tolls, cleaning, damage — never lose a receipt." },
        { title: "Get paid faster", body: "Clear payout cycles with auto-generated statements." },
      ]}
      ctaLabel="Go to my hosted cars"
    />
  );
}
