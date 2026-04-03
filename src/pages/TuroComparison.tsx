import { Link } from "react-router-dom";
import { SEO } from "@/components/SEO";
import { StructuredData } from "@/components/StructuredData";
import { NewsletterSignup } from "@/components/marketing/NewsletterSignup";
import { Logo } from "@/components/ui/logo";
import { Button } from "@/components/ui/button";
import {
  ArrowLeft,
  ArrowRight,
  CheckCircle,
  XCircle,
  Shield,
  DollarSign,
  Users,
  Clock,
  Car,
  Wrench,
  MapPin,
  Phone,
} from "lucide-react";

const comparisons = [
  {
    feature: "Full rental management",
    teslys: true,
    selfManaged: false,
    detail: "We handle bookings, guest screening, cleaning, and key exchanges",
  },
  {
    feature: "Guest support (24/7)",
    teslys: true,
    selfManaged: false,
    detail: "Our team handles all guest communication and emergencies",
  },
  {
    feature: "Professional cleaning",
    teslys: true,
    selfManaged: false,
    detail: "Vehicle cleaned and inspected after every rental",
  },
  {
    feature: "Maintenance scheduling",
    teslys: true,
    selfManaged: false,
    detail: "Proactive maintenance coordination to keep your vehicle in top shape",
  },
  {
    feature: "Insurance coverage",
    teslys: true,
    selfManaged: true,
    detail: "Comprehensive coverage included through the rental platform",
  },
  {
    feature: "Earnings tracking & analytics",
    teslys: true,
    selfManaged: false,
    detail: "Real-time dashboard with per-car performance metrics",
  },
  {
    feature: "No time commitment from you",
    teslys: true,
    selfManaged: false,
    detail: "Truly passive — you don't lift a finger",
  },
  {
    feature: "Keep 100% of earnings",
    teslys: false,
    selfManaged: true,
    detail: "Teslys hosts take a management fee; self-managed keeps everything",
  },
  {
    feature: "Full control over pricing",
    teslys: false,
    selfManaged: true,
    detail: "Self-managed hosts set and adjust their own rates",
  },
];

const breadcrumbData = {
  itemListElement: [
    { "@type": "ListItem", position: 1, name: "Home", item: "https://teslys.app/" },
    { "@type": "ListItem", position: 2, name: "Tesla Turo Management", item: "https://teslys.app/turo-management" },
  ],
};

