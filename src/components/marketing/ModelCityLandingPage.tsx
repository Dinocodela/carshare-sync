import { Link } from "react-router-dom";
import { SEO } from "@/components/SEO";
import { NewsletterSignup } from "@/components/marketing/NewsletterSignup";
import { Logo } from "@/components/ui/logo";
import { Button } from "@/components/ui/button";
import type { ModelCityData } from "@/data/modelCityPages";
import {
  ArrowLeft,
  ArrowRight,
  Car,
  DollarSign,
  MapPin,
  Phone,
  CheckCircle,
  TrendingUp,
  Calculator,
  Shield,
  Star,
  Users,
} from "lucide-react";

export function ModelCityLandingPage({ data }: { data: ModelCityData }) {
  const jsonLd = {
    "@context": "https://schema.org",
    "@type": "WebPage",
    name: data.metaTitle,
    description: data.metaDescription,
    url: `https://teslys.app/${data.slug}`,
    breadcrumb: {
      "@type": "BreadcrumbList",
      itemListElement: [
        { "@type": "ListItem", position: 1, name: "Home", item: "https://teslys.app/" },
        { "@type": "ListItem", position: 2, name: `Tesla Car Sharing ${data.city}`, item: `https://teslys.app/tesla-car-sharing-${data.city.toLowerCase().replace(/\s+/g, "-")}` },
        { "@type": "ListItem", position: 3, name: `${data.model} in ${data.city}`, item: `https://teslys.app/${data.slug}` },
      ],
    },
  };

  const faqJsonLd = {
    "@context": "https://schema.org",
    "@type": "FAQPage",
    mainEntity: [
      {
        "@type": "Question",
        name: `How much can I earn renting my ${data.model} in ${data.city}?`,
        acceptedAnswer: {
          "@type": "Answer",
          text: `${data.model} owners in ${data.city} earn an average of ${data.avgMonthlyEarnings}/month with Teslys, based on an average daily rate of ${data.avgDailyRate}.`,
        },
      },
      {
        "@type": "Question",
        name: `Is it worth renting out my ${data.model} in ${data.city}?`,
        acceptedAnswer: {
          "@type": "Answer",
          text: `Yes. ${data.city} has strong rental demand, and the ${data.modelShort}'s low operating costs and high desirability make it one of the best-performing vehicles on platforms like Turo. Teslys handles all management so you earn passively.`,
        },
      },
    ],
  };

  return (
    <>
      <SEO
        title={data.metaTitle}
        description={data.metaDescription}
        canonical={`https://teslys.app/${data.slug}`}
        keywords={`${data.model} rental income ${data.city}, rent out ${data.model} ${data.city}, ${data.model} Turo earnings ${data.stateCode}, ${data.model} passive income ${data.city}`}
        ogImage="https://teslys.app/icons/icon-512.webp"
      />
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }} />
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(faqJsonLd) }} />

      <div className="min-h-screen bg-background">
        {/* Header */}
        <header className="sticky top-0 z-50 bg-background/95 backdrop-blur border-b border-border">
          <div className="max-w-6xl mx-auto px-4 py-3 flex items-center justify-between">
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
          <section className="relative bg-gradient-hero py-16 lg:py-24">
            <div className="max-w-6xl mx-auto px-4 text-center">
              <div className="inline-flex items-center gap-1.5 bg-primary/10 text-primary text-xs font-semibold px-3 py-1.5 rounded-full mb-6">
                <Car className="w-3.5 h-3.5" />
                {data.model} · {data.city}, {data.stateCode}
              </div>
              <h1 className="text-3xl md:text-5xl font-bold text-foreground mb-4 leading-tight">
                {data.model} Rental Income in {data.city}
              </h1>
              <p className="text-lg text-muted-foreground max-w-2xl mx-auto mb-8">
                See how much you can earn renting out your {data.modelShort} in {data.city}. Teslys handles everything — you just collect the income.
              </p>
              <div className="flex flex-col sm:flex-row gap-3 justify-center">
                <Link to="/register/client">
                  <Button size="lg" className="rounded-xl shadow-lg shadow-primary/20 w-full sm:w-auto">
                    Start Earning <ArrowRight className="w-4 h-4 ml-1" />
                  </Button>
                </Link>
                <Link to="/earnings-calculator">
                  <Button size="lg" variant="outline" className="rounded-xl w-full sm:w-auto">
                    <Calculator className="w-4 h-4 mr-1" /> Calculate My Earnings
                  </Button>
                </Link>
              </div>
            </div>
          </section>

          {/* Earnings Stats */}
          <section className="py-12 border-b border-border">
            <div className="max-w-4xl mx-auto px-4">
              <div className="grid grid-cols-3 gap-6 text-center">
                <div>
                  <p className="text-2xl md:text-3xl font-bold text-primary">{data.avgMonthlyEarnings}</p>
                  <p className="text-xs md:text-sm text-muted-foreground mt-1">Avg Monthly Earnings</p>
                </div>
                <div>
                  <p className="text-2xl md:text-3xl font-bold text-primary">{data.avgDailyRate}</p>
                  <p className="text-xs md:text-sm text-muted-foreground mt-1">Avg Daily Rate</p>
                </div>
                <div>
                  <p className="text-2xl md:text-3xl font-bold text-primary">20–25</p>
                  <p className="text-xs md:text-sm text-muted-foreground mt-1">Avg Days Booked/Mo</p>
                </div>
              </div>
            </div>
          </section>

          {/* Model Highlight */}
          <section className="py-16">
            <div className="max-w-4xl mx-auto px-4">
              <div className="flex items-start gap-4 mb-8">
                <div className="w-12 h-12 rounded-full bg-primary/10 flex items-center justify-center shrink-0">
                  <TrendingUp className="w-6 h-6 text-primary" />
                </div>
                <div>
                  <h2 className="text-2xl md:text-3xl font-bold text-foreground mb-3">
                    Why the {data.modelShort} Is a Top Earner
                  </h2>
                  <p className="text-muted-foreground leading-relaxed">{data.modelHighlight}</p>
                </div>
              </div>
              <div className="flex items-start gap-4">
                <div className="w-12 h-12 rounded-full bg-primary/10 flex items-center justify-center shrink-0">
                  <MapPin className="w-6 h-6 text-primary" />
                </div>
                <div>
                  <h2 className="text-2xl md:text-3xl font-bold text-foreground mb-3">
                    {data.model} Demand in {data.city}
                  </h2>
                  <p className="text-muted-foreground leading-relaxed">{data.cityInsight}</p>
                </div>
              </div>
            </div>
          </section>

          {/* Neighborhoods */}
          <section className="py-16 bg-muted/30">
            <div className="max-w-4xl mx-auto px-4">
              <h2 className="text-2xl font-bold text-foreground mb-6 text-center">
                Best {data.city} Areas for {data.modelShort} Rentals
              </h2>
              <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                {data.popularNeighborhoods.map((n) => (
                  <div key={n} className="flex items-center gap-2 bg-card rounded-xl p-4 border border-border/50 shadow-card">
                    <CheckCircle className="w-4 h-4 text-primary shrink-0" />
                    <span className="text-sm text-foreground font-medium">{n}</span>
                  </div>
                ))}
              </div>
            </div>
          </section>

          {/* FAQ */}
          <section className="py-16">
            <div className="max-w-4xl mx-auto px-4">
              <h2 className="text-2xl font-bold text-foreground mb-8 text-center">
                Frequently Asked Questions
              </h2>
              <div className="space-y-6">
                <div className="bg-card rounded-xl p-6 border border-border/50">
                  <h3 className="font-semibold text-foreground mb-2">
                    How much can I earn renting my {data.model} in {data.city}?
                  </h3>
                  <p className="text-sm text-muted-foreground">
                    {data.model} owners in {data.city} earn an average of {data.avgMonthlyEarnings}/month with Teslys, based on an average daily rate of {data.avgDailyRate}. Use our{" "}
                    <Link to="/earnings-calculator" className="text-primary hover:underline">earnings calculator</Link> for a personalized estimate.
                  </p>
                </div>
                <div className="bg-card rounded-xl p-6 border border-border/50">
                  <h3 className="font-semibold text-foreground mb-2">
                    Is it worth renting out my {data.modelShort} in {data.city}?
                  </h3>
                  <p className="text-sm text-muted-foreground">
                    Yes. {data.city} has strong rental demand, and the {data.modelShort}'s low operating costs and high desirability make it one of the best-performing vehicles on platforms like Turo. Teslys handles all management so you earn passively.
                  </p>
                </div>
                <div className="bg-card rounded-xl p-6 border border-border/50">
                  <h3 className="font-semibold text-foreground mb-2">
                    What does Teslys handle for {data.modelShort} owners?
                  </h3>
                  <p className="text-sm text-muted-foreground">
                    Teslys provides full-service management: listing optimization, guest communication, vehicle cleaning, key exchange, damage claims, and maintenance coordination. You don't lift a finger.
                  </p>
                </div>
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
                  <div key={label} className="flex flex-col items-center gap-2">
                    <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center">
                      <Icon className="w-5 h-5 text-primary" />
                    </div>
                    <span className="text-xs text-muted-foreground font-medium">{label}</span>
                  </div>
                ))}
              </div>
            </div>
          </section>

          {/* CTA */}
          <section className="py-16 bg-gradient-hero">
            <div className="max-w-3xl mx-auto px-4 text-center">
              <h2 className="text-2xl md:text-3xl font-bold text-foreground mb-4">
                Start Earning with Your {data.modelShort} in {data.city}
              </h2>
              <p className="text-muted-foreground mb-8">
                Join {data.modelShort} owners in {data.city} already earning passive income with Teslys.
              </p>
              <div className="flex flex-col sm:flex-row gap-3 justify-center">
                <Link to="/register/client">
                  <Button size="lg" className="rounded-xl shadow-lg shadow-primary/20 w-full sm:w-auto">
                    Sign Up as Owner <ArrowRight className="w-4 h-4 ml-1" />
                  </Button>
                </Link>
                <Link to="/how-much-can-i-earn">
                  <Button size="lg" variant="outline" className="rounded-xl w-full sm:w-auto">
                    Read Earnings Guide
                  </Button>
                </Link>
              </div>
            </div>
          </section>

          <NewsletterSignup
            source={`model-city-${data.slug}`}
            heading={`${data.modelShort} Earning Tips for ${data.city}`}
            subheading={`Get weekly insights on maximizing your ${data.modelShort} rental income in ${data.city}.`}
          />
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
                  <MapPin className="w-3 h-3" /> 475 Washington Blvd, Marina Del Rey, CA 90292
                </a>
                <a href="tel:+13106990473" className="inline-flex items-center gap-1 hover:text-foreground transition-colors">
                  <Phone className="w-3 h-3" /> (310) 699-0473
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
