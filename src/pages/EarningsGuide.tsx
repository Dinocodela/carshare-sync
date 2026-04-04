import { Link } from "react-router-dom";
import { SEO } from "@/components/SEO";
import { StructuredData } from "@/components/StructuredData";
import { NewsletterSignup } from "@/components/marketing/NewsletterSignup";
import { Logo } from "@/components/ui/logo";
import { Button } from "@/components/ui/button";
import {
  ArrowLeft,
  ArrowRight,
  DollarSign,
  TrendingUp,
  MapPin,
  Phone,
  Car,
  CheckCircle,
  BarChart3,
} from "lucide-react";

const modelData = [
  { model: "Model 3", avgMonthly: "$1,400–$1,900", bestYear: "2021–2022", notes: "Highest trip volume; most in-demand model on the platform." },
  { model: "Model Y", avgMonthly: "$1,200–$1,800", bestYear: "2021–2022", notes: "Strong family/SUV demand; excellent year-round performer." },
  { model: "Model X", avgMonthly: "$1,300–$1,700", bestYear: "2021–2022", notes: "Premium rates; lower trip volume but higher per-trip revenue." },
  { model: "Model S", avgMonthly: "$1,200–$1,600", bestYear: "2021–2022", notes: "Luxury appeal for business travelers and special occasions." },
  { model: "Cybertruck", avgMonthly: "$1,500–$1,800", bestYear: "2024+", notes: "Novelty factor drives high demand and premium pricing." },
];

const cityData = [
  { city: "Los Angeles", earnings: "$1,800+", link: "/tesla-car-sharing-los-angeles" },
  { city: "Miami", earnings: "$1,600+", link: "/tesla-car-sharing-miami" },
  { city: "San Francisco", earnings: "$1,500+", link: "/tesla-car-sharing-san-francisco" },
  { city: "New York", earnings: "$1,700+", link: "/tesla-car-sharing-new-york" },
  { city: "Austin", earnings: "$1,300+", link: "/tesla-car-sharing-austin" },
  { city: "Dallas", earnings: "$1,400+", link: "/tesla-car-sharing-dallas" },
  { city: "Chicago", earnings: "$1,500+", link: "/tesla-car-sharing-chicago" },
  { city: "Phoenix", earnings: "$1,250+", link: "/tesla-car-sharing-phoenix" },
];

const breadcrumbData = {
  itemListElement: [
    { "@type": "ListItem", position: 1, name: "Home", item: "https://teslys.app/" },
    { "@type": "ListItem", position: 2, name: "How Much Can I Earn Renting My Tesla", item: "https://teslys.app/how-much-can-i-earn" },
  ],
};

const faqSchema = {
  "@context": "https://schema.org",
  "@type": "FAQPage",
  mainEntity: [
    {
      "@type": "Question",
      name: "How much can I earn renting my Tesla?",
      acceptedAnswer: { "@type": "Answer", text: "Tesla owners on Teslys typically earn $1,000–$2,000 per month after host management fees, depending on model, year, location, and availability." },
    },
    {
      "@type": "Question",
      name: "Is renting my Tesla on Turo worth it?",
      acceptedAnswer: { "@type": "Answer", text: "Yes, but self-managing takes 10+ hours per week. With Teslys, your host handles everything, making it truly passive income. Most owners net $1,000–$1,500/month with zero time investment." },
    },
    {
      "@type": "Question",
      name: "Which Tesla model earns the most from rentals?",
      acceptedAnswer: { "@type": "Answer", text: "The Model 3 (2021–2022) consistently earns the most at approximately $1,900/month gross, followed by the Model Y at $1,800/month. Newer Cybertrucks also command premium rates." },
    },
  ],
};

