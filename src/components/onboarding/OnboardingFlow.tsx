import { useState, useCallback, useRef, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { ChevronRight } from "lucide-react";
import { Logo } from "@/components/ui/logo";
import { RentATeslaLink } from "@/components/RentATeslaLink";
import { OnboardingScreen1 } from "./OnboardingScreen1";
import { OnboardingScreen2 } from "./OnboardingScreen2";
import { OnboardingScreen3 } from "./OnboardingScreen3";

function WhatsAppBubble() {
  const message = encodeURIComponent("Hi Teslys, I'm interested in learning more about hosting my Tesla.");
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
      }, 250);
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

  // Swipe support
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

  return (
    <div className="min-h-screen flex flex-col bg-gradient-hero relative overflow-hidden">
      <RentATeslaLink />

      {/* Screen content with transitions */}
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
                ? "translateX(-30px)"
                : "translateX(30px)"
              : "translateX(0)",
          }}
        >
          <ScreenComponent />
        </div>
      </div>

      {/* Bottom section */}
      <div className="relative z-10 pb-8 px-6 space-y-5">
        {/* Progress indicator */}
        <div className="flex justify-center gap-2">
          {SCREENS.map((_, index) => (
            <button
              key={index}
              type="button"
              onClick={() => goTo(index)}
              className="relative h-2 rounded-full transition-all duration-500 cursor-pointer overflow-hidden"
              style={{ width: index === currentScreen ? 32 : 8 }}
              aria-label={`Go to screen ${index + 1}`}
            >
              <div
                className="absolute inset-0 rounded-full transition-colors duration-300"
                style={{
                  backgroundColor:
                    index === currentScreen
                      ? "hsl(var(--primary))"
                      : "hsl(var(--muted-foreground) / 0.25)",
                }}
              />
              {/* Active fill animation */}
              {index === currentScreen && (
                <div
                  className="absolute inset-0 rounded-full bg-primary/50 origin-left"
                  style={{
                    animation: "progressFill 4s linear forwards",
                  }}
                />
              )}
            </button>
          ))}
        </div>

        {/* CTA */}
        <Button
          onClick={handleNext}
          size="lg"
          className="w-full max-w-sm mx-auto flex gap-2 rounded-xl h-12 text-base font-semibold shadow-lg shadow-primary/20 hover:shadow-primary/30 transition-shadow"
        >
          {currentScreen === SCREENS.length - 1 ? "Get Started" : "Continue"}
          <ChevronRight className="w-5 h-5" />
        </Button>

        {/* Trust text on last screen */}
        {currentScreen === SCREENS.length - 1 && (
          <p className="text-center text-[11px] text-muted-foreground animate-fade-in">
            Trusted by Tesla owners across the US 🇺🇸
          </p>
        )}
      </div>

      <WhatsAppBubble />

      <style>{`
        @keyframes progressFill {
          from { transform: scaleX(0); }
          to { transform: scaleX(1); }
        }
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
