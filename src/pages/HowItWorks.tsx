import { Link } from "react-router-dom";
import { SEO } from "@/components/SEO";
import { StructuredData } from "@/components/StructuredData";
import { Logo } from "@/components/ui/logo";
import { Button } from "@/components/ui/button";
import {
  ArrowLeft,
  ArrowRight,
  Car,
  Users,
  DollarSign,
  Shield,
  ClipboardCheck,
  Sparkles,
  MapPin,
  Phone,
} from "lucide-react";

const clientSteps = [
  {
    icon: ClipboardCheck,
    title: "Create Your Account",
    description:
      "Sign up as a client in under 2 minutes. Provide your basic info and Tesla details to get started.",
  },
  {
    icon: Car,
    title: "Add Your Tesla",
    description:
      "List your Tesla with photos, mileage, and location. Our team reviews your listing for quality.",
  },
  {
    icon: Users,
    title: "Choose Your Host",
    description:
      "Browse vetted, professional hosts in your area. Review ratings, services, and experience before selecting.",
  },
  {
    icon: DollarSign,
    title: "Earn Passive Income",
    description:
      "Your host handles everything — rentals, cleaning, guest support, and vehicle logistics. You sit back and earn.",
  },
];

const hostSteps = [
  {
    icon: ClipboardCheck,
    title: "Apply as Host",
    description:
      "Submit your application with your experience, services offered, and service area. Our team reviews every applicant.",
  },
  {
    icon: Shield,
    title: "Get Approved",
    description:
      "Once approved, you'll appear in our host directory. Vehicle owners in your area can select you to manage their Tesla.",
  },
  {
    icon: Sparkles,
    title: "Manage Vehicles",
    description:
      "Handle rentals, cleaning, guest coordination, and maintenance. Use the Teslys dashboard to track everything in one place.",
  },
  {
    icon: DollarSign,
    title: "Grow Your Business",
    description:
      "Earn commissions on every rental. The more vehicles you manage, the more you earn. Scale at your own pace.",
  },
];

const howToJsonLd = {
  "@context": "https://schema.org",
  "@type": "HowTo",
  name: "How to Earn Passive Income with Your Tesla on Teslys",
  description:
    "Step-by-step guide to listing your Tesla on Teslys and earning passive income through professional car sharing management.",
  step: clientSteps.map((s, i) => ({
    "@type": "HowToStep",
    position: i + 1,
    name: s.title,
    text: s.description,
  })),
};