export default function EarningsGuide() {
  return (
    <>
      <SEO
        title="How Much Can I Earn Renting My Tesla? | Complete Guide"
        description="Discover exactly how much you can earn renting your Tesla. Real data from 500+ trips showing Model 3, Y, X, S, and Cybertruck earnings by city and year."
        keywords="how much can I earn renting my Tesla, Tesla rental income, Tesla passive income, rent out Tesla earnings, Turo Tesla earnings"
        canonical="https://teslys.app/how-much-can-i-earn"
      />
      <StructuredData type="breadcrumblist" data={breadcrumbData} />
      <StructuredData type="faq" data={faqSchema} />

      <div className="min-h-screen bg-background">
        {/* Header */}
        <header className="sticky top-0 z-50 bg-background/95 backdrop-blur border-b border-border">
          <div className="max-w-4xl mx-auto px-4 py-3 flex items-center justify-between">
            <div className="flex items-center gap-3">
              <Link to="/" className="flex items-center gap-2 text-muted-foreground hover:text-foreground transition">
                <ArrowLeft className="w-4 h-4" />
              </Link>
              <Link to="/"><Logo className="h-7" /></Link>
            </div>
            <Link to="/earnings-calculator">
              <Button size="sm" className="rounded-full">
                Calculator <ArrowRight className="w-3.5 h-3.5 ml-1" />
              </Button>
            </Link>
          </div>
        </header>

        <main className="max-w-4xl mx-auto px-4 py-12 sm:py-16">
          {/* Hero */}
          <div className="text-center mb-12">
            <div className="inline-flex items-center gap-1.5 bg-primary/10 text-primary text-xs font-semibold px-3 py-1.5 rounded-full mb-4">
              <BarChart3 className="w-3.5 h-3.5" />
              Data from 500+ Real Trips
            </div>
            <h1 className="text-3xl md:text-5xl font-bold text-foreground mb-4 leading-tight">
              How Much Can You Earn <br className="hidden sm:block" />Renting Your Tesla?
            </h1>
            <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
              We analyzed real rental data from our platform to give you honest, data-backed earnings projections for every Tesla model.
            </p>
          </div>

          {/* Quick Answer */}
          <section className="bg-primary/5 border border-primary/20 rounded-2xl p-6 sm:p-8 mb-12">
            <h2 className="text-xl font-bold text-foreground mb-3">The Short Answer</h2>
            <p className="text-muted-foreground leading-relaxed mb-4">
              Tesla owners on Teslys earn between <strong className="text-foreground">$1,000 and $2,000 per month</strong> after
              host management fees. The exact amount depends on your model, year, city, and how many days per month your car is available.
            </p>
            <Link to="/earnings-calculator" className="inline-flex items-center gap-1 text-sm font-semibold text-primary hover:underline">
              Get your personalized estimate <ArrowRight className="w-3.5 h-3.5" />
            </Link>
          </section>

          {/* By Model */}
          <section className="mb-12">
            <h2 className="text-2xl font-bold text-foreground mb-6">Earnings by Tesla Model</h2>
            <div className="space-y-4">
              {modelData.map((item) => (
                <div key={item.model} className="bg-card rounded-xl border border-border p-5 flex flex-col sm:flex-row sm:items-center gap-4">
                  <div className="flex items-center gap-3 sm:w-40 shrink-0">
                    <div className="w-10 h-10 rounded-lg bg-primary/10 flex items-center justify-center">
                      <Car className="w-5 h-5 text-primary" />
                    </div>
                    <div>
                      <p className="font-bold text-foreground">{item.model}</p>
                      <p className="text-xs text-muted-foreground">Best: {item.bestYear}</p>
                    </div>
                  </div>
                  <div className="flex-1">
                    <p className="text-sm text-muted-foreground">{item.notes}</p>
                  </div>
                  <div className="text-right sm:w-40 shrink-0">
                    <p className="text-lg font-bold text-primary">{item.avgMonthly}</p>
                    <p className="text-xs text-muted-foreground">per month (net)</p>
                  </div>
                </div>
              ))}
            </div>
            <p className="text-xs text-muted-foreground mt-3">* Net earnings after 30% host management fee. Based on 80% monthly availability.</p>
          </section>

          {/* Factors */}
          <section className="mb-12">
            <h2 className="text-2xl font-bold text-foreground mb-6">5 Factors That Determine Your Earnings</h2>
            <div className="space-y-4">
              {[
                { num: "1", title: "Vehicle Model & Year", desc: "Newer models and popular configurations (Long Range, Performance) command higher daily rates. The Model 3 and Model Y are the most in-demand." },
                { num: "2", title: "Location", desc: "Cities with strong tourism, business travel, and EV infrastructure generate the highest bookings. LA, Miami, and NYC consistently lead." },
                { num: "3", title: "Availability", desc: "The more days your car is available, the more you earn. Hosts who keep 80%+ availability see the best returns." },
                { num: "4", title: "Seasonality", desc: "Demand spikes during holidays, summer travel season, and major local events. Smart availability during peak times maximizes earnings." },
                { num: "5", title: "Vehicle Condition", desc: "Clean, well-maintained vehicles with good photos earn higher ratings, more repeat bookings, and better daily rates." },
              ].map((item) => (
                <div key={item.num} className="flex gap-4">
                  <div className="w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center shrink-0 mt-0.5">
                    <span className="text-sm font-bold text-primary">{item.num}</span>
                  </div>
                  <div>
                    <h3 className="font-bold text-foreground mb-1">{item.title}</h3>
                    <p className="text-sm text-muted-foreground leading-relaxed">{item.desc}</p>
                  </div>
                </div>
              ))}
            </div>
          </section>

          {/* By City */}
          <section className="mb-12">
            <h2 className="text-2xl font-bold text-foreground mb-6">Earnings by City</h2>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
              {cityData.map((item) => (
                <Link
                  key={item.city}
                  to={item.link}
                  className="bg-card rounded-xl border border-border p-4 text-center hover:border-primary/30 hover:shadow-sm transition-all group"
                >
                  <p className="text-sm font-bold text-foreground group-hover:text-primary transition-colors">{item.city}</p>
                  <p className="text-lg font-bold text-primary mt-1">{item.earnings}</p>
                  <p className="text-xs text-muted-foreground">per month</p>
                </Link>
              ))}
            </div>
          </section>

          {/* Why Teslys */}
          <section className="mb-12">
            <h2 className="text-2xl font-bold text-foreground mb-6">Why Teslys Over Self-Managing?</h2>
            <div className="space-y-3">
              {[
                "Zero time commitment — your host handles everything",
                "Professional cleaning and maintenance after every trip",
                "24/7 guest support and emergency handling",
                "Real-time earnings dashboard and expense tracking",
                "Vetted, experienced hosts in your city",
              ].map((item) => (
                <div key={item} className="flex items-start gap-2">
                  <CheckCircle className="w-4 h-4 text-primary shrink-0 mt-0.5" />
                  <p className="text-sm text-muted-foreground">{item}</p>
                </div>
              ))}
            </div>
            <div className="mt-4">
              <Link to="/turo-management" className="inline-flex items-center gap-1 text-sm font-semibold text-primary hover:underline">
                See full comparison: Teslys vs. self-managing <ArrowRight className="w-3.5 h-3.5" />
              </Link>
            </div>
          </section>

          {/* CTA */}
          <section className="bg-gradient-hero rounded-2xl p-8 sm:p-10 text-center mb-12">
            <h2 className="text-2xl font-bold text-foreground mb-3">Ready to Start Earning?</h2>
            <p className="text-muted-foreground mb-6">
              Use our calculator for a personalized estimate, or sign up to get started today.
            </p>
            <div className="flex flex-col sm:flex-row gap-3 justify-center">
              <Link to="/earnings-calculator">
                <Button size="lg" className="rounded-xl shadow-lg shadow-primary/20 w-full sm:w-auto">
                  Calculate My Earnings <ArrowRight className="w-4 h-4 ml-1" />
                </Button>
              </Link>
              <Link to="/register/client">
                <Button size="lg" variant="outline" className="rounded-xl w-full sm:w-auto">
                  Sign Up Free
                </Button>
              </Link>
            </div>
          </section>
        </main>

        <NewsletterSignup source="earnings-guide" />

        {/* Footer */}
        <footer className="border-t border-border py-8">
          <div className="max-w-4xl mx-auto px-4">
            <div className="flex flex-col items-center gap-4">
              <Link to="/"><Logo className="h-6 opacity-80" /></Link>
              <nav className="flex flex-wrap justify-center gap-x-5 gap-y-2 text-xs text-muted-foreground">
                <Link to="/how-it-works" className="hover:text-foreground transition-colors">How It Works</Link>
                <Link to="/earnings-calculator" className="hover:text-foreground transition-colors">Earnings Calculator</Link>
                <Link to="/turo-management" className="hover:text-foreground transition-colors">Turo Management</Link>
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
