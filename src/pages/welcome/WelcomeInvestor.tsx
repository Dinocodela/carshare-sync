import { useEffect, useMemo, useRef, useState } from "react";
import { useNavigate } from "react-router-dom";
import {
  Zap,
  TrendingUp,
  ShieldCheck,
  CalendarClock,
  Receipt,
  ArrowRight,
  Star,
  Clock,
  AlertCircle,
  User,
  Car,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Slider } from "@/components/ui/slider";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { toast } from "@/hooks/use-toast";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";
import { useWorkspace } from "@/hooks/useWorkspace";
import heroImg from "@/assets/investor-hero.jpg";


const MONTHLY_RETURN = 1000;
const TERM_MONTHS = 50;
const INVESTMENT = 50000;

const WHY = [
  {
    Icon: TrendingUp,
    title: "6 Years Profitable",
    body: "Proven track record with near-100% fleet occupancy and consistent profitability.",
  },
  {
    Icon: ShieldCheck,
    title: "Asset-Backed",
    body: "Your investment is secured by physical Tesla vehicles. Full insurance coverage included.",
  },
  {
    Icon: CalendarClock,
    title: "Monthly Distributions",
    body: "Receive $1,000 every month for 50 months. Predictable, consistent returns.",
  },
  {
    Icon: Receipt,
    title: "Tax Benefits",
    body: "Potential tax deductions and depreciation benefits. Consult your tax advisor.",
  },
];

const TESTIMONIALS = [
  {
    quote:
      "Solid investment with predictable monthly returns. The team is professional and responsive. Exactly what I was looking for to diversify my portfolio.",
    name: "James M.",
    role: "Business Owner, California",
    result: "Made $14,000 in 50 months",
  },
  {
    quote:
      "I invested in 2 vehicles and couldn't be happier. Consistent payments, great communication, and the resale returns exceeded expectations.",
    name: "Sarah T.",
    role: "Real Estate Investor, Florida",
    result: "Made $28,500 across 2 vehicles",
  },
  {
    quote:
      "As someone new to alternative investments, this was easy to understand and execute. The asset-backed model gave me confidence. Highly recommend.",
    name: "Michael R.",
    role: "Financial Advisor, Texas",
    result: "Made $13,200 in first round",
  },
];

const FAQS = [
  {
    q: "What happens if the vehicle is damaged or totaled?",
    a: "Each vehicle is covered under a comprehensive commercial insurance policy that includes liability, collision, and comprehensive coverage. In the event of total loss, the insurance payout is used to satisfy the outstanding investment balance or replace the vehicle. The investor is protected in all scenarios.",
  },
  {
    q: "How are monthly payments structured?",
    a: "You receive a fixed $1,000 distribution every month for 50 months, backed by fleet rental income from a Tesla operating at near-100% occupancy.",
  },
  {
    q: "Can I exit early before the 50-month term?",
    a: "The structure is designed as a 50-month term. Early exits are handled case-by-case — reach out to our team to discuss your situation.",
  },
  {
    q: "How is the resale value determined at month 50?",
    a: "At month 50 the vehicle is sold at fair market value. You receive 50% of the resale proceeds on top of your monthly distributions.",
  },
  {
    q: "Can I invest in multiple vehicles?",
    a: "Yes. Many investors fund multiple vehicles to scale their monthly cash flow and resale upside.",
  },
  {
    q: "How do I get started?",
    a: "Browse available vehicles in the marketplace, choose a position, and submit your investment request. Our team confirms wire/ACH details and activates your position.",
  },
];

const currency = (n: number) =>
  n.toLocaleString("en-US", { style: "currency", currency: "USD", maximumFractionDigits: 0 });

