import { useState, useMemo } from "react";
import { Link } from "react-router-dom";
import { SEO } from "@/components/SEO";
import { StructuredData } from "@/components/StructuredData";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Slider } from "@/components/ui/slider";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Logo } from "@/components/ui/logo";
import { ArrowRight, Calculator, TrendingUp, DollarSign, Car, ChevronLeft } from "lucide-react";
import { PageContainer } from "@/components/layout/PageContainer";

/* ── Static benchmark data from real platform rentals ── */
type BenchmarkKey = string; // "model|yearBucket"

interface Benchmark {
  avgMonthly: number; // gross monthly avg at 100% availability
  trips: number;      // data points backing this figure
}

const BENCHMARKS: Record<BenchmarkKey, Benchmark> = {
  // Model 3
  "Model 3|2018-2020": { avgMonthly: 1600, trips: 40 },
  "Model 3|2021-2022": { avgMonthly: 2100, trips: 166 },
  "Model 3|2023-2025": { avgMonthly: 1900, trips: 30 },
  // Model Y
  "Model Y|2018-2020": { avgMonthly: 1700, trips: 15 },
  "Model Y|2021-2022": { avgMonthly: 2000, trips: 98 },
  "Model Y|2023-2025": { avgMonthly: 1260, trips: 25 },
  // Model X
  "Model X|2018-2020": { avgMonthly: 1500, trips: 20 },
  "Model X|2021-2022": { avgMonthly: 1800, trips: 32 },
  "Model X|2023-2025": { avgMonthly: 1700, trips: 10 },
  // Model S
  "Model S|2018-2020": { avgMonthly: 1400, trips: 18 },
  "Model S|2021-2022": { avgMonthly: 1700, trips: 22 },
  "Model S|2023-2025": { avgMonthly: 1600, trips: 8 },
  // Cybertruck
  "Cybertruck|2023-2025": { avgMonthly: 1800, trips: 34 },
};

const MODELS = ["Model 3", "Model Y", "Model X", "Model S", "Cybertruck"] as const;
const YEAR_BUCKETS = ["2018-2020", "2021-2022", "2023-2025"] as const;

const HOST_COMMISSION = 0.30; // 30% goes to host

function yearBucketForYear(year: number): string {
  if (year <= 2020) return "2018-2020";
  if (year <= 2022) return "2021-2022";
  return "2023-2025";
}

const YEARS = Array.from({ length: 8 }, (_, i) => 2018 + i); // 2018-2025

