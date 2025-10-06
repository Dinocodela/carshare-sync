import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { ChevronRight } from "lucide-react";
import { OnboardingScreen1 } from "./OnboardingScreen1";
import { OnboardingScreen2 } from "./OnboardingScreen2";
import { OnboardingScreen3 } from "./OnboardingScreen3";

export function OnboardingFlow() {
  const [currentScreen, setCurrentScreen] = useState(0);
  const navigate = useNavigate();

  const screens = [
    <OnboardingScreen1 key="screen1" />,
    <OnboardingScreen2 key="screen2" />,
    <OnboardingScreen3 key="screen3" />,
  ];

  const handleNext = () => {
    if (currentScreen < screens.length - 1) {
      setCurrentScreen(currentScreen + 1);
    } else {
      handleComplete();
    }
  };

  const handleSkip = () => {
    handleComplete();
  };

  const handleComplete = () => {
    localStorage.setItem("hasSeenOnboarding", "true");
    navigate("/");
  };

  return (
    <div className="min-h-screen flex flex-col bg-background">
      {/* Skip button */}
      <div className="absolute top-4 right-4 z-10">
        <Button variant="ghost" onClick={handleSkip}>
          Skip
        </Button>
      </div>

      {/* Screen content */}
      <div className="flex-1 flex items-center justify-center">
        {screens[currentScreen]}
      </div>

      {/* Bottom navigation */}
      <div className="pb-8 px-6">
        {/* Progress dots */}
        <div className="flex justify-center gap-2 mb-6">
          {screens.map((_, index) => (
            <div
              key={index}
              className={`h-2 rounded-full transition-all ${
                index === currentScreen
                  ? "w-8 bg-primary"
                  : "w-2 bg-muted-foreground/30"
              }`}
            />
          ))}
        </div>

        {/* Next/Get Started button */}
        <Button
          onClick={handleNext}
          size="lg"
          className="w-full max-w-md mx-auto flex gap-2"
        >
          {currentScreen === screens.length - 1 ? "Get Started" : "Next"}
          <ChevronRight className="w-5 h-5" />
        </Button>
      </div>
    </div>
  );
}
