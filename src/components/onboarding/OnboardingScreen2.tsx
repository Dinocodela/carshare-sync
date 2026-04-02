import { Shield, Users, Wrench, CheckCircle2 } from "lucide-react";
import { useEffect, useState } from "react";

export function OnboardingScreen2() {
  const [visible, setVisible] = useState(false);
  const [showCards, setShowCards] = useState(false);

  useEffect(() => {
    setVisible(true);
    const t = setTimeout(() => setShowCards(true), 400);
    return () => clearTimeout(t);
  }, []);

  return (
    <div className="flex flex-col items-center justify-center h-full px-6 text-center relative">
      {/* Background gradient */}
      <div className="absolute inset-0 pointer-events-none">
        <div
          className="absolute top-1/3 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[500px] h-[500px] rounded-full opacity-15 blur-[100px] transition-all duration-[2000ms]"
          style={{
            background: "radial-gradient(circle, hsl(var(--primary)), hsl(175 70% 45%), transparent)",
            transform: visible ? "translate(-50%, -50%) scale(1)" : "translate(-50%, -50%) scale(0.3)",
          }}
        />
      </div>

      {/* Shield icon with trust ring */}
      <div
        className="mb-8 relative transition-all duration-700 ease-out"
        style={{
          opacity: visible ? 1 : 0,
          transform: visible ? "translateY(0) scale(1)" : "translateY(30px) scale(0.8)",
        }}
      >
        <div className="w-20 h-20 rounded-full bg-gradient-to-br from-primary/20 to-primary/5 backdrop-blur-sm flex items-center justify-center border border-primary/30 relative">
          <Shield className="w-9 h-9 text-primary drop-shadow-lg" strokeWidth={2.5} />
          {/* Animated checkmark */}
          <div
            className="absolute -bottom-1 -right-1 w-8 h-8 bg-primary rounded-full flex items-center justify-center shadow-lg transition-all duration-500 delay-700"
            style={{
              opacity: visible ? 1 : 0,
              transform: visible ? "scale(1)" : "scale(0)",
            }}
          >
            <CheckCircle2 className="w-5 h-5 text-primary-foreground" />
          </div>
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
        We Manage
        <br />
        <span className="bg-gradient-to-r from-primary to-accent bg-clip-text text-transparent">
          100% of Operations
        </span>
      </h1>

      <p
        className="text-base text-muted-foreground mb-8 max-w-xs transition-all duration-700 delay-300 ease-out"
        style={{
          opacity: visible ? 1 : 0,
          transform: visible ? "translateY(0)" : "translateY(20px)",
        }}
      >
        Guest screening, maintenance, insurance — you don't touch a thing.
      </p>

      {/* Trust cards */}
      <div className="space-y-3 w-full max-w-sm">
        {[
          {
            icon: Users,
            title: "No Guest Calls, Ever",
            desc: "We screen & communicate with all renters",
            delay: 0,
          },
          {
            icon: Wrench,
            title: "Professional Care",
            desc: "Cleaning, maintenance, and inspections handled",
            delay: 100,
          },
          {
            icon: Shield,
            title: "Fully Insured",
            desc: "Comprehensive coverage for total peace of mind",
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
    </div>
  );
}
