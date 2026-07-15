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
const APP_STORE_URL = "https://apps.apple.com/us/app/teslys/id6748548283"; // TODO: verify final iOS URL
const PLAY_STORE_URL = "https://play.google.com/store/apps/details?id=com.app.teslys"; // TODO: verify final Android URL

// ---------------------------------------------------------------------------

function DiamondDivider({ tone = "light" }: { tone?: "light" | "dark" }) {
  const line = tone === "light" ? "bg-[#D9CDB4]" : "bg-white/25";
  return (
    <div className="flex items-center justify-center gap-3 my-5" aria-hidden>
      <span className={`h-px w-12 sm:w-16 ${line}`} />
      <svg width="8" height="8" viewBox="0 0 10 10" className="text-[#C6A15B]">
        <path d="M5 0 L10 5 L5 10 L0 5 Z" fill="currentColor" />
      </svg>
      <span className={`h-px w-12 sm:w-16 ${line}`} />
    </div>
  );
}

function TealRule({ className = "" }: { className?: string }) {
  return <div className={`h-px w-10 bg-[#1B6E66] ${className}`} />;
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

  const serif = { fontFamily: "'Playfair Display', ui-serif, Georgia, serif" };

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
        className="min-h-screen pt-safe-top bg-[#F7F2E9] text-[#17211F]"
        style={{ fontFamily: "Inter, ui-sans-serif, system-ui, sans-serif" }}
      >
        {/* ═════════════ HERO (with luxury home + tesla background) ═════════════ */}
        <section className="relative overflow-hidden">
          {/* Background photo, right-anchored, faded into ivory */}
          <div
            aria-hidden
            className="absolute inset-0 pointer-events-none"
            style={{
              backgroundImage: `url(${heroBg.url})`,
              backgroundSize: "cover",
              backgroundPosition: "right center",
              backgroundRepeat: "no-repeat",
              opacity: 0.55,
            }}
          />
          {/* Cream-to-transparent overlay for legibility */}
          <div
            aria-hidden
            className="absolute inset-0 pointer-events-none"
            style={{
              background:
                "linear-gradient(to right, #F7F2E9 0%, rgba(247,242,233,0.85) 40%, rgba(247,242,233,0.4) 70%, rgba(247,242,233,0.15) 100%), linear-gradient(to bottom, rgba(247,242,233,0.2) 0%, #F7F2E9 100%)",
            }}
          />

          <div className="relative mx-auto w-full max-w-6xl px-5 sm:px-8 lg:px-12 pt-6 sm:pt-8 pb-10 sm:pb-14">
            {/* Top bar */}
            <div className="flex items-start justify-between gap-4">
              <div className="w-16 sm:w-20" aria-hidden />
              <div className="flex flex-col items-center gap-2">
                <Logo size="lg" linked />
                <div
                  className="text-[13px] sm:text-[15px] font-medium text-[#0E3D3A]"
                  style={{ letterSpacing: "0.34em" }}
                >
                  T E S L Y S
                </div>
              </div>
              <Link
                to="/how-it-works"
                className="inline-flex items-center gap-1.5 rounded-full border border-[#C6A15B]/50 bg-white/80 backdrop-blur-sm px-3 py-1.5 text-[10px] font-semibold uppercase tracking-[0.18em] text-[#0E3D3A] shadow-sm hover:border-[#C6A15B] transition-colors shrink-0"
                aria-label="Learn about the VIP experience"
              >
                <Crown className="w-3.5 h-3.5 text-[#C6A15B]" />
                <span className="hidden xs:inline sm:inline">VIP Experience</span>
                <span className="xs:hidden sm:hidden">VIP</span>
              </Link>
            </div>

            {/* Headline */}
            <div className="text-center pt-10 sm:pt-14">
              <h1
                className="text-[38px] leading-[1.05] sm:text-6xl md:text-7xl tracking-tight text-[#17211F]"
                style={serif}
              >
                Choose Your
                <br />
                <span className="text-[#0E3D3A]">Teslys Experience</span>
              </h1>
              <DiamondDivider />
              <p className="mx-auto max-w-md text-[15px] sm:text-base text-[#5C6B67] leading-relaxed">
                Premium Teslas. Exceptional service.
                <br className="sm:hidden" /> Extraordinary income.
              </p>
            </div>
          </div>
        </section>

        <div className="mx-auto w-full max-w-6xl px-5 sm:px-8 lg:px-12 pb-16 pb-[max(4rem,env(safe-area-inset-bottom))]">
          {/* ═════════════ CHOICE CARDS ═════════════ */}
          <section className="space-y-5 sm:space-y-6">
            {/* — Rent a Tesla (dark) — */}
            <a
              href="/tesla-rental-near-me"
              onClick={handleRent}
              className="group relative block overflow-hidden rounded-[28px] bg-[#0E3D3A] text-white shadow-[0_24px_60px_-20px_rgba(14,61,58,0.45)] hover:shadow-[0_32px_80px_-20px_rgba(14,61,58,0.6)] transition-shadow"
            >
              <div
                aria-hidden
                className="absolute inset-0 pointer-events-none"
                style={{
                  background:
                    "radial-gradient(120% 90% at 100% 50%, rgba(27,110,102,0.55) 0%, rgba(27,110,102,0) 55%)",
                }}
              />
              <div className="relative grid grid-cols-1 sm:grid-cols-[minmax(0,0.9fr)_minmax(0,1.1fr)] items-center gap-0">
                <div className="p-7 sm:p-10 md:p-12">
                  <div className="w-11 h-11 rounded-full bg-white/8 border border-white/15 flex items-center justify-center mb-5 backdrop-blur-sm">
                    <Car className="w-[18px] h-[18px] text-[#5EC7BE]" strokeWidth={1.6} />
                  </div>
                  <h2 className="text-3xl sm:text-4xl md:text-[42px] leading-[1.05] text-white" style={serif}>
                    Rent a Tesla
                  </h2>
                  <div className="mt-3 h-px w-12 bg-[#5EC7BE]" />
                  <p className="mt-5 text-[14px] sm:text-[15px] text-white/72 leading-relaxed max-w-[22ch]">
                    Premium Teslas, delivered to you. By the day, week, or month.
                  </p>
                  <span className="mt-7 inline-flex items-center gap-3 rounded-full bg-[#1B6E66] hover:bg-[#207c73] text-white pl-5 pr-2 py-2 text-[13px] font-semibold shadow-lg shadow-[#1B6E66]/20 transition-colors">
                    <span className="tracking-wide">Explore Rentals</span>
                    <span className="inline-flex items-center justify-center w-8 h-8 rounded-full bg-white/10 group-hover:bg-white/15 transition-colors">
                      <ArrowRight className="w-4 h-4" />
                    </span>
                  </span>
                </div>
                <div className="relative h-44 sm:h-full sm:min-h-[280px] md:min-h-[320px] flex items-center justify-center pr-4 sm:pr-6 pb-4 sm:pb-0">
                  <img
                    src={teslaCutout.url}
                    alt="Black Tesla Model 3"
                    className="max-h-full max-w-full object-contain drop-shadow-[0_20px_30px_rgba(0,0,0,0.5)]"
                    loading="eager"
                  />
                </div>
              </div>
            </a>

            {/* — List my Tesla (light) — */}
            <Link
              to="/register/client"
              className="group relative block overflow-hidden rounded-[28px] bg-[#FFFDF9] border border-[#E8E1D3] shadow-[0_24px_60px_-24px_rgba(14,61,58,0.18)] hover:shadow-[0_32px_80px_-24px_rgba(14,61,58,0.28)] transition-shadow"
            >
              <div className="grid grid-cols-1 sm:grid-cols-[minmax(0,0.9fr)_minmax(0,1.1fr)] items-center gap-0">
                <div className="p-7 sm:p-10 md:p-12">
                  <div className="w-11 h-11 rounded-full bg-[#EFE7D5] border border-[#E1D5B8] flex items-center justify-center mb-5">
                    <KeyRound className="w-[18px] h-[18px] text-[#1B6E66]" strokeWidth={1.6} />
                  </div>
                  <h2 className="text-3xl sm:text-4xl md:text-[42px] leading-[1.05] text-[#17211F]" style={serif}>
                    List my Tesla
                  </h2>
                  <TealRule className="mt-3" />
                  <p className="mt-5 text-[14px] sm:text-[15px] text-[#5C6B67] leading-relaxed max-w-[26ch]">
                    Turn your Tesla into passive income. We handle rentals, cleaning, and guests.
                  </p>
                  <span className="mt-7 inline-flex items-center gap-3 rounded-full bg-[#0E3D3A] hover:bg-[#12514c] text-white pl-5 pr-2 py-2 text-[13px] font-semibold shadow-lg shadow-[#0E3D3A]/25 transition-colors">
                    <span className="tracking-wide">Start Earning</span>
                    <span className="inline-flex items-center justify-center w-8 h-8 rounded-full bg-white/10 group-hover:bg-white/15 transition-colors">
                      <ArrowRight className="w-4 h-4" />
                    </span>
                  </span>
                </div>
                <div className="relative h-44 sm:h-full sm:min-h-[280px] md:min-h-[320px] overflow-hidden">
                  <img
                    src={keyFob.url}
                    alt="Teslys branded key fob"
                    className="w-full h-full object-cover"
                    loading="lazy"
                  />
                </div>
              </div>
            </Link>
          </section>

          {/* Sign-in shortcut */}
          <div className="mt-5 text-center">
            <span className="text-xs text-[#5C6B67]">
              Already a member?{" "}
              <Link to="/login" className="font-semibold text-[#0E3D3A] hover:underline">
                Sign in
              </Link>
            </span>
          </div>

          {/* ═════════════ CALCULATOR BANNER ═════════════ */}
          <section className="mt-10 sm:mt-14">
            <Link
              to="/earnings-calculator"
              className="group flex items-center gap-4 sm:gap-5 rounded-[22px] bg-[#EFEDE4] border border-[#E1DDCF] px-5 sm:px-7 py-5 sm:py-6 hover:bg-[#E9E6DA] transition-colors"
            >
              <div className="w-12 h-12 rounded-full bg-white flex items-center justify-center shrink-0 ring-1 ring-[#E1DDCF]">
                <Calculator className="w-5 h-5 text-[#1B6E66]" strokeWidth={1.5} />
              </div>
              <div className="flex-1 min-w-0">
                <h3 className="text-lg sm:text-2xl text-[#17211F] leading-tight" style={serif}>
                  Calculate Your Earnings
                </h3>
                <p className="mt-0.5 text-xs sm:text-sm text-[#5C6B67]">
                  See your potential income in minutes.
                </p>
              </div>
              <div className="w-10 h-10 rounded-full bg-white ring-1 ring-[#E1DDCF] text-[#17211F] flex items-center justify-center shrink-0 group-hover:translate-x-1 transition-transform">
                <ArrowRight className="w-4 h-4" />
              </div>
            </Link>
          </section>

          {/* ═════════════ TRUST BADGES ═════════════ */}
          <section className="mt-10 sm:mt-14">
            <div className="grid grid-cols-1 sm:grid-cols-3 sm:divide-x sm:divide-[#E1DDCF]">
              {[
                { icon: ShieldCheck, title: "Fully Insured", sub: "Your Tesla is protected" },
                { icon: ConciergeBell, title: "Concierge Support", sub: "We handle everything" },
                { icon: Star, title: "Top Rated Hosts", sub: "5-star experiences" },
              ].map(({ icon: Icon, title, sub }) => (
                <div key={title} className="flex items-center gap-3 py-3 sm:py-2 sm:px-6 first:sm:pl-0 last:sm:pr-0">
                  <Icon className="w-6 h-6 text-[#0E3D3A] shrink-0" strokeWidth={1.5} />
                  <div className="min-w-0">
                    <div className="text-[13px] font-semibold text-[#17211F] leading-tight">{title}</div>
                    <div className="text-[11px] text-[#5C6B67] mt-0.5">{sub}</div>
                  </div>
                </div>
              ))}
            </div>
          </section>

          {/* ═════════════ TESTIMONIAL ═════════════ */}
          <section className="mt-10 sm:mt-14">
            <div className="rounded-[24px] bg-[#FFFDF9] border border-[#E8E1D3] p-6 sm:p-8 shadow-[0_20px_60px_-24px_rgba(14,61,58,0.14)]">
              <div className="grid grid-cols-1 md:grid-cols-[minmax(0,1fr)_minmax(0,0.75fr)] gap-6 md:gap-8 items-center">
                <div>
                  <div className="flex items-start gap-3">
                    <span
                      className="text-[52px] leading-none text-[#0E3D3A]/80 font-serif -mt-2"
                      style={serif}
                      aria-hidden
                    >
                      &ldquo;
                    </span>
                    <p
                      className="text-[17px] sm:text-xl leading-snug text-[#17211F] italic pt-1"
                      style={serif}
                    >
                      Teslys made renting my Model Y effortless. The service is truly first-class.
                    </p>
                  </div>
                  <div className="mt-4 flex items-center gap-1">
                    {Array.from({ length: 5 }).map((_, i) => (
                      <Star key={i} className="w-4 h-4 text-[#1B6E66]" fill="currentColor" strokeWidth={0} />
                    ))}
                  </div>
                  <div className="mt-4 flex flex-wrap items-center gap-3 text-sm">
                    <span className="font-semibold text-[#17211F]">— Michael R.</span>
                    <span className="inline-flex items-center gap-1 text-[#0E3D3A] text-[12px] font-semibold">
                      <CheckCircle2 className="w-4 h-4 text-[#1B6E66]" strokeWidth={2} fill="#E7F1EF" />
                      Verified Host
                    </span>
                  </div>
                </div>
                <div className="w-full aspect-[16/11] md:aspect-[4/3] rounded-2xl overflow-hidden bg-[#F7F2E9] ring-1 ring-[#E8E1D3]">
                  <img
                    src={testimonialProperty.url}
                    alt="Luxury property at dusk with Tesla"
                    className="w-full h-full object-cover"
                    loading="lazy"
                  />
                </div>
              </div>
              <div className="mt-6 flex items-center justify-center gap-2" aria-hidden>
                <span className="h-1.5 w-1.5 rounded-full bg-[#1B6E66]" />
                <span className="h-1.5 w-1.5 rounded-full bg-[#D9CDB4]" />
                <span className="h-1.5 w-1.5 rounded-full bg-[#D9CDB4]" />
              </div>
            </div>
          </section>

          {/* ═════════════ APP PROMO ═════════════ */}
          <section className="mt-10 sm:mt-14">
            <div className="relative overflow-hidden rounded-[24px] bg-[#0E3D3A] text-white p-6 sm:p-8">
              <div
                aria-hidden
                className="absolute -bottom-24 -left-16 h-72 w-72 rounded-full"
                style={{
                  background:
                    "radial-gradient(closest-side, rgba(27,110,102,0.5), rgba(27,110,102,0) 70%)",
                }}
              />
              <div className="relative flex flex-col md:flex-row md:items-center md:justify-between gap-6">
                <div className="flex items-center gap-4">
                  <div className="w-14 h-14 rounded-full bg-white/8 border border-white/15 flex items-center justify-center shrink-0">
                    <Gem className="w-6 h-6 text-[#C6A15B]" strokeWidth={1.4} />
                  </div>
                  <div>
                    <h3 className="text-2xl sm:text-3xl text-white leading-tight" style={serif}>
                      The Teslys App
                    </h3>
                    <p className="mt-1 text-[13px] sm:text-sm text-white/70 max-w-md">
                      Manage, earn, and elevate your Tesla experience.
                    </p>
                  </div>
                </div>
                <div className="flex flex-wrap items-center gap-3">
                  <a
                    href={APP_STORE_URL}
                    target="_blank"
                    rel="noopener noreferrer"
                    aria-label="Download Teslys on the App Store"
                    className="inline-block hover:opacity-90 transition-opacity"
                  >
                    <img src={appStoreBadge} alt="Download on the App Store" className="h-11" />
                  </a>
                  <a
                    href={PLAY_STORE_URL}
                    target="_blank"
                    rel="noopener noreferrer"
                    aria-label="Get Teslys on Google Play"
                    className="inline-block hover:opacity-90 transition-opacity"
                  >
                    <img src={googlePlayBadge} alt="Get it on Google Play" className="h-11" />
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
