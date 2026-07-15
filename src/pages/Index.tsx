import { useEffect, useMemo, useState } from "react";
import { Link, Navigate, useNavigate } from "react-router-dom";
import {
  ArrowRight,
  BellRing,
  Briefcase,
  Calculator,
  Car,
  Crown,
  Eye,
  EyeOff,
  Lock,
  Mail,
  Shield,
  Star,
  TrendingUp,
} from "lucide-react";
import { StatusBar } from "@capacitor/status-bar";
import { Capacitor } from "@capacitor/core";
import { ScreenOrientation } from "@capacitor/screen-orientation";

import { useAuth } from "@/hooks/useAuth";
import { useToast } from "@/hooks/use-toast";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Logo } from "@/components/ui/logo";
import ClientRegisterCard from "@/components/auth/ClientRegisterCard";
import HostRegisterCard from "@/components/auth/HostRegisterCard";
import { SEO } from "@/components/SEO";
import { StructuredData } from "@/components/StructuredData";
import { ReadReviewsLink } from "@/components/ReadReviewsLink";
import { AppStoreBadges } from "@/components/ui/AppStoreBadges";
import { IntentChooser } from "@/components/landing/IntentChooser";

type Panel = "login" | "register-client" | "register-host";

const RENT_URL = "https://app.eonrides.com";

