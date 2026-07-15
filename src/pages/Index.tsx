import { useEffect, useMemo, useState } from "react";
import { useNavigate, Link, Navigate } from "react-router-dom";
import { useAuth } from "@/hooks/useAuth";
import { Capacitor } from "@capacitor/core";
import { Browser } from "@capacitor/browser";
import { StatusBar } from "@capacitor/status-bar";
import { ScreenOrientation } from "@capacitor/screen-orientation";
import {
  ArrowRight,
  CarFront,
  KeyRound,
  Crown,
  Calculator,
  ShieldCheck,
  ConciergeBell,
  Star,
  CheckCircle2,
  Gem,
} from "lucide-react";

import { Logo } from "@/components/ui/logo";
import { SEO } from "@/components/SEO";
import { StructuredData } from "@/components/StructuredData";
import appStoreBadge from "@/assets/app-store-badge.svg";
import googlePlayBadge from "@/assets/google-play-badge.png";
import heroBg from "@/assets/teslys-luxury-home-hero.webp.asset.json";
import teslaCutout from "@/assets/tesla-black-cutout.png.asset.json";
import keyFob from "@/assets/teslys-key-fob.webp.asset.json";
import testimonialProperty from "@/assets/teslys-testimonial-property.webp.asset.json";

const RENT_URL = "https://app.eonrides.com";
const APP_STORE_URL = "https://apps.apple.com/us/app/teslys/id6748548283";
const PLAY_STORE_URL = "https://play.google.com/store/apps/details?id=com.app.teslys";

const SERIF = '"Cormorant Garamond", ui-serif, Georgia, serif';
const SANS = '"Manrope", ui-sans-serif, system-ui, sans-serif';

// Palette (locked "Luxury Concierge" spec)
const C = {
  pageCream: "#FBF8F2",
  warmWhite: "#FFFDF9",
  softCream: "#F7F1E8",
  headline: "#071C27",
  body: "#52616D",
  muted: "#7C8790",
  darkTeal: "#03252C",
  darkTealEnd: "#061C23",
  teal: "#078B8E",
  tealDark: "#056F73",
  tealLight: "#69CDD0",
  tealSoft: "#EAF6F5",
  gold: "#B59251",
  goldBorder: "#D8C39C",
  goldBackground: "rgba(255,253,249,0.76)",
  border: "#E6DCCF",
  borderSoft: "#E9E4DC",
  divider: "#C9C8C2",
};

function DiamondDivider({ tone = "light" }: { tone?: "light" | "dark" }) {
  const line = tone === "light" ? C.divider : "rgba(255,255,255,0.35)";
  const diamond = tone === "light" ? C.teal : "#C6A15B";

  return (
    <div className="flex items-center justify-center" aria-hidden>
      <span style={{ height: 1, width: 42, background: line }} />
      <span style={{ width: 12 }} />
      <span
        style={{
          width: 9,
          height: 9,
          background: diamond,
          transform: "rotate(45deg)",
          display: "inline-block",
        }}
      />
      <span style={{ width: 12 }} />
      <span style={{ height: 1, width: 42, background: line }} />
    </div>
  );
}

