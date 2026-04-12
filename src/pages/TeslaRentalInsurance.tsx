import { Link } from "react-router-dom";
import { SEO } from "@/components/SEO";
import { NewsletterSignup } from "@/components/marketing/NewsletterSignup";
import { RelatedPages } from "@/components/marketing/RelatedPages";
import { Logo } from "@/components/ui/logo";
import { Button } from "@/components/ui/button";
import {
  ArrowLeft,
  ArrowRight,
  Shield,
  CheckCircle,
  FileText,
  Phone,
  HelpCircle,
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

export default function TeslaRentalInsurance() {
  const faqJsonLd = {
    "@context": "https://schema.org",
    "@type": "FAQPage",
    mainEntity: [
      { "@type": "Question", name: "Does Teslys include insurance with Tesla rentals?", acceptedAnswer: { "@type": "Answer", text: "Yes. Every Tesla rental through Teslys includes comprehensive liability and collision coverage. This protects both the vehicle owner and the renter during the rental period." } },
      { "@type": "Question", name: "What does Tesla rental insurance cover?", acceptedAnswer: { "@type": "Answer", text: "Standard coverage includes liability protection, collision damage, comprehensive coverage for theft and weather damage, and uninsured/underinsured motorist protection. Premium plans add zero-deductible and roadside assistance." } },
      { "@type": "Question", name: "How much does Tesla rental insurance cost?", acceptedAnswer: { "@type": "Answer", text: "Basic insurance is included at no extra cost with every Teslys rental. Premium coverage options start at $15/day and provide enhanced protection with lower or zero deductibles." } },
      { "@type": "Question", name: "Can I use my personal auto insurance for a Tesla rental?", acceptedAnswer: { "@type": "Answer", text: "Some personal auto insurance policies extend coverage to rental vehicles. However, Teslys includes its own insurance so you're always covered regardless of your personal policy status." } },
      { "@type": "Question", name: "What happens if the rental Tesla gets damaged?", acceptedAnswer: { "@type": "Answer", text: "If damage occurs, document it with photos and contact Teslys support immediately. Our insurance partner handles the claim process. With standard coverage, a deductible may apply. Premium coverage offers zero-deductible protection." } },
      { "@type": "Question", name: "Does Teslys offer insurance for Tesla owners who list their cars?", acceptedAnswer: { "@type": "Answer", text: "Yes. Tesla owners on the Teslys platform receive commercial rental insurance that covers their vehicle during every trip. This is separate from and in addition to the owner's personal auto insurance." } },
    ],
  };

  return (
    <div className="min-h-screen bg-background">
      <SEO
        title="Tesla Rental Insurance | Coverage & Protection | Teslys"
        description="Learn about Tesla rental insurance coverage with Teslys. Comprehensive liability, collision, and theft protection included with every rental. Premium plans available."
        canonical="https://teslys.app/tesla-rental-insurance"
        keywords="Tesla rental insurance, Tesla car rental coverage, rental car insurance Tesla, Tesla rental protection, EV rental insurance"
      />
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

      {/* Hero */}
      <section className="bg-gradient-to-b from-primary/5 to-background py-16 md:py-24">
        <div className="max-w-6xl mx-auto px-4">
          <Link to="/" className="inline-flex items-center gap-1 text-sm text-muted-foreground hover:text-foreground mb-6">
            <ArrowLeft className="h-4 w-4" /> Back to Home
          </Link>
          <h1 className="text-4xl md:text-5xl font-bold tracking-tight mb-4">
            Tesla Rental Insurance — Drive with Confidence
          </h1>
          <p className="text-xl text-muted-foreground max-w-2xl mb-8">
            Every Tesla rental through Teslys comes with comprehensive insurance coverage. Whether you're renting a Tesla or listing yours on our platform, you're fully protected from day one.
          </p>
          <div className="flex flex-wrap gap-3">
            <a href="https://teslys.app.eonrides.com/" target="_blank" rel="noopener noreferrer">
              <Button size="lg">Browse Available Teslas <ArrowRight className="ml-2 h-4 w-4" /></Button>
            </a>
            <Link to="/register/client">
              <Button variant="outline" size="lg"><Shield className="mr-2 h-4 w-4" /> List Your Tesla</Button>
            </Link>
          </div>
        </div>
      </section>

      {/* Coverage Types */}
      <section className="py-16 bg-background">
        <div className="max-w-6xl mx-auto px-4">
          <h2 className="text-3xl font-bold mb-3">What's Covered</h2>
          <p className="text-muted-foreground mb-8 max-w-2xl">
            Teslys partners with top-rated insurance providers to deliver rental protection that meets or exceeds industry standards. Here's what's included with every Tesla rental.
          </p>
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
            {[
              { title: "Liability Protection", desc: "Covers bodily injury and property damage to third parties. Meets or exceeds state minimum requirements in all 50 states." },
              { title: "Collision Coverage", desc: "Pays for damage to the rental Tesla from accidents, regardless of fault. Standard deductible applies; zero-deductible available with premium plans." },
              { title: "Comprehensive Coverage", desc: "Protects against theft, vandalism, weather damage, and other non-collision incidents during your rental period." },
              { title: "Uninsured Motorist", desc: "Covers you if you're involved in an accident with an uninsured or underinsured driver." },
              { title: "Roadside Assistance", desc: "24/7 roadside support including towing, flat tire assistance, lockout service, and mobile charging for your Tesla." },
              { title: "Personal Effects", desc: "Premium plans include coverage for personal belongings damaged or stolen from the rental vehicle." },
            ].map((c) => (
              <div key={c.title} className="bg-card border rounded-xl p-6">
                <CheckCircle className="h-6 w-6 text-primary mb-3" />
                <h3 className="text-lg font-semibold mb-2">{c.title}</h3>
                <p className="text-sm text-muted-foreground">{c.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Plans Comparison */}
      <section className="py-16 bg-muted/30">
        <div className="max-w-6xl mx-auto px-4">
          <h2 className="text-3xl font-bold mb-3">Insurance Plans</h2>
          <p className="text-muted-foreground mb-8">Choose the level of protection that works for you.</p>
          <div className="grid md:grid-cols-2 gap-6 max-w-4xl">
            <div className="bg-card border rounded-xl p-6">
              <h3 className="text-xl font-bold mb-2">Standard Coverage</h3>
              <div className="text-2xl font-bold text-primary mb-4">Included<span className="text-sm font-normal text-muted-foreground ml-1">with every rental</span></div>
              <ul className="space-y-3">
                {["Liability protection", "Collision coverage ($1,500 deductible)", "Comprehensive coverage", "Uninsured motorist protection"].map((f) => (
                  <li key={f} className="flex items-center gap-2 text-sm text-muted-foreground">
                    <CheckCircle className="w-4 h-4 text-primary shrink-0" /> {f}
                  </li>
                ))}
              </ul>
            </div>
            <div className="bg-card border-2 border-primary rounded-xl p-6 relative">
              <div className="absolute -top-3 right-4 bg-primary text-primary-foreground text-xs font-bold px-3 py-1 rounded-full">RECOMMENDED</div>
              <h3 className="text-xl font-bold mb-2">Premium Coverage</h3>
              <div className="text-2xl font-bold text-primary mb-4">$15<span className="text-sm font-normal text-muted-foreground">/day</span></div>
              <ul className="space-y-3">
                {["Everything in Standard", "Zero deductible", "24/7 roadside assistance", "Personal effects coverage", "Tire & windshield protection"].map((f) => (
                  <li key={f} className="flex items-center gap-2 text-sm text-muted-foreground">
                    <CheckCircle className="w-4 h-4 text-primary shrink-0" /> {f}
                  </li>
                ))}
              </ul>
            </div>
          </div>
        </div>
      </section>

      {/* For Owners */}
      <section className="py-16 bg-background">
        <div className="max-w-6xl mx-auto px-4">
          <h2 className="text-3xl font-bold mb-3">Insurance for Tesla Owners</h2>
          <p className="text-muted-foreground mb-8 max-w-3xl">
            When you list your Tesla on Teslys, your vehicle is protected by commercial rental insurance during every active trip. This coverage is separate from your personal auto policy and specifically designed for car-sharing.
          </p>
          <div className="grid sm:grid-cols-3 gap-6">
            {[
              { icon: Shield, title: "Commercial Coverage", desc: "Your Tesla is covered under a commercial rental policy during every active booking — from pickup to return." },
              { icon: FileText, title: "Damage Claims", desc: "If a renter causes damage, Teslys handles the entire claims process. Your personal insurance is not affected." },
              { icon: Phone, title: "Dedicated Support", desc: "Our team manages all insurance communications, documentation, and claim resolution on your behalf." },
            ].map((item) => (
              <div key={item.title} className="bg-card border rounded-xl p-6">
                <item.icon className="h-8 w-8 text-primary mb-3" />
                <h3 className="text-lg font-semibold mb-2">{item.title}</h3>
                <p className="text-sm text-muted-foreground">{item.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* FAQ */}
      <section className="py-16 bg-muted/30">
        <div className="max-w-6xl mx-auto px-4">
          <h2 className="text-3xl font-bold mb-8">Insurance FAQ</h2>
          <div className="space-y-4">
            {[
              { q: "Does Teslys include insurance with Tesla rentals?", a: "Yes. Every Tesla rental through Teslys includes comprehensive liability and collision coverage. This protects both the vehicle owner and the renter during the rental period." },
              { q: "What does Tesla rental insurance cover?", a: "Standard coverage includes liability protection, collision damage, comprehensive coverage for theft and weather damage, and uninsured/underinsured motorist protection. Premium plans add zero-deductible and roadside assistance." },
              { q: "How much does Tesla rental insurance cost?", a: "Basic insurance is included at no extra cost with every Teslys rental. Premium coverage options start at $15/day and provide enhanced protection with lower or zero deductibles." },
              { q: "Can I use my personal auto insurance for a Tesla rental?", a: "Some personal auto insurance policies extend coverage to rental vehicles. However, Teslys includes its own insurance so you're always covered regardless of your personal policy status." },
              { q: "What happens if the rental Tesla gets damaged?", a: "If damage occurs, document it with photos and contact Teslys support immediately. Our insurance partner handles the claim process. With standard coverage, a deductible may apply. Premium coverage offers zero-deductible protection." },
              { q: "Does Teslys offer insurance for Tesla owners who list their cars?", a: "Yes. Tesla owners on the Teslys platform receive commercial rental insurance that covers their vehicle during every trip. This is separate from and in addition to the owner's personal auto insurance." },
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
          <h2 className="text-3xl font-bold mb-4">Drive Protected. Rent or List with Confidence.</h2>
          <p className="text-lg opacity-90 mb-8">Every Tesla on Teslys is fully insured. Whether you're renting or earning, your peace of mind is included.</p>
          <div className="flex flex-wrap justify-center gap-3">
            <a href="https://teslys.app.eonrides.com/" target="_blank" rel="noopener noreferrer">
              <Button size="lg" variant="secondary">Rent a Tesla <ArrowRight className="ml-2 h-4 w-4" /></Button>
            </a>
            <Link to="/register/client">
              <Button size="lg" variant="outline" className="border-primary-foreground/30 text-primary-foreground hover:bg-primary-foreground/10">List Your Tesla</Button>
            </Link>
          </div>
        </div>
      </section>

      <section className="py-16 bg-background">
        <div className="max-w-2xl mx-auto px-4"><NewsletterSignup /></div>
      </section>

      <RelatedPages heading="Related Pages" />

      <footer className="border-t py-8">
        <div className="max-w-6xl mx-auto px-4 flex flex-wrap gap-4 text-sm text-muted-foreground">
          <Link to="/" className="hover:text-foreground">Home</Link>
          <Link to="/how-it-works" className="hover:text-foreground">How It Works</Link>
          <Link to="/tesla-rental-near-me" className="hover:text-foreground">Tesla Rental Near Me</Link>
          <Link to="/tesla-rental-cost" className="hover:text-foreground">Tesla Rental Cost</Link>
          <Link to="/tesla-monthly-rental" className="hover:text-foreground">Monthly Rental</Link>
          <Link to="/blog" className="hover:text-foreground">Blog</Link>
          <Link to="/faq" className="hover:text-foreground">FAQ</Link>
          <Link to="/privacy" className="hover:text-foreground">Privacy</Link>
          <Link to="/terms" className="hover:text-foreground">Terms</Link>
        </div>
      </footer>
    </div>
  );
}
