import { ExternalLink } from "lucide-react";

export function RentATeslaLink() {
  return (
    <a
      href="https://teslys.app.eonrides.com/"
      target="_blank"
      rel="noopener noreferrer"
      className="fixed top-4 right-4 z-50 inline-flex items-center gap-1.5 px-3.5 py-2 rounded-full bg-card/80 backdrop-blur-sm border border-border/50 text-xs font-semibold text-primary hover:bg-card transition-colors shadow-sm"
    >
      Rent A Tesla
      <ExternalLink className="w-3 h-3" />
    </a>
  );
}
