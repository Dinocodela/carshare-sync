import { Link } from "react-router-dom";
import { SEO } from "@/components/SEO";
import { MarketplaceDisclosure } from "@/components/marketing/MarketplaceDisclosure";
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
      { "@type": "Question", name: "Who provides protection for Teslas managed by Teslys?", acceptedAnswer: { "@type": "Answer", text: "Teslys is a vehicle management and co-hosting service, not an insurer. Trip protection is provided by the third-party car-sharing marketplace a trip is booked on, such as Turo or Eon, subject to that platform's terms, limits, and deductibles." } },
      { "@type": "Question", name: "What does marketplace trip protection typically cover?", acceptedAnswer: { "@type": "Answer", text: "Marketplace protection plans typically address liability, physical damage to the vehicle during a trip, and related deductibles. Exact coverage, limits, exclusions, and deductibles are set by the marketplace and can change; review the platform terms before each trip." } },
      { "@type": "Question", name: "What deductibles apply on the marketplaces Teslys works with?", acceptedAnswer: { "@type": "Answer", text: "At the time of writing, trips booked through Eon carry a $0 owner deductible and trips booked through Turo carry a $250 owner deductible. These figures are set by the marketplaces and are subject to change under their terms." } },
      { "@type": "Question", name: "Do I still need my own auto insurance as an owner?", acceptedAnswer: { "@type": "Answer", text: "Yes. Owners must maintain the insurance they are legally required to carry and should disclose commercial car-sharing use to their insurer where required. Marketplace protection applies only during qualifying trips, per platform terms." } },
      { "@type": "Question", name: "What happens if a managed Tesla is damaged during a trip?", acceptedAnswer: { "@type": "Answer", text: "Document the damage with photos and contact Teslys support. We coordinate the claim with the marketplace on the owner's behalf. Any recovery, deductible, and outcome are determined by the marketplace under its terms; Teslys does not guarantee a result." } },
      { "@type": "Question", name: "Does Teslys sell insurance to Tesla owners?", acceptedAnswer: { "@type": "Answer", text: "No. Teslys does not underwrite, issue, or guarantee insurance. Owners can obtain commercial car-sharing coverage separately through providers such as Bonzah, whose terms and eligibility are set by the insurer." } },
    ],
  };

  return (
    <div className="min-h-screen bg-background">
      <SEO
        title="Tesla Car-Sharing Protection Explained | Teslys"
        description="How protection works for Teslas managed by Teslys. Trip protection is provided by third-party car-sharing marketplaces such as Turo and Eon, subject to their terms."
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
            Tesla Car-Sharing Protection — How It Works
          </h1>
          <p className="text-xl text-muted-foreground max-w-2xl mb-8">
            Teslys is a vehicle management and co-hosting service, not an insurance company. Bookings and trip protection are handled by third-party car-sharing marketplaces such as Turo and Eon, subject to their terms.
          </p>
          <div className="flex flex-wrap gap-3">
            <a href="https://app.eonrides.com/" target="_blank" rel="noopener noreferrer">
              <Button size="lg">Browse Available Teslas <ArrowRight className="ml-2 h-4 w-4" /></Button>
            </a>
            <Link to="/register/client">
              <Button variant="outline" size="lg"><Shield className="mr-2 h-4 w-4" /> List Your Tesla</Button>
            </Link>
          </div>
        </div>
      </section>

      <section className="bg-muted/30 border-y border-border">
        <div className="max-w-6xl mx-auto px-4 py-6">
          <MarketplaceDisclosure />
        </div>
      </section>


      {/* Coverage Types */}
      <section className="py-16 bg-background">
        <div className="max-w-6xl mx-auto px-4">
          <h2 className="text-3xl font-bold mb-3">What's Covered</h2>
          <p className="text-muted-foreground mb-8 max-w-2xl">
            Marketplaces typically address the categories below during a qualifying trip. Coverage, limits, exclusions, and deductibles are defined by the marketplace and can change — always review the platform's current terms.
          </p>
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
            {[
              { title: "Liability", desc: "Marketplace liability protection may apply to third-party injury or property damage during a qualifying trip, per platform terms." },
              { title: "Physical Damage", desc: "Damage to the vehicle during a qualifying trip may be addressed by the marketplace plan. Deductibles vary by platform." },
              { title: "Theft & Vandalism", desc: "Some marketplace plans address theft, vandalism, and non-collision incidents during a trip. Check the platform terms." },
              { title: "Uninsured Motorist", desc: "Availability of uninsured or underinsured motorist protection depends on the marketplace plan and state." },
              { title: "Roadside Assistance", desc: "Roadside support during trips is generally provided by the marketplace; Teslys coordinates on the owner's behalf." },
              { title: "Owner Policy", desc: "Owners must keep the insurance they are legally required to carry and disclose commercial car-sharing use where required." },
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
          <h2 className="text-3xl font-bold mb-3">Marketplace Deductibles</h2>
          <p className="text-muted-foreground mb-8">Owner deductibles are set by the marketplace a trip is booked on and are subject to change under that platform's terms.</p>
          <div className="grid md:grid-cols-2 gap-6 max-w-4xl">
            <div className="bg-card border rounded-xl p-6">
              <h3 className="text-xl font-bold mb-2">Eon</h3>
              <div className="text-2xl font-bold text-primary mb-4">$0<span className="text-sm font-normal text-muted-foreground ml-1">owner deductible</span></div>
              <ul className="space-y-3">
                {["Protection provided by Eon, per its terms", "70/30 gross revenue split with the marketplace", "Claims coordinated by Teslys on your behalf", "Terms and limits set by Eon and subject to change"].map((f) => (
                  <li key={f} className="flex items-center gap-2 text-sm text-muted-foreground">
                    <CheckCircle className="w-4 h-4 text-primary shrink-0" /> {f}
                  </li>
                ))}
              </ul>
            </div>
            <div className="bg-card border-2 border-primary rounded-xl p-6 relative">
              
              <h3 className="text-xl font-bold mb-2">Turo</h3>
              <div className="text-2xl font-bold text-primary mb-4">$250<span className="text-sm font-normal text-muted-foreground ml-1">owner deductible</span></div>
              <ul className="space-y-3">
                {["Protection provided by Turo, per its terms", "70/30 gross revenue split with the marketplace", "Claims coordinated by Teslys on your behalf", "Terms and limits set by Turo and subject to change"].map((f) => (
                  <li key={f} className="flex items-center gap-2 text-sm text-muted-foreground">
                    <CheckCircle className="w-4 h-4 text-primary shrink-0" /> {f}
                  </li>
                ))}
              </ul>
            </div>
          </div>
        </div>
      </section>

      {/* Bonzah Partnership */}
      <section className="py-16 bg-background">
        <div className="max-w-6xl mx-auto px-4">
          <div className="bg-card border-2 border-primary/20 rounded-2xl p-8 md:p-10 max-w-4xl mx-auto">
            <div className="flex items-center gap-2 mb-4">
              <Shield className="h-6 w-6 text-primary" />
              <span className="text-xs font-semibold uppercase tracking-wider text-primary">Insurance Partner</span>
            </div>
            <h2 className="text-3xl font-bold mb-3">Optional Coverage Through Bonzah</h2>
            <p className="text-muted-foreground mb-6 max-w-2xl">
              Bonzah offers commercial car-sharing coverage that owners and hosts can purchase directly. Coverage, eligibility, limits, and claim decisions are determined and underwritten by Bonzah — Teslys is not an insurer, agent, or underwriter and does not guarantee coverage.
            </p>
            <div className="grid sm:grid-cols-3 gap-6 mb-8">
              {[
                { title: "Commercial Policy", desc: "Bonzah offers commercial car-sharing policies that owners can purchase directly, subject to underwriting." },
                { title: "Damage Claims", desc: "Teslys can help coordinate documentation; claim decisions rest with the insurer or marketplace." },
                { title: "Direct Bookings", desc: "Hosts arranging bookings outside a marketplace can explore coverage options directly with Bonzah." },
              ].map((item) => (
                <div key={item.title}>
                  <h3 className="text-sm font-semibold mb-1">{item.title}</h3>
                  <p className="text-sm text-muted-foreground">{item.desc}</p>
                </div>
              ))}
            </div>
            <div className="bg-muted/50 rounded-xl p-6 border border-border">
              <h3 className="text-lg font-semibold mb-2">Get Set Up with Bonzah</h3>
              <p className="text-sm text-muted-foreground mb-4">
                Contact a Bonzah agent to discuss commercial car-sharing coverage options for your Tesla fleet.
              </p>
              <div className="flex flex-col sm:flex-row gap-4 text-sm">
                <div>
                  <span className="text-muted-foreground">Agent:</span>{" "}
                  <span className="font-medium text-foreground">Brandon Rockow</span>
                </div>
                <a href="tel:+15157266924" className="inline-flex items-center gap-1.5 text-primary hover:underline">
                  <Phone className="w-3.5 h-3.5" /> (515) 726-6924
                </a>
                <a href="tel:+15154445669" className="inline-flex items-center gap-1.5 text-primary hover:underline">
                  <Phone className="w-3.5 h-3.5" /> (515) 444-5669
                </a>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* For Owners */}
      <section className="py-16 bg-muted/30">
        <div className="max-w-6xl mx-auto px-4">
          <h2 className="text-3xl font-bold mb-3">What Owners Should Know</h2>
          <p className="text-muted-foreground mb-8 max-w-3xl">
            When Teslys manages your Tesla, the vehicle is listed on third-party car-sharing marketplaces. Trip protection is provided by those marketplaces under their terms, and owners must continue to maintain the insurance they are legally required to carry.
          </p>
          <div className="grid sm:grid-cols-3 gap-6">
            {[
              { icon: Shield, title: "Marketplace protection", desc: "Protection during a trip is provided by the applicable marketplace, subject to its terms, limits, and deductibles." },
              { icon: FileText, title: "Claim Coordination", desc: "If damage occurs, Teslys coordinates documentation and filing with the marketplace. Outcomes are decided by the platform or insurer." },
              { icon: Phone, title: "Dedicated Support", desc: "Our team manages communications and paperwork on your behalf throughout the process." },
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
          <h2 className="text-3xl font-bold mb-8">Protection FAQ</h2>
          <div className="space-y-4">
            {[
              { q: "Does Teslys provide insurance?", a: "No. Teslys is a vehicle management and co-hosting service, not an insurer. Trip protection is provided by the third-party marketplace a trip is booked on, subject to its terms." },
              { q: "What does marketplace protection typically cover?", a: "Plans generally address liability and physical damage during a qualifying trip. Exact coverage, limits, exclusions, and deductibles are set by the marketplace and can change." },
              { q: "What deductible applies to my vehicle?", a: "At the time of writing, Eon trips carry a $0 owner deductible and Turo trips carry a $250 owner deductible. These are set by the marketplaces and subject to change." },
              { q: "Do I still need my own policy?", a: "Yes. Owners must maintain legally required insurance and should disclose commercial car-sharing use to their insurer where required." },
              { q: "What happens if the Tesla is damaged during a trip?", a: "Document it with photos and contact Teslys support. We coordinate the claim with the marketplace; the platform or insurer determines the outcome and any deductible." },
              { q: "Can I buy additional coverage?", a: "Owners can explore commercial car-sharing coverage directly with providers such as Bonzah. Eligibility and terms are set by the insurer, not by Teslys." },
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
          <h2 className="text-3xl font-bold mb-4">Know Exactly How Protection Works</h2>
          <p className="text-lg opacity-90 mb-8">Teslys manages your Tesla; bookings and trip protection are handled by third-party car-sharing marketplaces under their terms.</p>
          <div className="flex flex-wrap justify-center gap-3">
            <a href="https://app.eonrides.com/" target="_blank" rel="noopener noreferrer">
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
          <Link to="/faq" className="hover:text-foreground">FAQ</Link>
          <Link to="/privacy" className="hover:text-foreground">Privacy</Link>
          <Link to="/terms" className="hover:text-foreground">Terms</Link>
        </div>
      </footer>
    </div>
  );
}
