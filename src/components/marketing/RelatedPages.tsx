import { Link } from "react-router-dom";
import { ArrowRight } from "lucide-react";

interface RelatedLink {
  to: string;
  label: string;
}

interface RelatedPagesProps {
  heading?: string;
  links?: RelatedLink[];
}

const defaultLinks: RelatedLink[] = [
  { to: "/how-it-works", label: "How It Works" },
  { to: "/earnings-calculator", label: "Earnings Calculator" },
  { to: "/how-much-can-i-earn", label: "Earnings Guide" },
  { to: "/tesla-rental-near-me", label: "Tesla Rental Near Me" },
  { to: "/tesla-monthly-rental", label: "Monthly Tesla Rental" },
  { to: "/tesla-rental-cost", label: "Tesla Rental Cost" },
  { to: "/turo-management", label: "Turo Management" },
  { to: "/tesla-cybertruck-rental", label: "Cybertruck Rental" },
  { to: "/tesla-model-x-rental", label: "Model X Rental" },
  { to: "/tesla-model-s-rental", label: "Model S Rental" },
  { to: "/blog", label: "Blog" },
  { to: "/faq", label: "FAQ" },
];

const cityLinks: RelatedLink[] = [
  { to: "/tesla-car-sharing-los-angeles", label: "Los Angeles" },
  { to: "/tesla-car-sharing-miami", label: "Miami" },
  { to: "/tesla-car-sharing-san-francisco", label: "San Francisco" },
  { to: "/tesla-car-sharing-new-york", label: "New York" },
  { to: "/tesla-car-sharing-austin", label: "Austin" },
  { to: "/tesla-car-sharing-dallas", label: "Dallas" },
  { to: "/tesla-car-sharing-chicago", label: "Chicago" },
  { to: "/tesla-car-sharing-seattle", label: "Seattle" },
  { to: "/tesla-car-sharing-denver", label: "Denver" },
  { to: "/tesla-car-sharing-phoenix", label: "Phoenix" },
  { to: "/tesla-car-sharing-atlanta", label: "Atlanta" },
  { to: "/tesla-car-sharing-las-vegas", label: "Las Vegas" },
  { to: "/tesla-car-sharing-san-diego", label: "San Diego" },
  { to: "/tesla-car-sharing-oklahoma-city", label: "Oklahoma City" },
];

export function RelatedPages({ heading = "Explore More", links }: RelatedPagesProps) {
  const currentPath = typeof window !== "undefined" ? window.location.pathname : "";
  const displayLinks = (links || [...defaultLinks, ...cityLinks]).filter(
    (l) => l.to !== currentPath
  );

  return (
    <section className="py-12 border-t border-border">
      <div className="max-w-6xl mx-auto px-4">
        <h2 className="text-xl font-bold text-foreground mb-6">{heading}</h2>
        <div className="flex flex-wrap gap-2">
          {displayLinks.slice(0, 20).map((link) => (
            <Link
              key={link.to}
              to={link.to}
              className="inline-flex items-center gap-1 text-xs font-medium px-3 py-2 rounded-full border border-border bg-card text-muted-foreground hover:text-foreground hover:border-primary/40 transition-colors"
            >
              {link.label}
              <ArrowRight className="w-3 h-3" />
            </Link>
          ))}
        </div>
      </div>
    </section>
  );
}

export { defaultLinks, cityLinks };
export type { RelatedLink };