export default function TuroComparison() {
  return (
    <>
      <SEO
        title="Tesla Turo Management Service | Teslys vs Self-Managed"
        description="Compare Teslys full-service Tesla rental management vs self-managing on Turo. See which option earns more with less effort for Tesla owners."
        keywords="Tesla Turo management, Turo fleet management, Tesla rental management service, Turo co-host Tesla, Tesla passive income Turo"
        canonical="https://teslys.app/turo-management"
      />
      <StructuredData type="breadcrumblist" data={breadcrumbData} />

      <div className="min-h-screen bg-background">
        {/* Header */}
        <header className="sticky top-0 z-50 bg-background/95 backdrop-blur border-b border-border">
          <div className="max-w-5xl mx-auto px-4 py-3 flex items-center justify-between">
            <div className="flex items-center gap-3">
              <Link to="/" className="flex items-center gap-2 text-muted-foreground hover:text-foreground transition">
                <ArrowLeft className="w-4 h-4" />
              </Link>
              <Link to="/"><Logo className="h-7" /></Link>
            </div>
            <Link to="/register/client">
              <Button size="sm" className="rounded-full">
                Get Started <ArrowRight className="w-3.5 h-3.5 ml-1" />
              </Button>
            </Link>
          </div>
        </header>

        <main>
          {/* Hero */}
          <section className="py-16 lg:py-24 bg-gradient-hero">
            <div className="max-w-4xl mx-auto px-4 text-center">
              <div className="inline-flex items-center gap-1.5 bg-primary/10 text-primary text-xs font-semibold px-3 py-1.5 rounded-full mb-6">
                <Car className="w-3.5 h-3.5" />
                Turo Management
              </div>
              <h1 className="text-3xl md:text-5xl font-bold text-foreground mb-4 leading-tight">
                Stop Managing Your Tesla on Turo.
                <br />
                <span className="text-primary">Let Us Do It for You.</span>
              </h1>
              <p className="text-lg text-muted-foreground max-w-2xl mx-auto mb-8">
                Teslys is a full-service Tesla rental management platform. We handle everything —
                guest communication, cleaning, key exchanges, and maintenance — so you earn truly passive income.
              </p>
              <div className="flex flex-col sm:flex-row gap-3 justify-center">
                <Link to="/register/client">
                  <Button size="lg" className="rounded-xl shadow-lg shadow-primary/20 w-full sm:w-auto">
                    List My Tesla <ArrowRight className="w-4 h-4 ml-1" />
                  </Button>
                </Link>
                <Link to="/earnings-calculator">
                  <Button size="lg" variant="outline" className="rounded-xl w-full sm:w-auto">
                    Calculate My Earnings
                  </Button>
                </Link>
              </div>
            </div>
          </section>

          {/* The Problem */}
          <section className="py-16">
            <div className="max-w-4xl mx-auto px-4">
              <h2 className="text-2xl md:text-3xl font-bold text-foreground mb-6 text-center">
                Self-Managing on Turo Is a Full-Time Job
              </h2>
              <div className="grid md:grid-cols-3 gap-6">
                {[
                  { icon: Clock, title: "10+ Hours/Week", desc: "Coordinating pickups, messaging guests, and handling issues eats your free time." },
                  { icon: Wrench, title: "Cleaning & Maintenance", desc: "After every trip: interior cleaning, charging, inspections, and tire checks." },
                  { icon: Users, title: "Guest Problems", desc: "Late returns, smoking damage, parking tickets — you deal with it all alone." },
                ].map(({ icon: Icon, title, desc }) => (
                  <div key={title} className="bg-destructive/5 border border-destructive/20 rounded-2xl p-6 text-center">
                    <div className="w-12 h-12 rounded-full bg-destructive/10 flex items-center justify-center mx-auto mb-4">
                      <Icon className="w-6 h-6 text-destructive" />
                    </div>
                    <h3 className="text-lg font-bold text-foreground mb-2">{title}</h3>
                    <p className="text-sm text-muted-foreground">{desc}</p>
                  </div>
                ))}
              </div>
            </div>
          </section>

          {/* Comparison Table */}
          <section className="py-16 bg-muted/30">
            <div className="max-w-4xl mx-auto px-4">
              <h2 className="text-2xl md:text-3xl font-bold text-foreground mb-10 text-center">
                Teslys vs. Self-Managing on Turo
              </h2>
              <div className="bg-card rounded-2xl border border-border shadow-card overflow-hidden">
                {/* Header row */}
                <div className="grid grid-cols-3 border-b border-border bg-muted/50 px-4 sm:px-6 py-4">
                  <div className="text-sm font-bold text-foreground">Feature</div>
                  <div className="text-sm font-bold text-primary text-center">Teslys</div>
                  <div className="text-sm font-bold text-muted-foreground text-center">Self-Managed</div>
                </div>
                {comparisons.map((row, i) => (
                  <div
                    key={row.feature}
                    className={`grid grid-cols-3 px-4 sm:px-6 py-4 items-center ${
                      i < comparisons.length - 1 ? "border-b border-border/50" : ""
                    }`}
                  >
                    <div>
                      <p className="text-sm font-medium text-foreground">{row.feature}</p>
                      <p className="text-xs text-muted-foreground mt-0.5 hidden sm:block">{row.detail}</p>
                    </div>
                    <div className="flex justify-center">
                      {row.teslys ? (
                        <CheckCircle className="w-5 h-5 text-primary" />
                      ) : (
                        <XCircle className="w-5 h-5 text-muted-foreground/40" />
                      )}
                    </div>
                    <div className="flex justify-center">
                      {row.selfManaged ? (
                        <CheckCircle className="w-5 h-5 text-primary" />
                      ) : (
                        <XCircle className="w-5 h-5 text-muted-foreground/40" />
                      )}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </section>

          {/* Earnings comparison */}
          <section className="py-16">
            <div className="max-w-4xl mx-auto px-4">
              <h2 className="text-2xl md:text-3xl font-bold text-foreground mb-6 text-center">
                The Math: Your Time Has Value
              </h2>
              <div className="grid md:grid-cols-2 gap-6 max-w-3xl mx-auto">
                <div className="bg-card rounded-2xl border border-border p-6 space-y-4">
                  <h3 className="text-lg font-bold text-muted-foreground">Self-Managed on Turo</h3>
                  <div className="space-y-2 text-sm">
                    <div className="flex justify-between"><span className="text-muted-foreground">Gross monthly</span><span className="font-semibold text-foreground">$2,000</span></div>
                    <div className="flex justify-between"><span className="text-muted-foreground">Turo platform fee (~25%)</span><span className="font-semibold text-foreground">-$500</span></div>
                    <div className="flex justify-between"><span className="text-muted-foreground">Cleaning costs</span><span className="font-semibold text-foreground">-$200</span></div>
                    <div className="flex justify-between"><span className="text-muted-foreground">Your time (~10 hrs/wk @ $30/hr)</span><span className="font-semibold text-foreground">-$1,200</span></div>
                    <div className="border-t border-border pt-2 flex justify-between">
                      <span className="font-bold text-foreground">True net earnings</span>
                      <span className="font-bold text-foreground">$100/mo</span>
                    </div>
                  </div>
                </div>
                <div className="bg-primary/5 rounded-2xl border-2 border-primary/30 p-6 space-y-4">
                  <h3 className="text-lg font-bold text-primary">With Teslys</h3>
                  <div className="space-y-2 text-sm">
                    <div className="flex justify-between"><span className="text-muted-foreground">Gross monthly</span><span className="font-semibold text-foreground">$2,000</span></div>
                    <div className="flex justify-between"><span className="text-muted-foreground">Host management fee (30%)</span><span className="font-semibold text-foreground">-$600</span></div>
                    <div className="flex justify-between"><span className="text-muted-foreground">Your time</span><span className="font-semibold text-primary">$0</span></div>
                    <div className="border-t border-border pt-2 flex justify-between">
                      <span className="font-bold text-foreground">True net earnings</span>
                      <span className="font-bold text-primary text-xl">$1,400/mo</span>
                    </div>
                  </div>
                  <p className="text-xs text-muted-foreground">+ zero hours of your time spent</p>
                </div>
              </div>
            </div>
          </section>

          {/* CTA */}
          <section className="py-16 bg-gradient-hero">
            <div className="max-w-3xl mx-auto px-4 text-center">
              <h2 className="text-2xl md:text-3xl font-bold text-foreground mb-4">
                Ready to Make Your Tesla Work for You?
              </h2>
              <p className="text-muted-foreground mb-8">
                Join Tesla owners who earn $1,000–$2,000/month without lifting a finger.
              </p>
              <div className="flex flex-col sm:flex-row gap-3 justify-center">
                <Link to="/register/client">
                  <Button size="lg" className="rounded-xl shadow-lg shadow-primary/20 w-full sm:w-auto">
                    Sign Up as Owner <ArrowRight className="w-4 h-4 ml-1" />
                  </Button>
                </Link>
                <Link to="/earnings-calculator">
                  <Button size="lg" variant="outline" className="rounded-xl w-full sm:w-auto">
                    Calculate Earnings
                  </Button>
                </Link>
              </div>
            </div>
          </section>

          <NewsletterSignup source="turo-comparison" />
        </main>

        {/* Footer */}
        <footer className="border-t border-border py-8">
          <div className="max-w-4xl mx-auto px-4">
            <div className="flex flex-col items-center gap-4">
              <Link to="/"><Logo className="h-6 opacity-80" /></Link>
              <nav className="flex flex-wrap justify-center gap-x-5 gap-y-2 text-xs text-muted-foreground">
                <Link to="/how-it-works" className="hover:text-foreground transition-colors">How It Works</Link>
                <Link to="/earnings-calculator" className="hover:text-foreground transition-colors">Earnings Calculator</Link>
                <Link to="/how-much-can-i-earn" className="hover:text-foreground transition-colors">Earnings Guide</Link>
                <Link to="/blog" className="hover:text-foreground transition-colors">Blog</Link>
                <Link to="/faq" className="hover:text-foreground transition-colors">FAQ</Link>
                <Link to="/privacy" className="hover:text-foreground transition-colors">Privacy</Link>
                <Link to="/terms" className="hover:text-foreground transition-colors">Terms</Link>
              </nav>
              <div className="flex flex-col items-center gap-1 text-xs text-muted-foreground">
                <a href="https://www.google.com/maps/search/?api=1&query=475+Washington+Blvd+Marina+Del+Rey+CA+90292" target="_blank" rel="noopener noreferrer" className="inline-flex items-center gap-1 hover:text-foreground transition-colors">
                  <MapPin className="w-3 h-3" />475 Washington Blvd, Marina Del Rey, CA 90292
                </a>
                <a href="tel:+13106990473" className="inline-flex items-center gap-1 hover:text-foreground transition-colors">
                  <Phone className="w-3 h-3" />(310) 699-0473
                </a>
              </div>
              <p className="text-xs text-muted-foreground/60">© {new Date().getFullYear()} Teslys. All rights reserved.</p>
            </div>
          </div>
        </footer>
      </div>
    </>
  );
}