export default function EarningsCalculator() {
  const [model, setModel] = useState<string>("Model 3");
  const [year, setYear] = useState<string>("2022");
  const [availability, setAvailability] = useState<number[]>([80]);

  const estimates = useMemo(() => {
    const bucket = yearBucketForYear(Number(year));
    const key = `${model}|${bucket}`;
    const bench = BENCHMARKS[key];

    if (!bench) {
      // fallback: average across all benchmarks for that model
      const modelBenches = Object.entries(BENCHMARKS)
        .filter(([k]) => k.startsWith(model))
        .map(([, v]) => v);
      if (modelBenches.length === 0) return null;
      const avg = modelBenches.reduce((s, b) => s + b.avgMonthly, 0) / modelBenches.length;
      const scale = (availability[0] / 100);
      const gross = Math.round(avg * scale);
      const net = Math.round(gross * (1 - HOST_COMMISSION));
      return {
        low: Math.round(net * 0.7),
        avg: net,
        high: Math.round(net * 1.3),
      };
    }

    const scale = availability[0] / 100;
    const gross = Math.round(bench.avgMonthly * scale);
    const net = Math.round(gross * (1 - HOST_COMMISSION));

    return {
      low: Math.round(net * 0.7),
      avg: net,
      high: Math.round(net * 1.3),
    };
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

  return (
    <>
      <SEO
        title="Tesla Earnings Calculator | Estimate Monthly Income | Teslys"
        description="Calculate how much you can earn renting your Tesla on Teslys. Get personalized monthly income estimates based on your car model, year, and availability."
        keywords="Tesla earnings calculator, Tesla rental income, how much can I earn renting my Tesla, Tesla passive income calculator"
        canonical="https://teslysapp.lovable.app/earnings-calculator"
      />
      <StructuredData data={faqSchema} />

      <div className="min-h-screen bg-gradient-to-b from-background via-secondary/30 to-background">
        {/* Nav */}
        <header className="sticky top-0 z-30 bg-background/80 backdrop-blur border-b border-border/40">
          <PageContainer className="flex items-center justify-between py-3">
            <Link to="/" className="flex items-center gap-2">
              <ChevronLeft className="w-4 h-4 text-muted-foreground" />
              <Logo className="h-6" />
            </Link>
            <Link to="/register/client">
              <Button size="sm" className="rounded-full text-xs">
                Get Started <ArrowRight className="w-3 h-3 ml-1" />
              </Button>
            </Link>
          </PageContainer>
        </header>

        <PageContainer className="py-10 space-y-10">
          {/* Hero */}
          <div className="text-center max-w-2xl mx-auto space-y-3">
            <div className="inline-flex items-center gap-2 bg-primary/10 text-primary text-xs font-semibold px-3 py-1.5 rounded-full">
              <Calculator className="w-3.5 h-3.5" />
              Earnings Calculator
            </div>
            <h1 className="text-3xl sm:text-4xl font-bold text-foreground leading-tight">
              How Much Can Your{" "}
              <span className="bg-gradient-to-r from-primary to-accent bg-clip-text text-transparent">
                Tesla
              </span>{" "}
              Earn?
            </h1>
            <p className="text-muted-foreground text-sm sm:text-base max-w-md mx-auto">
              Get a personalized estimate based on real rental data from hundreds of trips on our platform.
            </p>
          </div>

          <div className="grid md:grid-cols-2 gap-6 max-w-4xl mx-auto">
            {/* Input Card */}
            <Card className="border-border/60 shadow-lg">
              <CardHeader className="pb-4">
                <CardTitle className="text-lg flex items-center gap-2">
                  <Car className="w-5 h-5 text-primary" />
                  Your Vehicle Details
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-6">
                {/* Model */}
                <div className="space-y-2">
                  <label className="text-sm font-medium text-foreground">Tesla Model</label>
                  <Select value={model} onValueChange={setModel}>
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      {MODELS.map((m) => (
                        <SelectItem key={m} value={m}>{m}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                {/* Year */}
                <div className="space-y-2">
                  <label className="text-sm font-medium text-foreground">Vehicle Year</label>
                  <Select value={year} onValueChange={setYear}>
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      {YEARS.map((y) => (
                        <SelectItem key={y} value={String(y)}>{y}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                {/* Availability */}
                <div className="space-y-3">
                  <div className="flex items-center justify-between">
                    <label className="text-sm font-medium text-foreground">
                      Monthly Availability
                    </label>
                    <span className="text-sm font-bold text-primary">
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
                  <div className="flex justify-between text-[10px] text-muted-foreground">
                    <span>50% (~15 days)</span>
                    <span>100% (~30 days)</span>
                  </div>
                </div>

                <p className="text-[11px] text-muted-foreground leading-relaxed">
                  Estimates are based on real trip data collected from our platform.
                  Actual earnings may vary depending on location, season, and demand.
                </p>
              </CardContent>
            </Card>

            {/* Results Card */}
            <div className="space-y-6">
              <Card className="border-primary/30 shadow-lg bg-gradient-to-br from-card to-secondary/20">
                <CardHeader className="pb-3">
                  <CardTitle className="text-lg flex items-center gap-2">
                    <TrendingUp className="w-5 h-5 text-primary" />
                    Your Estimated Monthly Earnings
                  </CardTitle>
                  <p className="text-xs text-muted-foreground">
                    After host management fees (30%)
                  </p>
                </CardHeader>
                <CardContent>
                  {estimates ? (
                    <div className="space-y-5">
                      {/* Main estimate */}
                      <div className="text-center py-4">
                        <p className="text-xs text-muted-foreground uppercase tracking-wider mb-1">
                          Average Estimate
                        </p>
                        <p className="text-5xl font-bold bg-gradient-to-r from-primary to-accent bg-clip-text text-transparent">
                          ${estimates.avg.toLocaleString()}
                        </p>
                        <p className="text-sm text-muted-foreground mt-1">per month</p>
                      </div>

                      {/* Range */}
                      <div className="grid grid-cols-2 gap-3">
                        <div className="bg-background/60 rounded-xl p-4 text-center border border-border/40">
                          <p className="text-[10px] text-muted-foreground uppercase tracking-wider mb-1">
                            Conservative
                          </p>
                          <p className="text-xl font-bold text-foreground">
                            ${estimates.low.toLocaleString()}
                          </p>
                        </div>
                        <div className="bg-background/60 rounded-xl p-4 text-center border border-border/40">
                          <p className="text-[10px] text-muted-foreground uppercase tracking-wider mb-1">
                            Optimistic
                          </p>
                          <p className="text-xl font-bold text-foreground">
                            ${estimates.high.toLocaleString()}
                          </p>
                        </div>
                      </div>

                      {/* Annual projection */}
                      <div className="bg-primary/5 rounded-xl p-4 text-center border border-primary/20">
                        <p className="text-xs text-muted-foreground mb-0.5">
                          Projected Annual Earnings
                        </p>
                        <p className="text-2xl font-bold text-foreground flex items-center justify-center gap-1">
                          <DollarSign className="w-5 h-5 text-primary" />
                          {(estimates.avg * 12).toLocaleString()}
                        </p>
                      </div>
                    </div>
                  ) : (
                    <p className="text-center text-muted-foreground py-8">
                      Select your vehicle details to see estimates.
                    </p>
                  )}
                </CardContent>
              </Card>

              {/* CTA */}
              <Link to="/register/client" className="block">
                <Button className="w-full h-12 rounded-xl text-sm font-semibold shadow-lg shadow-primary/20 hover:shadow-primary/30 transition-all">
                  Start Earning With Your Tesla
                  <ArrowRight className="w-4 h-4 ml-2" />
                </Button>
              </Link>

              <p className="text-center text-[11px] text-muted-foreground">
                Free to sign up · No commitment required
              </p>
            </div>
          </div>

          {/* How it works mini */}
          <div className="max-w-3xl mx-auto pt-6">
            <h2 className="text-xl font-bold text-center text-foreground mb-6">
              How It Works
            </h2>
            <div className="grid sm:grid-cols-3 gap-4">
              {[
                { step: "1", title: "List Your Tesla", desc: "Add your vehicle details and set your availability preferences." },
                { step: "2", title: "We Handle the Rest", desc: "Your host manages bookings, cleaning, guest support, and logistics." },
                { step: "3", title: "Get Paid", desc: "Earn passive income deposited directly to your account every month." },
              ].map(({ step, title, desc }) => (
                <div key={step} className="text-center p-5 rounded-xl bg-card border border-border/40">
                  <div className="w-10 h-10 rounded-full bg-primary/10 text-primary font-bold text-lg flex items-center justify-center mx-auto mb-3">
                    {step}
                  </div>
                  <h3 className="font-semibold text-foreground text-sm mb-1">{title}</h3>
                  <p className="text-xs text-muted-foreground leading-relaxed">{desc}</p>
                </div>
              ))}
            </div>
          </div>
        </PageContainer>
      </div>
    </>
  );
}
