import { Link } from "react-router-dom";
import { SEO } from "@/components/SEO";
import { StructuredData } from "@/components/StructuredData";
import { Button } from "@/components/ui/button";
import { Shield, DollarSign, CheckCircle2, Star, Clock, Car } from "lucide-react";

export default function MilitaryProgram() {
  const benefits = [
    { icon: DollarSign, title: "85/15 Split", desc: "You keep 85% of all rental earnings — only 15% management fee for active-duty members." },
    { icon: Car, title: "Full Management", desc: "We handle guest screening, cleaning, maintenance, and 24/7 support while you're deployed." },
    { icon: Shield, title: "Vehicle Protection", desc: "Comprehensive insurance on every rental. Your car is safe and cared for." },
    { icon: Clock, title: "Flexible Terms", desc: "Deploy for 3 months or 3 years — we manage your car as long as you need." },
  ];

  const checkpoints = [
    "Veteran-owned company — we understand military life",
    "No car payments coming out of pocket during deployment",
    "Earn $1,500–$3,000+/month while you serve",
    "Seamless handoff when you return from duty",
    "Tax-deductible vehicle expenses on rental income",
    "Dedicated support for military members",
  ];

  return (
    <>
      <SEO
        title="Military Tesla Rental Program — 85/15 Split | Teslys"
        description="Teslys is veteran-owned. Active-duty military members earn 85% of rental income while deployed. Let your Tesla work for you while you serve."
        keywords="military Tesla rental, deployment car rental, veteran car sharing, military passive income Tesla"
        canonical="https://teslys.app/military"
      />
      <StructuredData type="breadcrumblist" data={{ itemListElement: [
        { "@type": "ListItem", position: 1, name: "Home", item: "https://teslys.app/" },
        { "@type": "ListItem", position: 2, name: "Military Program", item: "https://teslys.app/military" },
      ] }} />

      <div className="min-h-screen bg-background flex flex-col">
        <header className="border-b border-border px-6 py-4 flex items-center justify-between">
          <Link to="/" className="text-2xl font-bold text-primary">Teslys</Link>
          <Link to="/register/client?program=military">
            <Button size="sm">Enroll Now</Button>
          </Link>
        </header>

        {/* Hero */}
        <section className="px-6 py-16 text-center">
          <div className="max-w-3xl mx-auto space-y-6">
            <div className="inline-flex items-center gap-2 rounded-full bg-primary/10 px-4 py-1.5 text-sm font-medium text-primary">
              <Star className="w-4 h-4" /> Veteran-Owned Company
            </div>
            <h1 className="text-4xl sm:text-5xl lg:text-6xl font-extrabold tracking-tight text-foreground leading-tight">
              Deploying?{" "}
              <span className="text-primary">Let Your Tesla Earn For You</span>
            </h1>
            <p className="text-lg sm:text-xl text-muted-foreground max-w-2xl mx-auto">
              Teslys is veteran-owned and built for service members. We manage your Tesla while you're deployed — you keep <strong className="text-foreground">85% of all earnings</strong>.
            </p>
            <div className="pt-4 flex flex-col sm:flex-row gap-3 justify-center">
              <Button asChild size="lg" className="text-lg px-10 py-6 h-auto rounded-xl shadow-lg">
                <Link to="/register/client?program=military">Get Started — 85/15 Split</Link>
              </Button>
              <Button asChild variant="outline" size="lg" className="text-lg px-10 py-6 h-auto rounded-xl">
                <Link to="/earnings-calculator">Calculate Earnings</Link>
              </Button>
            </div>
          </div>
        </section>

        {/* Value Props */}
        <section className="bg-muted/50 px-6 py-16">
          <div className="max-w-5xl mx-auto">
            <h2 className="text-3xl font-bold text-center text-foreground mb-10">
              How It Works for Military Members
            </h2>
            <div className="grid gap-8 md:grid-cols-2">
              {benefits.map((b) => (
                <div key={b.title} className="bg-card border border-border rounded-xl p-8 space-y-4">
                  <div className="w-14 h-14 rounded-full bg-primary/10 flex items-center justify-center">
                    <b.icon className="h-7 w-7 text-primary" />
                  </div>
                  <h3 className="text-xl font-bold text-foreground">{b.title}</h3>
                  <p className="text-muted-foreground leading-relaxed">{b.desc}</p>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* Checklist */}
        <section className="px-6 py-16">
          <div className="max-w-2xl mx-auto text-center space-y-8">
            <h2 className="text-3xl font-bold text-foreground">
              Built for Those Who Serve
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
                <Link to="/register/client?program=military">Join the Military Program</Link>
              </Button>
            </div>
          </div>
        </section>

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
