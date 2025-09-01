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

type Role = "client" | "host";

const Index = () => {
  const { user, loading, signIn } = useAuth();
  const { toast } = useToast();
  const navigate = useNavigate();

  const [role, setRole] = useState<Role>("client");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const isNative = useMemo(() => Capacitor.isNativePlatform(), []);

  useEffect(() => {
    if (isNative) {
      StatusBar.setBackgroundColor({ color: "#000000" });
    }
    return () => {
      if (isNative) {
        StatusBar.setBackgroundColor({ color: "#aef1be" });
      }
    };
  }, []);

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

  return (
    <div className="h-full bg-gradient-hero flex items-center justify-center p-4">
      <div className={`w-full max-w-xl `}>
        {/* Hero */}
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

        {/* Segmented Selector */}
        <div className="mx-auto mb-4 w-full max-w-sm">
          <div className="grid grid-cols-2 rounded-xl bg-white/60 backdrop-blur border border-primary/10 overflow-hidden">
            <button
              type="button"
              onClick={() => setRole("client")}
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
              onClick={() => setRole("host")}
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

        {/* Role summary */}
        <div className="text-center text-sm text-muted-foreground mb-4 px-2">
          {role === "client"
            ? "Track expenses, manage claims, and keep your vehicles organized with powerful analytics"
            : "Manage car listings, track earnings, and grow your business with comprehensive tools"}
        </div>

        {/* Inline Login */}
        <Card className="bg-white/80 border-primary/10 backdrop-blur">
          <CardHeader className="pb-2">
            {/* <CardTitle className="text-lg">Sign In</CardTitle>
            <CardDescription className="text-sm">
              Continue as{" "}
              <span className="font-medium">
                {role === "client" ? "Client" : "Host"}
              </span>
            </CardDescription> */}
          </CardHeader>
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
                <Link
                  to={role === "client" ? "/register/client" : "/register/host"}
                  className="text-primary underline"
                >
                  Register as {role === "client" ? "Client" : "Host"}
                </Link>
              </div>
            </form>
          </CardContent>
        </Card>

        {/* Optional: direct Sign-In page link */}
        {/* <div className="text-center mt-6">
          <Button
            variant="outline"
            asChild
            className="bg-white/50 border-primary/20 hover:bg-white/70 hover:border-primary/40 transition"
          >
            <Link to="/login" className="flex items-center gap-2">
              Go to full Sign In
              <ArrowRight className="w-4 h-4" />
            </Link>
          </Button>
        </div> */}
      </div>
    </div>
  );
};

export default Index;
