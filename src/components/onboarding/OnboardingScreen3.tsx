import { CircleDollarSign, BarChart3, LineChart, Crown } from "lucide-react";
import { AppStoreBadges } from "@/components/ui/AppStoreBadges";
import { useEffect, useState } from "react";
import { C, SERIF, SANS } from "@/components/luxury/tokens";
import { DiamondDivider } from "@/components/luxury/DiamondDivider";

const FEATURES = [
  {
    icon: CircleDollarSign,
    title: "Earnings and payment records",
    desc: "Review recorded earnings and payment status when available.",
  },
  {
    icon: LineChart,
    title: "Vehicle activity",
    desc: "Follow booking and vehicle information provided through the platform.",
  },
  {
    icon: BarChart3,
    title: "Clearer recordkeeping",
    desc: "Keep key operating details organized without promising specific financial results.",
  },
];

export function OnboardingScreen3() {
  const [visible, setVisible] = useState(false);
  const [showRows, setShowRows] = useState(false);
  const [showBadges, setShowBadges] = useState(false);

  useEffect(() => {
    setVisible(true);
    const t1 = setTimeout(() => setShowRows(true), 350);
    const t2 = setTimeout(() => setShowBadges(true), 900);
    return () => {
      clearTimeout(t1);
      clearTimeout(t2);
    };
  }, []);

  return (
    <div
      className="flex flex-col items-center min-h-full px-6 pt-6 pb-8 text-center relative"
      style={{ fontFamily: SANS, color: C.headline }}
    >
      {/* Icon chip — dark teal on this final screen for emphasis */}
      <div
        className="relative transition-all duration-700 ease-out"
        style={{
          opacity: visible ? 1 : 0,
          transform: visible ? "translateY(0)" : "translateY(16px)",
        }}
      >
        <div
          className="flex items-center justify-center"
          style={{
            width: 76,
            height: 76,
            borderRadius: "50%",
            background: `linear-gradient(135deg, ${C.darkTeal} 0%, ${C.darkTealEnd} 100%)`,
            border: `1px solid ${C.borderSoft}`,
            boxShadow: "0 14px 30px rgba(3,37,44,0.24)",
          }}
        >
          <Crown size={28} strokeWidth={1.5} style={{ color: C.gold }} />
        </div>
      </div>

      <p
        className="transition-all duration-700 delay-100 ease-out"
        style={{
          marginTop: 22,
          fontFamily: SANS,
          fontSize: 10,
          letterSpacing: "0.28em",
          textTransform: "uppercase",
          color: C.gold,
          fontWeight: 600,
          opacity: visible ? 1 : 0,
        }}
      >
        Track Your Vehicle
      </p>

      <h1
        className="transition-all duration-700 delay-150 ease-out"
        style={{
          marginTop: 10,
          fontFamily: SERIF,
          fontSize: 38,
          lineHeight: "42px",
          fontWeight: 500,
          letterSpacing: "-0.015em",
          color: C.headline,
          opacity: visible ? 1 : 0,
          transform: visible ? "translateY(0)" : "translateY(14px)",
          maxWidth: 330,
        }}
      >
        Paid like
        <br />
        <em
          style={{
            fontStyle: "italic",
            color: C.teal,
            fontWeight: 500,
          }}
        >
          clockwork.
        </em>
      </h1>

      <p
        className="transition-all duration-700 delay-300 ease-out"
        style={{
          marginTop: 14,
          fontFamily: SANS,
          fontSize: 14.5,
          lineHeight: "22px",
          color: C.body,
          maxWidth: 300,
          opacity: visible ? 1 : 0,
          transform: visible ? "translateY(0)" : "translateY(14px)",
        }}
      >
        Reliable deposits, transparent reporting, and a concierge team on call —
        all inside your Teslys app.
      </p>

      <div style={{ marginTop: 22, width: "100%" }}>
        <DiamondDivider tone="light" />
      </div>

      <div
        style={{
          marginTop: 22,
          width: "100%",
          maxWidth: 360,
          background: C.warmWhite,
          border: `1px solid ${C.border}`,
          borderRadius: 20,
          padding: "6px 18px",
          boxShadow: "0 18px 40px rgba(3,37,44,0.06)",
        }}
      >
        {FEATURES.map(({ icon: Icon, title, desc }, i) => (
          <div
            key={i}
            className="flex items-center gap-3.5 transition-all duration-500 ease-out"
            style={{
              padding: "14px 0",
              borderBottom:
                i < FEATURES.length - 1 ? `1px solid ${C.borderSoft}` : "none",
              opacity: showRows ? 1 : 0,
              transform: showRows ? "translateX(0)" : "translateX(-14px)",
              transitionDelay: `${i * 90}ms`,
            }}
          >
            <div
              className="flex items-center justify-center shrink-0"
              style={{
                width: 38,
                height: 38,
                borderRadius: "50%",
                background: C.tealSoft,
                border: `1px solid ${C.borderSoft}`,
              }}
            >
              <Icon size={17} strokeWidth={1.6} style={{ color: C.tealDark }} />
            </div>
            <div className="text-left flex-1 min-w-0">
              <h3
                style={{
                  fontFamily: SERIF,
                  fontSize: 16,
                  lineHeight: "20px",
                  fontWeight: 500,
                  color: C.headline,
                  letterSpacing: "-0.005em",
                }}
              >
                {title}
              </h3>
              <p
                style={{
                  marginTop: 2,
                  fontFamily: SANS,
                  fontSize: 12.5,
                  lineHeight: "17px",
                  color: C.body,
                }}
              >
                {desc}
              </p>
            </div>
          </div>
        ))}
      </div>

      {/* App store badges */}
      <div
        className="transition-all duration-700 ease-out"
        style={{
          marginTop: 22,
          opacity: showBadges ? 1 : 0,
          transform: showBadges ? "translateY(0)" : "translateY(12px)",
        }}
      >
        <AppStoreBadges heading="Or download the Teslys app" size="small" />
      </div>
    </div>
  );
}
