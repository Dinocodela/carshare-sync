import { Link } from "react-router-dom";
import { SEO } from "@/components/SEO";
import { NewsletterSignup } from "@/components/marketing/NewsletterSignup";
import { RelatedPages } from "@/components/marketing/RelatedPages";
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
  CheckCircle,
  Calculator,
  TrendingUp,
  MapPin,
} from "lucide-react";
import { useEffect } from "react";

export interface ModelDetailData {
  slug: string;
  model: string;
  modelShort: string;
  metaTitle: string;
  metaDescription: string;
  headline: string;
  subheadline: string;
  avgMonthlyEarnings: string;
  avgDailyRate: string;
  overview: string;
  whyRent: string;
  specs: { label: string; value: string }[];
  comparisonModels: { model: string; dailyRate: string; monthlyEarnings: string; bestFor: string }[];
  faqs: { question: string; answer: string }[];
  topCities: { city: string; slug: string }[];
}

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

export function ModelDetailPage({ data }: { data: ModelDetailData }) {
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
        { "@type": "ListItem", position: 2, name: data.model, item: `https://teslys.app/${data.slug}` },
      ],
    },
  };

  const faqJsonLd = {
    "@context": "https://schema.org",
    "@type": "FAQPage",
    mainEntity: data.faqs.map((faq) => ({
      "@type": "Question",
      name: faq.question,
      acceptedAnswer: { "@type": "Answer", text: faq.answer },
    })),
  };

  return (
    <div className="min-h-screen bg-background">
      <SEO title={data.metaTitle} description={data.metaDescription} />
      <JsonLd data={jsonLd} />
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
          <h1 className="text-4xl md:text-5xl font-bold tracking-tight mb-4">{data.headline}</h1>
          <p className="text-xl text-muted-foreground max-w-2xl mb-8">{data.subheadline}</p>
          <div className="flex flex-wrap gap-6 mb-8">
            <div className="flex items-center gap-2 bg-card border rounded-lg px-4 py-3">
              <DollarSign className="h-5 w-5 text-primary" />
              <div>
                <div className="text-2xl font-bold">{data.avgMonthlyEarnings}</div>
                <div className="text-sm text-muted-foreground">Avg. Monthly Earnings</div>
              </div>
            </div>
            <div className="flex items-center gap-2 bg-card border rounded-lg px-4 py-3">
              <TrendingUp className="h-5 w-5 text-primary" />
              <div>
                <div className="text-2xl font-bold">{data.avgDailyRate}</div>
                <div className="text-sm text-muted-foreground">Avg. Daily Rate</div>
              </div>
            </div>
          </div>
          <div className="flex flex-wrap gap-3">
            <Link to="/register/client"><Button size="lg">List Your {data.modelShort} <ArrowRight className="ml-2 h-4 w-4" /></Button></Link>
            <Link to="/earnings-calculator"><Button variant="outline" size="lg"><Calculator className="mr-2 h-4 w-4" /> Calculate Earnings</Button></Link>
          </div>
        </div>
      </section>

      <section className="py-16 bg-background">
        <div className="max-w-6xl mx-auto px-4">
          <h2 className="text-3xl font-bold mb-6">Why Rent Out Your {data.modelShort}?</h2>
          <p className="text-lg text-muted-foreground max-w-3xl mb-8">{data.overview}</p>
          <div className="bg-card border rounded-xl p-6">
            <h3 className="text-xl font-semibold mb-4">What Makes the {data.modelShort} a Top Earner</h3>
            <p className="text-muted-foreground">{data.whyRent}</p>
          </div>
        </div>
      </section>

      <section className="py-16 bg-muted/30">
        <div className="max-w-6xl mx-auto px-4">
          <h2 className="text-3xl font-bold mb-8">{data.modelShort} Key Specs</h2>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            {data.specs.map((spec) => (
              <div key={spec.label} className="bg-card border rounded-lg p-4 text-center">
                <div className="text-2xl font-bold text-primary">{spec.value}</div>
                <div className="text-sm text-muted-foreground mt-1">{spec.label}</div>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section className="py-16 bg-background">
        <div className="max-w-6xl mx-auto px-4">
          <h2 className="text-3xl font-bold mb-8">How the {data.modelShort} Compares</h2>
          <div className="overflow-x-auto">
            <table className="w-full border-collapse">
              <thead><tr className="border-b"><th className="text-left py-3 px-4 font-semibold">Model</th><th className="text-left py-3 px-4 font-semibold">Avg. Daily Rate</th><th className="text-left py-3 px-4 font-semibold">Avg. Monthly Earnings</th><th className="text-left py-3 px-4 font-semibold">Best For</th></tr></thead>
              <tbody>
                {data.comparisonModels.map((m) => (
                  <tr key={m.model} className="border-b hover:bg-muted/50">
                    <td className="py-3 px-4 font-medium">{m.model}</td>
                    <td className="py-3 px-4">{m.dailyRate}</td>
                    <td className="py-3 px-4">{m.monthlyEarnings}</td>
                    <td className="py-3 px-4 text-muted-foreground">{m.bestFor}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </section>

      <section className="py-16 bg-muted/30">
        <div className="max-w-6xl mx-auto px-4">
          <h2 className="text-3xl font-bold mb-8">Why Hosts Trust Teslys</h2>
          <div className="grid md:grid-cols-3 gap-6">
            {[
              { icon: Shield, title: "Fully Insured", desc: "Commercial insurance covers every trip. Your investment is protected." },
              { icon: Users, title: "Professional Co-Hosting", desc: "We handle guest communication, cleaning, and vehicle turnover." },
              { icon: Star, title: "5-Star Guest Experience", desc: "Professional management leads to higher ratings and more bookings." },
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
          <h2 className="text-3xl font-bold mb-8">Top Cities for {data.modelShort} Rentals</h2>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            {data.topCities.map((city) => (
              <Link key={city.slug} to={`/${city.slug}`} className="bg-card border rounded-lg p-4 hover:border-primary transition-colors text-center">
                <MapPin className="h-5 w-5 text-primary mx-auto mb-2" />
                <span className="font-medium">{city.city}</span>
              </Link>
            ))}
          </div>
        </div>
      </section>

      <section className="py-16 bg-muted/30">
        <div className="max-w-6xl mx-auto px-4">
          <h2 className="text-3xl font-bold mb-8">Frequently Asked Questions</h2>
          <div className="space-y-4">
            {data.faqs.map((faq) => (
              <div key={faq.question} className="bg-card border rounded-lg p-6">
                <h3 className="text-lg font-semibold mb-2">{faq.question}</h3>
                <p className="text-muted-foreground">{faq.answer}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section className="py-16 bg-primary text-primary-foreground">
        <div className="max-w-4xl mx-auto px-4 text-center">
          <h2 className="text-3xl font-bold mb-4">Start Earning with Your {data.modelShort} Today</h2>
          <p className="text-lg opacity-90 mb-8">Join Teslys and let us handle the work while you earn passive income.</p>
          <div className="flex flex-wrap justify-center gap-3">
            <Link to="/register/client"><Button size="lg" variant="secondary">List Your Tesla <ArrowRight className="ml-2 h-4 w-4" /></Button></Link>
            <Link to="/how-it-works"><Button size="lg" variant="outline" className="border-primary-foreground/30 text-primary-foreground hover:bg-primary-foreground/10">How It Works</Button></Link>
          </div>
        </div>
      </section>

      <section className="py-16 bg-background"><div className="max-w-2xl mx-auto px-4"><NewsletterSignup /></div></section>

      <RelatedPages heading="Explore More" />

      <footer className="border-t py-8">
        <div className="max-w-6xl mx-auto px-4 flex flex-wrap gap-4 text-sm text-muted-foreground">
          <Link to="/" className="hover:text-foreground">Home</Link>
          <Link to="/how-it-works" className="hover:text-foreground">How It Works</Link>
          <Link to="/earnings-calculator" className="hover:text-foreground">Earnings Calculator</Link>
          <Link to="/blog" className="hover:text-foreground">Blog</Link>
          <Link to="/faq" className="hover:text-foreground">FAQ</Link>
          <Link to="/support" className="hover:text-foreground">Support</Link>
          <Link to="/privacy" className="hover:text-foreground">Privacy</Link>
          <Link to="/terms" className="hover:text-foreground">Terms</Link>
        </div>
      </footer>
    </div>
  );
}
