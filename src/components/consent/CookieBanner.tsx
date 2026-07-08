import { useState } from "react";
import { Link } from "react-router-dom";
import { Shield } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useConsent } from "@/hooks/useConsent";

/**
 * First-visit cookie banner. Bottom bar on desktop, bottom sheet on mobile.
 * Never blocks the page — no backdrop, no scroll lock.
 */
export function CookieBanner() {
  const { showBanner, showPreferences, acceptAll, rejectAll, openPreferences } =
    useConsent();
  const [mounted] = useState(true);

  if (!showBanner || showPreferences || !mounted) return null;

  return (
    <div
      role="dialog"
      aria-modal="false"
      aria-label="Cookie consent"
      className="fixed inset-x-0 bottom-0 z-[100] p-3 sm:p-4 pb-safe-bottom animate-fade-in pointer-events-none"
    >
      <div className="pointer-events-auto mx-auto w-full max-w-3xl rounded-t-3xl sm:rounded-3xl border border-border/60 bg-background/80 backdrop-blur-xl shadow-elegant p-5 sm:p-6">
        <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:gap-6">
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-2 mb-1.5">
              <Shield className="h-4 w-4 text-primary shrink-0" />
              <h2 className="text-base font-semibold text-foreground">
                Your Privacy Matters
              </h2>
            </div>
            <p className="text-sm text-muted-foreground leading-relaxed">
              We use cookies and similar technologies to improve your experience,
              analyze website performance, and personalize content. You control
              what information you share.{" "}
              <Link
                to="/privacy-center"
                className="text-primary underline underline-offset-2 hover:opacity-80"
              >
                Learn more
              </Link>
            </p>
          </div>

          <div className="flex flex-col gap-2.5 sm:w-auto shrink-0">
            <div className="flex flex-col-reverse sm:flex-row gap-2.5">
              <Button
                variant="outline"
                onClick={rejectAll}
                className="rounded-full min-h-11 w-full sm:w-auto"
              >
                Reject Non-Essential
              </Button>
              <Button
                onClick={acceptAll}
                className="rounded-full min-h-11 w-full sm:w-auto bg-gradient-primary border-0"
              >
                Accept All
              </Button>
            </div>
            <button
              type="button"
              onClick={openPreferences}
              className="text-xs text-muted-foreground underline underline-offset-2 hover:text-foreground transition-colors self-center sm:self-end min-h-11 sm:min-h-0"
            >
              Customize Preferences
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