export default function WelcomeInvestor() {
  const navigate = useNavigate();
  const { markLandingSeen, availableRoles } = useWorkspace();
  const dealRef = useRef<HTMLDivElement>(null);

  const row = availableRoles.find((r) => r.role === "investor");
  const pending = row?.status === "pending";

  const [resale, setResale] = useState(28000);
  const [vehicles, setVehicles] = useState(1);

  // Countdown to end of current round
  const deadline = useMemo(() => {
    const d = new Date();
    d.setDate(d.getDate() + 3);
    d.setHours(23, 59, 59, 999);
    return d.getTime();
  }, []);
  const [now, setNow] = useState(() => Date.now());
  useEffect(() => {
    const id = setInterval(() => setNow(Date.now()), 1000);
    return () => clearInterval(id);
  }, []);
  const remaining = Math.max(0, deadline - now);
  const cd = {
    hours: Math.floor(remaining / 3_600_000),
    minutes: Math.floor((remaining % 3_600_000) / 60_000),
    seconds: Math.floor((remaining % 60_000) / 1000),
  };
  const pad = (n: number) => String(n).padStart(2, "0");

  // Inquiry form
  const [form, setForm] = useState({ name: "", email: "", phone: "", amount: "", message: "" });
  const [submitting, setSubmitting] = useState(false);
  const formRef = useRef<HTMLDivElement>(null);
  const scrollToForm = () => formRef.current?.scrollIntoView({ behavior: "smooth" });

  const submitInquiry = (e: React.FormEvent) => {
    e.preventDefault();
    if (!form.name.trim() || !form.email.trim() || !form.amount.trim()) {
      toast({
        title: "Missing information",
        description: "Please fill in your name, email, and interested investment amount.",
        variant: "destructive",
      });
      return;
    }
    setSubmitting(true);
    setTimeout(() => {
      setSubmitting(false);
      setForm({ name: "", email: "", phone: "", amount: "", message: "" });
      toast({
        title: "Inquiry submitted",
        description: "We'll review your inquiry and contact you within 24 hours.",
      });
    }, 600);
  };



  const calc = useMemo(() => {
    const monthlyTotal = MONTHLY_RETURN * TERM_MONTHS; // 50,000
    const resaleShare = resale * 0.5;
    const totalPerVehicle = monthlyTotal + resaleShare;
    const netProfit = totalPerVehicle - INVESTMENT;
    const roi = (netProfit / INVESTMENT) * 100;
    const annualized = roi / (TERM_MONTHS / 12);
    return {
      resaleShare: resaleShare * vehicles,
      totalReturn: totalPerVehicle * vehicles,
      netProfit: netProfit * vehicles,
      roi,
      annualized,
    };
  }, [resale, vehicles]);

  const goToMarketplace = async () => {
    await markLandingSeen("investor");
    navigate("/investor/marketplace");
  };

  const scrollToDeal = () => dealRef.current?.scrollIntoView({ behavior: "smooth" });

  return (
    <div className="min-h-screen bg-background">
      {/* Hero */}
      <section className="relative overflow-hidden">
        <img
          src={heroImg}
          alt="Tesla fleet driving on a mountain highway at sunset"
          width={1920}
          height={1080}
          className="absolute inset-0 h-full w-full object-cover"
        />
        <div className="absolute inset-0 bg-gradient-to-r from-navy/85 via-navy/55 to-navy/30" />
        <div className="relative max-w-5xl mx-auto px-4 py-24 md:py-32 text-center text-navy-foreground">
          <Badge className="mb-6 bg-accent/20 text-accent border border-accent/40 backdrop-blur">
            <Zap className="h-3.5 w-3.5 mr-1" /> Limited Time Offer
          </Badge>
          <h1 className="text-4xl md:text-6xl font-bold tracking-tight mb-4">
            Invest in Tesla Fleet Growth
          </h1>
          <p className="text-lg md:text-2xl text-white/90 mb-8">
            $50K per vehicle. $1K monthly returns. 50% of resale upside.
          </p>
          <div className="flex flex-col sm:flex-row gap-3 justify-center">
            <Button size="lg" onClick={goToMarketplace} className="gap-2">
              <Zap className="h-4 w-4" /> Invest Now
            </Button>
            <Button
              size="lg"
              variant="outline"
              onClick={scrollToDeal}
              className="bg-white/10 text-white border-white/40 hover:bg-white/20 hover:text-white"
            >
              See Returns
            </Button>
          </div>
        </div>
      </section>

      {/* Slots-left countdown banner */}
      <section className="px-4 py-6 bg-muted/40 border-y">
        <div className="max-w-5xl mx-auto flex flex-col sm:flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-4">
            <div className="flex h-14 w-14 shrink-0 items-center justify-center rounded-xl bg-navy text-navy-foreground">
              <span className="text-xl font-bold leading-none">10</span>
            </div>
            <div>
              <div className="font-bold text-primary uppercase tracking-wide text-sm">
                Only 10 Slots Left
              </div>
              <div className="text-sm text-muted-foreground flex items-center gap-1.5">
                <Clock className="h-3.5 w-3.5" /> This round closes in:
              </div>
              <div className="text-2xl font-bold tabular-nums">
                {pad(cd.hours)}:{pad(cd.minutes)}:{pad(cd.seconds)}
              </div>
            </div>
          </div>
          <Button size="lg" onClick={scrollToForm}>
            Reserve Your Spot
          </Button>
        </div>
      </section>


      {/* The Deal */}
      <section ref={dealRef} className="py-16 md:py-24 px-4">
        <div className="max-w-5xl mx-auto text-center">
          <h2 className="text-3xl md:text-4xl font-bold mb-2">The Deal</h2>
          <p className="text-muted-foreground mb-10">Simple. Transparent. Profitable.</p>
          <div className="grid sm:grid-cols-3 gap-6">
            {[
              { value: "$50K", label: "Your Investment" },
              { value: "$1K", label: "Monthly Cash Flow" },
              { value: "50%", label: "Resale Upside" },
            ].map((s) => (
              <Card key={s.label} className="border-2">
                <CardContent className="p-8">
                  <div className="text-4xl md:text-5xl font-bold text-primary mb-2">
                    {s.value}
                  </div>
                  <div className="text-muted-foreground">{s.label}</div>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* ROI Calculator */}
      <section className="py-16 md:py-24 px-4 bg-muted/40">
        <div className="max-w-5xl mx-auto">
          <div className="text-center mb-10">
            <h2 className="text-3xl md:text-4xl font-bold mb-2">Your Potential Returns</h2>
            <p className="text-muted-foreground">
              Adjust the calculator to see different scenarios.
            </p>
          </div>
          <div className="grid md:grid-cols-2 gap-8 items-start">
            <Card>
              <CardContent className="p-6 space-y-8">
                <div>
                  <div className="flex justify-between mb-3">
                    <span className="font-medium">Vehicle Resale Value at Month 50</span>
                    <span className="font-bold text-primary">{currency(resale)}</span>
                  </div>
                  <Slider
                    value={[resale]}
                    min={20000}
                    max={35000}
                    step={500}
                    onValueChange={(v) => setResale(v[0])}
                  />
                  <div className="flex justify-between text-xs text-muted-foreground mt-2">
                    <span>$20,000 (Conservative)</span>
                    <span>$35,000 (Optimistic)</span>
                  </div>
                </div>
                <div>
                  <div className="flex justify-between mb-3">
                    <span className="font-medium">Number of Vehicles</span>
                    <span className="font-bold text-primary">
                      {vehicles} Tesla{vehicles > 1 ? "s" : ""}
                    </span>
                  </div>
                  <Slider
                    value={[vehicles]}
                    min={1}
                    max={10}
                    step={1}
                    onValueChange={(v) => setVehicles(v[0])}
                  />
                  <div className="flex justify-between text-xs text-muted-foreground mt-2">
                    <span>1 Vehicle</span>
                    <span>10 Vehicles</span>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card className="bg-gradient-to-br from-primary/5 to-accent/5 border-primary/20">
              <CardContent className="p-6">
                <div className="grid grid-cols-2 gap-4">
                  {[
                    { label: "Monthly Cash Flow", value: currency(MONTHLY_RETURN * vehicles), sub: "× 50 months" },
                    { label: "Resale Share (50%)", value: currency(calc.resaleShare), sub: "At month 50" },
                    { label: "Total Return", value: currency(calc.totalReturn), sub: "Principal + profit" },
                    { label: "Net Profit", value: currency(calc.netProfit), sub: "Above investment" },
                    { label: "Total ROI", value: `${calc.roi.toFixed(1)}%`, sub: "Over 50 months" },
                    { label: "Annualized ROI", value: `${calc.annualized.toFixed(1)}%`, sub: "Simple average" },
                  ].map((m) => (
                    <div key={m.label} className="rounded-lg bg-card p-4 border">
                      <div className="text-xs text-muted-foreground">{m.label}</div>
                      <div className="text-xl font-bold text-primary">{m.value}</div>
                      <div className="text-[11px] text-muted-foreground">{m.sub}</div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </section>

      {/* Why Teslys */}
      <section className="py-16 md:py-24 px-4">
        <div className="max-w-5xl mx-auto">
          <h2 className="text-3xl md:text-4xl font-bold text-center mb-10">Why Teslys?</h2>
          <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {WHY.map(({ Icon, title, body }) => (
              <Card key={title}>
                <CardContent className="p-6">
                  <div className="p-2.5 rounded-xl bg-primary/10 text-primary w-fit mb-4">
                    <Icon className="h-6 w-6" />
                  </div>
                  <h3 className="font-semibold mb-2">{title}</h3>
                  <p className="text-sm text-muted-foreground">{body}</p>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* Testimonials */}
      <section className="py-16 md:py-24 px-4 bg-muted/40">
        <div className="max-w-5xl mx-auto">
          <div className="text-center mb-10">
            <h2 className="text-3xl md:text-4xl font-bold mb-2">Investor Success Stories</h2>
            <p className="text-muted-foreground">
              Real returns from real investors.
            </p>
          </div>
          <div className="grid md:grid-cols-3 gap-6">
            {TESTIMONIALS.map((t) => (
              <Card key={t.name}>
                <CardContent className="p-6 flex flex-col h-full">
                  <div className="flex gap-1 mb-3 text-warning">
                    {Array.from({ length: 5 }).map((_, i) => (
                      <Star key={i} className="h-4 w-4 fill-current" />
                    ))}
                  </div>
                  <p className="text-sm text-muted-foreground mb-4 flex-1">"{t.quote}"</p>
                  <div className="border-t pt-4">
                    <div className="font-semibold">{t.name}</div>
                    <div className="text-xs text-muted-foreground">{t.role}</div>
                    <Badge variant="secondary" className="mt-2">
                      {t.result}
                    </Badge>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* FAQ */}
      <section className="py-16 md:py-24 px-4">
        <div className="max-w-3xl mx-auto">
          <h2 className="text-3xl md:text-4xl font-bold text-center mb-2">
            Frequently Asked Questions
          </h2>
          <p className="text-muted-foreground text-center mb-10">
            Common questions about the deal structure, risks, and process.
          </p>
          <Accordion type="single" collapsible className="w-full">
            {FAQS.map((f, i) => (
              <AccordionItem key={i} value={`faq-${i}`}>
                <AccordionTrigger className="text-left">{f.q}</AccordionTrigger>
                <AccordionContent className="text-muted-foreground">{f.a}</AccordionContent>
              </AccordionItem>
            ))}
          </Accordion>
        </div>
      </section>

      {/* Final CTA */}
      <section className="py-16 md:py-24 px-4 bg-navy text-navy-foreground">
        <div className="max-w-3xl mx-auto text-center">
          <h2 className="text-3xl md:text-4xl font-bold mb-3">Ready to Invest?</h2>
          <p className="text-white/80 mb-8">
            Browse available vehicles and reserve your position today.
          </p>
          {pending ? (
            <Card className="border-amber-200 bg-amber-50 dark:bg-amber-950/20 text-left">
              <CardContent className="p-6">
                <h3 className="font-semibold mb-2 text-foreground">Approval pending</h3>
                <p className="text-sm text-muted-foreground">
                  Your investor access requires admin approval. We'll email you the moment
                  it's ready.
                </p>
              </CardContent>
            </Card>
          ) : (
            <Button size="lg" onClick={goToMarketplace} className="gap-2">
              Explore investments <ArrowRight className="h-4 w-4" />
            </Button>
          )}
        </div>
      </section>
    </div>
  );
}
