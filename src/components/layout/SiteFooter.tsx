import { Link } from "react-router-dom";
import { Logo } from "@/components/ui/logo";
import { MapPin, Phone, ArrowUpRight } from "lucide-react";

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

export function SiteFooter() {
  return (
    <footer className="relative w-full border-t border-border/40 bg-navy text-navy-foreground overflow-hidden">
      {/* Subtle gradient glow */}
      <div className="absolute -top-px left-0 right-0 h-px bg-gradient-to-r from-transparent via-primary/40 to-transparent" />
      <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[600px] h-[200px] bg-primary/5 rounded-full blur-[120px] pointer-events-none" />

      <div className="relative max-w-6xl mx-auto px-6 pt-14 pb-8">
        {/* Top row: brand + nav columns */}
        <div className="grid grid-cols-2 md:grid-cols-5 gap-10 md:gap-8 mb-12">
          {/* Brand column */}
          <div className="col-span-2 flex flex-col gap-4">
            <Link to="/">
              <Logo className="h-8 brightness-0 invert opacity-90" />
            </Link>
            <p className="text-sm text-navy-foreground/60 max-w-xs leading-relaxed">
              The premium Tesla car sharing management platform — connecting
              owners with professional hosts.
            </p>
            {/* Contact info */}
            <div className="flex flex-col gap-2 mt-2">
              <a
                href="https://www.google.com/maps/search/?api=1&query=475+Washington+Blvd+Marina+Del+Rey+CA+90292"
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-2 text-sm text-navy-foreground/50 hover:text-navy-foreground/80 transition-colors"
              >
                <MapPin className="w-3.5 h-3.5 shrink-0" />
                475 Washington Blvd, Marina Del Rey, CA 90292
              </a>
              <a
                href="tel:+13106990473"
                className="inline-flex items-center gap-2 text-sm text-navy-foreground/50 hover:text-navy-foreground/80 transition-colors"
              >
                <Phone className="w-3.5 h-3.5 shrink-0" />
                (310) 699-0473
              </a>
            </div>
          </div>

          {/* Nav columns */}
          {navSections.map((section) => (
            <div key={section.title} className="flex flex-col gap-3">
              <h4 className="text-xs font-semibold uppercase tracking-widest text-navy-foreground/40">
                {section.title}
              </h4>
              <ul className="flex flex-col gap-2.5">
                {section.links.map((link) =>
                  "to" in link && link.to ? (
                    <li key={link.label}>
                      <Link
                        to={link.to}
                        className="text-sm text-navy-foreground/70 hover:text-navy-foreground transition-colors"
                      >
                        {link.label}
                      </Link>
                    </li>
                  ) : (
                    <li key={link.label}>
                      <a
                        href={(link as any).href}
                        className="inline-flex items-center gap-1 text-sm text-navy-foreground/70 hover:text-navy-foreground transition-colors"
                      >
                        {link.label}
                        <ArrowUpRight className="w-3 h-3 opacity-50" />
                      </a>
                    </li>
                  )
                )}
              </ul>
            </div>
          ))}
        </div>

        {/* Bottom bar */}
        <div className="border-t border-navy-foreground/10 pt-6 flex flex-col sm:flex-row items-center justify-between gap-3">
          <p className="text-xs text-navy-foreground/40">
            © {new Date().getFullYear()} Teslys. All rights reserved.
          </p>
          <div className="flex items-center gap-4">
            <span className="inline-flex items-center gap-1.5 text-xs text-navy-foreground/40">
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
              All systems operational
            </span>
          </div>
        </div>
      </div>
    </footer>
  );
}
