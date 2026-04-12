import { Link } from "react-router-dom";
import { SEO } from "@/components/SEO";
import { NewsletterSignup } from "@/components/marketing/NewsletterSignup";
import { Logo } from "@/components/ui/logo";
import { Button } from "@/components/ui/button";
import {
  ArrowLeft,
  ArrowRight,
  Calendar,
  DollarSign,
  Shield,
  CheckCircle,
  Calculator,
  TrendingUp,
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

export default function TeslaMonthlyRental() {
  const faqJsonLd = {
    "@context": "https://schema.org",
    "@type": "FAQPage",
    mainEntity: [
      { "@type": "Question", name: "How much does a monthly Tesla rental cost?", acceptedAnswer: { "@type": "Answer", text: "Monthly Tesla rental rates vary by model: Model 3 starts at $1,800/month, Model Y at $2,400/month, Model S at $3,200/month, Model X at $3,600/month, and Cybertruck at $4,500/month." } },
      { "@type": "Question", name: "Is renting a Tesla monthly cheaper than daily?", acceptedAnswer: { "@type": "Answer", text: "Yes — monthly Tesla rentals typically offer 30-40% savings compared to daily rates. Most hosts offer significant discounts for 30+ day bookings." } },
      { "@type": "Question", name: "Can I earn passive income with long-term Tesla rentals?", acceptedAnswer: { "@type": "Answer", text: "Absolutely. Long-term rentals provide stable, predictable income with less vehicle wear compared to frequent short-term trips. Many Teslys hosts prefer monthly renters for their consistency." } },
    ],
  };

  return (
    <div className="min-h-screen bg-background">
      <SEO title="Tesla Monthly Rental | Long-Term Rates & Earnings | Teslys" description="Explore monthly Tesla rental rates and long-term rental income opportunities. List your Tesla for monthly rentals with Teslys and earn consistent passive income." />
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
          <h1 className="text-4xl md:text-5xl font-bold tracking-tight mb-4">Tesla Monthly Rental — Earn Consistent Passive Income</h1>
          <p className="text-xl text-muted-foreground max-w-2xl mb-8">Long-term Tesla rentals offer stable earnings, less wear on your vehicle, and hands-off income. Let Teslys handle everything.</p>
          <div className="flex flex-wrap gap-3">
            <Link to="/register/client"><Button size="lg">List Your Tesla <ArrowRight className="ml-2 h-4 w-4" /></Button></Link>
            <Link to="/earnings-calculator"><Button variant="outline" size="lg"><Calculator className="mr-2 h-4 w-4" /> Calculate Earnings</Button></Link>
          </div>
        </div>
      </section>

      <section className="py-16 bg-background">
        <div className="max-w-6xl mx-auto px-4">
          <h2 className="text-3xl font-bold mb-8">Monthly Tesla Rental Rates by Model</h2>
          <div className="grid md:grid-cols-3 lg:grid-cols-5 gap-4">
            {[
              { model: "Model 3", monthly: "$1,800+", daily: "$85+", link: "/tesla-model-3-rental-income-los-angeles" },
              { model: "Model Y", monthly: "$2,400+", daily: "$110+", link: "/tesla-model-y-rental-income-los-angeles" },
              { model: "Model S", monthly: "$3,200+", daily: "$140+", link: "/tesla-model-s-rental" },
              { model: "Model X", monthly: "$3,600+", daily: "$155+", link: "/tesla-model-x-rental" },
              { model: "Cybertruck", monthly: "$4,500+", daily: "$185+", link: "/tesla-cybertruck-rental" },
            ].map((m) => (
              <Link key={m.model} to={m.link} className="bg-card border rounded-xl p-6 hover:border-primary transition-colors">
                <Car className="h-6 w-6 text-primary mb-3" />
                <h3 className="font-bold text-lg mb-2">{m.model}</h3>
                <div className="text-2xl font-bold text-primary">{m.monthly}</div>
                <div className="text-sm text-muted-foreground">per month</div>
                <div className="text-sm text-muted-foreground mt-1">{m.daily}/day equivalent</div>
              </Link>
            ))}
          </div>
        </div>
      </section>

      <section className="py-16 bg-muted/30">
        <div className="max-w-6xl mx-auto px-4">
          <h2 className="text-3xl font-bold mb-8">Why Long-Term Tesla Rentals Win</h2>
          <div className="grid md:grid-cols-3 gap-6">
            {[
              { icon: TrendingUp, title: "Stable Monthly Income", desc: "No gaps between bookings. Monthly renters provide predictable, recurring revenue that makes financial planning easier." },
              { icon: Shield, title: "Less Vehicle Wear", desc: "Fewer guest turnovers means less cleaning, fewer key exchanges, and reduced wear on your Tesla compared to daily rentals." },
              { icon: Calendar, title: "Hands-Off Management", desc: "Teslys handles everything — guest screening, contracts, insurance, and maintenance — so you earn without lifting a finger." },
            ].map((item) => (
              <div key={item.title} className="bg-card border rounded-xl p-6">
                <item.icon className="h-8 w-8 text-primary mb-3" />
                <h3 className="text-lg font-semibold mb-2">{item.title}</h3>
                <p className="text-muted-foreground">{item.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section className="py-16 bg-background">
        <div className="max-w-6xl mx-auto px-4">
          <h2 className="text-3xl font-bold mb-8">Monthly vs. Daily Tesla Rental: Owner Comparison</h2>
          <div className="overflow-x-auto">
            <table className="w-full border-collapse">
              <thead><tr className="border-b"><th className="text-left py-3 px-4 font-semibold">Factor</th><th className="text-left py-3 px-4 font-semibold">Daily Rentals</th><th className="text-left py-3 px-4 font-semibold">Monthly Rentals</th></tr></thead>
              <tbody>
                {[
                  ["Revenue Potential", "Higher per-day rate", "Lower rate but guaranteed income"],
                  ["Vehicle Wear", "Higher — frequent turnovers", "Lower — single renter"],
                  ["Management Effort", "More guest interactions", "Set it and forget it"],
                  ["Booking Gaps", "Risk of empty days", "Minimal gaps"],
                  ["Best For", "Maximizing peak seasons", "Consistent year-round income"],
                ].map(([factor, daily, monthly]) => (
                  <tr key={factor} className="border-b hover:bg-muted/50">
                    <td className="py-3 px-4 font-medium">{factor}</td>
                    <td className="py-3 px-4 text-muted-foreground">{daily}</td>
                    <td className="py-3 px-4 text-muted-foreground">{monthly}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </section>

      <section className="py-16 bg-muted/30">
        <div className="max-w-6xl mx-auto px-4">
          <h2 className="text-3xl font-bold mb-8">Frequently Asked Questions</h2>
          <div className="space-y-4">
            {[
              { q: "How much does a monthly Tesla rental cost?", a: "Monthly Tesla rental rates vary by model: Model 3 starts at $1,800/month, Model Y at $2,400/month, Model S at $3,200/month, Model X at $3,600/month, and Cybertruck at $4,500/month." },
              { q: "Is renting a Tesla monthly cheaper than daily?", a: "Yes — monthly Tesla rentals typically offer 30-40% savings compared to daily rates. Most hosts offer significant discounts for 30+ day bookings." },
              { q: "Can I earn passive income with long-term Tesla rentals?", a: "Absolutely. Long-term rentals provide stable, predictable income with less vehicle wear compared to frequent short-term trips. Many Teslys hosts prefer monthly renters for their consistency." },
              { q: "Does Teslys manage long-term rentals?", a: "Yes. Teslys handles guest screening, contracts, insurance coordination, and vehicle maintenance for both short-term and long-term rentals." },
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
          <h2 className="text-3xl font-bold mb-4">Ready to Earn Monthly Income from Your Tesla?</h2>
          <p className="text-lg opacity-90 mb-8">Join Teslys and start earning consistent passive income today.</p>
          <Link to="/register/client"><Button size="lg" variant="secondary">Get Started <ArrowRight className="ml-2 h-4 w-4" /></Button></Link>
        </div>
      </section>

      <section className="py-16 bg-background"><div className="max-w-2xl mx-auto px-4"><NewsletterSignup /></div></section>

      <footer className="border-t py-8">
        <div className="max-w-6xl mx-auto px-4 flex flex-wrap gap-4 text-sm text-muted-foreground">
          <Link to="/" className="hover:text-foreground">Home</Link>
          <Link to="/how-it-works" className="hover:text-foreground">How It Works</Link>
          <Link to="/earnings-calculator" className="hover:text-foreground">Earnings Calculator</Link>
          <Link to="/blog" className="hover:text-foreground">Blog</Link>
          <Link to="/tesla-rental-cost" className="hover:text-foreground">Tesla Rental Cost</Link>
          <Link to="/faq" className="hover:text-foreground">FAQ</Link>
          <Link to="/privacy" className="hover:text-foreground">Privacy</Link>
          <Link to="/terms" className="hover:text-foreground">Terms</Link>
        </div>
      </footer>
    </div>
  );
}
