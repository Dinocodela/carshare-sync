import { useEffect, useMemo } from "react";
import { useNavigate, Link, Navigate } from "react-router-dom";
import { useAuth } from "@/hooks/useAuth";
import { Capacitor } from "@capacitor/core";
import { Browser } from "@capacitor/browser";
import { StatusBar } from "@capacitor/status-bar";
import { ScreenOrientation } from "@capacitor/screen-orientation";
import {
  ArrowRight,
  Car,
  KeyRound,
  Calculator,
  Crown,
  Shield,
  Sparkles,
  Star,
  CheckCircle2,
  Quote,
} from "lucide-react";

import { Logo } from "@/components/ui/logo";
import { SEO } from "@/components/SEO";
import { StructuredData } from "@/components/StructuredData";
import appStoreBadge from "@/assets/app-store-badge.svg";
import googlePlayBadge from "@/assets/google-play-badge.png";
// TODO: replace with final luxury photography assets
import heroCarPlaceholder from "@/assets/investor-hero.jpg";
import listTeslaPlaceholder from "@/assets/teslys-logo-clean.png";
import testimonialPlaceholder from "@/assets/investor-hero.jpg";

const RENT_URL = "https://app.eonrides.com";
const APP_STORE_URL = "https://apps.apple.com/us/app/teslys/id6748548283"; // TODO: verify final iOS URL
const PLAY_STORE_URL = "https://play.google.com/store/apps/details?id=com.app.teslys"; // TODO: verify final Android URL

// ---------------------------------------------------------------------------
// Small building blocks (local to this page)
// ---------------------------------------------------------------------------

function DiamondDivider() {
  return (
    <div className="flex items-center justify-center gap-4 my-6" aria-hidden>
      <span className="h-px w-16 sm:w-24 bg-[#E8E1D3]" />
      <svg width="10" height="10" viewBox="0 0 10 10" className="text-[#C6A15B]">
        <path d="M5 0 L10 5 L5 10 L0 5 Z" fill="currentColor" />
      </svg>
      <span className="h-px w-16 sm:w-24 bg-[#E8E1D3]" />
    </div>
  );
}

function VipBadge() {
  return (
    <Link
      to="/how-it-works"
      className="inline-flex items-center gap-1.5 rounded-full border border-[#C6A15B]/40 bg-white/70 backdrop-blur-sm px-3 py-1.5 text-[10px] font-semibold uppercase tracking-[0.18em] text-[#0E3D3A] shadow-sm hover:border-[#C6A15B] transition-colors"
      aria-label="Learn about the Teslys VIP experience"
    >
      <Crown className="w-3.5 h-3.5 text-[#C6A15B]" />
      VIP Experience
    </Link>
  );
}

