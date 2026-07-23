import { useState, useCallback, useRef } from "react";
import { useNavigate } from "react-router-dom";
import { Capacitor } from "@capacitor/core";
import { Browser } from "@capacitor/browser";
import { Button } from "@/components/ui/button";
import { ChevronRight } from "lucide-react";
import { RentOnboardingScreen1 } from "./RentOnboardingScreen1";
import { RentOnboardingScreen2 } from "./RentOnboardingScreen2";
import { RentOnboardingScreen3 } from "./RentOnboardingScreen3";

const RENT_URL = "https://app.eonrides.com";
const SCREENS = [RentOnboardingScreen1, RentOnboardingScreen2, RentOnboardingScreen3];

export function RentOnboardingFlow() {
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

  const handleComplete = async () => {
    try {
      localStorage.setItem("hasSeenRentOnboarding", "true");
    } catch {
      // ignore
    }
    try {
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      const w = window as any;
      if (Array.isArray(w.dataLayer)) {
        w.dataLayer.push({ event: "rent_onboarding_completed" });
      }
    } catch {
      // ignore
    }
    if (Capacitor.isNativePlatform()) {
      try {
        await Browser.open({ url: RENT_URL });
        return;
      } catch {
        // fall through
      }
    }
    window.location.href = RENT_URL;
  };

  const handleNext = () => {
    if (currentScreen < SCREENS.length - 1) {
      goTo(currentScreen + 1);
    } else {
      handleComplete();
    }
  };

  const handleSkip = () => {
    handleComplete();
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

  return (
    <div className="min-h-screen flex flex-col bg-gradient-hero relative overflow-hidden">
      {/* Top bar with back + skip */}
      <div className="relative z-10 flex items-center justify-between px-4 pt-4 sm:pt-6">
        <button
          type="button"
          onClick={() => navigate("/")}
          className="text-xs font-medium text-muted-foreground hover:text-foreground px-3 py-1.5 rounded-full transition-colors"
          aria-label="Back to home"
        >
          ← Back
        </button>
        <button
          type="button"
          onClick={handleSkip}
          className="text-xs font-medium text-muted-foreground hover:text-foreground px-3 py-1.5 rounded-full transition-colors"
        >
          Skip
        </button>
      </div>

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

      <div className="relative z-10 pb-8 px-6 space-y-5">
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
            </button>
          ))}
        </div>

        <Button
          onClick={handleNext}
          size="lg"
          className="w-full max-w-sm mx-auto flex gap-2 rounded-xl h-12 text-base font-semibold shadow-lg shadow-primary/20 hover:shadow-primary/30 transition-shadow"
        >
          {currentScreen === SCREENS.length - 1 ? "Browse Available Teslas" : "Continue"}
          <ChevronRight className="w-5 h-5" />
        </Button>

        {currentScreen === SCREENS.length - 1 && (
          <p className="text-center text-[11px] text-muted-foreground">
            Instant booking · Delivery available in Los Angeles
          </p>
        )}
      </div>
    </div>
  );
}
