import { Link } from "react-router-dom";
import { Logo } from "@/components/ui/logo";

/**
 * Shared public header for the wraps pages — logo only, linking home.
 */
export function WrapsHeader() {
  return (
    <header className="sticky top-0 z-50 bg-sand/95 backdrop-blur border-b border-sand-border">
      <div className="max-w-6xl mx-auto px-4 py-3 flex items-center">
        <Link to="/" aria-label="Teslys home" className="flex items-center">
          <Logo className="h-9 w-auto" />
        </Link>
      </div>
    </header>
  );
}
