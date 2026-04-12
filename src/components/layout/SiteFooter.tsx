import { Link } from "react-router-dom";
import { Logo } from "@/components/ui/logo";
import { MapPin, Phone, ArrowUpRight, Shield, Clock, Headphones, Instagram } from "lucide-react";

const navSections = [
  {
    title: "Platform",
    links: [
      { label: "How It Works", to: "/how-it-works" },
      { label: "Earnings Calculator", to: "/earnings-calculator" },
      { label: "Blog", to: "/blog" },
      { label: "About", to: "/about" },
    ],
  },
  {
    title: "Legal",
    links: [
      { label: "Privacy Policy", to: "/privacy" },
      { label: "Terms of Service", to: "/terms" },
      { label: "SMS Consent", to: "/sms-consent" },
    ],
  },
  {
    title: "Support",
    links: [
      { label: "FAQ", to: "/faq" },
      {
        label: "Email Us",
        href: "mailto:support@teslys.com?subject=Teslys%20Support%20Request",
      },
    ],
  },
];

const trustBadges = [
  { icon: Shield, label: "Fully Insured" },
  { icon: Clock, label: "24/7 Support" },
  { icon: Headphones, label: "Dedicated Manager" },
];

export function SiteFooter() {
  return (
    <footer className="relative w-full overflow-hidden">
      {/* Trust badges strip */}
      <div className="bg-charcoal">
        <div className="max-w-6xl mx-auto px-6 py-5 flex flex-wrap items-center justify-center gap-x-10 gap-y-3">
          {trustBadges.map((badge) => (
            <div
              key={badge.label}
              className="flex items-center gap-2.5 text-charcoal-foreground/80"
            >
              <badge.icon className="w-4 h-4 text-primary" />
              <span className="text-xs font-medium tracking-wide uppercase">
                {badge.label}
              </span>
            </div>
          ))}
        </div>
      </div>

      {/* Main footer */}
      <div className="bg-navy relative">
        {/* Top accent line */}
        <div className="absolute top-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-primary/30 to-transparent" />

        <div className="max-w-6xl mx-auto px-6 pt-16 pb-8">
          {/* Grid: brand + nav columns */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-12 gap-12 lg:gap-8 mb-14">
            {/* Brand column — wider */}
            <div className="lg:col-span-5 flex flex-col gap-5">
              <Link to="/" className="inline-block">
                <Logo size="sm" className="brightness-0 invert opacity-95" />
              </Link>
              <p className="text-sm text-navy-foreground/50 max-w-xs leading-relaxed">
                The premium Tesla car sharing management platform — connecting
                owners with vetted, professional hosts.
              </p>
              <div className="flex flex-col gap-2.5 mt-1">
                <a
                  href="https://www.google.com/maps/search/?api=1&query=475+Washington+Blvd+Marina+Del+Rey+CA+90292"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="group inline-flex items-center gap-2 text-sm text-navy-foreground/40 hover:text-navy-foreground/70 transition-colors"
                >
                  <MapPin className="w-3.5 h-3.5 shrink-0 text-primary/60 group-hover:text-primary transition-colors" />
                  475 Washington Blvd, Marina Del Rey, CA 90292
                </a>
                <a
                  href="tel:+13106990473"
                  className="group inline-flex items-center gap-2 text-sm text-navy-foreground/40 hover:text-navy-foreground/70 transition-colors"
                >
                  <Phone className="w-3.5 h-3.5 shrink-0 text-primary/60 group-hover:text-primary transition-colors" />
                  (310) 699-0473
                </a>
              </div>
              {/* Social */}
              <div className="flex items-center gap-3 mt-2">
                <a
                  href="https://www.instagram.com/teslysla"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="group flex items-center justify-center w-8 h-8 rounded-full border border-navy-foreground/10 hover:border-primary/40 transition-colors"
                  aria-label="Follow Teslys on Instagram"
                >
                  <Instagram className="w-4 h-4 text-navy-foreground/40 group-hover:text-primary transition-colors" />
                </a>
              </div>
            </div>

            {/* Nav columns */}
            {navSections.map((section) => (
              <div
                key={section.title}
                className="lg:col-span-2 flex flex-col gap-4"
              >
                <h4 className="text-[11px] font-semibold uppercase tracking-[0.2em] text-navy-foreground/30 mb-1">
                  {section.title}
                </h4>
                <ul className="flex flex-col gap-3">
                  {section.links.map((link) =>
                    "to" in link && link.to ? (
                      <li key={link.label}>
                        <Link
                          to={link.to}
                          className="text-sm text-navy-foreground/60 hover:text-navy-foreground transition-colors duration-200"
                        >
                          {link.label}
                        </Link>
                      </li>
                    ) : (
                      <li key={link.label}>
                        <a
                          href={(link as any).href}
                          className="group inline-flex items-center gap-1.5 text-sm text-navy-foreground/60 hover:text-navy-foreground transition-colors duration-200"
                        >
                          {link.label}
                          <ArrowUpRight className="w-3 h-3 opacity-0 group-hover:opacity-60 transition-opacity" />
                        </a>
                      </li>
                    )
                  )}
                </ul>
              </div>
            ))}
          </div>

          {/* Divider */}
          <div className="h-px bg-navy-foreground/8 mb-6" />

          {/* Bottom bar */}
          <div className="flex flex-col sm:flex-row items-center justify-between gap-3">
            <p className="text-xs text-navy-foreground/30">
              © {new Date().getFullYear()} Teslys Inc. All rights reserved.
            </p>
            <div className="flex items-center gap-1.5 text-xs text-navy-foreground/30">
              <span className="w-1.5 h-1.5 rounded-full bg-success animate-pulse" />
              All systems operational
            </div>
          </div>
        </div>
      </div>
    </footer>
  );
}
