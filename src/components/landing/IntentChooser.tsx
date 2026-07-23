import { Car, KeyRound, ArrowRight } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { Capacitor } from "@capacitor/core";
import { Browser } from "@capacitor/browser";

const RENT_URL = "https://app.eonrides.com";

type Props = {
  onChooseManage: () => void;
};

function track(intent: "rent" | "manage") {
  try {
    // GTM dataLayer (project uses GTM per memory)
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const w = window as any;
    if (Array.isArray(w.dataLayer)) {
      w.dataLayer.push({ event: "landing_intent_selected", intent });
    }
    localStorage.setItem("teslys_intent", intent);
  } catch {
    // no-op
  }
}

export function IntentChooser({ onChooseManage }: Props) {
  const navigate = useNavigate();

  const handleRent = async (e: React.MouseEvent) => {
    e.preventDefault();
    track("rent");

    // First-time visitors see the renter onboarding; repeat visitors go straight to booking.
    let hasSeen = false;
    try {
      hasSeen = localStorage.getItem("hasSeenRentOnboarding") === "true";
    } catch {
      // ignore
    }
    if (!hasSeen) {
      navigate("/rent");
      return;
    }

    if (Capacitor.isNativePlatform()) {
      try {
        await Browser.open({ url: RENT_URL });
        return;
      } catch {
        // fall through to window.open
      }
    }
    window.open(RENT_URL, "_blank", "noopener,noreferrer");
  };

  const handleManage = () => {
    track("manage");
    onChooseManage();
  };

  return (
    <div className="w-full">
      <h2 className="text-center text-lg font-bold text-foreground mb-1">
        What brings you to{" "}
        <span className="bg-gradient-to-r from-primary to-accent bg-clip-text text-transparent">
          Teslys
        </span>
        ?
      </h2>
      <p className="text-center text-xs text-muted-foreground mb-4">
        Choose your path — you can always switch later.
      </p>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
        {/* Rent a Tesla */}
        <button
          type="button"
          onClick={handleRent}
          className="group relative text-left rounded-2xl bg-card/80 backdrop-blur-sm border-2 border-sky-500/40 shadow-sm p-5 hover:border-sky-500/70 hover:shadow-md transition-all overflow-hidden"
        >
          <div className="absolute -top-8 -right-8 w-24 h-24 rounded-full bg-sky-500/10 blur-2xl" />
          <div className="relative">
            <div className="w-11 h-11 rounded-xl bg-sky-500/15 flex items-center justify-center mb-3">
              <Car className="w-6 h-6 text-sky-600 dark:text-sky-400" />
            </div>
            <div className="flex items-center gap-2 mb-1">
              <span className="text-base font-bold text-foreground">Rent a Tesla</span>
              <span className="text-[10px] uppercase tracking-wide font-semibold text-sky-700 dark:text-sky-300 bg-sky-500/10 px-2 py-0.5 rounded-full">
                Book now
              </span>
            </div>
            <p className="text-xs text-muted-foreground leading-relaxed mb-3">
              Book a Tesla by the day, week, or month. Delivered ready to drive.
            </p>
            <span className="inline-flex items-center gap-1.5 text-xs font-semibold text-sky-600 dark:text-sky-400 group-hover:gap-2 transition-all">
              Rent now <ArrowRight className="w-3.5 h-3.5" />
            </span>
          </div>
        </button>

        {/* List / Manage my Tesla */}
        <button
          type="button"
          onClick={handleManage}
          className="group relative text-left rounded-2xl bg-card/80 backdrop-blur-sm border-2 border-primary/40 shadow-sm p-5 hover:border-primary/70 hover:shadow-md transition-all overflow-hidden"
        >
          <div className="absolute -top-8 -right-8 w-24 h-24 rounded-full bg-primary/10 blur-2xl" />
          <div className="relative">
            <div className="w-11 h-11 rounded-xl bg-primary/15 flex items-center justify-center mb-3">
              <KeyRound className="w-6 h-6 text-primary" />
            </div>
            <div className="flex items-center gap-2 mb-1">
              <span className="text-base font-bold text-foreground">List my Tesla</span>
              <span className="text-[10px] uppercase tracking-wide font-semibold text-primary bg-primary/10 px-2 py-0.5 rounded-full">
                Earn
              </span>
            </div>
            <p className="text-xs text-muted-foreground leading-relaxed mb-3">
              Turn your Tesla into passive income. We handle rentals, cleaning, and guests.
            </p>
            <span className="inline-flex items-center gap-1.5 text-xs font-semibold text-primary group-hover:gap-2 transition-all">
              Get started <ArrowRight className="w-3.5 h-3.5" />
            </span>
          </div>
        </button>
      </div>
    </div>
  );
}