// ---------------------------------------------------------------------------

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
      StatusBar.setBackgroundColor({ color: "#F7F2E9" });
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
      <div className="h-full flex items-center justify-center bg-[#F7F2E9]">
        <div className="text-sm text-[#5C6B67]">Loading…</div>
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
        className="min-h-screen pt-safe-top bg-[#F7F2E9] text-[#17211F] font-[Inter,ui-sans-serif,system-ui]"
        style={{ fontFamily: "Inter, ui-sans-serif, system-ui, sans-serif" }}
      >
        <div className="mx-auto w-full max-w-6xl px-5 sm:px-8 lg:px-12 pb-[env(safe-area-inset-bottom)]">
          {/* HEADER */}
          <header className="relative pt-6 sm:pt-8">
            <div className="absolute right-0 top-6 sm:top-8">
              <VipBadge />
            </div>
            <div className="flex flex-col items-center gap-3">
              <Logo size="lg" linked />
              <div
                className="text-[15px] sm:text-base font-medium text-[#0E3D3A]"
                style={{ letterSpacing: "0.32em" }}
              >
                TESLYS
              </div>
            </div>
          </header>

          {/* HERO */}
          <section className="text-center pt-10 sm:pt-14 pb-2">
            <h1
              className="text-4xl sm:text-5xl md:text-6xl leading-[1.05] tracking-tight text-[#17211F]"
              style={{ fontFamily: "'Playfair Display', ui-serif, Georgia, serif" }}
            >
              Choose Your{" "}
              <span className="text-[#0E3D3A] italic">Teslys Experience</span>
            </h1>
            <DiamondDivider />
            <p className="mx-auto max-w-2xl text-sm sm:text-base text-[#5C6B67] leading-relaxed">
              Premium Teslas. Exceptional service. Extraordinary income.
            </p>
          </section>

          {/* CHOICE CARDS */}
          <section className="mt-10 sm:mt-14 grid grid-cols-1 lg:grid-cols-2 gap-6 lg:gap-8">
            {/* Rent a Tesla — dark card */}
            <a
              href="/tesla-rental-near-me"
              onClick={handleRent}
              className="group relative overflow-hidden rounded-3xl bg-[#0E3D3A] text-white p-8 sm:p-10 shadow-[0_20px_60px_rgba(14,61,58,0.18)] hover:shadow-[0_28px_70px_rgba(14,61,58,0.28)] transition-shadow"
            >
              <div
                aria-hidden
                className="absolute -top-24 -right-24 h-72 w-72 rounded-full"
                style={{
                  background:
                    "radial-gradient(closest-side, rgba(27,110,102,0.55), rgba(27,110,102,0) 70%)",
                }}
              />
              <div className="relative flex flex-col sm:flex-row items-start sm:items-center gap-8">
                <div className="flex-1 min-w-0">
                  <div className="w-12 h-12 rounded-full bg-white/8 border border-white/15 flex items-center justify-center mb-6 backdrop-blur-sm">
                    <Car className="w-5 h-5 text-white" strokeWidth={1.5} />
                  </div>
                  <h2
                    className="text-3xl sm:text-4xl leading-tight text-white"
                    style={{ fontFamily: "'Playfair Display', serif" }}
                  >
                    Rent a Tesla
                  </h2>
                  <div className="mt-3 h-px w-14 bg-[#C6A15B]/80" />
                  <p className="mt-5 text-sm sm:text-[15px] text-white/75 leading-relaxed max-w-sm">
                    Premium Teslas, delivered to you. By the day, week, or month.
                  </p>
                  <span className="mt-7 inline-flex items-center gap-2 rounded-full bg-white text-[#0E3D3A] px-5 py-2.5 text-sm font-semibold shadow-sm group-hover:gap-3 transition-all">
                    Explore Rentals
                    <ArrowRight className="w-4 h-4" />
                  </span>
                </div>
                {/* Image slot — TODO: replace with a hero shot of a black Tesla at golden hour */}
                <div className="w-full sm:w-56 md:w-64 shrink-0 rounded-2xl overflow-hidden aspect-[4/3] sm:aspect-square bg-white/5 ring-1 ring-white/10">
                  <img
                    src={heroCarPlaceholder}
                    alt="Black Tesla ready for delivery"
                    className="w-full h-full object-cover opacity-90 group-hover:opacity-100 transition-opacity"
                    loading="eager"
                  />
                </div>
              </div>
            </a>

            {/* List my Tesla — light card */}
            <Link
              to="/register/client"
              className="group relative overflow-hidden rounded-3xl bg-[#FFFDF9] p-8 sm:p-10 border border-[#E8E1D3] shadow-[0_20px_60px_rgba(14,61,58,0.08)] hover:shadow-[0_28px_70px_rgba(14,61,58,0.14)] transition-shadow"
            >
              <div className="relative flex flex-col sm:flex-row items-start sm:items-center gap-8">
                <div className="flex-1 min-w-0">
                  <div className="w-12 h-12 rounded-full bg-[#1B6E66]/10 border border-[#1B6E66]/15 flex items-center justify-center mb-6">
                    <KeyRound className="w-5 h-5 text-[#1B6E66]" strokeWidth={1.5} />
                  </div>
                  <h2
                    className="text-3xl sm:text-4xl leading-tight text-[#17211F]"
                    style={{ fontFamily: "'Playfair Display', serif" }}
                  >
                    List my Tesla
                  </h2>
                  <div className="mt-3 h-px w-14 bg-[#1B6E66]" />
                  <p className="mt-5 text-sm sm:text-[15px] text-[#5C6B67] leading-relaxed max-w-sm">
                    Turn your Tesla into passive income. We handle rentals, cleaning,
                    and guests.{" "}
                    <span className="text-[#0E3D3A] font-semibold" style={{ fontVariantNumeric: "tabular-nums" }}>
                      Owners average $1,200–$1,900/mo.
                    </span>
                  </p>
                  <span className="mt-7 inline-flex items-center gap-2 rounded-full bg-[#0E3D3A] text-white px-5 py-2.5 text-sm font-semibold shadow-sm group-hover:gap-3 transition-all">
                    Start Earning
                    <ArrowRight className="w-4 h-4" />
                  </span>
                </div>
                {/* Image slot — TODO: replace with a close-up photo of a Tesla key fob on a marble surface */}
                <div className="w-full sm:w-56 md:w-64 shrink-0 rounded-2xl overflow-hidden aspect-[4/3] sm:aspect-square bg-[#F7F2E9] ring-1 ring-[#E8E1D3] flex items-center justify-center">
                  <img
                    src={listTeslaPlaceholder}
                    alt="Tesla key fob"
                    className="w-2/3 h-2/3 object-contain opacity-90"
                    loading="lazy"
                  />
                </div>
              </div>
            </Link>
          </section>

          {/* Sign-in shortcut */}
          <div className="mt-6 text-center">
            <span className="text-xs text-[#5C6B67]">
              Already a member?{" "}
              <Link to="/login" className="font-semibold text-[#0E3D3A] hover:underline">
                Sign in
              </Link>
            </span>
          </div>

          {/* CALCULATOR BANNER */}
          <section className="mt-14">
            <Link
              to="/earnings-calculator"
              className="group flex items-center gap-5 rounded-3xl bg-[#1B6E66]/[0.06] border border-[#1B6E66]/15 px-6 sm:px-8 py-6 sm:py-7 hover:bg-[#1B6E66]/[0.09] transition-colors"
            >
              <div className="w-14 h-14 rounded-full bg-white flex items-center justify-center shrink-0 ring-1 ring-[#1B6E66]/15">
                <Calculator className="w-6 h-6 text-[#1B6E66]" strokeWidth={1.5} />
              </div>
              <div className="flex-1 min-w-0">
                <h3
                  className="text-xl sm:text-2xl text-[#17211F] leading-tight"
                  style={{ fontFamily: "'Playfair Display', serif" }}
                >
                  Calculate Your Earnings
                </h3>
                <p className="mt-1 text-xs sm:text-sm text-[#5C6B67]">
                  See your potential income in minutes.
                </p>
              </div>
              <div className="w-11 h-11 rounded-full bg-[#0E3D3A] text-white flex items-center justify-center shrink-0 group-hover:translate-x-1 transition-transform">
                <ArrowRight className="w-4 h-4" />
              </div>
            </Link>
          </section>

          {/* TRUST BADGES */}
          <section className="mt-14">
            <div className="grid grid-cols-1 md:grid-cols-3 md:divide-x md:divide-[#E8E1D3]">
              {[
                {
                  icon: Shield,
                  title: "Fully Insured",
                  sub: "Your Tesla is protected",
                },
                {
                  icon: Sparkles,
                  title: "Concierge Support",
                  sub: "We handle everything",
                },
                {
                  icon: Star,
                  title: "Top Rated Hosts",
                  sub: "5-star experiences",
                },
              ].map(({ icon: Icon, title, sub }) => (
                <div
                  key={title}
                  className="flex items-center gap-4 px-2 md:px-8 py-4 md:py-2"
                >
                  <div className="w-11 h-11 rounded-full bg-[#1B6E66]/10 flex items-center justify-center shrink-0">
                    <Icon className="w-5 h-5 text-[#1B6E66]" strokeWidth={1.5} />
                  </div>
                  <div className="min-w-0">
                    <div className="text-sm font-semibold text-[#17211F]">
                      {title}
                    </div>
                    <div className="text-xs text-[#5C6B67]">{sub}</div>
                  </div>
                </div>
              ))}
            </div>
          </section>

          {/* TESTIMONIAL */}
          <section className="mt-14">
            <div className="rounded-3xl bg-[#FFFDF9] border border-[#E8E1D3] p-8 sm:p-10 shadow-[0_20px_60px_rgba(14,61,58,0.06)]">
              <div className="grid grid-cols-1 md:grid-cols-[1fr_auto] gap-8 md:gap-10 items-center">
                <div>
                  <Quote
                    className="w-10 h-10 text-[#0E3D3A]/70 -ml-1"
                    strokeWidth={1.25}
                    style={{ transform: "scaleX(-1)" }}
                  />
                  <p
                    className="mt-4 text-2xl sm:text-3xl leading-snug text-[#17211F] italic"
                    style={{ fontFamily: "'Playfair Display', serif" }}
                  >
                    Teslys made renting my Model Y effortless. The service is truly
                    first-class.
                  </p>
                  <div className="mt-5 flex items-center gap-1.5">
                    {Array.from({ length: 5 }).map((_, i) => (
                      <Star
                        key={i}
                        className="w-4 h-4 text-[#1B6E66]"
                        fill="currentColor"
                        strokeWidth={0}
                      />
                    ))}
                  </div>
                  <div className="mt-4 flex items-center gap-3 text-sm text-[#5C6B67]">
                    <span className="font-semibold text-[#17211F]">— Michael R.</span>
                    <span className="inline-flex items-center gap-1 rounded-full bg-[#1B6E66]/10 text-[#0E3D3A] px-2.5 py-1 text-[11px] font-semibold">
                      <CheckCircle2 className="w-3.5 h-3.5" strokeWidth={1.75} />
                      Verified Host
                    </span>
                  </div>
                </div>
                {/* TODO: replace with a real portrait of the reviewer */}
                <div className="w-full md:w-52 aspect-square rounded-2xl overflow-hidden bg-[#F7F2E9] ring-1 ring-[#E8E1D3]">
                  <img
                    src={testimonialPlaceholder}
                    alt="Verified Teslys host portrait"
                    className="w-full h-full object-cover"
                    loading="lazy"
                  />
                </div>
              </div>
              <div className="mt-8 flex items-center justify-center gap-2">
                <span className="h-1.5 w-6 rounded-full bg-[#0E3D3A]" />
                <span className="h-1.5 w-1.5 rounded-full bg-[#E8E1D3]" />
                <span className="h-1.5 w-1.5 rounded-full bg-[#E8E1D3]" />
              </div>
            </div>
          </section>

          {/* APP PROMO BAND */}
          <section className="mt-14 mb-16">
            <div className="relative overflow-hidden rounded-3xl bg-[#0E3D3A] text-white p-8 sm:p-10">
              <div
                aria-hidden
                className="absolute -bottom-24 -left-16 h-72 w-72 rounded-full"
                style={{
                  background:
                    "radial-gradient(closest-side, rgba(27,110,102,0.5), rgba(27,110,102,0) 70%)",
                }}
              />
              <div className="relative flex flex-col md:flex-row md:items-center md:justify-between gap-6">
                <div>
                  <h3
                    className="text-3xl sm:text-4xl text-white leading-tight"
                    style={{ fontFamily: "'Playfair Display', serif" }}
                  >
                    The Teslys App
                  </h3>
                  <div className="mt-3 h-px w-14 bg-[#C6A15B]" />
                  <p className="mt-4 text-sm sm:text-base text-white/75 max-w-md">
                    Manage, earn, and elevate your Tesla experience.
                  </p>
                </div>
                <div className="flex flex-wrap items-center gap-3">
                  <a
                    href={APP_STORE_URL}
                    target="_blank"
                    rel="noopener noreferrer"
                    aria-label="Download Teslys on the App Store"
                    className="inline-block hover:opacity-90 transition-opacity"
                  >
                    <img src={appStoreBadge} alt="Download on the App Store" className="h-12" />
                  </a>
                  <a
                    href={PLAY_STORE_URL}
                    target="_blank"
                    rel="noopener noreferrer"
                    aria-label="Get Teslys on Google Play"
                    className="inline-block hover:opacity-90 transition-opacity"
                  >
                    <img src={googlePlayBadge} alt="Get it on Google Play" className="h-12" />
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
