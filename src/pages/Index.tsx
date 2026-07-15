import { useEffect, useMemo } from "react";
import { useNavigate, Link, Navigate } from "react-router-dom";
import { useAuth } from "@/hooks/useAuth";
import { Capacitor } from "@capacitor/core";
import { Browser } from "@capacitor/browser";
import { StatusBar } from "@capacitor/status-bar";
import { ScreenOrientation } from "@capacitor/screen-orientation";
import {
  ArrowLeft,
  ArrowRight,
  CarFront,
  KeyRound,
  Crown,
  Calculator,
  ShieldCheck,
  ConciergeBell,
  Star,
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

import {
  DiamondDivider,
  LuxuryCard,
  PillButton,
  TrustBadge,
  GoogleReviewCard,
  C,
  SERIF,
  SANS,
  type Testimonial,
} from "@/components/luxury";

const RENT_URL = "https://app.eonrides.com";
const APP_STORE_URL = "https://apps.apple.com/us/app/teslys/id6748548283";
const PLAY_STORE_URL =
  "https://play.google.com/store/apps/details?id=com.app.teslys";
const GOOGLE_REVIEWS_URL = "https://share.google/MRaxALqJbjqYHlRn4";

const TESTIMONIALS: Testimonial[] = [
  {
    quote:
      "Twelve days of the most joyful relaxed stress free driving with Tesla’s FSD providing flawless execution, I literally didn’t drive myself. Model Y drives like a dream, so smooth and lots of space. Highly recommended, rented from Walter via Eon. I will be back!",
    name: "Christian Eyde Moeller",
    source: "Google Review",
  },
  {
    quote:
      "Renting from Walter was a breeze. The car drove like a dream, and the pick-up / drop-off for the car was a seamless and easy experience. Can't recommend highly enough!",
    name: "Alex Ross",
    source: "Google Review",
  },
  {
    quote:
      "Teslys took care of my car really well while allowing me to generate income when not using it, would recommend 100%",
    name: "T A",
    source: "Google Review",
  },
];

const TRUST_ITEMS = [
  { icon: ShieldCheck, title: "Fully Insured", sub: "Your Tesla is protected" },
  { icon: ConciergeBell, title: "Concierge Support", sub: "We handle everything" },
  { icon: Star, title: "Top Rated Hosts", sub: "5-star experiences" },
];

// Uniform footprint for the two store badges. Google Play PNG has extra
// transparent padding, so we compensate by scaling its inner <img> only
// (the outer wrapper stays 132x40 to keep the grid aligned).
const BADGE_W = 132;
const BADGE_H = 40;

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

  const handleGoogleReviews = async (e: React.MouseEvent) => {
    e.preventDefault();
    if (Capacitor.isNativePlatform()) {
      try {
        await Browser.open({ url: GOOGLE_REVIEWS_URL });
        return;
      } catch {
        /* fallthrough */
      }
    }
    window.open(GOOGLE_REVIEWS_URL, "_blank", "noopener,noreferrer");
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
          <section className="relative overflow-hidden" style={{ height: 500 }}>
            <img
              src={heroBg.url}
              alt=""
              aria-hidden
              className="absolute inset-0 h-full w-full object-cover pointer-events-none"
              style={{ objectPosition: "72% center" }}
            />

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

            <button
              type="button"
              aria-label="Go back"
              onClick={() => navigate(-1)}
              className="absolute z-20 flex items-center justify-center"
              style={{
                top: "calc(env(safe-area-inset-top, 0px) + 6px)",
                left: 18,
                width: 44,
                height: 44,
                borderRadius: 9999,
                background: "rgba(255,253,249,0.82)",
                border: `1px solid ${C.border}`,
                color: C.headline,
                backdropFilter: "blur(7px)",
                WebkitBackdropFilter: "blur(7px)",
                boxShadow: "0 6px 20px rgba(55,41,25,0.08)",
              }}
            >
              <ArrowLeft size={21} strokeWidth={1.7} />
            </button>

            <div
              className="absolute z-20"
              style={{
                top: "calc(env(safe-area-inset-top, 0px) + 6px)",
                right: 18,
              }}
            >
              <Link
                to="/login"
                aria-label="Sign in to Teslys"
                className="inline-flex items-center"
                style={{
                  height: 44,
                  paddingLeft: 15,
                  paddingRight: 17,
                  gap: 8,
                  borderRadius: 9999,
                  background: C.goldBackground,
                  border: `1px solid ${C.goldBorder}`,
                  backdropFilter: "blur(7px)",
                  WebkitBackdropFilter: "blur(7px)",
                  boxShadow: "0 6px 20px rgba(71,52,25,0.07)",
                }}
              >
                <Crown size={17} strokeWidth={1.6} color={C.gold} />
                <span
                  style={{
                    fontFamily: SERIF,
                    fontSize: 16,
                    lineHeight: "20px",
                    fontWeight: 600,
                    letterSpacing: "-0.01em",
                    color: C.headline,
                    whiteSpace: "nowrap",
                  }}
                >
                  Sign in
                </span>
              </Link>
            </div>

            <div
              className="relative z-10 flex h-full flex-col items-center px-[22px] text-center"
              style={{ paddingTop: 24 }}
            >
              <div
                className="flex items-center justify-center"
                style={{ width: 82, height: 82 }}
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
                  marginTop: 36,
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
            <LuxuryCard
              as="article"
              variant="dark"
              role="link"
              tabIndex={0}
              aria-label="Explore Tesla rentals"
              onClick={handleRent}
              onKeyDown={(e) => {
                if (e.key === "Enter" || e.key === " ") {
                  handleRent(e as unknown as React.MouseEvent);
                }
              }}
              style={{
                height: 300,
                padding: "24px 24px 22px",
                cursor: "pointer",
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
                  <CarFront size={26} strokeWidth={1.65} color={C.tealLight} />
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
                  width: "67%",
                  maxWidth: "none",
                  right: -14,
                  bottom: 36,
                  objectFit: "contain",
                  filter: "drop-shadow(0 18px 20px rgba(0,0,0,0.42))",
                }}
              />

              <div className="absolute z-30" style={{ left: 24, bottom: 22 }}>
                <PillButton width={188} height={54} fontSize={19}>
                  Explore Rentals
                </PillButton>
              </div>
            </LuxuryCard>

            {/* MANAGEMENT */}
            <LuxuryCard
              as="article"
              variant="light"
              style={{ height: 272, padding: "22px 24px 20px" }}
            >
              <Link
                to="/register/client"
                aria-label="Start earning by listing your Tesla"
                className="absolute inset-0 z-40"
                style={{ borderRadius: 26 }}
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
                Turn your Tesla into passive income. We handle rentals,
                cleaning, and guests.
              </p>

              {/* Key-fob image: warm-white wrapper matches the card, and a
                  soft radial mask feathers the left/top/bottom edges so the
                  asset's rectangular background dissolves into the card. */}
              <div
                aria-hidden
                className="absolute z-10 pointer-events-none"
                style={{
                  right: -50,
                  bottom: -7,
                  width: "68%",
                  height: 200,
                  background: C.warmWhite,
                  WebkitMaskImage:
                    "radial-gradient(ellipse 78% 92% at 78% 62%, black 42%, rgba(0,0,0,0.65) 62%, transparent 88%)",
                  maskImage:
                    "radial-gradient(ellipse 78% 92% at 78% 62%, black 42%, rgba(0,0,0,0.65) 62%, transparent 88%)",
                }}
              >
                <img
                  src={keyFob.url}
                  alt=""
                  loading="lazy"
                  className="h-full w-full"
                  style={{
                    objectFit: "contain",
                    objectPosition: "right bottom",
                    filter:
                      "drop-shadow(0 10px 18px rgba(55,41,25,0.18)) contrast(1.02)",
                  }}
                />
              </div>

              <div className="absolute z-30" style={{ left: 24, bottom: 20 }}>
                <PillButton width={188} height={52} fontSize={19}>
                  Start Earning
                </PillButton>
              </div>
            </LuxuryCard>
          </section>

          {/* CALCULATOR */}
          <section
            style={{ marginTop: 24, paddingLeft: 22, paddingRight: 22 }}
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
            style={{ marginTop: 24, paddingLeft: 22, paddingRight: 22 }}
          >
            <div className="grid grid-cols-3" style={{ minHeight: 78 }}>
              {TRUST_ITEMS.map(({ icon, title, sub }, index) => (
                <TrustBadge
                  key={title}
                  icon={icon}
                  title={title}
                  sub={sub}
                  showDivider={index > 0}
                />
              ))}
            </div>
          </section>

          {/* GOOGLE REVIEWS */}
          <section
            style={{ marginTop: 22, paddingLeft: 22, paddingRight: 22 }}
          >
            <GoogleReviewCard
              testimonials={TESTIMONIALS}
              onViewAll={handleGoogleReviews}
            />
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
                style={{ gridTemplateColumns: "1.45fr 1fr", gap: 12 }}
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

                {/* Store badges: identical 132x40 wrappers; inner PNG for
                    Google Play is scaled to compensate for its transparent
                    padding, so both artworks visually fill the same frame. */}
                <div
                  className="flex flex-col items-stretch justify-center"
                  style={{ gap: 7 }}
                >
                  <a
                    href={APP_STORE_URL}
                    target="_blank"
                    rel="noopener noreferrer"
                    aria-label="Download Teslys on the App Store"
                    className="flex items-center justify-center overflow-hidden"
                    style={{ width: BADGE_W, height: BADGE_H }}
                  >
                    <img
                      src={appStoreBadge}
                      alt="Download on the App Store"
                      style={{
                        width: "100%",
                        height: "100%",
                        objectFit: "contain",
                        display: "block",
                      }}
                    />
                  </a>

                  <a
                    href={PLAY_STORE_URL}
                    target="_blank"
                    rel="noopener noreferrer"
                    aria-label="Get Teslys on Google Play"
                    className="flex items-center justify-center overflow-hidden"
                    style={{ width: BADGE_W, height: BADGE_H }}
                  >
                    <img
                      src={googlePlayBadge}
                      alt="Get it on Google Play"
                      style={{
                        // The Google Play PNG has ~12.7% horizontal and ~32.8%
                        // vertical transparent padding baked in. We upscale the
                        // <img> so the opaque artwork exactly fills the shared
                        // 132x40 wrapper (overflow:hidden crops the padding).
                        width: 151.2,
                        height: 59.5,
                        objectFit: "fill",
                        display: "block",
                        flexShrink: 0,
                      }}
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