export default function HowItWorks() {
  return (
    <>
      <SEO
        title="How It Works — Tesla Car Sharing with Teslys"
        description="Learn how Teslys makes it easy to earn passive income from your Tesla. List your car, choose a host, and start earning — we handle the rest."
        canonical="https://teslys.app/how-it-works"
        keywords="how Tesla car sharing works, rent out my Tesla, Tesla rental management process, Teslys how it works"
      />

      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(howToJsonLd) }}
      />

      <StructuredData type="breadcrumblist" data={{ itemListElement: [
        { "@type": "ListItem", position: 1, name: "Home", item: "https://teslys.app/" },
        { "@type": "ListItem", position: 2, name: "How It Works", item: "https://teslys.app/how-it-works" },
      ] }} />

      <div className="min-h-screen bg-background">
        {/* Header */}
        <header className="sticky top-0 z-50 bg-background/95 backdrop-blur border-b border-border">
          <div className="max-w-6xl mx-auto px-4 py-3 flex items-center justify-between">
            <div className="flex items-center gap-3">
              <Link to="/" className="text-muted-foreground hover:text-foreground transition">
                <ArrowLeft className="w-4 h-4" />
              </Link>
              <Link to="/"><Logo className="h-7" /></Link>
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
          <section className="bg-gradient-hero py-16 lg:py-24 text-center">
            <div className="max-w-3xl mx-auto px-4">
              <h1 className="text-3xl md:text-5xl font-bold text-foreground mb-4">
                How Teslys Works
              </h1>
              <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
                Whether you're a Tesla owner looking to earn or a professional host ready to grow, here's how Teslys makes it simple.
              </p>
            </div>
          </section>

          {/* For Owners */}
          <section className="py-16">
            <div className="max-w-4xl mx-auto px-4">
              <h2 className="text-2xl md:text-3xl font-bold text-foreground mb-2 text-center">
                For Tesla Owners
              </h2>
              <p className="text-muted-foreground text-center mb-10">
                Turn your Tesla into a money-making machine in 4 simple steps.
              </p>
              <div className="grid md:grid-cols-2 gap-6">
                {clientSteps.map((step, i) => (
                  <div
                    key={step.title}
                    className="bg-card rounded-2xl p-6 border border-border/50 shadow-card flex gap-4"
                  >
                    <div className="shrink-0">
                      <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center">
                        <step.icon className="w-5 h-5 text-primary" />
                      </div>
                    </div>
                    <div>
                      <div className="text-xs font-bold text-primary mb-1">
                        Step {i + 1}
                      </div>
                      <h3 className="text-base font-bold text-foreground mb-1">
                        {step.title}
                      </h3>
                      <p className="text-sm text-muted-foreground">
                        {step.description}
                      </p>
                    </div>
                  </div>
                ))}
              </div>
              <div className="text-center mt-8">
                <Link to="/register/client">
                  <Button size="lg" className="rounded-xl shadow-lg shadow-primary/20">
                    List My Tesla <ArrowRight className="w-4 h-4 ml-1" />
                  </Button>
                </Link>
              </div>
            </div>
          </section>

          {/* For Hosts */}
          <section className="py-16 bg-muted/30">
            <div className="max-w-4xl mx-auto px-4">
              <h2 className="text-2xl md:text-3xl font-bold text-foreground mb-2 text-center">
                For Professional Hosts
              </h2>
              <p className="text-muted-foreground text-center mb-10">
                Build a profitable car management business on the Teslys platform.
              </p>
              <div className="grid md:grid-cols-2 gap-6">
                {hostSteps.map((step, i) => (
                  <div
                    key={step.title}
                    className="bg-card rounded-2xl p-6 border border-border/50 shadow-card flex gap-4"
                  >
                    <div className="shrink-0">
                      <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center">
                        <step.icon className="w-5 h-5 text-primary" />
                      </div>
                    </div>
                    <div>
                      <div className="text-xs font-bold text-primary mb-1">
                        Step {i + 1}
                      </div>
                      <h3 className="text-base font-bold text-foreground mb-1">
                        {step.title}
                      </h3>
                      <p className="text-sm text-muted-foreground">
                        {step.description}
                      </p>
                    </div>
                  </div>
                ))}
              </div>
              <div className="text-center mt-8">
                <Link to="/register/host">
                  <Button size="lg" variant="outline" className="rounded-xl">
                    Apply as Host <ArrowRight className="w-4 h-4 ml-1" />
                  </Button>
                </Link>
              </div>
            </div>
          </section>

          {/* FAQ-lite */}
          <section className="py-16">
            <div className="max-w-3xl mx-auto px-4 text-center">
              <h2 className="text-2xl font-bold text-foreground mb-4">
                Still Have Questions?
              </h2>
              <p className="text-muted-foreground mb-6">
                Check our comprehensive FAQ or reach out to our support team.
              </p>
              <div className="flex gap-3 justify-center">
                <Link to="/faq">
                  <Button variant="outline" className="rounded-xl">
                    View FAQ
                  </Button>
                </Link>
                <a href="mailto:support@teslys.com">
                  <Button variant="outline" className="rounded-xl">
                    Contact Support
                  </Button>
                </a>
              </div>
            </div>
          </section>
        </main>

        {/* Footer */}
        <footer className="border-t border-border py-8">
          <div className="max-w-4xl mx-auto px-4 flex flex-col items-center gap-4">
            <Link to="/"><Logo className="h-6 opacity-80" /></Link>
            <nav className="flex flex-wrap justify-center gap-x-5 gap-y-2 text-xs text-muted-foreground">
              <Link to="/about" className="hover:text-foreground transition-colors">About</Link>
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
        </footer>
      </div>
    </>
  );
}
