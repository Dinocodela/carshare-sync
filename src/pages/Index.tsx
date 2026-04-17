import { useEffect, useMemo, useState } from "react";
import { useNavigate, Link, Navigate } from "react-router-dom";
import { useAuth } from "@/hooks/useAuth";
import { useToast } from "@/hooks/use-toast";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Logo } from "@/components/ui/logo";
import { ArrowRight, Shield, Star, Users, Mail, Lock, Eye, EyeOff, MapPin, Phone, Calculator } from "lucide-react";
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

type Role = "client" | "host";
type Panel = "login" | "register-client" | "register-host";

const Index = () => {
  const { user, loading, signIn } = useAuth();
  const { toast } = useToast();
  const navigate = useNavigate();

  const [role, setRole] = useState<Role>("client");
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
        title="Teslys - Tesla Car Sharing Platform | Turn Your Tesla Into Passive Income"
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
      <div className="min-h-screen pt-safe-top bg-gradient-hero overflow-y-auto">
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
                Streamline your car management and hosting services with our comprehensive platform
              </p>
            </div>

            {/* Role Switcher */}
            <div
              className="mx-auto mb-3 w-full max-w-sm transition-all duration-500 delay-[400ms] ease-out"
              style={{
                opacity: visible ? 1 : 0,
                transform: visible ? "translateY(0)" : "translateY(10px)",
              }}
            >
              <div className="grid grid-cols-2 rounded-xl bg-card/60 backdrop-blur border border-border/50 overflow-hidden">
                <button
                  type="button"
                  onClick={() => { setRole("client"); setPanel("login"); }}
                  className={`py-2.5 text-sm font-semibold transition-all duration-300 ${
                    role === "client"
                      ? "bg-primary text-primary-foreground shadow-md"
                      : "text-muted-foreground hover:text-foreground hover:bg-card"
                  }`}
                >
                  Client
                </button>
                <button
                  type="button"
                  onClick={() => { setRole("host"); setPanel("login"); }}
                  className={`py-2.5 text-sm font-semibold transition-all duration-300 ${
                    role === "host"
                      ? "bg-primary text-primary-foreground shadow-md"
                      : "text-muted-foreground hover:text-foreground hover:bg-card"
                  }`}
                >
                  Host
                </button>
              </div>
            </div>

            {/* Role description */}
            <p
              className="text-center text-xs text-muted-foreground mb-5 px-4 leading-relaxed transition-all duration-300"
            >
              {role === "client"
                ? "Create an account, list your car, and select the car hosting professional that meets your expectations to manage your car"
                : "Sign up to start receiving requests from car owners looking for professionals like you to manage their vehicles"}
            </p>

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
                      {role === "client" ? "Client Dashboard" : "Host Dashboard"}
                    </span>
                  </h2>
                  <p className="text-xs text-muted-foreground mb-5">
                    {role === "client"
                      ? "Track your vehicles, earnings, and manage your fleet"
                      : "View requests, manage listings, and grow your hosting business"}
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
                        onClick={() =>
                          setPanel(role === "client" ? "register-client" : "register-host")
                        }
                      >
                        Register as {role === "client" ? "Client" : "Host"}
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

            {/* Native-only: compact reviews link */}
            {isNative && <ReadReviewsLink />}
          </div>
        </div>
      </div>
    </>
  );
};
export default Index;
