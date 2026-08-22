import { Info } from "lucide-react";
import { cn } from "@/lib/utils";

/**
 * Standard earnings disclaimer. Must appear under any published
 * earnings figure, estimate, range, or calculator output.
 */
export const EARNINGS_DISCLAIMER_TEXT =
  "Figures shown are historical ranges observed on the Teslys platform, not a projection, promise, or guarantee of future income. Actual results vary by vehicle, model year, location, condition, availability, seasonality, insurance, and rental demand, and some vehicles earn nothing in a given month. Amounts are shown before taxes, financing, depreciation, tolls, tickets, and vehicle-related costs unless stated otherwise. Owner payouts are calculated after the rental platform's 30% share and the Teslys 30% management fee.";

interface EarningsDisclaimerProps {
  variant?: "inline" | "box" | "dark";
  className?: string;
  /** Optional short prefix, e.g. "Based on 85 vehicle-months of platform data." */
  prefix?: string;
}

export function EarningsDisclaimer({
  variant = "inline",
  className,
  prefix,
}: EarningsDisclaimerProps) {
  const text = prefix ? `${prefix} ${EARNINGS_DISCLAIMER_TEXT}` : EARNINGS_DISCLAIMER_TEXT;

  if (variant === "box") {
    return (
      <div
        className={cn(
          "flex gap-2 rounded-xl border border-border bg-muted/40 p-3 text-left",
          className
        )}
      >
        <Info className="mt-0.5 h-3.5 w-3.5 shrink-0 text-muted-foreground" />
        <p className="text-[11px] leading-relaxed text-muted-foreground">{text}</p>
      </div>
    );
  }

  if (variant === "dark") {
    return (
      <div
        className={cn(
          "flex gap-2 rounded-xl border border-white/10 bg-white/[0.04] p-3 text-left",
          className
        )}
      >
        <Info className="mt-0.5 h-3.5 w-3.5 shrink-0 text-white/40" />
        <p className="text-[11px] leading-relaxed text-white/50">{text}</p>
      </div>
    );
  }

  return (
    <p className={cn("text-[11px] leading-relaxed text-muted-foreground", className)}>
      {text}
    </p>
  );
}

export default EarningsDisclaimer;
