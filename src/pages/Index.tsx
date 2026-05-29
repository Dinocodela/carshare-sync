import { useEffect, useMemo, useState } from "react";
import { useNavigate, Link, Navigate } from "react-router-dom";
import { useAuth } from "@/hooks/useAuth";
import { useToast } from "@/hooks/use-toast";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Logo } from "@/components/ui/logo";
import { ArrowRight, Shield, Star, Users, Mail, Lock, Eye, EyeOff, Calculator, Briefcase, TrendingUp } from "lucide-react";
import { StatusBar } from "@capacitor/status-bar";
import { Capacitor } from "@capacitor/core";
import { ScreenOrientation } from "@capacitor/screen-orientation";

import ClientRegisterCard from "@/components/auth/ClientRegisterCard";
import HostRegisterCard from "@/components/auth/HostRegisterCard";
import { SEO } from "@/components/SEO";
import { StructuredData } from "@/components/StructuredData";
import { RentATeslaLink } from "@/components/RentATeslaLink";
import { ReadReviewsLink } from "@/components/ReadReviewsLink";
import { AppStoreBadges } from "@/components/ui/AppStoreBadges";

type Panel = "login" | "register-client" | "register-host";

const Index = () => {
  const { user, loading, signIn } = useAuth();
  const { toast } = useToast();
  const navigate = useNavigate();

  const [panel, setPanel] = useState<Panel>("login");
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
      StatusBar.setBackgroundColor({ color: "#000000" });
      ScreenOrientation.lock({ orientation: "portrait" });
    }
    return () => {
      if (isNative) {
        StatusBar.setBackgroundColor({ color: "#aef1be" });
        ScreenOrientation.unlock();
      }
    };
  }, [isNative]);

  const onSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
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
    } catch (err: any) {
      toast({
        title: "Unexpected error",
        description: err?.message ?? "Please try again.",
      });
    } finally {
      setSubmitting(false);
    }
  };

  if (loading) {
    return (
      <div className="h-full flex items-center justify-center bg-gradient-hero">
        <div className="text-lg text-muted-foreground">Loading...</div>
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

      <RentATeslaLink />
      <main className="min-h-screen pt-safe-top bg-gradient-hero overflow-y-auto">
        <div className="flex flex-col items-center p-4 pb-0">
          <div className="w-full max-w-xl">

            {/* Hero Section */}
            <div className="text-center pt-6 pb-4">
              <div
                className="flex justify-center mb-5 transition-all duration-700 ease-out"
                style={{
                  opacity: visible ? 1 : 0,
                  transform: visible ? "translateY(0) scale(1)" : "translateY(20px) scale(0.8)",
                }}
              >
                <Logo size="xl" linked />
              </div>

              <h1
                className="text-xl font-bold text-foreground mb-2 transition-all duration-700 delay-150 ease-out"
                style={{
                  opacity: visible ? 1 : 0,
                  transform: visible ? "translateY(0)" : "translateY(15px)",
                }}
              >
                Welcome to{" "}
                <span className="bg-gradient-to-r from-primary to-accent bg-clip-text text-transparent">
                  Teslys
                </span>
              </h1>

              <p
                className="text-sm text-muted-foreground leading-relaxed max-w-xs mx-auto transition-all duration-700 delay-300 ease-out"
                style={{
                  opacity: visible ? 1 : 0,
                  transform: visible ? "translateY(0)" : "translateY(15px)",
                }}
              >
                List your Tesla and earn passive income — we handle the rest. One login for your cars, hosting, and investments.
              </p>
            </div>

            {/* Login / Register Panel */}
            <div
              className="transition-all duration-500 delay-500 ease-out"
              style={{
                opacity: visible ? 1 : 0,
                transform: visible ? "translateY(0)" : "translateY(15px)",
              }}
            >
              {panel === "login" && (
                <div className="rounded-2xl bg-card/80 backdrop-blur-sm border border-border/50 shadow-sm p-5">
                  <h2 className="text-lg font-bold text-foreground mb-1">
                    Sign in to{" "}
                    <span className="bg-gradient-to-r from-primary to-accent bg-clip-text text-transparent">
                      your account
                    </span>
                  </h2>
                  <p className="text-xs text-muted-foreground mb-5">
                    Track your vehicles, earnings, and manage your Teslas in one place
                  </p>

                  <form onSubmit={onSubmit} className="space-y-4">
                    <div className="space-y-1.5">
                      <Label htmlFor="email" className="text-xs font-medium text-foreground">Email</Label>
                      <div className="relative">
                        <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-muted-foreground" />
                        <Input
                          id="email"
                          type="email"
                          inputMode="email"
                          autoComplete="email"
                          placeholder="you@example.com"
                          value={email}
                          onChange={(e) => setEmail(e.target.value)}
                          required
                          className="h-11 bg-background/50 border-border/60 focus:border-primary/50 rounded-lg pl-9"
                        />
                      </div>
                    </div>
                    <div className="space-y-1.5">
                      <Label htmlFor="password" className="text-xs font-medium text-foreground">Password</Label>
                      <div className="relative">
                        <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-muted-foreground" />
                        <Input
                          id="password"
                          type={showPassword ? "text" : "password"}
                          autoComplete="current-password"
                          placeholder="••••••••"
                          value={password}
                          onChange={(e) => setPassword(e.target.value)}
                          required
                          className="h-11 bg-background/50 border-border/60 focus:border-primary/50 rounded-lg pl-9 pr-10"
                        />
                        <button
                          type="button"
                          onClick={() => setShowPassword(!showPassword)}
                          className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground transition-colors"
                          aria-label={showPassword ? "Hide password" : "Show password"}
                        >
                          {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                        </button>
                      </div>
                    </div>

                    <Button
                      type="submit"
                      className="w-full h-11 rounded-xl text-sm font-semibold shadow-lg shadow-primary/20 hover:shadow-primary/30 transition-all"
                      disabled={submitting}
                    >
                      {submitting ? (
                        "Signing in…"
                      ) : (
                        <span className="inline-flex items-center gap-2">
                          Continue <ArrowRight className="w-4 h-4" />
                        </span>
                      )}
                    </Button>

                    <div className="text-center">
                      <Link to="/forgot-password" className="text-xs text-primary hover:underline">
                        Forgot password?
                      </Link>
                    </div>

                    <div className="text-center text-xs text-muted-foreground">
                      New here?{" "}
                      <button
                        type="button"
                        className="text-primary font-medium hover:underline"
                        onClick={() => setPanel("register-client")}
                      >
                        Create an account
                      </button>
                    </div>
                  </form>
                </div>
              )}

              {panel === "register-client" && (
                <ClientRegisterCard onBackToLogin={() => setPanel("login")} />
              )}

              {panel === "register-host" && (
                <HostRegisterCard onBackToLogin={() => setPanel("login")} />
              )}
            </div>

            {/* Become a host (Turo-style application banner) */}
            {panel === "login" && (
              <button
                type="button"
                onClick={() => setPanel("register-host")}
                className="mt-4 w-full text-left rounded-2xl bg-card/80 backdrop-blur-sm border border-border/50 shadow-sm p-4 hover:border-primary/40 transition-colors group"
              >
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-xl bg-primary/10 flex items-center justify-center shrink-0">
                    <Briefcase className="w-5 h-5 text-primary" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2">
                      <span className="text-sm font-semibold text-foreground">Become a host</span>
                      <span className="text-[10px] uppercase tracking-wide font-semibold text-primary bg-primary/10 px-2 py-0.5 rounded-full">
                        Apply
                      </span>
                    </div>
                    <p className="text-xs text-muted-foreground mt-0.5">
                      Manage Tesla fleets for owners. Approved by our team.
                    </p>
                  </div>
                  <ArrowRight className="w-4 h-4 text-muted-foreground group-hover:text-primary group-hover:translate-x-0.5 transition-all shrink-0" />
                </div>
              </button>
            )}

            {/* Investor link */}
            {panel === "login" && (
              <Link
                to="/welcome/investor"
                className="mt-3 w-full flex items-center gap-3 rounded-2xl bg-card/60 backdrop-blur-sm border border-border/40 shadow-sm p-4 hover:border-primary/40 transition-colors group"
              >
                <div className="w-10 h-10 rounded-xl bg-primary/10 flex items-center justify-center shrink-0">
                  <TrendingUp className="w-5 h-5 text-primary" />
                </div>
                <div className="flex-1 min-w-0">
                  <span className="text-sm font-semibold text-foreground">Invest in our fleet</span>
                  <p className="text-xs text-muted-foreground mt-0.5">
                    Earn returns by investing in Tesla fleet vehicles.
                  </p>
                </div>
                <ArrowRight className="w-4 h-4 text-muted-foreground group-hover:text-primary group-hover:translate-x-0.5 transition-all shrink-0" />
              </Link>
            )}

            {/* Earnings Calculator CTA */}
            <div className="mt-6 mb-2 text-center">
              <Link to="/earnings-calculator">
                <Button variant="outline" size="sm" className="rounded-full text-xs border-primary/40 text-primary hover:bg-primary/5">
                  <Calculator className="w-3.5 h-3.5 mr-1.5" />
                  Calculate Your Earnings
                </Button>
              </Link>
            </div>

            {/* Trust Indicators */}
            <div
              className="flex justify-center gap-6 mt-4 mb-2 transition-all duration-700 delay-700 ease-out"
              style={{
                opacity: visible ? 1 : 0,
                transform: visible ? "translateY(0)" : "translateY(10px)",
              }}
            >
              {[
                { icon: Shield, label: "Fully Insured" },
                { icon: Star, label: "Top Rated" },
                { icon: Users, label: "Trusted Hosts" },
              ].map(({ icon: Icon, label }) => (
                <div key={label} className="flex flex-col items-center gap-1">
                  <div className="w-9 h-9 rounded-full bg-primary/10 flex items-center justify-center">
                    <Icon className="w-4 h-4 text-primary" />
                  </div>
                  <span className="text-[10px] text-muted-foreground font-medium">{label}</span>
                </div>
              ))}
            </div>

            {/* Reviews link (web + native) */}
            <ReadReviewsLink />

            {/* Web-only: App Store badges */}
            {!isNative && (
              <div className="mt-4 mb-4">
                <AppStoreBadges heading="Get the mobile app" size="small" />
              </div>
            )}
          </div>
        </div>
      </main>
    </>
  );
};
export default Index;