const Index = () => {
  const { user, loading } = useAuth();
  const navigate = useNavigate();
  const isNative = useMemo(() => Capacitor.isNativePlatform(), []);

  const testimonials = useMemo(
    () => [
      {
        quote:
          "Teslys made renting my Model Y effortless. The service is truly first-class.",
        name: "Michael R.",
        badge: "Verified Host",
      },
      {
        quote:
          "Passive income without lifting a finger. My Model 3 pays for itself every month.",
        name: "Priya S.",
        badge: "Verified Host",
      },
      {
        quote:
          "Concierge delivery to my hotel — the most seamless Tesla experience in LA.",
        name: "Daniel K.",
        badge: "Verified Guest",
      },
    ],
    []
  );
  const [testimonialIdx, setTestimonialIdx] = useState(0);
  const activeTestimonial = testimonials[testimonialIdx];

  useEffect(() => {
    const hasSeenOnboarding = localStorage.getItem("hasSeenOnboarding");
    if (!hasSeenOnboarding && !user && !loading) {
      navigate("/onboarding");
    }
  }, [navigate, user, loading]);

  useEffect(() => {
    if (isNative) {
      StatusBar.setBackgroundColor({ color: C.pageCream });
      ScreenOrientation.lock({ orientation: "portrait" });
    }

    return () => {
      if (isNative) {
        StatusBar.setBackgroundColor({ color: "#aef1be" });
        ScreenOrientation.unlock();
      }
    };
  }, [isNative]);

  const handleRent = async (e: React.MouseEvent) => {
    e.preventDefault();

    try {
      const w = window as unknown as { dataLayer?: unknown[] };
      if (Array.isArray(w.dataLayer)) {
        w.dataLayer.push({ event: "landing_intent_selected", intent: "rent" });
      }
      localStorage.setItem("teslys_intent", "rent");
    } catch {
      /* no-op */
    }

    if (Capacitor.isNativePlatform()) {
      try {
        await Browser.open({ url: RENT_URL });
        return;
      } catch {
        /* fallthrough */
      }
    }

    window.open(RENT_URL, "_blank", "noopener,noreferrer");
  };

  if (loading) {
    return (
      <div
        className="flex h-full items-center justify-center"
        style={{ background: C.pageCream }}
      >
        <div style={{ fontFamily: SANS, color: C.muted, fontSize: 14 }}>
          Loading…
        </div>
      </div>
    );
  }

  if (user) return <Navigate to="/dashboard" replace />;

  return (
    <>
      <SEO
        title="Teslys — Turn Your Tesla Into Passive Income"
        description="Premium Tesla car sharing platform. We handle rentals, cleaning, and guest support so you can earn passive income from your Tesla. Join Teslys today."
        keywords="Tesla car sharing, Tesla passive income, rent out Tesla, Tesla rental management, Tesla Model 3 rental, Tesla Model Y income, car sharing platform"
        canonical="https://teslys.app/"
        ogImage="https://teslys.app/icons/icon-512.webp"
      />

      <StructuredData type="organization" />
      <StructuredData type="website" />
      <StructuredData type="service" />
      <StructuredData type="software" />
      <StructuredData type="localbusiness" />

      <main
        className="min-h-screen"
        style={{
          background: C.pageCream,
          color: C.headline,
          fontFamily: SANS,
        }}
      >
        <div
          className="mx-auto w-full overflow-hidden"
          style={{ maxWidth: 430 }}
        >
          {/* HERO */}
          <section
            className="relative overflow-hidden"
            style={{ height: 452 }}
          >
            <img
              src={heroBg.url}
              alt=""
              aria-hidden
              className="absolute inset-0 h-full w-full object-cover pointer-events-none"
              style={{ objectPosition: "72% center" }}
            />

            {/* Warm readability overlay. Keep above image and below all content. */}
            <div
              aria-hidden
              className="absolute inset-0 pointer-events-none"
              style={{
                background: `
                  linear-gradient(
                    180deg,
                    rgba(251,248,242,0.97) 0%,
                    rgba(251,248,242,0.90) 35%,
                    rgba(251,248,242,0.70) 68%,
                    rgba(251,248,242,0.15) 100%
                  ),
                  linear-gradient(
                    90deg,
                    rgba(251,248,242,0.95) 0%,
                    rgba(251,248,242,0.80) 53%,
                    rgba(251,248,242,0.08) 100%
                  )
                `,
              }}
            />

            {/* VIP badge */}
            <div
              className="absolute z-20"
              style={{
                top: "max(14px, env(safe-area-inset-top))",
                right: 18,
              }}
            >
              <Link
                to="/how-it-works"
                aria-label="Learn about the VIP experience"
                className="inline-flex items-center"
                style={{
                  height: 40,
                  paddingLeft: 14,
                  paddingRight: 14,
                  gap: 8,
                  borderRadius: 9999,
                  background: C.goldBackground,
                  border: `1px solid ${C.goldBorder}`,
                  backdropFilter: "blur(6px)",
                  WebkitBackdropFilter: "blur(6px)",
                  boxShadow: "0 5px 18px rgba(71,52,25,0.05)",
                }}
              >
                <Crown size={15} strokeWidth={1.6} color={C.gold} />
                <span
                  style={{
                    fontFamily: SERIF,
                    fontSize: 11,
                    lineHeight: "14px",
                    fontWeight: 600,
                    letterSpacing: "0.12em",
                    color: "#6C5731",
                    textTransform: "uppercase",
                    whiteSpace: "nowrap",
                  }}
                >
                  VIP Experience
                </span>
              </Link>
            </div>

            {/* Hero content */}
            <div
              className="relative z-10 flex h-full flex-col items-center px-[22px] text-center"
              style={{ paddingTop: 18 }}
            >
              <div
                className="flex items-center justify-center"
                style={{ width: 76, height: 76 }}
              >
                <Logo size="lg" linked />
              </div>

              <div
                style={{
                  marginTop: 7,
                  paddingLeft: "0.42em",
                  fontFamily: SERIF,
                  fontSize: 27,
                  lineHeight: "31px",
                  fontWeight: 500,
                  letterSpacing: "0.42em",
                  color: C.headline,
                }}
              >
                TESLYS
              </div>

              <h1
                style={{
                  marginTop: 30,
                  marginBottom: 0,
                  maxWidth: 356,
                  fontFamily: SERIF,
                  fontSize: 50,
                  lineHeight: "47px",
                  fontWeight: 500,
                  letterSpacing: "-0.035em",
                  color: C.headline,
                  textAlign: "center",
                }}
              >
                Choose Your
                <br />
                <span style={{ color: C.teal }}>Teslys</span> Experience
              </h1>

              <div style={{ marginTop: 20 }}>
                <DiamondDivider />
              </div>

              <p
                style={{
                  marginTop: 15,
                  marginBottom: 0,
                  maxWidth: 316,
                  fontFamily: SANS,
                  fontSize: 15,
                  lineHeight: "22px",
                  fontWeight: 400,
                  letterSpacing: "-0.012em",
                  color: C.body,
                  textAlign: "center",
                }}
              >
                Premium Teslas. Exceptional service.
                <br />
                Extraordinary income.
              </p>
            </div>
          </section>

          {/* EXPERIENCE CARDS */}
          <section
            style={{
              paddingLeft: 22,
              paddingRight: 22,
              marginTop: -22,
              display: "flex",
              flexDirection: "column",
              gap: 16,
            }}
          >
            {/* RENTAL */}
            <article
              onClick={handleRent}
              role="link"
              tabIndex={0}
              aria-label="Explore Tesla rentals"
              onKeyDown={(e) => {
                if (e.key === "Enter" || e.key === " ") {
                  handleRent(e as unknown as React.MouseEvent);
                }
              }}
              className="relative cursor-pointer overflow-hidden"
              style={{
                height: 300,
                borderRadius: 26,
                padding: "24px 24px 22px",
                background: `
                  radial-gradient(
                    circle at 86% 68%,
                    rgba(7,139,142,0.34) 0%,
                    rgba(7,139,142,0.08) 38%,
                    transparent 62%
                  ),
                  linear-gradient(150deg, ${C.darkTeal} 0%, ${C.darkTealEnd} 100%)
                `,
                color: "#fff",
                border: "1px solid rgba(105,205,208,0.18)",
                boxShadow: "0 22px 54px -20px rgba(3,37,44,0.48)",
              }}
            >
              <div
                aria-hidden
                className="absolute pointer-events-none"
                style={{
                  top: 34,
                  right: -48,
                  width: 260,
                  height: 190,
                  opacity: 0.24,
                  transform: "rotate(-7deg)",
                  background:
                    "repeating-linear-gradient(165deg, transparent 0px, transparent 15px, rgba(105,205,208,0.15) 16px, transparent 18px)",
                }}
              />

              <div
                className="relative z-20 flex items-center"
                style={{ gap: 18 }}
              >
                <div
                  className="flex shrink-0 items-center justify-center"
                  style={{
                    width: 58,
                    height: 58,
                    borderRadius: 9999,
                    background: "rgba(1,25,31,0.42)",
                    border: "1px solid rgba(105,205,208,0.48)",
                  }}
                >
                  <CarFront
                    size={26}
                    strokeWidth={1.65}
                    color={C.tealLight}
                  />
                </div>

                <div style={{ paddingTop: 2 }}>
                  <h2
                    style={{
                      margin: 0,
                      fontFamily: SERIF,
                      fontSize: 31,
                      lineHeight: "34px",
                      fontWeight: 500,
                      letterSpacing: "-0.025em",
                      color: "#fff",
                    }}
                  >
                    Rent a Tesla
                  </h2>
                  <div
                    aria-hidden
                    style={{
                      marginTop: 9,
                      width: 30,
                      height: 2,
                      borderRadius: 999,
                      background: "#36B7BA",
                    }}
                  />
                </div>
              </div>

              <p
                className="relative z-20"
                style={{
                  marginTop: 19,
                  marginBottom: 0,
                  maxWidth: 160,
                  fontFamily: SANS,
                  fontSize: 15,
                  lineHeight: "23px",
                  fontWeight: 400,
                  letterSpacing: "-0.01em",
                  color: "rgba(255,255,255,0.88)",
                }}
              >
                Premium Teslas, delivered to you. By the day, week, or month.
              </p>

              <img
                src={teslaCutout.url}
                alt="Black Tesla available to rent"
                loading="eager"
                className="absolute z-10 pointer-events-none"
                style={{
                  width: "65%",
                  maxWidth: "none",
                  right: -12,
                  bottom: 38,
                  objectFit: "contain",
                  filter: "drop-shadow(0 18px 20px rgba(0,0,0,0.42))",
                }}
              />

              <div className="absolute z-30" style={{ left: 24, bottom: 22 }}>
                <span
                  className="inline-flex items-center justify-between"
                  style={{
                    width: 188,
                    height: 54,
                    paddingLeft: 21,
                    paddingRight: 21,
                    borderRadius: 14,
                    background:
                      "linear-gradient(135deg, #056F73 0%, #07989B 100%)",
                    color: "#fff",
                    fontFamily: SERIF,
                    fontSize: 19,
                    lineHeight: "22px",
                    fontWeight: 500,
                    letterSpacing: "-0.01em",
                    boxShadow: "0 10px 24px rgba(0,92,96,0.24)",
                  }}
                >
                  Explore Rentals
                  <ArrowRight size={20} strokeWidth={1.75} />
                </span>
              </div>
            </article>

            {/* MANAGEMENT */}
            <Link
              to="/register/client"
              aria-label="Start earning by listing your Tesla"
              className="relative block overflow-hidden"
              style={{
                height: 272,
                borderRadius: 26,
                padding: "22px 24px 20px",
                background: C.warmWhite,
                border: `1px solid ${C.border}`,
                boxShadow: "0 16px 38px rgba(55,41,25,0.08)",
              }}
            >
              <div
                className="relative z-20 flex items-center"
                style={{ gap: 18 }}
              >
                <div
                  className="flex shrink-0 items-center justify-center"
                  style={{
                    width: 58,
                    height: 58,
                    borderRadius: 9999,
                    background: C.softCream,
                    border: `1px solid ${C.border}`,
                  }}
                >
                  <KeyRound size={27} strokeWidth={1.65} color={C.teal} />
                </div>

                <div style={{ paddingTop: 2 }}>
                  <h2
                    style={{
                      margin: 0,
                      fontFamily: SERIF,
                      fontSize: 31,
                      lineHeight: "34px",
                      fontWeight: 500,
                      letterSpacing: "-0.025em",
                      color: C.headline,
                    }}
                  >
                    List my Tesla
                  </h2>
                  <div
                    aria-hidden
                    style={{
                      marginTop: 9,
                      width: 30,
                      height: 2,
                      borderRadius: 999,
                      background: C.teal,
                    }}
                  />
                </div>
              </div>

              <p
                className="relative z-20"
                style={{
                  marginTop: 17,
                  marginBottom: 0,
                  maxWidth: 166,
                  fontFamily: SANS,
                  fontSize: 15,
                  lineHeight: "23px",
                  fontWeight: 400,
                  letterSpacing: "-0.01em",
                  color: C.body,
                }}
              >
                Turn your Tesla into passive income. We handle rentals, cleaning,
                and guests.
              </p>

              <img
                src={keyFob.url}
                alt="Teslys branded key fob"
                loading="lazy"
                className="absolute z-10 pointer-events-none"
                style={{
                  width: "63%",
                  maxWidth: "none",
                  right: -42,
                  bottom: -7,
                  objectFit: "contain",
                }}
              />

              <div className="absolute z-30" style={{ left: 24, bottom: 20 }}>
                <span
                  className="inline-flex items-center justify-between"
                  style={{
                    width: 188,
                    height: 52,
                    paddingLeft: 21,
                    paddingRight: 21,
                    borderRadius: 14,
                    background:
                      "linear-gradient(135deg, #056F73 0%, #07989B 100%)",
                    color: "#fff",
                    fontFamily: SERIF,
                    fontSize: 19,
                    lineHeight: "22px",
                    fontWeight: 500,
                    letterSpacing: "-0.01em",
                    boxShadow: "0 9px 22px rgba(0,92,96,0.20)",
                  }}
                >
                  Start Earning
                  <ArrowRight size={20} strokeWidth={1.75} />
                </span>
              </div>
            </Link>
          </section>

          {/* SIGN IN */}
          <div
            className="text-center"
            style={{
              marginTop: 18,
              paddingLeft: 22,
              paddingRight: 22,
            }}
          >
            <span
              style={{
                fontFamily: SANS,
                fontSize: 12,
                lineHeight: "18px",
                color: C.muted,
              }}
            >
              Already a member?{" "}
              <Link
                to="/login"
                style={{
                  color: C.tealDark,
                  fontWeight: 600,
                  textDecoration: "none",
                }}
              >
                Sign in
              </Link>
            </span>
          </div>

          {/* CALCULATOR */}
          <section
            style={{
              marginTop: 27,
              paddingLeft: 22,
              paddingRight: 22,
            }}
          >
            <Link
              to="/earnings-calculator"
              className="group flex items-center"
              style={{
                minHeight: 88,
                gap: 14,
                borderRadius: 20,
                background:
                  "linear-gradient(135deg, rgba(234,246,245,0.92), rgba(255,253,249,0.96))",
                border: "1px solid rgba(7,139,142,0.20)",
                padding: "14px 15px",
                boxShadow: "0 10px 26px rgba(3,37,44,0.05)",
              }}
            >
              <div
                className="flex shrink-0 items-center justify-center"
                style={{
                  width: 48,
                  height: 48,
                  borderRadius: 9999,
                  background: "rgba(234,246,245,0.95)",
                  border: "1px solid rgba(7,139,142,0.14)",
                }}
              >
                <Calculator size={21} strokeWidth={1.55} color={C.teal} />
              </div>

              <div className="min-w-0 flex-1">
                <h3
                  style={{
                    margin: 0,
                    fontFamily: SERIF,
                    fontSize: 21,
                    lineHeight: "24px",
                    fontWeight: 500,
                    letterSpacing: "-0.02em",
                    color: C.headline,
                  }}
                >
                  Calculate Your Earnings
                </h3>
                <p
                  style={{
                    marginTop: 2,
                    marginBottom: 0,
                    fontFamily: SANS,
                    fontSize: 12,
                    lineHeight: "17px",
                    color: C.body,
                  }}
                >
                  See your potential income in minutes.
                </p>
              </div>

              <div
                className="flex shrink-0 items-center justify-center transition-transform group-hover:translate-x-1"
                style={{
                  width: 42,
                  height: 42,
                  borderRadius: 9999,
                  background: C.warmWhite,
                  border: `1px solid ${C.borderSoft}`,
                  color: C.tealDark,
                  boxShadow: "0 5px 14px rgba(3,37,44,0.07)",
                }}
              >
                <ArrowRight size={18} strokeWidth={1.7} />
              </div>
            </Link>
          </section>

          {/* TRUST ROW */}
          <section
            style={{
              marginTop: 24,
              paddingLeft: 22,
              paddingRight: 22,
            }}
          >
            <div
              className="grid grid-cols-3"
              style={{ minHeight: 78 }}
            >
              {[
                {
                  Icon: ShieldCheck,
                  title: "Fully Insured",
                  sub: "Your Tesla is protected",
                },
                {
                  Icon: ConciergeBell,
                  title: "Concierge Support",
                  sub: "We handle everything",
                },
                {
                  Icon: Star,
                  title: "Top Rated Hosts",
                  sub: "5-star experiences",
                },
              ].map(({ Icon, title, sub }, index) => (
                <div
                  key={title}
                  className="relative flex flex-col items-center text-center"
                  style={{ padding: "0 6px" }}
                >
                  {index > 0 && (
                    <span
                      aria-hidden
                      className="absolute left-0 top-[8px]"
                      style={{
                        width: 1,
                        height: 54,
                        background: C.border,
                      }}
                    />
                  )}

                  <Icon
                    size={27}
                    strokeWidth={1.45}
                    color={C.tealDark}
                  />

                  <div
                    style={{
                      marginTop: 7,
                      fontFamily: SERIF,
                      fontSize: 12,
                      lineHeight: "14px",
                      fontWeight: 600,
                      color: C.headline,
                      whiteSpace: "nowrap",
                    }}
                  >
                    {title}
                  </div>

                  <div
                    style={{
                      marginTop: 2,
                      fontFamily: SANS,
                      fontSize: 9,
                      lineHeight: "12px",
                      color: C.muted,
                    }}
                  >
                    {sub}
                  </div>
                </div>
              ))}
            </div>
          </section>

          {/* TESTIMONIAL */}
          <section
            style={{
              marginTop: 20,
              paddingLeft: 22,
              paddingRight: 22,
            }}
          >
            <div
              className="relative overflow-hidden"
              style={{
                minHeight: 176,
                borderRadius: 23,
                background: C.warmWhite,
                border: `1px solid ${C.border}`,
                padding: "17px 16px 22px",
                boxShadow: "0 16px 42px rgba(3,37,44,0.07)",
              }}
            >
              <div
                className="grid items-stretch"
                style={{
                  gridTemplateColumns: "1.43fr 1fr",
                  gap: 12,
                }}
              >
                <div className="min-w-0">
                  <div className="flex items-start" style={{ gap: 7 }}>
                    <span
                      aria-hidden
                      style={{
                        flexShrink: 0,
                        fontFamily: SERIF,
                        fontSize: 38,
                        lineHeight: "30px",
                        color: C.teal,
                        marginTop: -2,
                      }}
                    >
                      &ldquo;
                    </span>

                    <p
                      style={{
                        margin: 0,
                        fontFamily: SERIF,
                        fontSize: 15,
                        lineHeight: "19px",
                        fontStyle: "italic",
                        color: C.headline,
                      }}
                    >
                      Teslys made renting my Model Y effortless. The service is
                      truly first-class.
                    </p>
                  </div>

                  <div
                    className="flex items-center"
                    style={{ gap: 3, marginTop: 10, paddingLeft: 35 }}
                  >
                    {Array.from({ length: 5 }).map((_, i) => (
                      <Star
                        key={i}
                        size={13}
                        color={C.teal}
                        fill={C.teal}
                        strokeWidth={0}
                      />
                    ))}
                  </div>

                  <div
                    className="flex flex-wrap items-center"
                    style={{
                      gap: 7,
                      marginTop: 9,
                      paddingLeft: 35,
                      fontFamily: SANS,
                    }}
                  >
                    <span
                      style={{
                        fontFamily: SERIF,
                        fontSize: 13,
                        fontWeight: 500,
                        color: C.headline,
                      }}
                    >
                      — Michael R.
                    </span>
                    <span
                      className="inline-flex items-center"
                      style={{
                        gap: 3,
                        fontSize: 9,
                        lineHeight: "12px",
                        color: C.tealDark,
                        fontWeight: 600,
                        whiteSpace: "nowrap",
                      }}
                    >
                      <CheckCircle2
                        size={12}
                        strokeWidth={2}
                        color={C.teal}
                        fill="#E7F1EF"
                      />
                      Verified Host
                    </span>
                  </div>
                </div>

                <div
                  className="overflow-hidden self-end"
                  style={{
                    height: 106,
                    borderRadius: 16,
                    background: C.softCream,
                    border: `1px solid ${C.border}`,
                  }}
                >
                  <img
                    src={testimonialProperty.url}
                    alt="Luxury property at dusk with Tesla"
                    className="h-full w-full object-cover"
                    loading="lazy"
                  />
                </div>
              </div>

              <div
                aria-hidden
                className="absolute bottom-[7px] left-1/2 flex -translate-x-1/2 items-center"
                style={{ gap: 5 }}
              >
                <span
                  style={{
                    width: 6,
                    height: 6,
                    borderRadius: 999,
                    background: C.teal,
                  }}
                />
                <span
                  style={{
                    width: 5,
                    height: 5,
                    borderRadius: 999,
                    background: C.border,
                  }}
                />
                <span
                  style={{
                    width: 5,
                    height: 5,
                    borderRadius: 999,
                    background: C.border,
                  }}
                />
              </div>
            </div>
          </section>

          {/* APP PROMO */}
          <section
            style={{
              marginTop: 20,
              marginBottom: 0,
              paddingLeft: 22,
              paddingRight: 22,
              paddingBottom: "max(34px, env(safe-area-inset-bottom))",
            }}
          >
            <div
              className="relative overflow-hidden"
              style={{
                minHeight: 126,
                borderRadius: 23,
                background: `
                  radial-gradient(
                    circle at 10% 130%,
                    rgba(7,139,142,0.46),
                    transparent 44%
                  ),
                  linear-gradient(155deg, ${C.darkTeal} 0%, ${C.darkTealEnd} 100%)
                `,
                color: "#fff",
                padding: "17px 16px",
                boxShadow: "0 18px 46px rgba(3,37,44,0.18)",
              }}
            >
              <div
                className="relative grid items-center"
                style={{
                  gridTemplateColumns: "1.45fr 1fr",
                  gap: 12,
                }}
              >
                <div className="flex min-w-0 items-center" style={{ gap: 12 }}>
                  <div
                    className="flex shrink-0 items-center justify-center"
                    style={{
                      width: 52,
                      height: 52,
                      borderRadius: 9999,
                      background: "rgba(255,255,255,0.05)",
                      border: "1px solid rgba(255,255,255,0.16)",
                    }}
                  >
                    <Gem size={22} strokeWidth={1.4} color={C.gold} />
                  </div>

                  <div className="min-w-0">
                    <h3
                      style={{
                        margin: 0,
                        fontFamily: SERIF,
                        fontSize: 21,
                        lineHeight: "24px",
                        fontWeight: 500,
                        letterSpacing: "-0.02em",
                        color: "#fff",
                      }}
                    >
                      The Teslys App
                    </h3>
                    <p
                      style={{
                        marginTop: 3,
                        marginBottom: 0,
                        fontFamily: SERIF,
                        fontSize: 12,
                        lineHeight: "16px",
                        color: "rgba(255,255,255,0.74)",
                      }}
                    >
                      Manage, earn, and elevate your Tesla experience.
                    </p>
                  </div>
                </div>

                <div
                  className="flex flex-col items-stretch justify-center"
                  style={{ gap: 7 }}
                >
                  <a
                    href={APP_STORE_URL}
                    target="_blank"
                    rel="noopener noreferrer"
                    aria-label="Download Teslys on the App Store"
                    className="block"
                  >
                    <img
                      src={appStoreBadge}
                      alt="Download on the App Store"
                      className="h-auto w-full"
                      style={{ maxHeight: 34, objectFit: "contain" }}
                    />
                  </a>

                  <a
                    href={PLAY_STORE_URL}
                    target="_blank"
                    rel="noopener noreferrer"
                    aria-label="Get Teslys on Google Play"
                    className="block"
                  >
                    <img
                      src={googlePlayBadge}
                      alt="Get it on Google Play"
                      className="h-auto w-full"
                      style={{ maxHeight: 34, objectFit: "contain" }}
                    />
                  </a>
                </div>
              </div>
            </div>
          </section>
        </div>
      </main>
    </>
  );
};

export default Index;
