import { Car } from "lucide-react";
import { WelcomeShell } from "./WelcomeShell";

export default function WelcomeClient() {
  return (
    <WelcomeShell
      role="client"
      Icon={Car}
      tagline="Client workspace"
      title="Your Tesla, fully managed"
      intro="As a client, you own one or more Teslas that our trusted hosts operate on your behalf. Track real earnings, expenses, and trips in one place — without lifting a finger."
      bullets={[
        { title: "Add your cars", body: "Tell us about your Tesla and set a profit split." },
        { title: "Pick a host", body: "Choose from vetted hosts who will manage your vehicle." },
        { title: "Watch earnings", body: "Real-time trips, payouts, and expense visibility." },
        { title: "Stay in control", body: "Approve hosts, view audit logs, and manage access." },
      ]}
      ctaLabel="Go to my cars"
    />
  );
}
