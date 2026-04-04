import { useState, useCallback, useRef, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { ChevronRight } from "lucide-react";
import { Logo } from "@/components/ui/logo";
import { RentATeslaLink } from "@/components/RentATeslaLink";
import { OnboardingScreen1 } from "./OnboardingScreen1";
import { OnboardingScreen2 } from "./OnboardingScreen2";
import { OnboardingScreen3 } from "./OnboardingScreen3";

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

      <style>{`
        @keyframes progressFill {
          from { transform: scaleX(0); }
          to { transform: scaleX(1); }
        }
      `}</style>
    </div>
  );
}
