import { useState, useCallback, useRef } from "react";
import { useNavigate } from "react-router-dom";
import { ArrowRight } from "lucide-react";
import { RentATeslaLink } from "@/components/RentATeslaLink";
import { C, SERIF, SANS } from "@/components/luxury/tokens";
import { OnboardingScreen1 } from "./OnboardingScreen1";
import { OnboardingScreen2 } from "./OnboardingScreen2";
import { OnboardingScreen3 } from "./OnboardingScreen3";

function WhatsAppBubble() {
  const message = encodeURIComponent(
    "Hi Teslys, I'm interested in learning more about hosting my Tesla."
  );
  return (
    <a
      href={`https://wa.me/13106990473?text=${message}`}
      target="_blank"
      rel="noopener noreferrer"
      aria-label="Chat with us on WhatsApp"
      className="fixed bottom-6 right-6 z-50 flex items-center justify-center w-14 h-14 rounded-full bg-[#25D366] shadow-lg shadow-black/20 hover:shadow-xl hover:scale-105 active:scale-95 transition-all duration-200 animate-bounce-in"
    >
      <svg
        xmlns="http://www.w3.org/2000/svg"
        viewBox="0 0 24 24"
        fill="white"
        className="w-7 h-7"
        aria-hidden="true"
      >
        <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z" />
      </svg>
    </a>
  );
}

const SCREENS = [OnboardingScreen1, OnboardingScreen2, OnboardingScreen3];

