import { Calendar, CircleDollarSign, BarChart3, Star } from "lucide-react";
import { AppStoreBadges } from "@/components/ui/AppStoreBadges";
import { useEffect, useState } from "react";

export function OnboardingScreen3() {
  const [visible, setVisible] = useState(false);
  const [showCards, setShowCards] = useState(false);
  const [showBadges, setShowBadges] = useState(false);

  useEffect(() => {
    setVisible(true);
    const t1 = setTimeout(() => setShowCards(true), 400);
    const t2 = setTimeout(() => setShowBadges(true), 900);
    return () => {
      clearTimeout(t1);
      clearTimeout(t2);
    };
  }, []);

  return (
    <div className="flex flex-col items-center justify-center h-full px-6 text-center relative">
      {/* Background */}
      <div className="absolute inset-0 pointer-events-none">
        <div
          className="absolute top-1/3 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[500px] h-[500px] rounded-full opacity-15 blur-[100px] transition-all duration-[2000ms]"
          style={{
            background: "radial-gradient(circle, hsl(var(--accent)), hsl(var(--primary)), transparent)",
            transform: visible ? "translate(-50%, -50%) scale(1)" : "translate(-50%, -50%) scale(0.3)",
          }}
        />
      </div>

      {/* Icon */}
      <div
        className="mb-8 relative transition-all duration-700 ease-out"
        style={{
          opacity: visible ? 1 : 0,
          transform: visible ? "translateY(0) scale(1)" : "translateY(30px) scale(0.8)",
        }}
      >
        <div className="w-20 h-20 rounded-full bg-gradient-to-br from-accent/20 to-primary/20 backdrop-blur-sm flex items-center justify-center border border-primary/30">
          <Calendar className="w-9 h-9 text-primary drop-shadow-lg" strokeWidth={2.5} />
        </div>
      </div>

      {/* Heading */}
      <h1
        className="text-3xl font-extrabold mb-3 text-foreground leading-tight tracking-tight transition-all duration-700 delay-150 ease-out"
        style={{
          opacity: visible ? 1 : 0,
          transform: visible ? "translateY(0)" : "translateY(20px)",
        }}
      >
        Paid Like
        <br />
        <span className="bg-gradient-to-r from-primary to-accent bg-clip-text text-transparent">
          Clockwork
        </span>
      </h1>

      <p
        className="text-base text-muted-foreground mb-6 max-w-xs transition-all duration-700 delay-300 ease-out"
        style={{
          opacity: visible ? 1 : 0,
          transform: visible ? "translateY(0)" : "translateY(20px)",
        }}
      >
        Reliable deposits on the 1st & 15th. Track everything in real-time.
      </p>

      {/* Feature cards */}
      <div className="space-y-3 w-full max-w-sm mb-6">
        {[
          {
            icon: CircleDollarSign,
            title: "Bi-Monthly Deposits",
            desc: "Automatic payments, always on time",
            delay: 0,
          },
          {
            icon: BarChart3,
            title: "Live Earnings Dashboard",
            desc: "Real-time tracking per vehicle",
            delay: 100,
          },
          {
            icon: Star,
            title: "Nothing to Lose",
            desc: "Everything to gain — start free today",
            delay: 200,
          },
        ].map(({ icon: Icon, title, desc, delay }, i) => (
          <div
            key={i}
            className="flex items-center gap-4 p-3.5 rounded-xl bg-card/80 backdrop-blur-sm border border-border/50 shadow-sm transition-all duration-500 ease-out hover:shadow-md hover:border-primary/20"
            style={{
              opacity: showCards ? 1 : 0,
              transform: showCards ? "translateX(0)" : "translateX(-20px)",
              transitionDelay: `${delay}ms`,
            }}
          >
            <div className="w-10 h-10 rounded-lg bg-primary/10 flex items-center justify-center shrink-0">
              <Icon className="w-5 h-5 text-primary" />
            </div>
            <div className="text-left">
              <h3 className="font-semibold text-sm text-foreground">{title}</h3>
              <p className="text-xs text-muted-foreground">{desc}</p>
            </div>
          </div>
        ))}
      </div>

      {/* App store badges */}
      <div
        className="transition-all duration-700 ease-out"
        style={{
          opacity: showBadges ? 1 : 0,
          transform: showBadges ? "translateY(0)" : "translateY(15px)",
        }}
      >
        <AppStoreBadges heading="Or download our mobile app" size="small" />
      </div>
    </div>
  );
}
