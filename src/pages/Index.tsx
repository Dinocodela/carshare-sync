import { useEffect, useMemo } from "react";
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

// Palette (locked spec)
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
  const diamond = tone === "light" ? C.gold : "#C6A15B";
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
      <div className="h-full flex items-center justify-center" style={{ background: C.pageCream }}>
        <div style={{ fontFamily: SANS, color: C.muted, fontSize: 14 }}>Loading…</div>
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
        style={{ background: C.pageCream, color: C.headline, fontFamily: SANS }}
      >
        {/* Constrained mobile-first container */}
        <div className="mx-auto w-full" style={{ maxWidth: 430 }}>
          {/* ═════════ HERO ═════════ */}
          <section
            className="relative overflow-hidden"
            style={{ height: 452, paddingLeft: 22, paddingRight: 22 }}
          >
            {/* Background photo */}
            <div
              aria-hidden
              className="absolute inset-0 pointer-events-none"
              style={{
                backgroundImage: `url(${heroBg.url})`,
                backgroundSize: "cover",
                backgroundPosition: "right center",
                backgroundRepeat: "no-repeat",
              }}
            />
            {/* Cream overlay — stronger behind headline (center-left), lighter right */}
            <div
              aria-hidden
              className="absolute inset-0 pointer-events-none"
              style={{
                background: `linear-gradient(to right, ${C.pageCream} 0%, rgba(251,248,242,0.92) 42%, rgba(251,248,242,0.55) 72%, rgba(251,248,242,0.2) 100%), linear-gradient(to bottom, rgba(251,248,242,0.1) 0%, ${C.pageCream} 100%)`,
              }}
            />

            {/* VIP badge — top right */}
            <div
              className="absolute z-10"
              style={{ top: "max(14px, env(safe-area-inset-top))", right: 22 }}
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
                  boxShadow: "0 2px 10px rgba(14,61,58,0.06)",
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
                    color: C.headline,
                    textTransform: "uppercase",
                  }}
                >
                  VIP Experience
                </span>
              </Link>
            </div>

            {/* Hero content — centered */}
            <div
              className="relative h-full flex flex-col items-center"
              style={{ paddingTop: 12 }}
            >
              {/* Logo */}
              <div style={{ width: 78, height: 78 }} className="flex items-center justify-center">
                <Logo size="lg" linked />
              </div>

              {/* Wordmark */}
              <div
                style={{
                  marginTop: 9,
                  fontFamily: SERIF,
                  fontSize: 28,
                  lineHeight: "32px",
                  fontWeight: 500,
                  letterSpacing: "0.42em",
                  color: C.headline,
                  paddingLeft: "0.42em",
                }}
              >
                TESLYS
              </div>

              {/* Headline */}
              <h1
                style={{
                  marginTop: 31,
                  marginBottom: 0,
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
                <span style={{ color: C.teal }}>Teslys Experience</span>
              </h1>

              {/* Divider */}
              <div style={{ marginTop: 20 }}>
                <DiamondDivider />
              </div>

              {/* Subtitle */}
              <p
                style={{
                  marginTop: 15,
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

          {/* ═════════ EXPERIENCE CARDS ═════════ */}
          <section
            style={{
              paddingLeft: 22,
              paddingRight: 22,
              marginTop: -22, // hero-to-first-card overlap
              display: "flex",
              flexDirection: "column",
              gap: 16,
            }}
          >
            {/* RENTAL CARD */}
            <article
              onClick={handleRent}
              role="link"
              tabIndex={0}
              onKeyDown={(e) => {
                if (e.key === "Enter") handleRent(e as unknown as React.MouseEvent);
              }}
              className="relative overflow-hidden cursor-pointer"
              style={{
                height: 300,
                borderRadius: 26,
                padding: "25px 24px 22px 24px",
                background: `linear-gradient(160deg, ${C.darkTeal} 0%, ${C.darkTealEnd} 100%)`,
                color: "#fff",
                boxShadow: "0 24px 60px -20px rgba(3,37,44,0.45)",
              }}
            >
              {/* Decorative light trails */}
              <div
                aria-hidden
                className="absolute pointer-events-none"
                style={{
                  inset: 0,
                  background:
                    "radial-gradient(140% 90% at 110% 45%, rgba(105,205,208,0.22) 0%, rgba(105,205,208,0) 55%), radial-gradient(60% 40% at 100% 80%, rgba(7,139,142,0.28) 0%, rgba(7,139,142,0) 60%)",
                }}
              />

              {/* Icon circle */}
              <div
                className="relative flex items-center justify-center"
                style={{
                  width: 58,
                  height: 58,
                  borderRadius: 9999,
                  background: "rgba(255,255,255,0.06)",
                  border: "1px solid rgba(255,255,255,0.14)",
                }}
              >
                <CarFront size={26} strokeWidth={1.65} color={C.tealLight} />
              </div>

              {/* Title */}
              <h2
                className="relative"
                style={{
                  marginTop: 14,
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

              {/* Teal underline rule */}
              <div
                className="relative"
                style={{ marginTop: 8, width: 34, height: 2, background: C.tealLight }}
                aria-hidden
              />

              {/* Body */}
              <p
                className="relative"
                style={{
                  marginTop: 12,
                  maxWidth: "58%",
                  fontFamily: SANS,
                  fontSize: 15,
                  lineHeight: "23px",
                  fontWeight: 400,
                  letterSpacing: "-0.01em",
                  color: "rgba(255,255,255,0.78)",
                }}
              >
                Premium Teslas, delivered to you. By the day, week, or month.
              </p>

              {/* Tesla image — bleeds right */}
              <img
                src={teslaCutout.url}
                alt="Black Tesla Model 3"
                loading="eager"
                className="absolute pointer-events-none"
                style={{
                  width: "67%",
                  right: -14,
                  bottom: 38,
                  filter: "drop-shadow(0 18px 26px rgba(0,0,0,0.55))",
                }}
              />

              {/* Button */}
              <div className="absolute" style={{ left: 24, bottom: 22 }}>
                <span
                  className="inline-flex items-center justify-between"
                  style={{
                    width: 188,
                    height: 54,
                    paddingLeft: 21,
                    paddingRight: 21,
                    borderRadius: 14,
                    background: C.teal,
                    color: "#fff",
                    fontFamily: SERIF,
                    fontSize: 19,
                    lineHeight: "22px",
                    fontWeight: 500,
                    letterSpacing: "-0.01em",
                    boxShadow: "0 10px 22px -8px rgba(7,139,142,0.55)",
                  }}
                >
                  Explore Rentals
                  <ArrowRight size={20} strokeWidth={1.75} />
                </span>
              </div>
            </article>

            {/* MANAGEMENT CARD */}
            <Link
              to="/register/client"
              className="relative overflow-hidden block"
              style={{
                height: 272,
                borderRadius: 26,
                padding: "22px 24px 20px 24px",
                background: C.warmWhite,
                border: `1px solid ${C.border}`,
                boxShadow: "0 20px 50px -22px rgba(3,37,44,0.16)",
              }}
            >
              {/* Icon circle */}
              <div
                className="flex items-center justify-center"
                style={{
                  width: 58,
                  height: 58,
                  borderRadius: 9999,
                  background: C.tealSoft,
                  border: `1px solid ${C.borderSoft}`,
                }}
              >
                <KeyRound size={27} strokeWidth={1.65} color={C.teal} />
              </div>

              {/* Title */}
              <h2
                style={{
                  marginTop: 14,
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
                style={{ marginTop: 8, width: 34, height: 2, background: C.teal }}
                aria-hidden
              />

              <p
                style={{
                  marginTop: 12,
                  maxWidth: "58%",
                  fontFamily: SANS,
                  fontSize: 15,
                  lineHeight: "23px",
                  fontWeight: 400,
                  letterSpacing: "-0.01em",
                  color: C.body,
                }}
              >
                Turn your Tesla into passive income. We handle rentals, cleaning, and guests.
              </p>

              {/* Key fob image — bleeds right & bottom */}
              <img
                src={keyFob.url}
                alt="Teslys branded key fob"
                loading="lazy"
                className="absolute pointer-events-none"
                style={{
                  width: "68%",
                  right: -50,
                  bottom: -6,
                }}
              />

              {/* Button */}
              <div className="absolute" style={{ left: 24, bottom: 20 }}>
                <span
                  className="inline-flex items-center justify-between"
                  style={{
                    width: 188,
                    height: 52,
                    paddingLeft: 21,
                    paddingRight: 21,
                    borderRadius: 14,
                    background: C.darkTeal,
                    color: "#fff",
                    fontFamily: SERIF,
                    fontSize: 19,
                    lineHeight: "22px",
                    fontWeight: 500,
                    letterSpacing: "-0.01em",
                    boxShadow: "0 10px 22px -8px rgba(3,37,44,0.4)",
                  }}
                >
                  Start Earning
                  <ArrowRight size={20} strokeWidth={1.75} />
                </span>
              </div>
            </Link>
          </section>

          {/* Sign-in shortcut */}
          <div className="text-center" style={{ marginTop: 20, paddingLeft: 22, paddingRight: 22 }}>
            <span style={{ fontFamily: SANS, fontSize: 12, color: C.muted }}>
              Already a member?{" "}
              <Link
                to="/login"
                style={{ color: C.darkTeal, fontWeight: 600, textDecoration: "none" }}
              >
                Sign in
              </Link>
            </span>
          </div>

          {/* ═════════ CALCULATOR ═════════ */}
          <section style={{ marginTop: 36, paddingLeft: 22, paddingRight: 22 }}>
            <Link
              to="/earnings-calculator"
              className="group flex items-center"
              style={{
                gap: 16,
                borderRadius: 22,
                background: C.softCream,
                border: `1px solid ${C.borderSoft}`,
                padding: "20px 20px",
              }}
            >
              <div
                className="flex items-center justify-center shrink-0"
                style={{
                  width: 48,
                  height: 48,
                  borderRadius: 9999,
                  background: "#fff",
                  border: `1px solid ${C.borderSoft}`,
                }}
              >
                <Calculator size={20} strokeWidth={1.5} color={C.teal} />
              </div>
              <div className="flex-1 min-w-0">
                <h3
                  style={{
                    fontFamily: SERIF,
                    fontSize: 22,
                    lineHeight: "26px",
                    fontWeight: 500,
                    letterSpacing: "-0.02em",
                    color: C.headline,
                    margin: 0,
                  }}
                >
                  Calculate Your Earnings
                </h3>
                <p
                  style={{
                    marginTop: 2,
                    fontFamily: SANS,
                    fontSize: 13,
                    color: C.body,
                  }}
                >
                  See your potential income in minutes.
                </p>
              </div>
              <div
                className="flex items-center justify-center shrink-0 group-hover:translate-x-1 transition-transform"
                style={{
                  width: 40,
                  height: 40,
                  borderRadius: 9999,
                  background: "#fff",
                  border: `1px solid ${C.borderSoft}`,
                  color: C.headline,
                }}
              >
                <ArrowRight size={16} />
              </div>
            </Link>
          </section>

          {/* ═════════ TRUST BADGES ═════════ */}
          <section style={{ marginTop: 36, paddingLeft: 22, paddingRight: 22 }}>
            <div className="flex flex-col" style={{ gap: 12 }}>
              {[
                { Icon: ShieldCheck, title: "Fully Insured", sub: "Your Tesla is protected" },
                { Icon: ConciergeBell, title: "Concierge Support", sub: "We handle everything" },
                { Icon: Star, title: "Top Rated Hosts", sub: "5-star experiences" },
              ].map(({ Icon, title, sub }) => (
                <div key={title} className="flex items-center" style={{ gap: 12 }}>
                  <Icon size={22} strokeWidth={1.5} color={C.darkTeal} />
                  <div>
                    <div
                      style={{
                        fontFamily: SANS,
                        fontSize: 13,
                        fontWeight: 600,
                        color: C.headline,
                        lineHeight: 1.2,
                      }}
                    >
                      {title}
                    </div>
                    <div
                      style={{
                        fontFamily: SANS,
                        fontSize: 11,
                        color: C.muted,
                        marginTop: 2,
                      }}
                    >
                      {sub}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </section>

          {/* ═════════ TESTIMONIAL ═════════ */}
          <section style={{ marginTop: 36, paddingLeft: 22, paddingRight: 22 }}>
            <div
              style={{
                borderRadius: 24,
                background: C.warmWhite,
                border: `1px solid ${C.border}`,
                padding: 24,
                boxShadow: "0 20px 60px -24px rgba(3,37,44,0.14)",
              }}
            >
              <div className="flex items-start" style={{ gap: 10 }}>
                <span
                  aria-hidden
                  style={{
                    fontFamily: SERIF,
                    fontSize: 44,
                    lineHeight: 1,
                    color: C.darkTeal,
                    opacity: 0.8,
                    marginTop: -6,
                  }}
                >
                  &ldquo;
                </span>
                <p
                  style={{
                    fontFamily: SERIF,
                    fontSize: 18,
                    lineHeight: "24px",
                    fontStyle: "italic",
                    color: C.headline,
                    margin: 0,
                    paddingTop: 4,
                  }}
                >
                  Teslys made renting my Model Y effortless. The service is truly first-class.
                </p>
              </div>
              <div className="flex items-center" style={{ gap: 4, marginTop: 14 }}>
                {Array.from({ length: 5 }).map((_, i) => (
                  <Star key={i} size={14} color={C.teal} fill={C.teal} strokeWidth={0} />
                ))}
              </div>
              <div
                className="flex items-center flex-wrap"
                style={{ gap: 10, marginTop: 12, fontFamily: SANS, fontSize: 13 }}
              >
                <span style={{ fontWeight: 600, color: C.headline }}>— Michael R.</span>
                <span
                  className="inline-flex items-center"
                  style={{ gap: 4, color: C.darkTeal, fontWeight: 600, fontSize: 12 }}
                >
                  <CheckCircle2 size={14} strokeWidth={2} color={C.teal} fill="#E7F1EF" />
                  Verified Host
                </span>
              </div>
              <div
                className="w-full overflow-hidden"
                style={{
                  aspectRatio: "16 / 11",
                  borderRadius: 16,
                  background: C.pageCream,
                  border: `1px solid ${C.border}`,
                  marginTop: 16,
                }}
              >
                <img
                  src={testimonialProperty.url}
                  alt="Luxury property at dusk with Tesla"
                  className="w-full h-full object-cover"
                  loading="lazy"
                />
              </div>
            </div>
          </section>

          {/* ═════════ APP PROMO ═════════ */}
          <section
            style={{
              marginTop: 36,
              marginBottom: 40,
              paddingLeft: 22,
              paddingRight: 22,
              paddingBottom: "max(1rem, env(safe-area-inset-bottom))",
            }}
          >
            <div
              className="relative overflow-hidden"
              style={{
                borderRadius: 24,
                background: `linear-gradient(160deg, ${C.darkTeal} 0%, ${C.darkTealEnd} 100%)`,
                color: "#fff",
                padding: 24,
              }}
            >
              <div
                aria-hidden
                className="absolute pointer-events-none"
                style={{
                  bottom: -80,
                  left: -60,
                  height: 240,
                  width: 240,
                  borderRadius: 9999,
                  background:
                    "radial-gradient(closest-side, rgba(7,139,142,0.5), rgba(7,139,142,0) 70%)",
                }}
              />
              <div className="relative flex items-center" style={{ gap: 14 }}>
                <div
                  className="flex items-center justify-center shrink-0"
                  style={{
                    width: 52,
                    height: 52,
                    borderRadius: 9999,
                    background: "rgba(255,255,255,0.06)",
                    border: "1px solid rgba(255,255,255,0.15)",
                  }}
                >
                  <Gem size={22} strokeWidth={1.4} color={C.gold} />
                </div>
                <div>
                  <h3
                    style={{
                      fontFamily: SERIF,
                      fontSize: 24,
                      lineHeight: "28px",
                      fontWeight: 500,
                      letterSpacing: "-0.02em",
                      margin: 0,
                    }}
                  >
                    The Teslys App
                  </h3>
                  <p
                    style={{
                      marginTop: 2,
                      fontFamily: SANS,
                      fontSize: 13,
                      color: "rgba(255,255,255,0.72)",
                    }}
                  >
                    Manage, earn, and elevate your Tesla experience.
                  </p>
                </div>
              </div>
              <div
                className="relative flex flex-wrap items-center"
                style={{ gap: 10, marginTop: 18 }}
              >
                <a
                  href={APP_STORE_URL}
                  target="_blank"
                  rel="noopener noreferrer"
                  aria-label="Download Teslys on the App Store"
                >
                  <img src={appStoreBadge} alt="Download on the App Store" style={{ height: 42 }} />
                </a>
                <a
                  href={PLAY_STORE_URL}
                  target="_blank"
                  rel="noopener noreferrer"
                  aria-label="Get Teslys on Google Play"
                >
                  <img src={googlePlayBadge} alt="Get it on Google Play" style={{ height: 42 }} />
                </a>
              </div>
            </div>
          </section>
        </div>
      </main>
    </>
  );
};

export default Index;
