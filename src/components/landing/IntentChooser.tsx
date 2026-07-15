import type { MouseEvent } from "react";
import { ArrowRight, Car, KeyRound, Sparkles } from "lucide-react";
import { Capacitor } from "@capacitor/core";
import { Browser } from "@capacitor/browser";

const RENT_URL = "https://app.eonrides.com";

type Props = {
  onChooseManage: () => void;
};

function track(intent: "rent" | "manage") {
  try {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const w = window as any;
    if (Array.isArray(w.dataLayer)) {
      w.dataLayer.push({ event: "landing_intent_selected", intent });
    }
    localStorage.setItem("teslys_intent", intent);
  } catch {
    // Tracking must never block navigation.
  }
}

export function IntentChooser({ onChooseManage }: Props) {
  const handleRent = async (event: MouseEvent<HTMLButtonElement>) => {
    event.preventDefault();
    track("rent");

    if (Capacitor.isNativePlatform()) {
      try {
        await Browser.open({ url: RENT_URL });
        return;
      } catch {
        // Fall through to the web fallback.
      }
    }

    window.open(RENT_URL, "_blank", "noopener,noreferrer");
  };

  const handleManage = () => {
    track("manage");
    onChooseManage();
  };

  return (
    <section className="w-full" aria-labelledby="teslys-experience-heading">
      <h2 id="teslys-experience-heading" className="sr-only">
        Choose your Teslys experience
      </h2>

      <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
        <button
          type="button"
          onClick={handleRent}
          className="group relative min-h-[330px] overflow-hidden rounded-[28px] border border-[#4fc8ca]/20 bg-[radial-gradient(circle_at_82%_68%,rgba(11,153,156,0.38),transparent_38%),linear-gradient(145deg,#03171d_0%,#082c34_100%)] p-6 text-left text-white shadow-[0_24px_65px_rgba(3,23,29,0.22)] transition duration-300 hover:-translate-y-1 hover:shadow-[0_30px_75px_rgba(3,23,29,0.28)] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#58cdd0] focus-visible:ring-offset-2"
          aria-label="Explore Tesla rentals"
        >
          <div className="absolute -right-16 bottom-3 h-56 w-56 rounded-full border border-white/10 bg-white/[0.025]" />
          <div className="absolute -right-8 bottom-11 h-40 w-40 rounded-full border border-[#58cdd0]/20" />
          <Car className="absolute -right-2 bottom-16 h-36 w-36 stroke-[0.8] text-[#58cdd0]/25 transition duration-500 group-hover:scale-105 group-hover:text-[#58cdd0]/35" />

          <div className="relative z-10 flex h-full flex-col">
            <div className="mb-7 flex items-start justify-between gap-3">
              <div className="flex h-14 w-14 items-center justify-center rounded-full border border-[#58cdd0]/35 bg-[#58cdd0]/10 backdrop-blur-sm">
                <Car className="h-6 w-6 text-[#70dfe1]" />
              </div>
              <span className="rounded-full border border-white/15 bg-white/[0.07] px-3 py-1.5 text-[10px] font-semibold uppercase tracking-[0.18em] text-white/75">
                For drivers
              </span>
            </div>

            <div className="max-w-[245px]">
              <p className="mb-2 flex items-center gap-1.5 text-[11px] font-semibold uppercase tracking-[0.2em] text-[#72d8da]">
                <Sparkles className="h-3.5 w-3.5" />
                Premium rental
              </p>
              <h3 className="font-['Cormorant_Garamond'] text-[38px] font-medium leading-none tracking-[-0.02em]">
                Rent a Tesla
              </h3>
              <div className="my-4 h-px w-10 bg-[#58cdd0]" />
              <p className="text-[14px] leading-6 text-white/72">
                Premium Teslas delivered ready to drive. Rent by the day, week, or month.
              </p>
            </div>

            <div className="mt-auto inline-flex h-14 w-full items-center justify-between rounded-2xl bg-[linear-gradient(135deg,#08777a,#0b9a9d)] px-5 text-[15px] font-semibold text-white shadow-[0_12px_30px_rgba(7,136,139,0.28)]">
              Explore Rentals
              <ArrowRight className="h-5 w-5 transition-transform duration-300 group-hover:translate-x-1" />
            </div>
          </div>
        </button>

        <button
          type="button"
          onClick={handleManage}
          className="group relative min-h-[330px] overflow-hidden rounded-[28px] border border-[#dcd1c2] bg-[radial-gradient(circle_at_90%_72%,rgba(7,136,139,0.11),transparent_35%),linear-gradient(145deg,#fffdfa_0%,#f6f0e7_100%)] p-6 text-left text-[#071a24] shadow-[0_22px_60px_rgba(7,26,36,0.10)] transition duration-300 hover:-translate-y-1 hover:shadow-[0_28px_68px_rgba(7,26,36,0.14)] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#07888b] focus-visible:ring-offset-2"
          aria-label="Start Tesla management application"
        >
          <div className="absolute -right-14 bottom-1 h-52 w-52 rounded-full border border-[#07888b]/10 bg-white/30" />
          <KeyRound className="absolute -right-1 bottom-12 h-36 w-36 rotate-[-10deg] stroke-[0.75] text-[#07888b]/15 transition duration-500 group-hover:rotate-[-5deg] group-hover:scale-105 group-hover:text-[#07888b]/22" />

          <div className="relative z-10 flex h-full flex-col">
            <div className="mb-7 flex items-start justify-between gap-3">
              <div className="flex h-14 w-14 items-center justify-center rounded-full border border-[#07888b]/20 bg-[#07888b]/10">
                <KeyRound className="h-6 w-6 text-[#07888b]" />
              </div>
              <span className="rounded-full border border-[#b89555]/30 bg-white/60 px-3 py-1.5 text-[10px] font-semibold uppercase tracking-[0.18em] text-[#76613e]">
                For owners
              </span>
            </div>

            <div className="max-w-[250px]">
              <p className="mb-2 flex items-center gap-1.5 text-[11px] font-semibold uppercase tracking-[0.2em] text-[#07888b]">
                <Sparkles className="h-3.5 w-3.5" />
                Concierge management
              </p>
              <h3 className="font-['Cormorant_Garamond'] text-[38px] font-medium leading-none tracking-[-0.02em]">
                List My Tesla
              </h3>
              <div className="my-4 h-px w-10 bg-[#07888b]" />
              <p className="text-[14px] leading-6 text-[#586473]">
                Turn your Tesla into passive income. We handle rentals, cleaning, and guests.
              </p>
            </div>

            <div className="mt-auto inline-flex h-14 w-full items-center justify-between rounded-2xl bg-[#07343a] px-5 text-[15px] font-semibold text-white shadow-[0_12px_30px_rgba(7,52,58,0.18)]">
              Start Earning
              <ArrowRight className="h-5 w-5 transition-transform duration-300 group-hover:translate-x-1" />
            </div>
          </div>
        </button>
      </div>
    </section>
  );
}
