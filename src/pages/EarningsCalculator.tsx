import { useState, useMemo, useEffect } from "react";
import { Link } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { SEO } from "@/components/SEO";
import { StructuredData } from "@/components/StructuredData";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Slider } from "@/components/ui/slider";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Logo } from "@/components/ui/logo";
import {
  ArrowRight,
  Calculator,
  TrendingUp,
  DollarSign,
  Car,
  ChevronLeft,
  Zap,
  Shield,
  Clock,
  Sparkles,
  Mail,
  Lock,
} from "lucide-react";

/* ── Static benchmark data from real platform rentals ── */
type BenchmarkKey = string;

interface Benchmark {
  avgMonthly: number;
  trips: number;
}

const BENCHMARKS: Record<BenchmarkKey, Benchmark> = {
  "Model 3|2018-2020": { avgMonthly: 1600, trips: 40 },
  "Model 3|2021-2022": { avgMonthly: 2100, trips: 166 },
  "Model 3|2023-2025": { avgMonthly: 1900, trips: 30 },
  "Model Y|2018-2020": { avgMonthly: 1700, trips: 15 },
  "Model Y|2021-2022": { avgMonthly: 2000, trips: 98 },
  "Model Y|2023-2025": { avgMonthly: 1260, trips: 25 },
  "Model X|2018-2020": { avgMonthly: 1500, trips: 20 },
  "Model X|2021-2022": { avgMonthly: 1800, trips: 32 },
  "Model X|2023-2025": { avgMonthly: 1700, trips: 10 },
  "Model S|2018-2020": { avgMonthly: 1400, trips: 18 },
  "Model S|2021-2022": { avgMonthly: 1700, trips: 22 },
  "Model S|2023-2025": { avgMonthly: 1600, trips: 8 },
  "Cybertruck|2023-2025": { avgMonthly: 1800, trips: 34 },
};

const MODELS = ["Model 3", "Model Y", "Model X", "Model S", "Cybertruck"] as const;
const HOST_COMMISSION = 0.3;

function yearBucketForYear(year: number): string {
  if (year <= 2020) return "2018-2020";
  if (year <= 2022) return "2021-2022";
  return "2023-2025";
}

const YEARS = Array.from({ length: 8 }, (_, i) => 2018 + i);

