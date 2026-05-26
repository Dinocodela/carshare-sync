import {
  DollarSign,
  TrendingUp,
  Calendar,
  Car,
  FileText,
  AlertTriangle,
  Info,
  Receipt,
} from "lucide-react";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import { AnalyticsSummary } from "@/hooks/useClientAnalytics";

interface SummaryCardsProps {
  summary: AnalyticsSummary & { totalExpenses?: number };
  loading?: boolean;
  hideNetProfit?: boolean;
  replaceNetProfitWithTotalExpenses?: boolean;
  tooltips?: {
    totalEarnings?: string;
    netProfit?: string;
    totalExpenses?: string;
    trueNetProfit?: string;
    totalFixedCosts?: string;
    activeDays?: string;
    totalTrips?: string;
    totalClaims?: string;
    pendingClaims?: string;
  };
}

export function SummaryCards({
  summary,
  loading,
  hideNetProfit,
  replaceNetProfitWithTotalExpenses,
  tooltips,
}: SummaryCardsProps) {
  if (loading) {
    return (
      <div className="grid grid-cols-2 gap-3 sm:grid-cols-3">
        {[...Array(hideNetProfit ? 6 : 7)].map((_, i) => (
          <div
            key={i}
            className="rounded-2xl border border-border/60 bg-card/80 backdrop-blur-sm p-4 animate-pulse"
          >
            <div className="h-3 w-20 bg-muted rounded mb-3" />
            <div className="h-7 w-16 bg-muted rounded" />
          </div>
        ))}
      </div>
    );
  }

  const cards = [
    {
      title: "Total Earnings",
      value: `$${summary.totalEarnings.toLocaleString(undefined, { minimumFractionDigits: 0, maximumFractionDigits: 0 })}`,
      icon: DollarSign,
      accent: "bg-emerald-500/10 text-emerald-600",
      iconBg: "bg-emerald-500",
      tooltip: tooltips?.totalEarnings || "Your share after trip-related expenses are deducted and your profit split is applied. This is not the full guest payment.",
    },
    {
      title: "Trip Net",
      value: `$${summary.netProfit.toLocaleString(undefined, { minimumFractionDigits: 0, maximumFractionDigits: 0 })}`,
      icon: TrendingUp,
      accent: summary.netProfit >= 0 ? "bg-emerald-500/10 text-emerald-600" : "bg-red-500/10 text-red-600",
      iconBg: summary.netProfit >= 0 ? "bg-emerald-500" : "bg-red-500",
      valueClass: summary.netProfit >= 0 ? "text-emerald-600" : "text-red-600",
      tooltip: tooltips?.netProfit || "Total Earnings minus recorded trip expenses for the selected time range, before fixed monthly costs.",
    },
    {
      title: "True Net Profit",
      value: `$${(summary.trueNetProfit ?? summary.netProfit).toLocaleString(undefined, { minimumFractionDigits: 0, maximumFractionDigits: 0 })}`,
      icon: TrendingUp,
      accent: (summary.trueNetProfit ?? summary.netProfit) >= 0 ? "bg-emerald-500/10 text-emerald-600" : "bg-red-500/10 text-red-600",
      iconBg: (summary.trueNetProfit ?? summary.netProfit) >= 0 ? "bg-emerald-500" : "bg-red-500",
      valueClass: (summary.trueNetProfit ?? summary.netProfit) >= 0 ? "text-emerald-600" : "text-red-600",
      tooltip: tooltips?.trueNetProfit || "Total Earnings after matched trip expenses and after fixed costs entered under Settings for each car. This is the investor-focused profit number.",
    },
    {
      title: "Active Days",
      value: summary.activeDays.toString(),
      icon: Calendar,
      accent: "bg-blue-500/10 text-blue-600",
      iconBg: "bg-blue-500",
      tooltip: tooltips?.activeDays || "Unique calendar days with recorded earnings or trips in the selected time range.",
    },
    {
      title: "Total Trips",
      value: summary.totalTrips.toString(),
      icon: Car,
      accent: "bg-violet-500/10 text-violet-600",
      iconBg: "bg-violet-500",
      tooltip: tooltips?.totalTrips || "Number of earning records or trips included in the selected filters.",
    },
    {
      title: "Total Claims",
      value: summary.totalClaims.toString(),
      icon: FileText,
      accent: "bg-orange-500/10 text-orange-600",
      iconBg: "bg-orange-500",
      tooltip: tooltips?.totalClaims || "Total number of claim records tied to these vehicles in the selected time range.",
    },
    {
      title: "Pending Claims",
      value: summary.pendingClaims.toString(),
      icon: AlertTriangle,
      accent: "bg-amber-500/10 text-amber-600",
      iconBg: "bg-amber-500",
      tooltip: tooltips?.pendingClaims || "Claims that are still marked pending and have not been approved or closed yet.",
    },
  ];

  let displayCards = cards;
  if (replaceNetProfitWithTotalExpenses) {
    displayCards = cards.map((c) =>
      c.title === "Trip Net"
        ? {
            title: "Total Expenses",
            value: `$${(summary.totalExpenses ?? 0).toLocaleString(undefined, { minimumFractionDigits: 0, maximumFractionDigits: 0 })}`,
            icon: Receipt,
            accent: "bg-red-500/10 text-red-600",
            iconBg: "bg-red-500",
            valueClass: "text-red-600",
            tooltip: tooltips?.totalExpenses || "Sum of all recorded expenses in the selected filters, including tolls, delivery, charging, car wash, and other expense amounts.",
          }
        : c
    );
  }

  const finalCards = hideNetProfit
    ? displayCards.filter((c) => c.title !== "Trip Net")
    : displayCards;

  return (
    <div className="grid grid-cols-2 gap-3 sm:grid-cols-3">
      {finalCards.map((card, index) => {
        const tooltipText = (card as any).tooltip;

        return (
          <div
            key={index}
            className="group relative rounded-2xl border border-border/60 bg-card/80 backdrop-blur-sm p-4 transition-all duration-300 hover:shadow-md hover:border-primary/20"
            style={{
              opacity: 1,
              animation: `fade-in 0.4s ease-out ${index * 60}ms both`,
            }}
          >
            {/* Subtle gradient overlay */}
            <div className="absolute inset-0 rounded-2xl bg-gradient-to-br from-transparent to-muted/30 opacity-0 group-hover:opacity-100 transition-opacity" />

            <div className="relative">
              <div className="flex items-center justify-between mb-3">
                <div className="flex items-center gap-1.5">
                  <span className="text-[11px] font-medium text-muted-foreground uppercase tracking-wider">
                    {card.title}
                  </span>
                  {tooltipText && (
                    <TooltipProvider>
                      <Tooltip>
                        <TooltipTrigger asChild>
                          <button type="button" className="text-muted-foreground/60 hover:text-foreground">
                            <Info className="h-3 w-3" />
                          </button>
                        </TooltipTrigger>
                        <TooltipContent className="max-w-xs text-xs">{tooltipText}</TooltipContent>
                      </Tooltip>
                    </TooltipProvider>
                  )}
                </div>
                <TooltipProvider>
                  <Tooltip>
                    <TooltipTrigger asChild>
                      <button
                        type="button"
                        aria-label={`How ${card.title} is calculated`}
                        className={`relative w-8 h-8 rounded-xl ${card.accent} flex items-center justify-center transition-transform hover:scale-105 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 focus-visible:ring-offset-background`}
                      >
                        <card.icon className="w-4 h-4" />
                        <Info className="absolute -bottom-1 -right-1 h-3.5 w-3.5 rounded-full bg-card text-muted-foreground shadow-sm" />
                      </button>
                    </TooltipTrigger>
                    <TooltipContent className="max-w-[260px] text-xs leading-relaxed">
                      {tooltipText}
                    </TooltipContent>
                  </Tooltip>
                </TooltipProvider>
              </div>
              <p className={`text-xl font-bold tracking-tight ${(card as any).valueClass || "text-foreground"}`}>
                {card.value}
              </p>
            </div>
          </div>
        );
      })}
    </div>
  );
}
