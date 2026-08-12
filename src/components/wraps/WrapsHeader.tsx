import { Link } from "react-router-dom";
import { Logo } from "@/components/ui/logo";
import { Button } from "@/components/ui/button";
import { ArrowRight } from "lucide-react";

/**
 * Shared public header for the wraps pages — mirrors the marketing/city page
 * header so the wraps funnel matches the rest of teslys.app.
 */
export function WrapsHeader() {
  return (
    <header className="sticky top-0 z-50 bg-background/95 backdrop-blur border-b border-border">
      <div className="max-w-6xl mx-auto px-4 py-3 flex items-center justify-between gap-3">
        <Link to="/" aria-label="Teslys home" className="flex items-center">
          <Logo className="h-9 w-auto" />
        </Link>
        <nav className="flex items-center gap-2">
          <a
            href="https://app.eonrides.com/"
            target="_blank"
            rel="noopener noreferrer"
            className="hidden sm:inline-flex text-sm font-medium text-muted-foreground hover:text-foreground transition-colors px-2"
          >
            Rent a Tesla
          </a>
          <Link
            to="/earnings-calculator"
            className="hidden sm:inline-flex text-sm font-medium text-muted-foreground hover:text-foreground transition-colors px-2"
          >
            Earn with your Tesla
          </Link>
          <Link to="/wraps">
            <Button size="sm" className="rounded-full">
              Free wraps <ArrowRight className="w-3.5 h-3.5 ml-1" />
            </Button>
          </Link>
        </nav>
      </div>
    </header>
  );
}