export default function EarningsCalculator() {
  const [model, setModel] = useState<string>("Model 3");
  const [year, setYear] = useState<string>("2022");
  const [availability, setAvailability] = useState<number[]>([80]);
  const [visible, setVisible] = useState(false);
  const [emailGated, setEmailGated] = useState(true);
  const [gateEmail, setGateEmail] = useState("");
  const [gateLoading, setGateLoading] = useState(false);

  useEffect(() => {
    requestAnimationFrame(() => setVisible(true));
  }, []);

  const estimates = useMemo(() => {
    const bucket = yearBucketForYear(Number(year));
    const key = `${model}|${bucket}`;
    const bench = BENCHMARKS[key];

    if (!bench) {
      const modelBenches = Object.entries(BENCHMARKS)
        .filter(([k]) => k.startsWith(model))
        .map(([, v]) => v);
      if (modelBenches.length === 0) return null;
      const avg =
        modelBenches.reduce((s, b) => s + b.avgMonthly, 0) / modelBenches.length;
      const scale = availability[0] / 100;
      const gross = Math.round(avg * scale);
      const net = Math.round(gross * (1 - HOST_COMMISSION));
      return { low: Math.round(net * 0.7), avg: net, high: Math.round(net * 1.3) };
    }

    const scale = availability[0] / 100;
    const gross = Math.round(bench.avgMonthly * scale);
    const net = Math.round(gross * (1 - HOST_COMMISSION));
    return { low: Math.round(net * 0.7), avg: net, high: Math.round(net * 1.3) };
  }, [model, year, availability]);

  const faqSchema = {
    "@context": "https://schema.org",
    "@type": "FAQPage",
    mainEntity: [
      {
        "@type": "Question",
        name: "How much can I earn renting my Tesla?",
        acceptedAnswer: {
          "@type": "Answer",
          text: "Earnings vary by model, year, and availability. On average, Tesla owners on Teslys earn $900–$1,900 per month after host fees.",
        },
      },
      {
        "@type": "Question",
        name: "What does Teslys charge?",
        acceptedAnswer: {
          "@type": "Answer",
          text: "Teslys hosts typically take a 30% commission for managing your vehicle, handling guest support, cleaning, and logistics.",
        },
      },
    ],
  };

  const fade = (delay: number) =>
    ({
      opacity: visible ? 1 : 0,
      transform: visible ? "translateY(0)" : "translateY(20px)",
      transition: `all 700ms cubic-bezier(0.23,1,0.32,1) ${delay}ms`,
    }) as React.CSSProperties;

  return (
    <>
      <SEO
        title="Tesla Earnings Calculator | Estimate Monthly Income | Teslys"
        description="Calculate how much you can earn renting your Tesla on Teslys. Get personalized monthly income estimates based on your car model, year, and availability."
        keywords="Tesla earnings calculator, Tesla rental income, how much can I earn renting my Tesla, Tesla passive income calculator"
        canonical="https://teslysapp.lovable.app/earnings-calculator"
      />
      <StructuredData type="faq" data={faqSchema} />

      <div className="min-h-screen bg-navy text-navy-foreground relative overflow-hidden">
        {/* Background gradient orbs */}
        <div className="absolute inset-0 pointer-events-none overflow-hidden">
          <div className="absolute -top-40 -right-40 w-[600px] h-[600px] rounded-full bg-primary/20 blur-[120px]" />
          <div className="absolute top-1/3 -left-32 w-[400px] h-[400px] rounded-full bg-accent/15 blur-[100px]" />
          <div className="absolute bottom-0 right-1/4 w-[500px] h-[500px] rounded-full bg-teal-light/10 blur-[100px]" />
        </div>

        {/* Nav */}
        <header className="sticky top-0 z-30 bg-navy/80 backdrop-blur-xl border-b border-white/10">
          <div className="mx-auto max-w-screen-lg px-4 sm:px-6 flex items-center justify-between py-3.5">
            <Link to="/" className="flex items-center gap-2 group">
              <ChevronLeft className="w-4 h-4 text-white/50 group-hover:text-white transition-colors" />
              <Logo className="h-6" />
            </Link>
            <Link to="/register/client">
              <Button
                size="sm"
                className="rounded-full text-xs bg-white text-navy font-semibold hover:bg-white/90 shadow-lg shadow-black/20"
              >
                Get Started <ArrowRight className="w-3 h-3 ml-1" />
              </Button>
            </Link>
          </div>
        </header>

        <div className="relative z-10 mx-auto max-w-screen-lg px-4 sm:px-6 py-12 sm:py-16 space-y-14">
          {/* Hero */}
          <div className="text-center max-w-2xl mx-auto space-y-4" style={fade(0)}>
            <div className="inline-flex items-center gap-2 bg-white/10 backdrop-blur text-white/90 text-xs font-semibold px-4 py-2 rounded-full border border-white/10">
              <Calculator className="w-3.5 h-3.5" />
              Earnings Calculator
            </div>
            <h1 className="text-4xl sm:text-5xl font-extrabold leading-tight tracking-tight">
              How Much Can Your{" "}
              <span className="bg-gradient-to-r from-accent to-teal-light bg-clip-text text-transparent">
                Tesla
              </span>{" "}
              Earn?
            </h1>
            <p className="text-white/60 text-base sm:text-lg max-w-lg mx-auto leading-relaxed">
              Real estimates based on{" "}
              <span className="text-white/80 font-medium">500+ trips</span> on our
              platform. No guesswork.
            </p>
          </div>

          {/* Calculator Grid */}
          <div
            className="grid lg:grid-cols-5 gap-6 max-w-4xl mx-auto items-start"
            style={fade(200)}
          >
            {/* Input Card — left 2 cols */}
            <div className="lg:col-span-2 rounded-2xl bg-white/[0.07] backdrop-blur-xl border border-white/10 p-6 space-y-6">
              <div className="flex items-center gap-2">
                <div className="w-8 h-8 rounded-lg bg-accent/20 flex items-center justify-center">
                  <Car className="w-4 h-4 text-accent" />
                </div>
                <h2 className="font-bold text-white">Vehicle Details</h2>
              </div>

              {/* Model */}
              <div className="space-y-2">
                <label className="text-xs font-medium text-white/60 uppercase tracking-wider">
                  Tesla Model
                </label>
                <Select value={model} onValueChange={setModel}>
                  <SelectTrigger className="bg-white/[0.08] border-white/10 text-white hover:bg-white/[0.12] transition-colors h-11 rounded-xl">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {MODELS.map((m) => (
                      <SelectItem key={m} value={m}>
                        {m}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              {/* Year */}
              <div className="space-y-2">
                <label className="text-xs font-medium text-white/60 uppercase tracking-wider">
                  Vehicle Year
                </label>
                <Select value={year} onValueChange={setYear}>
                  <SelectTrigger className="bg-white/[0.08] border-white/10 text-white hover:bg-white/[0.12] transition-colors h-11 rounded-xl">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {YEARS.map((y) => (
                      <SelectItem key={y} value={String(y)}>
                        {y}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              {/* Availability */}
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <label className="text-xs font-medium text-white/60 uppercase tracking-wider">
                    Availability
                  </label>
                  <span className="text-sm font-bold text-accent">
                    {availability[0]}%
                  </span>
                </div>
                <Slider
                  value={availability}
                  onValueChange={setAvailability}
                  min={50}
                  max={100}
                  step={5}
                  className="py-2"
                />
                <div className="flex justify-between text-[10px] text-white/40">
                  <span>50% (~15 days)</span>
                  <span>100% (~30 days)</span>
                </div>
              </div>

              <p className="text-[10px] text-white/30 leading-relaxed">
                Based on real trip data. Actual earnings vary by location, season, and
                demand.
              </p>
            </div>

            {/* Results Card — right 3 cols */}
            <div className="lg:col-span-3 space-y-5">
              <div className="rounded-2xl bg-gradient-to-br from-white/[0.12] to-white/[0.04] backdrop-blur-xl border border-white/15 p-6 sm:p-8 space-y-6">
                <div className="flex items-center gap-2">
                  <div className="w-8 h-8 rounded-lg bg-accent/20 flex items-center justify-center">
                    <TrendingUp className="w-4 h-4 text-accent" />
                  </div>
                  <div>
                    <h2 className="font-bold text-white">Monthly Earnings</h2>
                    <p className="text-[11px] text-white/40">
                      After host management fees (30%)
                    </p>
                  </div>
                </div>

                {estimates ? (
                  <>
                    {/* Main number */}
                    <div className="text-center py-6">
                      <p className="text-[10px] text-white/50 uppercase tracking-[0.2em] mb-2">
                        Average Estimate
                      </p>
                      <div className="relative inline-block">
                        <p className="text-6xl sm:text-7xl font-black bg-gradient-to-r from-accent via-teal-light to-accent bg-clip-text text-transparent tracking-tight tabular-nums">
                          ${estimates.avg.toLocaleString()}
                        </p>
                        <Sparkles className="absolute -top-2 -right-5 w-5 h-5 text-accent/60 animate-pulse" />
                      </div>
                      <p className="text-sm text-white/40 mt-1">per month</p>
                    </div>

                    {/* Range cards */}
                    <div className="grid grid-cols-2 gap-3">
                      <div className="bg-white/[0.06] rounded-xl p-4 text-center border border-white/10 hover:bg-white/[0.1] transition-colors">
                        <p className="text-[10px] text-white/40 uppercase tracking-wider mb-1">
                          Conservative
                        </p>
                        <p className="text-2xl font-bold text-white tabular-nums">
                          ${estimates.low.toLocaleString()}
                        </p>
                      </div>
                      <div className="bg-white/[0.06] rounded-xl p-4 text-center border border-white/10 hover:bg-white/[0.1] transition-colors">
                        <p className="text-[10px] text-white/40 uppercase tracking-wider mb-1">
                          Optimistic
                        </p>
                        <p className="text-2xl font-bold text-white tabular-nums">
                          ${estimates.high.toLocaleString()}
                        </p>
                      </div>
                    </div>

                    {/* Annual */}
                    <div className="bg-accent/10 rounded-xl p-4 text-center border border-accent/20">
                      <p className="text-[11px] text-white/50 mb-1">
                        Projected Annual Earnings
                      </p>
                      <p className="text-3xl font-black text-white tracking-tight flex items-center justify-center gap-1 tabular-nums">
                        <DollarSign className="w-6 h-6 text-accent" />
                        {(estimates.avg * 12).toLocaleString()}
                      </p>
                    </div>
                  </>
                ) : (
                  <p className="text-center text-white/40 py-8">
                    Select your vehicle details to see estimates.
                  </p>
                )}
              </div>

              {/* CTA */}
              <Link to="/register/client" className="block">
                <Button className="w-full h-13 rounded-xl text-sm font-bold bg-gradient-to-r from-primary to-accent text-navy hover:opacity-90 shadow-xl shadow-accent/20 transition-all active:scale-[0.98]">
                  Start Earning With Your Tesla
                  <ArrowRight className="w-4 h-4 ml-2" />
                </Button>
              </Link>
              <p className="text-center text-[11px] text-white/30">
                Free to sign up · No commitment required
              </p>
            </div>
          </div>

          {/* How It Works */}
          <div className="max-w-3xl mx-auto pt-4" style={fade(400)}>
            <h2 className="text-2xl font-bold text-center text-white mb-8">
              How It Works
            </h2>
            <div className="grid sm:grid-cols-3 gap-4">
              {[
                {
                  icon: Zap,
                  step: "1",
                  title: "List Your Tesla",
                  desc: "Add your vehicle details and set your availability preferences.",
                },
                {
                  icon: Shield,
                  step: "2",
                  title: "We Handle the Rest",
                  desc: "Your host manages bookings, cleaning, guest support, and logistics.",
                },
                {
                  icon: Clock,
                  step: "3",
                  title: "Get Paid",
                  desc: "Earn passive income deposited directly to your account every month.",
                },
              ].map(({ icon: Icon, step, title, desc }) => (
                <div
                  key={step}
                  className="group text-center p-6 rounded-2xl bg-white/[0.05] border border-white/10 hover:bg-white/[0.08] transition-all duration-300"
                >
                  <div className="w-12 h-12 rounded-xl bg-accent/15 text-accent font-bold text-lg flex items-center justify-center mx-auto mb-4 group-hover:scale-110 transition-transform">
                    <Icon className="w-5 h-5" />
                  </div>
                  <p className="text-[10px] text-accent/70 font-semibold uppercase tracking-widest mb-1">
                    Step {step}
                  </p>
                  <h3 className="font-semibold text-white text-sm mb-1.5">{title}</h3>
                  <p className="text-xs text-white/40 leading-relaxed">{desc}</p>
                </div>
              ))}
            </div>
          </div>

          {/* Trust footer */}
          <div className="text-center pt-6 pb-4 space-y-3" style={fade(500)}>
            <div className="flex items-center justify-center gap-6 text-white/30 text-xs">
              <span className="flex items-center gap-1.5">
                <Shield className="w-3.5 h-3.5" /> Fully Insured
              </span>
              <span className="flex items-center gap-1.5">
                <Zap className="w-3.5 h-3.5" /> 500+ Trips
              </span>
              <span className="flex items-center gap-1.5">
                <Clock className="w-3.5 h-3.5" /> 24/7 Support
              </span>
            </div>
            <p className="text-[10px] text-white/20">
              © {new Date().getFullYear()} Teslys. All rights reserved.
            </p>
          </div>
        </div>
      </div>
    </>
  );
}
