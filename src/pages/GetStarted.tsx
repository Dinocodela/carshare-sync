import { useEffect } from "react";
import { Link, useSearchParams } from "react-router-dom";
import { SEO } from "@/components/SEO";
import { StructuredData } from "@/components/StructuredData";
import { Button } from "@/components/ui/button";
import { DollarSign, Shield, Sparkles, CheckCircle2 } from "lucide-react";

export default function GetStarted() {
  const [searchParams] = useSearchParams();

  useEffect(() => {
    const source = searchParams.get("utm_source");
    const campaign = searchParams.get("utm_campaign");
    const medium = searchParams.get("utm_medium");
    if (source) localStorage.setItem("utm_source", source);
    if (campaign) localStorage.setItem("utm_campaign", campaign);
    if (medium) localStorage.setItem("utm_medium", medium);
  }, [searchParams]);

  const benefits = [
    {
      icon: DollarSign,
      title: "Earn $1,500–$3,000+/mo",
      description:
        "Your Tesla works for you while you sleep. Most hosts cover their car payment and then some.",
    },
    {
      icon: Shield,
      title: "Tax-Deductible Vehicle",
      description:
        "Unlock Section 179 depreciation, deduct insurance, maintenance, cleaning, and management fees.",
    },
    {
      icon: Sparkles,
      title: "We Handle Everything",
      description:
        "Guest screening, cleaning, 24/7 support, maintenance coordination — zero hassle for you.",
    },
  ];

  const checkpoints = [
    "Professional guest screening & verification",
    "Comprehensive insurance on every rental",
    "Earnings & expense analytics for tax season",
    "Block dates anytime you need your car",
    "No long-term commitment required",
  ];

  return (
    <>
      <SEO
        title="Rent Your Tesla for Passive Income | Get Started with Teslys"
        description="Turn your Tesla into a tax-deductible income machine. Earn $1,500-$3,000+/mo with full-service management. Get started in minutes."
        keywords="rent my Tesla for income, Tesla tax write off rental, Tesla passive income, Tesla car sharing business"
        canonical="https://teslys.app/get-started"
        ogType="website"
      />
      <StructuredData
        type="breadcrumblist"
        data={{
          itemListElement: [
            { "@type": "ListItem", position: 1, name: "Home", item: "https://teslys.app/" },
            { "@type": "ListItem", position: 2, name: "Get Started", item: "https://teslys.app/get-started" },
          ],
        }}
      />

      <div className="min-h-screen bg-background flex flex-col">
        {/* Minimal header */}
        <header className="border-b border-border px-6 py-4">
          <Link to="/" className="text-2xl font-bold text-primary">
            Teslys
          </Link>
        </header>

        {/* Hero */}
        <section className="flex-1 flex flex-col items-center justify-center px-6 py-16 text-center">
          <div className="max-w-3xl mx-auto space-y-6">
            <span className="inline-block rounded-full bg-primary/10 px-4 py-1.5 text-sm font-medium text-primary">
              Tesla Owners Only
            </span>
            <h1 className="text-4xl sm:text-5xl lg:text-6xl font-extrabold tracking-tight text-foreground leading-tight">
              Turn Your Tesla Into a{" "}
              <span className="text-primary">Tax-Deductible Income Machine</span>
            </h1>
            <p className="text-lg sm:text-xl text-muted-foreground max-w-2xl mx-auto">
              Earn passive income while writing off your vehicle. We handle every aspect of
              renting your Tesla — you just collect the earnings.
            </p>

            <div className="pt-4">
              <Button asChild size="lg" className="text-lg px-10 py-6 h-auto rounded-xl shadow-lg">
                <Link to="/register/client">Get Started — It's Free</Link>
              </Button>
              <p className="mt-3 text-sm text-muted-foreground">
                No credit card required · Start earning in days
              </p>
            </div>
          </div>
        </section>

        {/* Value props */}
        <section className="bg-muted/50 px-6 py-16">
          <div className="max-w-5xl mx-auto grid gap-8 md:grid-cols-3">
            {benefits.map((b) => (
              <div
                key={b.title}
                className="bg-card border border-border rounded-xl p-8 text-center space-y-4"
              >
                <div className="mx-auto w-14 h-14 rounded-full bg-primary/10 flex items-center justify-center">
                  <b.icon className="h-7 w-7 text-primary" />
                </div>
                <h2 className="text-xl font-bold text-foreground">{b.title}</h2>
                <p className="text-muted-foreground leading-relaxed">{b.description}</p>
              </div>
            ))}
          </div>
        </section>

        {/* Checklist + CTA */}
        <section className="px-6 py-16">
          <div className="max-w-2xl mx-auto text-center space-y-8">
            <h2 className="text-3xl font-bold text-foreground">
              Why Tesla Owners Choose Teslys
            </h2>
            <ul className="space-y-4 text-left inline-block">
              {checkpoints.map((item) => (
                <li key={item} className="flex items-start gap-3">
                  <CheckCircle2 className="h-5 w-5 text-primary mt-0.5 shrink-0" />
                  <span className="text-foreground">{item}</span>
                </li>
              ))}
            </ul>
            <div className="pt-4">
              <Button asChild size="lg" className="text-lg px-10 py-6 h-auto rounded-xl shadow-lg">
                <Link to="/register/client">Start Earning Today</Link>
              </Button>
            </div>
          </div>
        </section>

        {/* Footer */}
        <footer className="border-t border-border px-6 py-6 text-center text-sm text-muted-foreground">
          <div className="flex flex-wrap justify-center gap-4">
            <Link to="/faq" className="hover:text-foreground transition-colors">FAQ</Link>
            <Link to="/how-it-works" className="hover:text-foreground transition-colors">How It Works</Link>
            <Link to="/privacy" className="hover:text-foreground transition-colors">Privacy</Link>
            <Link to="/terms" className="hover:text-foreground transition-colors">Terms</Link>
          </div>
          <p className="mt-3">© {new Date().getFullYear()} Teslys. All rights reserved.</p>
        </footer>
      </div>
    </>
  );
}