const Index = () => {
  const { user, loading, signIn } = useAuth();
  const { toast } = useToast();
  const navigate = useNavigate();

  const [panel, setPanel] = useState<Panel>("login");
  const [showAuth, setShowAuth] = useState<boolean>(() => {
    try {
      return localStorage.getItem("teslys_intent") === "manage";
    } catch {
      return false;
    }
  });
  const [showPassword, setShowPassword] = useState(false);
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [visible, setVisible] = useState(false);
  const isNative = useMemo(() => Capacitor.isNativePlatform(), []);

  useEffect(() => {
    const hasSeenOnboarding = localStorage.getItem("hasSeenOnboarding");
    if (!hasSeenOnboarding && !user && !loading) {
      navigate("/onboarding");
    }
  }, [navigate, user, loading]);

  useEffect(() => {
    setVisible(true);
  }, []);

  useEffect(() => {
    if (isNative) {
      StatusBar.setBackgroundColor({ color: "#fbf7f1" });
      ScreenOrientation.lock({ orientation: "portrait" });
    }

    return () => {
      if (isNative) {
        StatusBar.setBackgroundColor({ color: "#d4eeec" });
        ScreenOrientation.unlock();
      }
    };
  }, [isNative]);

  const onSubmit = async (event: React.FormEvent) => {
    event.preventDefault();
    setSubmitting(true);

    try {
      const { error } = await signIn(email.trim(), password);
      if (error) {
        toast({
          title: "Sign in failed",
          description: error.message ?? "Please check your credentials.",
        });
        return;
      }
      navigate("/dashboard");
    } catch (error: any) {
      toast({
        title: "Unexpected error",
        description: error?.message ?? "Please try again.",
      });
    } finally {
      setSubmitting(false);
    }
  };

  const returnToOptions = () => {
    try {
      localStorage.removeItem("teslys_intent");
    } catch {
      // Local storage may be unavailable in restricted browser modes.
    }
    setShowAuth(false);
    setPanel("login");
  };

  if (loading) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-[#fbf7f1]">
        <div className="text-sm font-medium text-[#586473]">Loading Teslys…</div>
      </div>
    );
  }

  if (user) return <Navigate to="/dashboard" replace />;

  return (
    <>
      <SEO
        title="Rent a Tesla or List Your Tesla | Teslys"
        description="Choose your Teslys experience. Rent a premium Tesla by the day, week, or month, or let Teslys professionally manage your Tesla and help generate rental income."
        keywords="Tesla rental, rent a Tesla, Tesla management, list my Tesla, Tesla passive income, Tesla Model 3 rental, Tesla Model Y rental"
        canonical="https://teslys.app/"
        ogImage="https://teslys.app/icons/icon-512.webp"
      />
      <StructuredData type="organization" />
      <StructuredData type="website" />
      <StructuredData type="service" />
      <StructuredData type="software" />
      <StructuredData type="localbusiness" />

      <main className="min-h-screen overflow-x-hidden bg-[radial-gradient(circle_at_50%_0%,#ffffff_0%,#fbf7f1_48%,#f5efe7_100%)] pt-safe-top text-[#071a24]">
        <section className="relative overflow-hidden pb-16 pt-5 sm:pb-20 sm:pt-8">
          <div className="pointer-events-none absolute -right-24 top-28 h-72 w-72 rounded-full bg-[#07888b]/10 blur-3xl" />
          <div className="pointer-events-none absolute -left-32 top-10 h-72 w-72 rounded-full bg-[#b89555]/10 blur-3xl" />
          <div className="pointer-events-none absolute inset-x-0 bottom-0 h-32 bg-gradient-to-b from-transparent to-[#fbf7f1]" />

          <div className="relative mx-auto w-full max-w-5xl px-[18px] sm:px-8">
            <div className="flex items-start justify-between gap-4">
              <div
                className="transition-all duration-700 ease-out"
                style={{
                  opacity: visible ? 1 : 0,
                  transform: visible ? "translateY(0)" : "translateY(12px)",
                }}
              >
                <Logo size="lg" />
                <div className="mt-1 pl-1 font-['Cormorant_Garamond'] text-[18px] font-semibold tracking-[0.34em] text-[#07343a]">
                  TESLYS
                </div>
              </div>

              <div className="mt-1 inline-flex h-10 items-center gap-2 rounded-full border border-[#b89555]/35 bg-white/65 px-3.5 text-[10px] font-semibold uppercase tracking-[0.16em] text-[#6f5a37] shadow-sm backdrop-blur-md">
                <Crown className="h-3.5 w-3.5 text-[#b89555]" />
                VIP Experience
              </div>
            </div>

            <div className="mx-auto mt-10 max-w-3xl text-center sm:mt-12">
              <p className="mb-3 text-[11px] font-semibold uppercase tracking-[0.28em] text-[#07888b]">
                Premium Tesla concierge
              </p>
              <h1
                className="font-['Cormorant_Garamond'] text-[48px] font-medium leading-[0.9] tracking-[-0.035em] text-[#071a24] transition-all delay-100 duration-700 sm:text-[74px]"
                style={{
                  opacity: visible ? 1 : 0,
                  transform: visible ? "translateY(0)" : "translateY(18px)",
                }}
              >
                {showAuth ? (
                  <>Your Teslys Account</>
                ) : (
                  <>
                    Choose Your
                    <span className="block text-[#07888b]">Teslys Experience</span>
                  </>
                )}
              </h1>

              <div className="mx-auto my-5 flex max-w-[190px] items-center gap-3">
                <div className="h-px flex-1 bg-[#b89555]/35" />
                <Star className="h-3.5 w-3.5 fill-[#07888b] text-[#07888b]" />
                <div className="h-px flex-1 bg-[#b89555]/35" />
              </div>

              <p className="mx-auto max-w-md text-[15px] leading-6 text-[#586473] sm:text-[17px] sm:leading-7">
                {showAuth
                  ? "Sign in to manage your vehicles, earnings, hosting, and investments."
                  : "Premium Teslas. Exceptional service. Effortless earnings."}
              </p>
            </div>
          </div>
        </section>

        <div className="relative z-10 mx-auto -mt-9 w-full max-w-5xl px-[18px] pb-12 sm:-mt-12 sm:px-8 sm:pb-16">
          {!showAuth ? (
            <>
              <IntentChooser onChooseManage={() => setShowAuth(true)} />

              <div className="mt-5 text-center text-[13px] text-[#7a8490]">
                Already have an account?{" "}
                <button
                  type="button"
                  onClick={() => setShowAuth(true)}
                  className="font-semibold text-[#07888b] transition hover:text-[#056a6d] hover:underline"
                >
                  Sign in
                </button>
              </div>

              <Link
                to="/earnings-calculator"
                className="group mt-6 flex min-h-[92px] items-center gap-4 rounded-[22px] border border-[#d7e7e5] bg-white/75 p-4 shadow-[0_16px_45px_rgba(7,26,36,0.07)] backdrop-blur-sm transition hover:-translate-y-0.5 hover:border-[#07888b]/30 hover:shadow-[0_20px_55px_rgba(7,26,36,0.10)] sm:px-6"
              >
                <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-full border border-[#07888b]/20 bg-[#eff8f7]">
                  <Calculator className="h-5 w-5 text-[#07888b]" />
                </div>
                <div className="min-w-0 flex-1 text-left">
                  <div className="font-['Cormorant_Garamond'] text-[25px] font-semibold leading-none text-[#071a24]">
                    Calculate Your Earnings
                  </div>
                  <p className="mt-1.5 text-[12px] leading-5 text-[#7a8490] sm:text-[13px]">
                    See your potential monthly income in minutes.
                  </p>
                </div>
                <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-full border border-[#e3ded5] bg-white text-[#07888b] shadow-sm">
                  <ArrowRight className="h-5 w-5 transition-transform group-hover:translate-x-1" />
                </div>
              </Link>

              <div className="mt-7 grid grid-cols-3 gap-2 rounded-[22px] border border-white/70 bg-white/45 px-2 py-5 shadow-[0_12px_35px_rgba(7,26,36,0.045)] backdrop-blur-sm sm:gap-6 sm:px-6">
                {[
                  { icon: Shield, title: "Fully Insured", subtitle: "Protected trips" },
                  { icon: BellRing, title: "Concierge", subtitle: "Personal support" },
                  { icon: Star, title: "Top Rated", subtitle: "Five-star care" },
                ].map(({ icon: Icon, title, subtitle }) => (
                  <div key={title} className="flex min-w-0 flex-col items-center text-center">
                    <div className="mb-2 flex h-10 w-10 items-center justify-center rounded-full bg-[#07888b]/9">
                      <Icon className="h-[18px] w-[18px] text-[#07888b]" />
                    </div>
                    <span className="text-[10px] font-bold leading-4 text-[#23333b] sm:text-[12px]">
                      {title}
                    </span>
                    <span className="mt-0.5 text-[9px] leading-3 text-[#8b949d] sm:text-[10px]">
                      {subtitle}
                    </span>
                  </div>
                ))}
              </div>

              <div className="mt-6 overflow-hidden rounded-[24px] border border-[#e6ded3] bg-white/75 shadow-[0_16px_45px_rgba(7,26,36,0.06)]">
                <ReadReviewsLink />
              </div>

              {!isNative && (
                <div className="mt-6 rounded-[26px] bg-[linear-gradient(145deg,#03171d,#07343a)] px-5 py-6 text-white shadow-[0_22px_60px_rgba(3,23,29,0.20)] sm:px-8">
                  <p className="font-['Cormorant_Garamond'] text-[28px] font-semibold">The Teslys App</p>
                  <p className="mt-1 text-[12px] leading-5 text-white/65">
                    Manage, earn, and elevate your Tesla experience.
                  </p>
                  <div className="mt-4">
                    <AppStoreBadges heading="" size="small" />
                  </div>
                </div>
              )}
            </>
          ) : (
            <>
              <div className="mb-4 flex items-center justify-between gap-3">
                <button
                  type="button"
                  onClick={returnToOptions}
                  className="inline-flex h-10 items-center gap-1.5 rounded-full border border-[#ded6ca] bg-white/75 px-4 text-[12px] font-semibold text-[#31424a] shadow-sm backdrop-blur-sm transition hover:border-[#07888b]/35 hover:text-[#07888b]"
                  aria-label="Back to rental and management options"
                >
                  <ArrowRight className="h-4 w-4 rotate-180" />
                  Back to options
                </button>

                <a
                  href={RENT_URL}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-[11px] font-semibold text-[#07888b] hover:underline"
                >
                  Looking to rent?
                </a>
              </div>

              <a
                href={RENT_URL}
                target="_blank"
                rel="noopener noreferrer"
                className="group mb-4 flex items-center gap-3 rounded-[20px] border border-[#73ced0]/30 bg-[#effafa] p-4 shadow-sm transition hover:border-[#07888b]/40"
              >
                <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-full bg-white text-[#07888b] shadow-sm">
                  <Car className="h-5 w-5" />
                </div>
                <div className="min-w-0 flex-1">
                  <p className="text-[13px] font-bold text-[#07343a]">Looking to rent a Tesla instead?</p>
                  <p className="mt-0.5 text-[11px] leading-4 text-[#66767d]">
                    You are currently in the vehicle-management experience.
                  </p>
                </div>
                <ArrowRight className="h-4 w-4 shrink-0 text-[#07888b] transition-transform group-hover:translate-x-1" />
              </a>

              <div className="rounded-[28px] border border-[#e5ddd2] bg-white/85 p-5 shadow-[0_22px_60px_rgba(7,26,36,0.10)] backdrop-blur-sm sm:p-7">
                {panel === "login" && (
                  <>
                    <h2 className="font-['Cormorant_Garamond'] text-[34px] font-semibold leading-none text-[#071a24]">
                      Welcome Back
                    </h2>
                    <p className="mb-6 mt-2 text-[12px] leading-5 text-[#7a8490]">
                      Access your vehicles, earnings, hosting, and investments.
                    </p>

                    <form onSubmit={onSubmit} className="space-y-4">
                      <div className="space-y-1.5">
                        <Label htmlFor="email" className="text-[11px] font-semibold uppercase tracking-[0.12em] text-[#536169]">
                          Email
                        </Label>
                        <div className="relative">
                          <Mail className="absolute left-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-[#92a0a6]" />
                          <Input
                            id="email"
                            type="email"
                            inputMode="email"
                            autoComplete="email"
                            placeholder="you@example.com"
                            value={email}
                            onChange={(event) => setEmail(event.target.value)}
                            required
                            className="h-12 rounded-xl border-[#ded8cf] bg-[#fffdfa] pl-10 text-[14px] focus-visible:ring-[#07888b]/35"
                          />
                        </div>
                      </div>

                      <div className="space-y-1.5">
                        <Label htmlFor="password" className="text-[11px] font-semibold uppercase tracking-[0.12em] text-[#536169]">
                          Password
                        </Label>
                        <div className="relative">
                          <Lock className="absolute left-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-[#92a0a6]" />
                          <Input
                            id="password"
                            type={showPassword ? "text" : "password"}
                            autoComplete="current-password"
                            placeholder="••••••••"
                            value={password}
                            onChange={(event) => setPassword(event.target.value)}
                            required
                            className="h-12 rounded-xl border-[#ded8cf] bg-[#fffdfa] pl-10 pr-11 text-[14px] focus-visible:ring-[#07888b]/35"
                          />
                          <button
                            type="button"
                            onClick={() => setShowPassword((current) => !current)}
                            className="absolute right-3.5 top-1/2 -translate-y-1/2 text-[#92a0a6] transition hover:text-[#536169]"
                            aria-label={showPassword ? "Hide password" : "Show password"}
                          >
                            {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                          </button>
                        </div>
                      </div>

                      <Button
                        type="submit"
                        disabled={submitting}
                        className="h-13 w-full rounded-2xl bg-[#07343a] text-[14px] font-semibold text-white shadow-[0_12px_28px_rgba(7,52,58,0.18)] hover:bg-[#052a2f]"
                      >
                        {submitting ? (
                          "Signing in…"
                        ) : (
                          <span className="inline-flex items-center gap-2">
                            Continue <ArrowRight className="h-4 w-4" />
                          </span>
                        )}
                      </Button>

                      <div className="text-center">
                        <Link to="/forgot-password" className="text-[12px] font-semibold text-[#07888b] hover:underline">
                          Forgot password?
                        </Link>
                      </div>

                      <div className="text-center text-[12px] text-[#7a8490]">
                        New here?{" "}
                        <button
                          type="button"
                          className="font-semibold text-[#07888b] hover:underline"
                          onClick={() => setPanel("register-client")}
                        >
                          Create a client account
                        </button>
                      </div>
                    </form>
                  </>
                )}

                {panel === "register-client" && (
                  <ClientRegisterCard onBackToLogin={() => setPanel("login")} />
                )}

                {panel === "register-host" && (
                  <HostRegisterCard onBackToLogin={() => setPanel("login")} />
                )}
              </div>

              {panel === "login" && (
                <div className="mt-4 grid gap-3 sm:grid-cols-2">
                  <button
                    type="button"
                    onClick={() => setPanel("register-client")}
                    className="group flex items-center gap-3 rounded-[20px] border border-[#07888b]/25 bg-white/70 p-4 text-left shadow-sm transition hover:border-[#07888b]/45"
                  >
                    <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-full bg-[#07888b]/10">
                      <Car className="h-5 w-5 text-[#07888b]" />
                    </div>
                    <div className="min-w-0 flex-1">
                      <p className="text-[13px] font-bold text-[#24333a]">List your Tesla</p>
                      <p className="mt-0.5 text-[10px] leading-4 text-[#7d8990]">Create an owner account.</p>
                    </div>
                    <ArrowRight className="h-4 w-4 text-[#07888b] transition-transform group-hover:translate-x-1" />
                  </button>

                  <a
                    href="https://www.eonrides.com/partners"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="group flex items-center gap-3 rounded-[20px] border border-[#ded8cf] bg-white/70 p-4 text-left shadow-sm transition hover:border-[#07888b]/35"
                  >
                    <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-full bg-[#07888b]/10">
                      <Briefcase className="h-5 w-5 text-[#07888b]" />
                    </div>
                    <div className="min-w-0 flex-1">
                      <p className="text-[13px] font-bold text-[#24333a]">Become a host</p>
                      <p className="mt-0.5 text-[10px] leading-4 text-[#7d8990]">Manage vehicles for owners.</p>
                    </div>
                    <ArrowRight className="h-4 w-4 text-[#07888b] transition-transform group-hover:translate-x-1" />
                  </a>
                </div>
              )}

              {panel === "login" && (
                <Link
                  to="/welcome/investor"
                  className="group mt-3 flex items-center gap-3 rounded-[20px] border border-[#ded8cf] bg-white/60 p-4 shadow-sm transition hover:border-[#07888b]/35"
                >
                  <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-full bg-[#07888b]/10">
                    <TrendingUp className="h-5 w-5 text-[#07888b]" />
                  </div>
                  <div className="min-w-0 flex-1">
                    <p className="text-[13px] font-bold text-[#24333a]">Invest in our fleet</p>
                    <p className="mt-0.5 text-[10px] leading-4 text-[#7d8990]">Explore Tesla fleet investments.</p>
                  </div>
                  <ArrowRight className="h-4 w-4 text-[#07888b] transition-transform group-hover:translate-x-1" />
                </Link>
              )}
            </>
          )}
        </div>
      </main>
    </>
  );
};

export default Index;
