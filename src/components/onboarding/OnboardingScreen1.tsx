import { useEffect, useState } from "react";
import {
  BarChart3,
  CalendarDays,
  ChevronRight,
  Headphones,
  KeyRound,
} from "lucide-react";
import { Logo } from "@/components/ui/logo";
import { C, SERIF, SANS } from "@/components/luxury/tokens";
import { DiamondDivider } from "@/components/luxury/DiamondDivider";
import teslaCutout from "@/assets/tesla-black-cutout.png.asset.json";

const FEATURES = [
  {
    icon: Headphones,
    title: "Hosting support",
    description:
      "We help coordinate the rental experience from inquiry to return.",
  },
  {
    icon: BarChart3,
    title: "Owner visibility",
    description: "Track activity, trips, and vehicle details in the app.",
  },
  {
    icon: CalendarDays,
    title: "Flexible control",
    description:
      "You decide when your Tesla is available and review the details before you continue.",
  },
];

export function OnboardingScreen1() {
  const [visible, setVisible] = useState(false);
  const [showCards, setShowCards] = useState(false);

  useEffect(() => {
    setVisible(true);
    const timer = window.setTimeout(() => setShowCards(true), 280);
    return () => window.clearTimeout(timer);
  }, []);

  return (
    <section
      className="relative flex min-h-full w-full flex-col items-center overflow-hidden px-5 pb-5 text-center"
      style={{
        paddingTop: 14,
        fontFamily: SANS,
        color: C.headline,
        background: C.pageCream,
      }}
    >
      {/* Quiet editorial background shapes */}
      <div
        aria-hidden
        className="pointer-events-none absolute inset-0"
        style={{
          background:
            "radial-gradient(circle at 12% 64%, rgba(105,205,208,0.10), transparent 31%), radial-gradient(circle at 90% 55%, rgba(181,146,81,0.07), transparent 28%)",
        }}
      />

      {/* Brand */}
      <div
        className="relative z-10 flex flex-col items-center transition-all duration-700 ease-out"
        style={{
          opacity: visible ? 1 : 0,
          transform: visible ? "translateY(0)" : "translateY(12px)",
        }}
      >
        <div className="flex h-[66px] w-[66px] items-center justify-center">
          <Logo size="lg" linked={false} />
        </div>
        <div
          style={{
            marginTop: 5,
            paddingLeft: "0.39em",
            fontFamily: SERIF,
            fontSize: 23,
            lineHeight: "27px",
            fontWeight: 500,
            letterSpacing: "0.39em",
            color: C.headline,
          }}
        >
          TESLYS
        </div>
      </div>

      {/* Hero product composition */}
      <div
        className="relative z-10 mt-4 w-full max-w-[370px] transition-all duration-700 delay-100 ease-out"
        style={{
          height: 235,
          opacity: visible ? 1 : 0,
          transform: visible ? "translateY(0) scale(1)" : "translateY(16px) scale(0.97)",
        }}
      >
        <div
          aria-hidden
          className="absolute inset-x-2 bottom-1 top-0 overflow-hidden rounded-[34px]"
          style={{
            background:
              "linear-gradient(180deg, rgba(255,253,249,0.88) 0%, rgba(247,241,232,0.94) 100%)",
            border: `1px solid ${C.borderSoft}`,
            boxShadow: "0 24px 55px rgba(55,41,25,0.08)",
          }}
        >
          <div
            className="absolute left-1/2 top-[18px] h-[196px] w-[178px] -translate-x-1/2 rounded-t-[90px] border"
            style={{ borderColor: "rgba(181,146,81,0.18)" }}
          />
          <div
            className="absolute left-1/2 top-[34px] h-[180px] w-[144px] -translate-x-1/2 rounded-t-[72px] border"
            style={{ borderColor: "rgba(181,146,81,0.12)" }}
          />
          <div
            className="absolute inset-x-0 bottom-0 h-[78px]"
            style={{
              background:
                "linear-gradient(180deg, rgba(255,253,249,0), rgba(255,253,249,0.96))",
            }}
          />
        </div>

        <img
          src={teslaCutout.url}
          alt="Black Tesla"
          className="pointer-events-none absolute bottom-[23px] left-[18px] z-10 w-[68%] max-w-none object-contain"
          style={{ filter: "drop-shadow(0 18px 18px rgba(3,37,44,0.20))" }}
        />

        {/* Phone mockup kept in code so text remains crisp and responsive */}
        <div
          aria-hidden
          className="absolute bottom-[17px] right-[31px] z-20 h-[174px] w-[98px] rotate-[3deg] overflow-hidden rounded-[20px] border-[3px]"
          style={{
            borderColor: "#9F7D44",
            background: "linear-gradient(165deg, #082E35 0%, #031C22 100%)",
            boxShadow: "0 18px 30px rgba(3,37,44,0.28)",
          }}
        >
          <div className="mx-auto mt-[7px] h-[4px] w-[27px] rounded-full bg-white/25" />
          <div className="px-[8px] pt-[10px] text-left">
            <div className="h-[5px] w-[36px] rounded-full bg-white/65" />
            <div className="mt-[10px] flex items-center justify-between">
              <div className="h-[4px] w-[24px] rounded-full bg-white/25" />
              <div className="h-[11px] w-[11px] rounded-full bg-[#B59251]" />
            </div>
            <div className="mt-[8px] grid grid-cols-5 gap-[3px]">
              {Array.from({ length: 15 }).map((_, index) => (
                <span
                  key={index}
                  className="block h-[4px] rounded-[2px]"
                  style={{
                    background:
                      index === 8 ? C.gold : "rgba(255,255,255,0.16)",
                  }}
                />
              ))}
            </div>
            <div className="mt-[11px] space-y-[6px]">
              {["72%", "87%", "64%"].map((width) => (
                <div
                  key={width}
                  className="rounded-[6px] border border-white/10 bg-white/[0.04] p-[5px]"
                >
                  <div className="h-[3px] rounded-full bg-white/45" style={{ width }} />
                  <div className="mt-[4px] h-[3px] w-[48%] rounded-full bg-white/15" />
                </div>
              ))}
            </div>
          </div>
        </div>

        <div
          aria-hidden
          className="absolute bottom-[14px] right-[11px] z-30 flex h-[52px] w-[52px] items-center justify-center rounded-[14px]"
          style={{
            background: C.darkTeal,
            border: `1px solid ${C.goldBorder}`,
            boxShadow: "0 12px 22px rgba(3,37,44,0.18)",
          }}
        >
          <KeyRound size={24} strokeWidth={1.55} color={C.gold} />
        </div>
      </div>

      {/* Copy */}
      <div
        className="relative z-10 transition-all duration-700 delay-200 ease-out"
        style={{
          marginTop: 17,
          opacity: visible ? 1 : 0,
          transform: visible ? "translateY(0)" : "translateY(12px)",
        }}
      >
        <h1
          style={{
            margin: 0,
            fontFamily: SERIF,
            fontSize: "clamp(37px, 10.5vw, 44px)",
            lineHeight: 0.98,
            fontWeight: 500,
            letterSpacing: "-0.035em",
            color: C.headline,
          }}
        >
          List with confidence
        </h1>
        <p
          style={{
            margin: "17px auto 0",
            maxWidth: 344,
            fontFamily: SANS,
            fontSize: 14.5,
            lineHeight: "22px",
            fontWeight: 400,
            color: C.body,
          }}
        >
          Teslys helps Tesla owners manage bookings, guest communication, and
          day-to-day hosting in one place.
        </p>
        <div style={{ marginTop: 19 }}>
          <DiamondDivider tone="light" />
        </div>
      </div>

      {/* Feature cards */}
      <div className="relative z-10 mt-5 flex w-full max-w-[370px] flex-col gap-3">
        {FEATURES.map(({ icon: Icon, title, description }, index) => (
          <div
            key={title}
            className="flex items-center rounded-[20px] text-left transition-all duration-500 ease-out"
            style={{
              minHeight: 92,
              padding: "14px 14px 14px 13px",
              gap: 13,
              background: "rgba(255,253,249,0.92)",
              border: `1px solid ${C.border}`,
              boxShadow: "0 12px 28px rgba(55,41,25,0.055)",
              opacity: showCards ? 1 : 0,
              transform: showCards ? "translateY(0)" : "translateY(12px)",
              transitionDelay: `${index * 80}ms`,
            }}
          >
            <div
              className="flex h-[54px] w-[54px] shrink-0 items-center justify-center rounded-full"
              style={{
                background: C.warmWhite,
                border: `1px solid ${C.goldBorder}`,
              }}
            >
              <Icon size={23} strokeWidth={1.45} color={C.teal} />
            </div>
            <div className="min-w-0 flex-1">
              <h2
                style={{
                  margin: 0,
                  fontFamily: SERIF,
                  fontSize: 20,
                  lineHeight: "23px",
                  fontWeight: 500,
                  color: C.headline,
                }}
              >
                {title}
              </h2>
              <p
                style={{
                  margin: "3px 0 0",
                  fontFamily: SANS,
                  fontSize: 12.5,
                  lineHeight: "17px",
                  color: C.body,
                }}
              >
                {description}
              </p>
            </div>
            <ChevronRight
              className="shrink-0"
              size={19}
              strokeWidth={1.45}
              color={C.gold}
            />
          </div>
        ))}
      </div>

      <p
        className="relative z-10"
        style={{
          margin: "17px 0 0",
          fontFamily: SANS,
          fontSize: 10.5,
          lineHeight: "15px",
          color: C.muted,
        }}
      >
        Features and availability may vary by market and vehicle.
      </p>
    </section>
  );
}
