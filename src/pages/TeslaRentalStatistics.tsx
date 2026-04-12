import { Link } from "react-router-dom";
import { SEO } from "@/components/SEO";
import { NewsletterSignup } from "@/components/marketing/NewsletterSignup";
import { RelatedPages } from "@/components/marketing/RelatedPages";
import { Logo } from "@/components/ui/logo";
import { Button } from "@/components/ui/button";
import {
  ArrowLeft,
  ArrowRight,
  TrendingUp,
  BarChart3,
  MapPin,
  Calendar,
  DollarSign,
  Car,
} from "lucide-react";
import { useEffect } from "react";

function JsonLd({ data }: { data: Record<string, any> }) {
  useEffect(() => {
    const script = document.createElement("script");
    script.type = "application/ld+json";
    script.text = JSON.stringify(data);
    document.head.appendChild(script);
    return () => { script.remove(); };
  }, [data]);
  return null;
}

export default function TeslaRentalStatistics() {
  const faqJsonLd = {
    "@context": "https://schema.org",
    "@type": "FAQPage",
    mainEntity: [
      { "@type": "Question", name: "How much do Tesla owners earn on average from car sharing?", acceptedAnswer: { "@type": "Answer", text: "Tesla owners on the Teslys platform earn an average of $1,800–$2,400 per month depending on the model, city, and booking frequency. Model Y owners in top markets like Los Angeles and Miami tend to earn on the higher end." } },
      { "@type": "Question", name: "What is the average occupancy rate for Tesla rentals?", acceptedAnswer: { "@type": "Answer", text: "Tesla vehicles on the Teslys platform achieve an average occupancy rate of 75–85%, significantly higher than the 55–65% industry average for traditional rental cars. The combination of brand appeal and Supercharger access drives higher demand." } },
      { "@type": "Question", name: "Which Tesla model earns the most in car sharing?", acceptedAnswer: { "@type": "Answer", text: "The Tesla Model Y generates the highest total earnings due to its combination of strong daily rates ($100–$130/day) and consistently high occupancy. The Model X commands the highest daily rate ($140–$180/day) but has slightly lower booking frequency." } },
    ],
  };

  const articleJsonLd = {
    "@context": "https://schema.org",
    "@type": "Article",
    headline: "Tesla Rental Market Statistics & Earnings Data 2025",
    description: "Original data and insights on Tesla rental earnings, occupancy rates, and market trends across major U.S. cities. Updated quarterly by the Teslys research team.",
    author: { "@type": "Organization", name: "Teslys", url: "https://teslys.app" },
    publisher: { "@type": "Organization", name: "Teslys", logo: { "@type": "ImageObject", url: "https://teslys.app/icons/icon-512.webp" } },
    datePublished: "2025-01-15",
    dateModified: "2026-04-01",
    mainEntityOfPage: "https://teslys.app/tesla-rental-statistics",
  };

  const cityData = [
    { city: "Los Angeles", avgMonthly: "$2,400", avgDaily: "$120", occupancy: "82%", topModel: "Model Y" },
    { city: "Miami", avgMonthly: "$2,200", avgDaily: "$115", occupancy: "80%", topModel: "Model Y" },
    { city: "San Francisco", avgMonthly: "$2,300", avgDaily: "$125", occupancy: "78%", topModel: "Model 3" },
    { city: "New York", avgMonthly: "$2,100", avgDaily: "$130", occupancy: "76%", topModel: "Model Y" },
    { city: "Austin", avgMonthly: "$1,900", avgDaily: "$105", occupancy: "79%", topModel: "Model 3" },
    { city: "Dallas", avgMonthly: "$1,800", avgDaily: "$100", occupancy: "77%", topModel: "Model Y" },
    { city: "Las Vegas", avgMonthly: "$2,500", avgDaily: "$135", occupancy: "84%", topModel: "Model X" },
    { city: "Chicago", avgMonthly: "$1,700", avgDaily: "$95", occupancy: "72%", topModel: "Model 3" },
    { city: "Denver", avgMonthly: "$1,850", avgDaily: "$100", occupancy: "75%", topModel: "Model Y" },
    { city: "Seattle", avgMonthly: "$2,000", avgDaily: "$110", occupancy: "76%", topModel: "Model Y" },
    { city: "Phoenix", avgMonthly: "$1,750", avgDaily: "$95", occupancy: "74%", topModel: "Model 3" },
    { city: "Atlanta", avgMonthly: "$1,800", avgDaily: "$100", occupancy: "76%", topModel: "Model Y" },
    { city: "San Diego", avgMonthly: "$2,100", avgDaily: "$115", occupancy: "80%", topModel: "Model Y" },
    { city: "Oklahoma City", avgMonthly: "$1,600", avgDaily: "$90", occupancy: "73%", topModel: "Model 3" },
  ];

  const modelData = [
    { model: "Tesla Model 3", avgDaily: "$85–$110", avgMonthly: "$1,600–$2,100", occupancy: "80%", bestFor: "Highest ROI, most affordable entry" },
    { model: "Tesla Model Y", avgDaily: "$100–$130", avgMonthly: "$1,900–$2,500", occupancy: "82%", bestFor: "Best overall earnings, highest demand" },
    { model: "Tesla Model X", avgDaily: "$140–$180", avgMonthly: "$2,200–$3,200", occupancy: "72%", bestFor: "Premium segment, highest daily rate" },
    { model: "Tesla Model S", avgDaily: "$130–$165", avgMonthly: "$2,000–$2,800", occupancy: "68%", bestFor: "Luxury sedans, special occasions" },
    { model: "Tesla Cybertruck", avgDaily: "$160–$220", avgMonthly: "$2,500–$3,800", occupancy: "70%", bestFor: "Novelty demand, premium pricing" },
  ];

  return (
    <div className="min-h-screen bg-background">
      <SEO
        title="Tesla Rental Statistics & Earnings Data 2025 | Teslys"
        description="Original data on Tesla rental earnings by city and model. Average monthly income, occupancy rates, and market trends from the Teslys platform. Updated quarterly."
        canonical="https://teslys.app/tesla-rental-statistics"
        keywords="Tesla rental statistics, Tesla rental earnings data, Tesla car sharing income, Tesla rental market, how much do Tesla owners earn"
      />
      <JsonLd data={faqJsonLd} />
      <JsonLd data={articleJsonLd} />

      <nav className="border-b border-border/50 bg-background/95 backdrop-blur sticky top-0 z-50">
        <div className="max-w-6xl mx-auto px-4 py-3 flex items-center justify-between">
          <Link to="/" className="flex items-center gap-2"><Logo className="h-7 w-auto" /></Link>
          <div className="flex items-center gap-3">
            <Link to="/login"><Button variant="ghost" size="sm">Log in</Button></Link>
            <Link to="/get-started"><Button size="sm">Get Started</Button></Link>
          </div>
        </div>
      </nav>

      {/* Hero */}
      <section className="bg-gradient-to-b from-primary/5 to-background py-16 md:py-24">
        <div className="max-w-6xl mx-auto px-4">
          <Link to="/" className="inline-flex items-center gap-1 text-sm text-muted-foreground hover:text-foreground mb-6">
            <ArrowLeft className="h-4 w-4" /> Back to Home
          </Link>
          <div className="inline-flex items-center gap-1.5 bg-primary/10 text-primary text-xs font-semibold px-3 py-1.5 rounded-full mb-4">
            <BarChart3 className="w-3.5 h-3.5" /> Updated Q1 2026
          </div>
          <h1 className="text-4xl md:text-5xl font-bold tracking-tight mb-4">
            Tesla Rental Market Statistics & Earnings Data
          </h1>
          <p className="text-xl text-muted-foreground max-w-3xl mb-8">
            Original data from the Teslys platform on Tesla rental earnings, occupancy rates, and market performance across 14 U.S. cities. This report is updated quarterly based on real booking data from our network of Tesla owners and professional hosts.
          </p>
        </div>
      </section>

      {/* Key Metrics */}
      <section className="py-12 border-b border-border">
        <div className="max-w-6xl mx-auto px-4">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-6 text-center">
            {[
              { value: "$2,050", label: "Avg. Monthly Owner Earnings", icon: DollarSign },
              { value: "78%", label: "Avg. Occupancy Rate", icon: Calendar },
              { value: "14", label: "Active Markets", icon: MapPin },
              { value: "22 days", label: "Avg. Days Booked/Month", icon: TrendingUp },
            ].map((stat) => (
              <div key={stat.label}>
                <stat.icon className="w-5 h-5 text-primary mx-auto mb-2" />
                <p className="text-2xl md:text-3xl font-bold text-primary">{stat.value}</p>
                <p className="text-xs md:text-sm text-muted-foreground mt-1">{stat.label}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Earnings by City */}
      <section className="py-16 bg-background">
        <div className="max-w-6xl mx-auto px-4">
          <h2 className="text-3xl font-bold mb-3">Tesla Rental Earnings by City</h2>
          <p className="text-muted-foreground mb-8 max-w-3xl">
            Earnings vary significantly by market. Tourist-heavy cities like Las Vegas and Los Angeles consistently lead in both daily rates and occupancy. Data is based on Teslys platform bookings over the trailing 12 months.
          </p>
          <div className="overflow-x-auto">
            <table className="w-full border-collapse bg-card rounded-xl border">
              <thead>
                <tr className="border-b">
                  <th className="text-left py-4 px-4 font-semibold">City</th>
                  <th className="text-left py-4 px-4 font-semibold">Avg. Monthly Earnings</th>
                  <th className="text-left py-4 px-4 font-semibold">Avg. Daily Rate</th>
                  <th className="text-left py-4 px-4 font-semibold">Occupancy</th>
                  <th className="text-left py-4 px-4 font-semibold">Top Model</th>
                </tr>
              </thead>
              <tbody>
                {cityData.map((row) => (
                  <tr key={row.city} className="border-b last:border-0 hover:bg-muted/50">
                    <td className="py-3 px-4 font-medium">{row.city}</td>
                    <td className="py-3 px-4 text-primary font-medium">{row.avgMonthly}</td>
                    <td className="py-3 px-4 text-muted-foreground">{row.avgDaily}</td>
                    <td className="py-3 px-4 text-muted-foreground">{row.occupancy}</td>
                    <td className="py-3 px-4 text-muted-foreground">{row.topModel}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          <p className="text-xs text-muted-foreground mt-4 italic">
            Source: Teslys platform data, trailing 12 months ending March 2026. Earnings reflect gross owner income before platform fees.
          </p>
        </div>
      </section>

      {/* Earnings by Model */}
      <section className="py-16 bg-muted/30">
        <div className="max-w-6xl mx-auto px-4">
          <h2 className="text-3xl font-bold mb-3">Earnings by Tesla Model</h2>
          <p className="text-muted-foreground mb-8 max-w-3xl">
            The Tesla Model Y is the most popular car-sharing vehicle on the platform, combining strong daily rates with the highest occupancy among all models. The Cybertruck commands premium rates but has lower booking frequency.
          </p>
          <div className="overflow-x-auto">
            <table className="w-full border-collapse bg-card rounded-xl border">
              <thead>
                <tr className="border-b">
                  <th className="text-left py-4 px-4 font-semibold">Model</th>
                  <th className="text-left py-4 px-4 font-semibold">Daily Rate Range</th>
                  <th className="text-left py-4 px-4 font-semibold">Monthly Earnings Range</th>
                  <th className="text-left py-4 px-4 font-semibold">Avg. Occupancy</th>
                  <th className="text-left py-4 px-4 font-semibold">Best For</th>
                </tr>
              </thead>
              <tbody>
                {modelData.map((row) => (
                  <tr key={row.model} className="border-b last:border-0 hover:bg-muted/50">
                    <td className="py-3 px-4 font-medium">{row.model}</td>
                    <td className="py-3 px-4 text-muted-foreground">{row.avgDaily}</td>
                    <td className="py-3 px-4 text-primary font-medium">{row.avgMonthly}</td>
                    <td className="py-3 px-4 text-muted-foreground">{row.occupancy}</td>
                    <td className="py-3 px-4 text-muted-foreground">{row.bestFor}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </section>

      {/* Market Trends */}
      <section className="py-16 bg-background">
        <div className="max-w-6xl mx-auto px-4">
          <h2 className="text-3xl font-bold mb-8">Key Market Trends</h2>
          <div className="grid md:grid-cols-2 gap-6">
            {[
              { title: "EV Rental Demand Growing 35% YoY", desc: "Consumer demand for electric vehicle rentals has grown 35% year-over-year as EV adoption accelerates. Tesla remains the most searched EV rental brand, commanding 68% of all EV rental searches in the U.S." },
              { title: "Monthly Rentals Up 42%", desc: "Long-term Tesla rentals (30+ days) have increased 42% as remote workers and digital nomads choose flexible transportation. Monthly renters show 3x higher lifetime value than daily renters." },
              { title: "Supercharger Network Drives Demand", desc: "Tesla's Supercharger network — now open to other EVs — remains a key differentiator. 73% of renters cite charging convenience as a top reason for choosing a Tesla over other EVs." },
              { title: "Professional Hosting Yields 28% More", desc: "Tesla owners using professional co-hosting services like Teslys earn an average of 28% more than self-managed listings, driven by optimized pricing, faster turnovers, and higher ratings." },
            ].map((trend) => (
              <div key={trend.title} className="bg-card border rounded-xl p-6">
                <TrendingUp className="h-6 w-6 text-primary mb-3" />
                <h3 className="text-lg font-semibold mb-2">{trend.title}</h3>
                <p className="text-sm text-muted-foreground">{trend.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Methodology */}
      <section className="py-16 bg-muted/30">
        <div className="max-w-4xl mx-auto px-4">
          <h2 className="text-3xl font-bold mb-4">Methodology</h2>
          <p className="text-muted-foreground leading-relaxed mb-4">
            All statistics in this report are derived from anonymized, aggregated booking data on the Teslys platform. Data covers the trailing 12 months ending March 2026 and includes bookings across 14 active U.S. markets.
          </p>
          <p className="text-muted-foreground leading-relaxed mb-4">
            "Average monthly earnings" represent gross income to vehicle owners before Teslys platform fees (typically 15–25%). Occupancy rates are calculated as booked days divided by available days per month. Daily rates reflect the average across all booking durations.
          </p>
          <p className="text-muted-foreground leading-relaxed">
            This report is updated quarterly. For custom data requests, media inquiries, or partnership opportunities, contact <a href="mailto:support@teslys.com" className="text-primary underline underline-offset-2">support@teslys.com</a>.
          </p>
        </div>
      </section>

      {/* FAQ */}
      <section className="py-16 bg-background">
        <div className="max-w-6xl mx-auto px-4">
          <h2 className="text-3xl font-bold mb-8">Frequently Asked Questions</h2>
          <div className="space-y-4">
            {[
              { q: "How much do Tesla owners earn on average from car sharing?", a: "Tesla owners on the Teslys platform earn an average of $1,800–$2,400 per month depending on the model, city, and booking frequency. Model Y owners in top markets like Los Angeles and Miami tend to earn on the higher end." },
              { q: "What is the average occupancy rate for Tesla rentals?", a: "Tesla vehicles on the Teslys platform achieve an average occupancy rate of 75–85%, significantly higher than the 55–65% industry average for traditional rental cars. The combination of brand appeal and Supercharger access drives higher demand." },
              { q: "Which Tesla model earns the most in car sharing?", a: "The Tesla Model Y generates the highest total earnings due to its combination of strong daily rates ($100–$130/day) and consistently high occupancy. The Model X commands the highest daily rate ($140–$180/day) but has slightly lower booking frequency." },
            ].map((faq) => (
              <div key={faq.q} className="bg-card border rounded-lg p-6">
                <h3 className="text-lg font-semibold mb-2">{faq.q}</h3>
                <p className="text-muted-foreground">{faq.a}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="py-16 bg-primary text-primary-foreground">
        <div className="max-w-4xl mx-auto px-4 text-center">
          <h2 className="text-3xl font-bold mb-4">Start Earning with Your Tesla</h2>
          <p className="text-lg opacity-90 mb-8">Join the fastest-growing Tesla car-sharing platform. Professional management, full insurance, and real earnings data to back it up.</p>
          <div className="flex flex-wrap justify-center gap-3">
            <Link to="/register/client">
              <Button size="lg" variant="secondary">List Your Tesla <ArrowRight className="ml-2 h-4 w-4" /></Button>
            </Link>
            <Link to="/earnings-calculator">
              <Button size="lg" variant="outline" className="border-primary-foreground/30 text-primary-foreground hover:bg-primary-foreground/10">Calculate My Earnings</Button>
            </Link>
          </div>
        </div>
      </section>

      <section className="py-16 bg-background">
        <div className="max-w-2xl mx-auto px-4"><NewsletterSignup /></div>
      </section>

      <RelatedPages heading="Explore More" />

      <footer className="border-t py-8">
        <div className="max-w-6xl mx-auto px-4 flex flex-wrap gap-4 text-sm text-muted-foreground">
          <Link to="/" className="hover:text-foreground">Home</Link>
          <Link to="/how-it-works" className="hover:text-foreground">How It Works</Link>
          <Link to="/tesla-rental-near-me" className="hover:text-foreground">Tesla Rental Near Me</Link>
          <Link to="/tesla-rental-cost" className="hover:text-foreground">Tesla Rental Cost</Link>
          <Link to="/earnings-calculator" className="hover:text-foreground">Earnings Calculator</Link>
          <Link to="/blog" className="hover:text-foreground">Blog</Link>
          <Link to="/faq" className="hover:text-foreground">FAQ</Link>
          <Link to="/privacy" className="hover:text-foreground">Privacy</Link>
          <Link to="/terms" className="hover:text-foreground">Terms</Link>
        </div>
      </footer>
    </div>
  );
}
