import { Link } from "react-router-dom";
import { SEO } from "@/components/SEO";
import { StructuredData } from "@/components/StructuredData";
import { Logo } from "@/components/ui/logo";
import { Button } from "@/components/ui/button";
import {
  ArrowLeft,
  ArrowRight,
  Car,
  DollarSign,
  Shield,
  Star,
  Users,
  MapPin,
  Phone,
  CheckCircle,
} from "lucide-react";

export interface CityData {
  slug: string;
  city: string;
  state: string;
  stateCode: string;
  headline: string;
  subheadline: string;
  metaTitle: string;
  metaDescription: string;
  heroImage?: string;
  marketStats: {
    avgMonthlyEarnings: string;
    activeHosts: string;
    avgDailyRate: string;
  };
  localContent: {
    whyCity: string;
    marketInsight: string;
    popularModels: string[];
    neighborhoods: string[];
  };
}

export function CityLandingPage({ city }: { city: CityData }) {
  const steps = [
    {
      icon: Car,
      title: "List Your Tesla",
      description: `Sign up and add your Tesla to the Teslys platform in ${city.city}. It takes less than 5 minutes.`,
    },
    {
      icon: Users,
      title: "Get Matched with a Host",
      description: `We connect you with a vetted, professional host in the ${city.city} area who manages everything.`,
    },
    {
      icon: DollarSign,
      title: "Earn Passive Income",
      description: `Your host handles rentals, cleaning, and guest support while you earn ${city.marketStats.avgMonthlyEarnings}/month on average.`,
    },
  ];

  const jsonLd = {
    "@context": "https://schema.org",
    "@type": "LocalBusiness",
    name: "Teslys",
    description: city.metaDescription,
    url: `https://teslys.app/${city.slug}`,
    telephone: "+13106990473",
    address: {
      "@type": "PostalAddress",
      streetAddress: "475 Washington Blvd",
      addressLocality: "Marina Del Rey",
      addressRegion: "CA",
      postalCode: "90292",
      addressCountry: "US",
    },
    areaServed: {
      "@type": "City",
      name: city.city,
      containedInPlace: {
        "@type": "State",
        name: city.state,
      },
    },
    priceRange: "$$",
    sameAs: ["https://teslys.app"],
  };

  return (
    <>
      <SEO
        title={city.metaTitle}
        description={city.metaDescription}
        canonical={`https://teslys.app/${city.slug}`}
        keywords={`Tesla car sharing ${city.city}, rent out Tesla ${city.city}, Tesla passive income ${city.stateCode}, Tesla rental management ${city.city}`}
        ogImage="https://teslys.app/icons/icon-512.webp"
      />

      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
      />

      <div className="min-h-screen bg-background">
        {/* Header */}
        <header className="sticky top-0 z-50 bg-background/95 backdrop-blur border-b border-border">
          <div className="max-w-6xl mx-auto px-4 py-3 flex items-center justify-between">
            <div className="flex items-center gap-3">
              <Link
                to="/"
                className="flex items-center gap-2 text-muted-foreground hover:text-foreground transition"
              >
                <ArrowLeft className="w-4 h-4" />
              </Link>
              <Link to="/">
                <Logo className="h-7" />
              </Link>
            </div>
            <Link to="/">
              <Button size="sm" className="rounded-full">
                Get Started <ArrowRight className="w-3.5 h-3.5 ml-1" />
              </Button>
            </Link>
          </div>
        </header>

        <main>
          {/* Hero */}
          <section className="relative bg-gradient-hero py-16 lg:py-24">
            <div className="max-w-6xl mx-auto px-4 text-center">
              <div className="inline-flex items-center gap-1.5 bg-primary/10 text-primary text-xs font-semibold px-3 py-1.5 rounded-full mb-6">
                <MapPin className="w-3.5 h-3.5" />
                {city.city}, {city.stateCode}
              </div>
              <h1 className="text-3xl md:text-5xl font-bold text-foreground mb-4 leading-tight">
                {city.headline}
              </h1>
              <p className="text-lg text-muted-foreground max-w-2xl mx-auto mb-8">
                {city.subheadline}
              </p>
              <div className="flex flex-col sm:flex-row gap-3 justify-center">
                <Link to="/register/client">
                  <Button
                    size="lg"
                    className="rounded-xl shadow-lg shadow-primary/20 w-full sm:w-auto"
                  >
                    List My Tesla <ArrowRight className="w-4 h-4 ml-1" />
                  </Button>
                </Link>
                <Link to="/register/host">
                  <Button
                    size="lg"
                    variant="outline"
                    className="rounded-xl w-full sm:w-auto"
                  >
                    Become a Host
                  </Button>
                </Link>
              </div>
            </div>
          </section>

          {/* Market Stats */}
          <section className="py-12 border-b border-border">
            <div className="max-w-4xl mx-auto px-4">
              <div className="grid grid-cols-3 gap-6 text-center">
                {[
                  {
                    value: city.marketStats.avgMonthlyEarnings,
                    label: "Avg Monthly Earnings",
                  },
                  {
                    value: city.marketStats.activeHosts,
                    label: "Active Hosts",
                  },
                  {
                    value: city.marketStats.avgDailyRate,
                    label: "Avg Daily Rate",
                  },
                ].map((stat) => (
                  <div key={stat.label}>
                    <p className="text-2xl md:text-3xl font-bold text-primary">
                      {stat.value}
                    </p>
                    <p className="text-xs md:text-sm text-muted-foreground mt-1">
                      {stat.label}
                    </p>
                  </div>
                ))}
              </div>
            </div>
          </section>

          {/* Why This City */}
          <section className="py-16">
            <div className="max-w-4xl mx-auto px-4">
              <h2 className="text-2xl md:text-3xl font-bold text-foreground mb-4">
                Why Tesla Car Sharing Thrives in {city.city}
              </h2>
              <p className="text-muted-foreground leading-relaxed mb-6">
                {city.localContent.whyCity}
              </p>
              <p className="text-muted-foreground leading-relaxed">
                {city.localContent.marketInsight}
              </p>
            </div>
          </section>

          {/* How It Works */}
          <section className="py-16 bg-muted/30">
            <div className="max-w-4xl mx-auto px-4">
              <h2 className="text-2xl md:text-3xl font-bold text-foreground mb-10 text-center">
                How It Works in {city.city}
              </h2>
              <div className="grid md:grid-cols-3 gap-8">
                {steps.map((step, i) => (
                  <div
                    key={step.title}
                    className="text-center bg-card rounded-2xl p-6 border border-border/50 shadow-card"
                  >
                    <div className="w-12 h-12 rounded-full bg-primary/10 flex items-center justify-center mx-auto mb-4">
                      <step.icon className="w-6 h-6 text-primary" />
                    </div>
                    <div className="text-xs font-bold text-primary mb-2">
                      Step {i + 1}
                    </div>
                    <h3 className="text-lg font-bold text-foreground mb-2">
                      {step.title}
                    </h3>
                    <p className="text-sm text-muted-foreground">
                      {step.description}
                    </p>
                  </div>
                ))}
              </div>
            </div>
          </section>

          {/* Popular Models & Neighborhoods */}
          <section className="py-16">
            <div className="max-w-4xl mx-auto px-4 grid md:grid-cols-2 gap-12">
              <div>
                <h3 className="text-xl font-bold text-foreground mb-4">
                  Popular Models in {city.city}
                </h3>
                <ul className="space-y-3">
                  {city.localContent.popularModels.map((model) => (
                    <li
                      key={model}
                      className="flex items-center gap-2 text-muted-foreground"
                    >
                      <CheckCircle className="w-4 h-4 text-primary shrink-0" />
                      {model}
                    </li>
                  ))}
                </ul>
              </div>
              <div>
                <h3 className="text-xl font-bold text-foreground mb-4">
                  Top Neighborhoods
                </h3>
                <ul className="space-y-3">
                  {city.localContent.neighborhoods.map((n) => (
                    <li
                      key={n}
                      className="flex items-center gap-2 text-muted-foreground"
                    >
                      <MapPin className="w-4 h-4 text-primary shrink-0" />
                      {n}
                    </li>
                  ))}
                </ul>
              </div>
            </div>
          </section>

          {/* Trust */}
          <section className="py-12 border-t border-border">
            <div className="max-w-4xl mx-auto px-4">
              <div className="flex justify-center gap-10">
                {[
                  { icon: Shield, label: "Fully Insured" },
                  { icon: Star, label: "Top Rated" },
                  { icon: Users, label: "Trusted Hosts" },
                ].map(({ icon: Icon, label }) => (
                  <div
                    key={label}
                    className="flex flex-col items-center gap-2"
                  >
                    <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center">
                      <Icon className="w-5 h-5 text-primary" />
                    </div>
                    <span className="text-xs text-muted-foreground font-medium">
                      {label}
                    </span>
                  </div>
                ))}
              </div>
            </div>
          </section>

          {/* CTA */}
          <section className="py-16 bg-gradient-hero">
            <div className="max-w-3xl mx-auto px-4 text-center">
              <h2 className="text-2xl md:text-3xl font-bold text-foreground mb-4">
                Start Earning with Your Tesla in {city.city}
              </h2>
              <p className="text-muted-foreground mb-8">
                Join Tesla owners across {city.city} who are already earning
                passive income with Teslys.
              </p>
              <div className="flex flex-col sm:flex-row gap-3 justify-center">
                <Link to="/register/client">
                  <Button
                    size="lg"
                    className="rounded-xl shadow-lg shadow-primary/20 w-full sm:w-auto"
                  >
                    Sign Up as Owner <ArrowRight className="w-4 h-4 ml-1" />
                  </Button>
                </Link>
                <Link to="/register/host">
                  <Button
                    size="lg"
                    variant="outline"
                    className="rounded-xl w-full sm:w-auto"
                  >
                    Apply as Host
                  </Button>
                </Link>
              </div>
            </div>
          </section>
        </main>

        {/* Footer */}
        <footer className="border-t border-border py-8">
          <div className="max-w-4xl mx-auto px-4">
            <div className="flex flex-col items-center gap-4">
              <Link to="/">
                <Logo className="h-6 opacity-80" />
              </Link>
              <nav className="flex flex-wrap justify-center gap-x-5 gap-y-2 text-xs text-muted-foreground">
                <Link to="/how-it-works" className="hover:text-foreground transition-colors">How It Works</Link>
                <Link to="/about" className="hover:text-foreground transition-colors">About</Link>
                <Link to="/blog" className="hover:text-foreground transition-colors">Blog</Link>
                <Link to="/faq" className="hover:text-foreground transition-colors">FAQ</Link>
                <Link to="/privacy" className="hover:text-foreground transition-colors">Privacy</Link>
                <Link to="/terms" className="hover:text-foreground transition-colors">Terms</Link>
              </nav>
              <div className="flex flex-col items-center gap-1 text-xs text-muted-foreground">
                <a
                  href="https://www.google.com/maps/search/?api=1&query=475+Washington+Blvd+Marina+Del+Rey+CA+90292"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center gap-1 hover:text-foreground transition-colors"
                >
                  <MapPin className="w-3 h-3" />
                  475 Washington Blvd, Marina Del Rey, CA 90292
                </a>
                <a
                  href="tel:+13106990473"
                  className="inline-flex items-center gap-1 hover:text-foreground transition-colors"
                >
                  <Phone className="w-3 h-3" />
                  (310) 699-0473
                </a>
              </div>
              <p className="text-xs text-muted-foreground/60">
                © {new Date().getFullYear()} Teslys. All rights reserved.
              </p>
            </div>
          </div>
        </footer>
      </div>
    </>
  );
}
