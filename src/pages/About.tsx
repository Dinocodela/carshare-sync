import { Link } from "react-router-dom";
import { SEO } from "@/components/SEO";
import { StructuredData } from "@/components/StructuredData";
import { Logo } from "@/components/ui/logo";
import { Button } from "@/components/ui/button";
import {
  ArrowLeft,
  ArrowRight,
  MapPin,
  Phone,
  Target,
  Heart,
  Zap,
  Shield,
} from "lucide-react";

const aboutJsonLd = {
  "@context": "https://schema.org",
  "@type": "AboutPage",
  name: "About Teslys",
  description:
    "Learn about Teslys — the premium Tesla car sharing platform connecting Tesla owners with professional hosts to generate passive income.",
  url: "https://teslys.app/about",
  mainEntity: {
    "@type": "Organization",
    name: "Teslys",
    url: "https://teslys.app",
    foundingDate: "2024",
    address: {
      "@type": "PostalAddress",
      streetAddress: "475 Washington Blvd",
      addressLocality: "Marina Del Rey",
      addressRegion: "CA",
      postalCode: "90292",
      addressCountry: "US",
    },
    telephone: "+13106990473",
    description:
      "Teslys is a car sharing management platform that connects Tesla owners with professional hosts who handle rentals, cleaning, and guest support.",
  },
};

const values = [
  {
    icon: Target,
    title: "Mission-Driven",
    description:
      "We believe every Tesla owner should have access to professional car sharing management — without the complexity.",
  },
  {
    icon: Shield,
    title: "Trust First",
    description:
      "Every host is vetted. Every vehicle is insured. We build relationships on transparency and reliability.",
  },
  {
    icon: Heart,
    title: "Community Focused",
    description:
      "We're creating a network of owners and hosts who support each other's success in the EV economy.",
  },
  {
    icon: Zap,
    title: "Innovation Forward",
    description:
      "From real-time analytics to seamless mobile management, we leverage technology to make car sharing effortless.",
  },
];

export default function About() {
  return (
    <>
      <SEO
        title="About Teslys — Tesla Car Sharing Platform"
        description="Teslys connects Tesla owners with professional hosts to generate passive income. Learn about our mission, values, and the team behind the platform."
        canonical="https://teslys.app/about"
        keywords="about Teslys, Tesla car sharing company, Tesla rental management, who is Teslys"
      />

      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(aboutJsonLd) }}
      />

      <StructuredData type="breadcrumblist" data={{ itemListElement: [
        { "@type": "ListItem", position: 1, name: "Home", item: "https://teslys.app/" },
        { "@type": "ListItem", position: 2, name: "About", item: "https://teslys.app/about" },
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
          <section className="bg-gradient-hero py-16 lg:py-24">
            <div className="max-w-3xl mx-auto px-4 text-center">
              <h1 className="text-3xl md:text-5xl font-bold text-foreground mb-4">
                About Teslys
              </h1>
              <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
                We're building the bridge between Tesla owners and professional hosts — making passive income from your Tesla simple, safe, and scalable.
              </p>
            </div>
          </section>

          {/* Story */}
          <section className="py-16">
            <div className="max-w-3xl mx-auto px-4">
              <h2 className="text-2xl md:text-3xl font-bold text-foreground mb-6">
                Our Story
              </h2>
              <div className="space-y-4 text-muted-foreground leading-relaxed">
                <p>
                  Teslys was born from a simple observation: thousands of Tesla owners want to earn money from their vehicles through car sharing platforms like Turo, but managing rentals is time-consuming and complex. On the other side, experienced car sharing hosts are looking for quality vehicles to add to their fleet.
                </p>
                <p>
                  We built Teslys to connect these two groups. Our platform lets Tesla owners list their vehicles and choose from a network of vetted, professional hosts who handle everything — from guest communication and vehicle cleaning to maintenance coordination and trip logistics.
                </p>
                <p>
                  Based in Marina Del Rey, California, we serve Tesla owners and hosts across major U.S. cities. Our mission is to make Tesla car sharing as effortless as possible while ensuring every vehicle is managed with professional-grade care.
                </p>
              </div>
            </div>
          </section>

          {/* Values */}
          <section className="py-16 bg-muted/30">
            <div className="max-w-4xl mx-auto px-4">
              <h2 className="text-2xl md:text-3xl font-bold text-foreground mb-10 text-center">
                Our Values
              </h2>
              <div className="grid md:grid-cols-2 gap-6">
                {values.map((v) => (
                  <div
                    key={v.title}
                    className="bg-card rounded-2xl p-6 border border-border/50 shadow-card flex gap-4"
                  >
                    <div className="shrink-0">
                      <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center">
                        <v.icon className="w-5 h-5 text-primary" />
                      </div>
                    </div>
                    <div>
                      <h3 className="text-base font-bold text-foreground mb-1">
                        {v.title}
                      </h3>
                      <p className="text-sm text-muted-foreground">
                        {v.description}
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </section>

          {/* Contact */}
          <section className="py-16">
            <div className="max-w-3xl mx-auto px-4 text-center">
              <h2 className="text-2xl font-bold text-foreground mb-4">
                Get in Touch
              </h2>
              <p className="text-muted-foreground mb-6">
                Have questions? We'd love to hear from you.
              </p>
              <div className="flex flex-col items-center gap-3 mb-8">
                <a
                  href="https://www.google.com/maps/search/?api=1&query=475+Washington+Blvd+Marina+Del+Rey+CA+90292"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center gap-2 text-muted-foreground hover:text-foreground transition-colors"
                >
                  <MapPin className="w-4 h-4 text-primary" />
                  475 Washington Blvd, Marina Del Rey, CA 90292
                </a>
                <a
                  href="tel:+13106990473"
                  className="inline-flex items-center gap-2 text-muted-foreground hover:text-foreground transition-colors"
                >
                  <Phone className="w-4 h-4 text-primary" />
                  (310) 699-0473
                </a>
              </div>
              <div className="flex gap-3 justify-center">
                <a href="mailto:support@teslys.com">
                  <Button className="rounded-xl">
                    Email Us <ArrowRight className="w-4 h-4 ml-1" />
                  </Button>
                </a>
                <Link to="/faq">
                  <Button variant="outline" className="rounded-xl">
                    View FAQ
                  </Button>
                </Link>
              </div>
            </div>
          </section>
        </main>

        {/* Footer */}
        <footer className="border-t border-border py-8">
          <div className="max-w-4xl mx-auto px-4 flex flex-col items-center gap-4">
            <Link to="/"><Logo className="h-6 opacity-80" /></Link>
            <nav className="flex flex-wrap justify-center gap-x-5 gap-y-2 text-xs text-muted-foreground">
              <Link to="/how-it-works" className="hover:text-foreground transition-colors">How It Works</Link>
              <Link to="/blog" className="hover:text-foreground transition-colors">Blog</Link>
              <Link to="/faq" className="hover:text-foreground transition-colors">FAQ</Link>
              <Link to="/privacy" className="hover:text-foreground transition-colors">Privacy</Link>
              <Link to="/terms" className="hover:text-foreground transition-colors">Terms</Link>
            </nav>
            <p className="text-xs text-muted-foreground/60">© {new Date().getFullYear()} Teslys. All rights reserved.</p>
          </div>
        </footer>
      </div>
    </>
  );
}
