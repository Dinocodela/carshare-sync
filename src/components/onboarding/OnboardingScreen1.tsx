import { DollarSign, TrendingUp, Zap } from "lucide-react";
import { useEffect, useState } from "react";

export function OnboardingScreen1() {
  const [visible, setVisible] = useState(false);
  const [showFeatures, setShowFeatures] = useState(false);

  useEffect(() => {
    setVisible(true);
    const t = setTimeout(() => setShowFeatures(true), 400);
    return () => clearTimeout(t);
  }, []);

  return (
    <div className="flex flex-col items-center justify-center h-full px-6 text-center relative overflow-hidden">
      {/* Animated background glow */}
      <div className="absolute inset-0 pointer-events-none">
        <div
          className="absolute top-1/4 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[500px] h-[500px] rounded-full opacity-20 blur-[100px] transition-all duration-[2000ms]"
          style={{
            background: "radial-gradient(circle, hsl(var(--primary)), hsl(var(--accent)), transparent)",
            transform: visible ? "translate(-50%, -50%) scale(1)" : "translate(-50%, -50%) scale(0.3)",
          }}
        />
      </div>

      {/* Icon with animated rings */}
      <div
        className="mb-8 relative transition-all duration-700 ease-out"
        style={{
          opacity: visible ? 1 : 0,
          transform: visible ? "translateY(0) scale(1)" : "translateY(30px) scale(0.8)",
        }}
      >
        {/* Outer ring pulse */}
        <div className="absolute inset-0 w-20 h-20 rounded-full border-2 border-primary/20 animate-[ping_3s_ease-out_infinite]" />
        <div className="absolute inset-0 w-20 h-20 rounded-full border border-primary/10 animate-[ping_3s_ease-out_1s_infinite]" />
        {/* Icon circle */}
        <div className="w-20 h-20 rounded-full bg-gradient-to-br from-primary/20 to-accent/20 backdrop-blur-sm flex items-center justify-center border border-primary/30">
          <DollarSign className="w-9 h-9 text-primary drop-shadow-lg" strokeWidth={2.5} />
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
        Your Tesla Earns
        <br />
        <span className="bg-gradient-to-r from-primary to-accent bg-clip-text text-transparent">
          While You Sleep
        </span>
      </h1>

      <p
        className="text-base text-muted-foreground mb-8 max-w-xs transition-all duration-700 delay-300 ease-out"
        style={{
          opacity: visible ? 1 : 0,
          transform: visible ? "translateY(0)" : "translateY(20px)",
        }}
      >
        Turn your idle Tesla into a reliable passive income stream — zero effort, zero stress.
      </p>

      {/* Feature cards */}
      <div className="space-y-3 w-full max-w-sm">
        {[
          {
            icon: TrendingUp,
            title: "Earn $1,500–$3,500/mo",
            desc: "Per vehicle, consistently",
            delay: 0,
          },
          {
            icon: Zap,
            title: "Zero Effort Required",
            desc: "We handle literally everything",
            delay: 100,
          },
          {
            icon: DollarSign,
            title: "Keep Full Ownership",
            desc: "Your car, your asset, our management",
            delay: 200,
          },
        ].map(({ icon: Icon, title, desc, delay }, i) => (
          <div
            key={i}
            className="flex items-center gap-4 p-3.5 rounded-xl bg-card/80 backdrop-blur-sm border border-border/50 shadow-sm transition-all duration-500 ease-out hover:shadow-md hover:border-primary/20"
            style={{
              opacity: showFeatures ? 1 : 0,
              transform: showFeatures ? "translateX(0)" : "translateX(-20px)",
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
    </div>
  );
}
