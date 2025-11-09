import { useEffect, useMemo, useState } from "react";
import { useNavigate, Link, Navigate } from "react-router-dom";
import { useAuth } from "@/hooks/useAuth";
import { useToast } from "@/hooks/use-toast";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Logo } from "@/components/ui/logo";
import { ArrowRight } from "lucide-react";
import { StatusBar } from "@capacitor/status-bar";
import { Capacitor } from "@capacitor/core";
import { ScreenOrientation } from "@capacitor/screen-orientation";

import ClientRegisterCard from "@/components/auth/ClientRegisterCard";
import HostRegisterCard from "@/components/auth/HostRegisterCard";
import { AppStoreBadges } from "@/components/ui/AppStoreBadges";

type Role = "client" | "host";
type Panel = "login" | "register-client" | "register-host";

const Index = () => {
  const { user, loading, signIn } = useAuth();
  const { toast } = useToast();
  const navigate = useNavigate();

  const [role, setRole] = useState<Role>("client");
  const [panel, setPanel] = useState<Panel>("login");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const isNative = useMemo(() => Capacitor.isNativePlatform(), []);

  // Check if user has seen onboarding
  useEffect(() => {
    const hasSeenOnboarding = localStorage.getItem("hasSeenOnboarding");
    if (!hasSeenOnboarding && !user && !loading) {
      navigate("/onboarding");
    }
  }, [navigate, user, loading]);

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

  //   useEffect(() => {
  //     if (user) navigate("/dashboard");
  //   }, [user, navigate]);

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

  const Hero = (
    <>
      <div className="text-center mb-8">
        <div className="flex justify-center mb-6">
          <Logo size="xl" />
        </div>
        <p className="text-base sm:text-lg md:text-xl text-muted-foreground leading-relaxed px-2">
          Streamline your car management and hosting services
          <br className="hidden sm:block" />
          <span className="block sm:inline">
            {" "}
            with our comprehensive platform{" "}
          </span>
        </p>
      </div>

      <div className="mx-auto mb-4 w-full max-w-sm">
        <div className="grid grid-cols-2 rounded-xl bg-white/60 backdrop-blur border border-primary/10 overflow-hidden">
          <button
            type="button"
            onClick={() => {
              setRole("client");
              setPanel("login");
            }}
            className={`py-2.5 text-sm font-medium transition ${
              role === "client"
                ? "bg-primary text-white"
                : "text-foreground hover:bg-white"
            }`}
          >
            Client
          </button>
          <button
            type="button"
            onClick={() => {
              setRole("host");
              setPanel("login");
            }}
            className={`py-2.5 text-sm font-medium transition ${
              role === "host"
                ? "bg-primary text-white"
                : "text-foreground hover:bg-white"
            }`}
          >
            Host
          </button>
        </div>
      </div>

      <div className="text-center text-sm text-muted-foreground mb-4 px-2">
        {role === "client"
          ? "Track expenses, manage claims, and keep your vehicles organized with powerful analytics"
          : "Manage car listings, track earnings, and grow your business with comprehensive tools"}
      </div>
    </>
  );

  return (
    <div className="h-full pt-safe-top bg-gradient-hero flex items-center justify-center p-4 overflow-y-scroll">
      <div className="w-full max-w-xl h-full">
        {Hero}

        {/* ✅ Switch the content panel inline */}
        {panel === "login" && (
          <Card className="bg-white/80 border-primary/10 backdrop-blur">
            <CardHeader className="pb-2" />
            <CardContent className="px-4">
              <form onSubmit={onSubmit} className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="email">Email</Label>
                  <Input
                    id="email"
                    type="email"
                    inputMode="email"
                    autoComplete="email"
                    placeholder="you@example.com"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    required
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="password">Password</Label>
                  <Input
                    id="password"
                    type="password"
                    autoComplete="current-password"
                    placeholder="••••••••"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    required
                  />
                </div>

                <Button
                  type="submit"
                  className="w-full flex items-center justify-center"
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

                <div className="text-center text-sm text-muted-foreground">
                  New here?{" "}
                  <button
                    type="button"
                    className="text-primary underline"
                    onClick={() =>
                      setPanel(
                        role === "client" ? "register-client" : "register-host"
                      )
                    }
                  >
                    Register as {role === "client" ? "Client" : "Host"}
                  </button>
                </div>
              </form>
            </CardContent>
          </Card>
        )}

        {panel === "register-client" && (
          <ClientRegisterCard onBackToLogin={() => setPanel("login")} />
        )}

        {panel === "register-host" && (
          <HostRegisterCard onBackToLogin={() => setPanel("login")} />
        )}

        <div className="mt-8 mb-4">
          <AppStoreBadges heading="Available on mobile" size="small" />
        </div>
      </div>
    </div>
  );
};
export default Index;
