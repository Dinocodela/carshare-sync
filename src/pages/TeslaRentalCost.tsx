import { Link } from "react-router-dom";
import { SEO } from "@/components/SEO";
import { NewsletterSignup } from "@/components/marketing/NewsletterSignup";
import { Logo } from "@/components/ui/logo";
import { Button } from "@/components/ui/button";
import {
  ArrowLeft,
  ArrowRight,
  DollarSign,
  Calculator,
  Car,
  TrendingUp,
  Shield,
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

export default function TeslaRentalCost() {
  const faqJsonLd = {
    "@context": "https://schema.org",
    "@type": "FAQPage",
    mainEntity: [
      { "@type": "Question", name: "How much does it cost to rent a Tesla?", acceptedAnswer: { "@type": "Answer", text: "Tesla rental costs range from $85/day for a Model 3 to $220/day for a Cybertruck. Monthly rates offer 30-40% savings. Exact pricing depends on model, location, and season." } },
      { "@type": "Question", name: "How much can I earn renting out my Tesla?", acceptedAnswer: { "@type": "Answer", text: "Tesla owners earn $1,200-$3,000+ per month depending on model and city. The Cybertruck earns the most, followed by Model X, Model S, Model Y, and Model 3." } },
      { "@type": "Question", name: "Is renting a Tesla on Turo worth it?", acceptedAnswer: { "@type": "Answer", text: "Yes — most Tesla owners cover their monthly car payment and earn additional profit. With professional co-hosting through Teslys, owners earn 30-50% more than self-managing." } },
    ],
  };

  return (
    <div className="min-h-screen bg-background">
      <SEO title="Tesla Rental Cost Breakdown | Daily, Weekly & Monthly Rates | Teslys" description="How much does it cost to rent a Tesla? Complete pricing breakdown by model with daily, weekly, and monthly rates. Calculate your potential rental income." />
      <JsonLd data={faqJsonLd} />

      <nav className="border-b border-border/50 bg-background/95 backdrop-blur sticky top-0 z-50">
        <div className="max-w-6xl mx-auto px-4 py-3 flex items-center justify-between">
          <Link to="/" className="flex items-center gap-2"><Logo className="h-7 w-auto" /></Link>
          <div className="flex items-center gap-3">
            <Link to="/login"><Button variant="ghost" size="sm">Log in</Button></Link>
            <Link to="/get-started"><Button size="sm">Get Started</Button></Link>
          </div>
        </div>
      </nav>

      <section className="bg-gradient-to-b from-primary/5 to-background py-16 md:py-24">
        <div className="max-w-6xl mx-auto px-4">
          <Link to="/" className="inline-flex items-center gap-1 text-sm text-muted-foreground hover:text-foreground mb-6"><ArrowLeft className="h-4 w-4" /> Back to Home</Link>
          <h1 className="text-4xl md:text-5xl font-bold tracking-tight mb-4">Tesla Rental Cost — Complete Pricing Breakdown</h1>
          <p className="text-xl text-muted-foreground max-w-2xl mb-8">Whether you're renting a Tesla or earning from one, here's exactly what Tesla rentals cost in 2026 — by model, duration, and city.</p>
          <div className="flex flex-wrap gap-3">
            <Link to="/earnings-calculator"><Button size="lg"><Calculator className="mr-2 h-4 w-4" /> Calculate Your Earnings</Button></Link>
            <Link to="/register/client"><Button variant="outline" size="lg">List Your Tesla <ArrowRight className="ml-2 h-4 w-4" /></Button></Link>
          </div>
        </div>
      </section>

      <section className="py-16 bg-background">
        <div className="max-w-6xl mx-auto px-4">
          <h2 className="text-3xl font-bold mb-8">Tesla Rental Rates by Model (2026)</h2>
          <div className="overflow-x-auto">
            <table className="w-full border-collapse">
              <thead>
                <tr className="border-b bg-muted/50">
                  <th className="text-left py-3 px-4 font-semibold">Model</th>
                  <th className="text-left py-3 px-4 font-semibold">Daily Rate</th>
                  <th className="text-left py-3 px-4 font-semibold">Weekly Rate</th>
                  <th className="text-left py-3 px-4 font-semibold">Monthly Rate</th>
                  <th className="text-left py-3 px-4 font-semibold">Owner Earnings/mo</th>
                </tr>
              </thead>
              <tbody>
                {[
                  { model: "Tesla Model 3", daily: "$85–$100", weekly: "$500–$600", monthly: "$1,800–$2,200", earnings: "$1,200–$1,500", link: "/tesla-model-3-rental-income-los-angeles" },
                  { model: "Tesla Model Y", daily: "$100–$130", weekly: "$600–$800", monthly: "$2,200–$2,800", earnings: "$1,400–$1,800", link: "/tesla-model-y-rental-income-los-angeles" },
                  { model: "Tesla Model S", daily: "$125–$160", weekly: "$750–$1,000", monthly: "$2,800–$3,500", earnings: "$1,700–$2,200", link: "/tesla-model-s-rental" },
                  { model: "Tesla Model X", daily: "$140–$175", weekly: "$850–$1,100", monthly: "$3,200–$4,000", earnings: "$1,900–$2,500", link: "/tesla-model-x-rental" },
                  { model: "Tesla Cybertruck", daily: "$170–$220", weekly: "$1,000–$1,400", monthly: "$4,000–$5,000", earnings: "$2,400–$3,000", link: "/tesla-cybertruck-rental" },
                ].map((m) => (
                  <tr key={m.model} className="border-b hover:bg-muted/50">
                    <td className="py-3 px-4"><Link to={m.link} className="font-medium text-primary hover:underline">{m.model}</Link></td>
                    <td className="py-3 px-4">{m.daily}</td>
                    <td className="py-3 px-4">{m.weekly}</td>
                    <td className="py-3 px-4">{m.monthly}</td>
                    <td className="py-3 px-4 font-semibold text-primary">{m.earnings}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          <p className="text-sm text-muted-foreground mt-4">* Rates vary by city, season, and vehicle condition. Owner earnings are after platform fees and co-hosting costs.</p>
        </div>
      </section>

      <section className="py-16 bg-muted/30">
        <div className="max-w-6xl mx-auto px-4">
          <h2 className="text-3xl font-bold mb-8">What Affects Tesla Rental Pricing?</h2>
          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
            {[
              { icon: Car, title: "Model & Trim", desc: "Performance and luxury trims command higher daily rates. A Model S Plaid earns 20-30% more than Long Range." },
              { icon: DollarSign, title: "Location", desc: "Top-tier cities like LA, Miami, and Las Vegas see higher rates. Emerging markets offer less competition." },
              { icon: TrendingUp, title: "Season & Events", desc: "Peak seasons, holidays, and major events (CES, SXSW, Art Basel) drive surge pricing." },
              { icon: Shield, title: "Rental Duration", desc: "Weekly and monthly rentals offer volume discounts but provide steadier, more predictable income." },
            ].map((item) => (
              <div key={item.title} className="bg-card border rounded-xl p-6">
                <item.icon className="h-8 w-8 text-primary mb-3" />
                <h3 className="text-lg font-semibold mb-2">{item.title}</h3>
                <p className="text-muted-foreground text-sm">{item.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section className="py-16 bg-background">
        <div className="max-w-6xl mx-auto px-4">
          <h2 className="text-3xl font-bold mb-8">Frequently Asked Questions</h2>
          <div className="space-y-4">
            {[
              { q: "How much does it cost to rent a Tesla?", a: "Tesla rental costs range from $85/day for a Model 3 to $220/day for a Cybertruck. Monthly rates offer 30-40% savings. Exact pricing depends on model, location, and season." },
              { q: "How much can I earn renting out my Tesla?", a: "Tesla owners earn $1,200-$3,000+ per month depending on model and city. The Cybertruck earns the most, followed by Model X, Model S, Model Y, and Model 3." },
              { q: "Is renting a Tesla on Turo worth it?", a: "Yes — most Tesla owners cover their monthly car payment and earn additional profit. With professional co-hosting through Teslys, owners earn 30-50% more than self-managing." },
              { q: "What are the hidden costs of renting a Tesla?", a: "The main costs are charging (Supercharger fees are minimal), insurance (covered by Teslys), and occasional cleaning. With co-hosting, these are all handled for you." },
            ].map((faq) => (
              <div key={faq.q} className="bg-card border rounded-lg p-6">
                <h3 className="text-lg font-semibold mb-2">{faq.q}</h3>
                <p className="text-muted-foreground">{faq.a}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section className="py-16 bg-primary text-primary-foreground">
        <div className="max-w-4xl mx-auto px-4 text-center">
          <h2 className="text-3xl font-bold mb-4">Turn Your Tesla Into a Revenue Machine</h2>
          <p className="text-lg opacity-90 mb-8">Join Teslys and start earning passive income from your Tesla today.</p>
          <Link to="/register/client"><Button size="lg" variant="secondary">Get Started <ArrowRight className="ml-2 h-4 w-4" /></Button></Link>
        </div>
      </section>

      <section className="py-16 bg-background"><div className="max-w-2xl mx-auto px-4"><NewsletterSignup /></div></section>

      <footer className="border-t py-8">
        <div className="max-w-6xl mx-auto px-4 flex flex-wrap gap-4 text-sm text-muted-foreground">
          <Link to="/" className="hover:text-foreground">Home</Link>
          <Link to="/how-it-works" className="hover:text-foreground">How It Works</Link>
          <Link to="/tesla-monthly-rental" className="hover:text-foreground">Monthly Rentals</Link>
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
