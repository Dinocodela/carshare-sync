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
  CheckCircle,
  Calculator,
  MapPin,
  Zap,
  Shield,
  Clock,
  FileText,
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

export default function TeslaRentalNearMe() {
  const faqJsonLd = {
    "@context": "https://schema.org",
    "@type": "FAQPage",
    mainEntity: [
      { "@type": "Question", name: "How much does it cost to rent a Tesla?", acceptedAnswer: { "@type": "Answer", text: "Tesla rental rates vary by model and duration. A Model 3 starts at $85/day, Model Y at $110/day, and Model X at $155/day. Weekly and monthly discounts of up to 40% are available." } },
      { "@type": "Question", name: "Is insurance included with a Tesla rental?", acceptedAnswer: { "@type": "Answer", text: "Yes. Every Tesla rental through Teslys includes comprehensive insurance coverage. Additional premium coverage options are also available for full peace of mind." } },
      { "@type": "Question", name: "Is there a mileage limit on Tesla rentals?", acceptedAnswer: { "@type": "Answer", text: "Most Tesla rentals include 200–250 miles per day. Unlimited mileage packages are available for weekly and monthly bookings. Excess mileage is charged at a per-mile rate." } },
      { "@type": "Question", name: "Can I get a Tesla delivered to me?", acceptedAnswer: { "@type": "Answer", text: "Absolutely. Teslys offers doorstep delivery and pickup in most major cities. Your Tesla can be delivered to your home, office, hotel, or airport." } },
      { "@type": "Question", name: "Where can I charge a rental Tesla?", acceptedAnswer: { "@type": "Answer", text: "You can charge at any of 50,000+ Tesla Superchargers across the U.S. or at public charging stations. Each Tesla comes with a charging guide and the Supercharger network is built into the navigation system." } },
      { "@type": "Question", name: "How quickly can I get a Tesla rental?", acceptedAnswer: { "@type": "Answer", text: "Same-day rentals are available in many cities. Browse available Tesla vehicles near you, complete a quick verification, and your car can be ready within hours." } },
    ],
  };

  return (
    <div className="min-h-screen bg-background">
      <SEO
        title="Tesla Rental Near Me | Rent a Tesla Today | Teslys"
        description="Rent a Tesla near you with Teslys. Browse Model 3, Model Y, and Model X vehicles. Daily, weekly, and monthly rates with delivery to your door."
      />
      <JsonLd data={faqJsonLd} />

      {/* Nav */}
      <nav className="border-b border-border/50 bg-background/95 backdrop-blur sticky top-0 z-50">
        <div className="max-w-6xl mx-auto px-4 py-3 flex items-center justify-between">
          <Link to="/" className="flex items-center gap-2"><Logo className="h-7 w-auto" /></Link>
          <div className="flex items-center gap-3">
            <Link to="/login"><Button variant="ghost" size="sm">Log in</Button></Link>
            <Link to="/get-started"><Button size="sm">Get Started</Button></Link>
          </div>
        </div>
      </nav>

      {/* Hero — CTA above the fold */}
      <section className="bg-gradient-to-b from-primary/5 to-background py-16 md:py-24">
        <div className="max-w-6xl mx-auto px-4">
          <Link to="/" className="inline-flex items-center gap-1 text-sm text-muted-foreground hover:text-foreground mb-6">
            <ArrowLeft className="h-4 w-4" /> Back to Home
          </Link>
          <h1 className="text-4xl md:text-5xl font-bold tracking-tight mb-4">
            Tesla Rental Near Me — Find and Rent a Tesla Today
          </h1>
          <p className="text-xl text-muted-foreground max-w-2xl mb-8">
            Looking to rent a Tesla? Teslys makes it easy to browse available Tesla vehicles in your area, choose your preferred model, and get it delivered straight to your door. No dealership visits, no long lines — just a premium electric car rental experience.
          </p>
          <div className="flex flex-wrap gap-3">
            <a href="https://teslys.app.eonrides.com/" target="_blank" rel="noopener noreferrer">
              <Button size="lg">Browse Available Teslas <ArrowRight className="ml-2 h-4 w-4" /></Button>
            </a>
            <Link to="/earnings-calculator">
              <Button variant="outline" size="lg"><Calculator className="mr-2 h-4 w-4" /> Earnings Calculator</Button>
            </Link>
          </div>
        </div>
      </section>

      {/* Available Tesla Models */}
      <section className="py-16 bg-background">
        <div className="max-w-6xl mx-auto px-4">
          <h2 className="text-3xl font-bold mb-3">Available Tesla Models for Rent</h2>
          <p className="text-muted-foreground mb-8 max-w-2xl">
            Whether you need an affordable daily driver or a luxury SUV, our fleet of Tesla vehicles has you covered. Every car rental includes insurance, charging access, and 24/7 roadside assistance.
          </p>
          <div className="grid md:grid-cols-3 gap-6">
            {[
              { model: "Model 3", daily: "$85", desc: "The most affordable way to rent a Tesla. Perfect for city driving with 350+ miles of range and access to Tesla Superchargers nationwide.", link: "/tesla-model-3-rental-income-los-angeles" },
              { model: "Model Y", daily: "$110", desc: "A versatile electric SUV with room for five. Great for road trips, family outings, and anyone who wants extra cargo space.", link: "/tesla-model-y-rental-income-los-angeles" },
              { model: "Model X", daily: "$155", desc: "The premium Tesla experience with falcon-wing doors, three rows of seating, and up to 340 miles of range. Ideal for luxury car rental seekers.", link: "/tesla-model-x-rental" },
            ].map((m) => (
              <Link key={m.model} to={m.link} className="bg-card border rounded-xl p-6 hover:border-primary transition-colors group">
                <Car className="h-8 w-8 text-primary mb-3" />
                <h3 className="text-xl font-bold mb-1">Tesla {m.model}</h3>
                <div className="text-2xl font-bold text-primary mb-2">{m.daily}<span className="text-sm font-normal text-muted-foreground">/day</span></div>
                <p className="text-sm text-muted-foreground">{m.desc}</p>
              </Link>
            ))}
          </div>
        </div>
      </section>

      {/* Pricing Options */}
      <section className="py-16 bg-muted/30">
        <div className="max-w-6xl mx-auto px-4">
          <h2 className="text-3xl font-bold mb-3">Flexible Pricing Options</h2>
          <p className="text-muted-foreground mb-8">Save more with longer rentals. Check out our <Link to="/tesla-rental-cost" className="text-primary underline underline-offset-2">detailed rental cost breakdown</Link> for all models.</p>
          <div className="overflow-x-auto">
            <table className="w-full border-collapse bg-card rounded-xl border">
              <thead>
                <tr className="border-b">
                  <th className="text-left py-4 px-4 font-semibold">Model</th>
                  <th className="text-left py-4 px-4 font-semibold">Daily Rate</th>
                  <th className="text-left py-4 px-4 font-semibold">Weekly Rate</th>
                  <th className="text-left py-4 px-4 font-semibold">Monthly Rate</th>
                </tr>
              </thead>
              <tbody>
                {[
                  ["Model 3", "$85/day", "$500/week (16% off)", "$1,800/mo (40% off)"],
                  ["Model Y", "$110/day", "$660/week (14% off)", "$2,400/mo (35% off)"],
                  ["Model X", "$155/day", "$930/week (14% off)", "$3,600/mo (30% off)"],
                ].map(([model, daily, weekly, monthly]) => (
                  <tr key={model} className="border-b last:border-0 hover:bg-muted/50">
                    <td className="py-3 px-4 font-medium">{model}</td>
                    <td className="py-3 px-4 text-muted-foreground">{daily}</td>
                    <td className="py-3 px-4 text-muted-foreground">{weekly}</td>
                    <td className="py-3 px-4 text-primary font-medium">{monthly}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          <p className="text-sm text-muted-foreground mt-4">
            Looking for a <Link to="/tesla-monthly-rental" className="text-primary underline underline-offset-2">monthly Tesla rental</Link>? Long-term rates include additional perks like unlimited mileage and priority support.
          </p>
        </div>
      </section>

      {/* How It Works */}
      <section className="py-16 bg-background">
        <div className="max-w-6xl mx-auto px-4">
          <h2 className="text-3xl font-bold mb-8">How It Works</h2>
          <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {[
              { icon: MapPin, step: "1", title: "Browse Nearby", desc: "Search for available Tesla vehicles in your city. Filter by model, price, and availability." },
              { icon: CheckCircle, step: "2", title: "Quick Verification", desc: "Complete a fast identity and license check. Most verifications are approved within minutes." },
              { icon: Car, step: "3", title: "Pick Up or Delivery", desc: "Choose self-pickup or doorstep delivery. Your Tesla arrives fully charged and ready to drive." },
              { icon: Zap, step: "4", title: "Drive & Charge", desc: "Hit the road with access to 50,000+ Tesla Superchargers and charging stations across the country." },
            ].map((s) => (
              <div key={s.step} className="relative bg-card border rounded-xl p-6">
                <div className="absolute -top-3 -left-3 h-8 w-8 rounded-full bg-primary text-primary-foreground flex items-center justify-center text-sm font-bold">{s.step}</div>
                <s.icon className="h-8 w-8 text-primary mb-3" />
                <h3 className="text-lg font-semibold mb-2">{s.title}</h3>
                <p className="text-sm text-muted-foreground">{s.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Charging & Tesla Superchargers */}
      <section className="py-16 bg-muted/30">
        <div className="max-w-6xl mx-auto px-4">
          <h2 className="text-3xl font-bold mb-3">Charging Your Rental Tesla</h2>
          <p className="text-muted-foreground mb-8 max-w-3xl">
            One of the biggest advantages of renting a Tesla is access to the Tesla Supercharger network — the largest and fastest EV charging network in the United States. With over 50,000 charging stations, you'll never worry about range.
          </p>
          <div className="grid md:grid-cols-3 gap-6">
            {[
              { title: "Tesla Superchargers", desc: "Add up to 200 miles of range in just 15 minutes at any Supercharger station. Locations are built into the car's navigation system for effortless trip planning." },
              { title: "Public Charging Stations", desc: "Every rental Tesla also works with thousands of third-party charging stations via adapters included with the vehicle. Charge at hotels, malls, and parking garages." },
              { title: "Range by Model", desc: "Model 3: 350+ miles. Model Y: 310+ miles. Model X: 340+ miles. Most renters charge once every 2–3 days with normal city driving." },
            ].map((c) => (
              <div key={c.title} className="bg-card border rounded-xl p-6">
                <Zap className="h-6 w-6 text-primary mb-3" />
                <h3 className="text-lg font-semibold mb-2">{c.title}</h3>
                <p className="text-sm text-muted-foreground">{c.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Terms & Conditions Overview */}
      <section className="py-16 bg-background">
        <div className="max-w-6xl mx-auto px-4">
          <h2 className="text-3xl font-bold mb-8">Rental Terms at a Glance</h2>
          <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {[
              { icon: Shield, title: "Insurance Included", desc: "Comprehensive coverage included with every booking. Optional premium plans available." },
              { icon: Clock, title: "Mileage Policy", desc: "200–250 miles/day included. Unlimited mileage on weekly and monthly plans." },
              { icon: FileText, title: "Age & License", desc: "Minimum age 21. Valid driver's license and clean driving record required." },
              { icon: CheckCircle, title: "Cancellation", desc: "Free cancellation up to 24 hours before pickup. Full refund, no questions asked." },
            ].map((t) => (
              <div key={t.title} className="bg-card border rounded-xl p-6">
                <t.icon className="h-6 w-6 text-primary mb-3" />
                <h3 className="text-lg font-semibold mb-2">{t.title}</h3>
                <p className="text-sm text-muted-foreground">{t.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* FAQ */}
      <section className="py-16 bg-muted/30">
        <div className="max-w-6xl mx-auto px-4">
          <h2 className="text-3xl font-bold mb-8">Frequently Asked Questions</h2>
          <div className="space-y-4">
            {[
              { q: "How much does it cost to rent a Tesla?", a: "Tesla rental rates vary by model and duration. A Model 3 starts at $85/day, Model Y at $110/day, and Model X at $155/day. Weekly and monthly discounts of up to 40% are available." },
              { q: "Is insurance included with a Tesla rental?", a: "Yes. Every Tesla rental through Teslys includes comprehensive insurance coverage. Additional premium coverage options are also available for full peace of mind." },
              { q: "Is there a mileage limit on Tesla rentals?", a: "Most Tesla rentals include 200–250 miles per day. Unlimited mileage packages are available for weekly and monthly bookings. Excess mileage is charged at a per-mile rate." },
              { q: "Can I get a Tesla delivered to me?", a: "Absolutely. Teslys offers doorstep delivery and pickup in most major cities. Your Tesla can be delivered to your home, office, hotel, or airport." },
              { q: "Where can I charge a rental Tesla?", a: "You can charge at any of 50,000+ Tesla Superchargers across the U.S. or at public charging stations. Each Tesla comes with a charging guide and the Supercharger network is built into the navigation system." },
              { q: "How quickly can I get a Tesla rental?", a: "Same-day rentals are available in many cities. Browse available Tesla vehicles near you, complete a quick verification, and your car can be ready within hours." },
            ].map((faq) => (
              <div key={faq.q} className="bg-card border rounded-lg p-6">
                <h3 className="text-lg font-semibold mb-2">{faq.q}</h3>
                <p className="text-muted-foreground">{faq.a}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Bottom CTA */}
      <section className="py-16 bg-primary text-primary-foreground">
        <div className="max-w-4xl mx-auto px-4 text-center">
          <h2 className="text-3xl font-bold mb-4">Ready to Rent a Tesla Near You?</h2>
          <p className="text-lg opacity-90 mb-8">Browse available Tesla vehicles, compare prices, and get your car delivered today. The easiest way to experience electric driving.</p>
          <div className="flex flex-wrap justify-center gap-3">
            <a href="https://teslys.app.eonrides.com/" target="_blank" rel="noopener noreferrer">
              <Button size="lg" variant="secondary">Browse Teslas Near Me <ArrowRight className="ml-2 h-4 w-4" /></Button>
            </a>
          </div>
        </div>
      </section>

      {/* Newsletter */}
      <section className="py-16 bg-background">
        <div className="max-w-2xl mx-auto px-4"><NewsletterSignup /></div>
      </section>

      {/* Earn CTA */}
      <section className="py-12 bg-muted/30">
        <div className="max-w-4xl mx-auto px-4 text-center">
          <h2 className="text-2xl font-bold mb-3">Own a Tesla? Earn Passive Income</h2>
          <p className="text-muted-foreground mb-6">List your Tesla on Teslys and let professional hosts manage everything while you earn up to $2,000+/month.</p>
          <Link to="/register/client"><Button variant="outline" size="lg">Start Earning <ArrowRight className="ml-2 h-4 w-4" /></Button></Link>
        </div>
      </section>

      <RelatedPages heading="Explore More" />

      {/* Footer */}
      <footer className="border-t py-8">
        <div className="max-w-6xl mx-auto px-4 flex flex-wrap gap-4 text-sm text-muted-foreground">
          <Link to="/" className="hover:text-foreground">Home</Link>
          <Link to="/how-it-works" className="hover:text-foreground">How It Works</Link>
          <Link to="/tesla-rental-cost" className="hover:text-foreground">Tesla Rental Cost</Link>
          <Link to="/tesla-monthly-rental" className="hover:text-foreground">Monthly Rental</Link>
          <Link to="/earnings-calculator" className="hover:text-foreground">Earnings Calculator</Link>
          <Link to="/tesla-cybertruck-rental" className="hover:text-foreground">Cybertruck Rental</Link>
          <Link to="/tesla-model-x-rental" className="hover:text-foreground">Model X Rental</Link>
          <Link to="/blog" className="hover:text-foreground">Blog</Link>
          <Link to="/faq" className="hover:text-foreground">FAQ</Link>
          <Link to="/privacy" className="hover:text-foreground">Privacy</Link>
          <Link to="/terms" className="hover:text-foreground">Terms</Link>
        </div>
      </footer>
    </div>
  );
}