export function OnboardingFlow() {
  const [currentScreen, setCurrentScreen] = useState(0);
  const [direction, setDirection] = useState<"left" | "right">("left");
  const [animating, setAnimating] = useState(false);
  const navigate = useNavigate();
  const touchStartX = useRef(0);

  const goTo = useCallback(
    (index: number) => {
      if (index === currentScreen || animating) return;
      setDirection(index > currentScreen ? "left" : "right");
      setAnimating(true);
      setTimeout(() => {
        setCurrentScreen(index);
        setAnimating(false);
      }, 220);
    },
    [currentScreen, animating]
  );

  const handleNext = () => {
    if (currentScreen < SCREENS.length - 1) {
      goTo(currentScreen + 1);
    } else {
      handleComplete();
    }
  };

  const handleComplete = () => {
    localStorage.setItem("hasSeenOnboarding", "true");
    navigate("/");
  };

  const handleSkip = () => {
    localStorage.setItem("hasSeenOnboarding", "true");
    navigate("/");
  };

  const handleTouchStart = (e: React.TouchEvent) => {
    touchStartX.current = e.touches[0].clientX;
  };

  const handleTouchEnd = (e: React.TouchEvent) => {
    const diff = touchStartX.current - e.changedTouches[0].clientX;
    if (Math.abs(diff) > 60) {
      if (diff > 0 && currentScreen < SCREENS.length - 1) goTo(currentScreen + 1);
      if (diff < 0 && currentScreen > 0) goTo(currentScreen - 1);
    }
  };

  const ScreenComponent = SCREENS[currentScreen];
  const isLast = currentScreen === SCREENS.length - 1;

  return (
    <div
      className="min-h-screen flex flex-col relative overflow-hidden"
      style={{ background: C.pageCream, fontFamily: SANS, color: C.headline }}
    >
      <RentATeslaLink />

      {/* Soft ambient teal glow (single, restrained) */}
      <div
        aria-hidden
        className="absolute pointer-events-none"
        style={{
          top: "-160px",
          left: "50%",
          transform: "translateX(-50%)",
          width: 520,
          height: 520,
          borderRadius: "50%",
          background:
            "radial-gradient(circle, rgba(7,139,142,0.10) 0%, rgba(7,139,142,0) 70%)",
          filter: "blur(20px)",
        }}
      />

      {/* Top bar: step counter + skip */}
      <div
        className="relative z-10 flex items-center justify-between px-6"
        style={{ paddingTop: "calc(env(safe-area-inset-top) + 18px)" }}
      >
        <span
          style={{
            fontFamily: SANS,
            fontSize: 11,
            letterSpacing: "0.22em",
            textTransform: "uppercase",
            color: C.gold,
            fontWeight: 600,
          }}
        >
          {String(currentScreen + 1).padStart(2, "0")}
          <span style={{ color: C.divider, margin: "0 6px" }}>/</span>
          {String(SCREENS.length).padStart(2, "0")}
        </span>
        {!isLast && (
          <button
            type="button"
            onClick={handleSkip}
            style={{
              fontFamily: SANS,
              fontSize: 12,
              letterSpacing: "0.14em",
              textTransform: "uppercase",
              color: C.muted,
              fontWeight: 500,
              padding: "6px 4px",
            }}
            aria-label="Skip onboarding"
          >
            Skip
          </button>
        )}
      </div>

      {/* Screen content */}
      <div
        className="flex-1 min-h-0 overflow-y-auto flex items-center justify-center"
        onTouchStart={handleTouchStart}
        onTouchEnd={handleTouchEnd}
      >
        <div
          key={currentScreen}
          className="w-full h-full transition-all duration-300 ease-out"
          style={{
            opacity: animating ? 0 : 1,
            transform: animating
              ? direction === "left"
                ? "translateX(-24px)"
                : "translateX(24px)"
              : "translateX(0)",
          }}
        >
          <ScreenComponent />
        </div>
      </div>

      {/* Bottom section */}
      <div
        className="relative z-10 px-6"
        style={{
          paddingBottom: "calc(env(safe-area-inset-bottom) + 26px)",
          paddingTop: 18,
        }}
      >
        {/* Progress dots */}
        <div className="flex justify-center items-center gap-2 mb-5">
          {SCREENS.map((_, index) => {
            const active = index === currentScreen;
            return (
              <button
                key={index}
                type="button"
                onClick={() => goTo(index)}
                aria-label={`Go to screen ${index + 1}`}
                className="transition-all duration-500"
                style={{
                  height: 6,
                  width: active ? 28 : 6,
                  borderRadius: 999,
                  background: active ? C.teal : C.divider,
                  opacity: active ? 1 : 0.55,
                }}
              />
            );
          })}
        </div>

        {/* CTA — luxury teal gradient pill */}
        <button
          type="button"
          onClick={handleNext}
          className="w-full max-w-sm mx-auto flex items-center justify-center gap-2 active:scale-[0.99] transition-transform"
          style={{
            display: "flex",
            height: 54,
            borderRadius: 999,
            background: "linear-gradient(135deg, #056F73 0%, #07989B 100%)",
            color: "#fff",
            fontFamily: SERIF,
            fontSize: 19,
            fontWeight: 500,
            letterSpacing: "-0.01em",
            boxShadow: "0 12px 28px rgba(0,92,96,0.22)",
          }}
        >
          <span>{isLast ? "Enter Teslys" : "Continue"}</span>
          <ArrowRight size={19} strokeWidth={1.75} />
        </button>

        {/* Trust text on last screen */}
        {isLast && (
          <p
            className="text-center animate-fade-in"
            style={{
              marginTop: 12,
              fontFamily: SANS,
              fontSize: 11,
              letterSpacing: "0.14em",
              textTransform: "uppercase",
              color: C.muted,
            }}
          >
            Trusted by Tesla owners across the US
          </p>
        )}
      </div>

      <WhatsAppBubble />

      <style>{`
        @keyframes bounceIn {
          0% { opacity: 0; transform: scale(0.3) translateY(20px); }
          50% { opacity: 1; transform: scale(1.05) translateY(-5px); }
          70% { transform: scale(0.95) translateY(0); }
          100% { opacity: 1; transform: scale(1) translateY(0); }
        }
        .animate-bounce-in {
          animation: bounceIn 0.6s ease-out 1.2s both;
        }
      `}</style>
    </div>
  );
}
