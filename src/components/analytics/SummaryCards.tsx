import {
  DollarSign,
  TrendingUp,
  Calendar,
  Car,
  FileText,
  AlertTriangle,
  Info,
  Receipt,
  Shield,
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
        {[...Array(hideNetProfit ? 5 : 6)].map((_, i) => (
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
    },
    {
      title: "Net Profit",
      value: `$${summary.netProfit.toLocaleString(undefined, { minimumFractionDigits: 0, maximumFractionDigits: 0 })}`,
      icon: TrendingUp,
      accent: summary.netProfit >= 0 ? "bg-emerald-500/10 text-emerald-600" : "bg-red-500/10 text-red-600",
      iconBg: summary.netProfit >= 0 ? "bg-emerald-500" : "bg-red-500",
      valueClass: summary.netProfit >= 0 ? "text-emerald-600" : "text-red-600",
    },
    {
      title: "Active Days",
      value: summary.activeDays.toString(),
      icon: Calendar,
      accent: "bg-blue-500/10 text-blue-600",
      iconBg: "bg-blue-500",
    },
    {
      title: "Total Trips",
      value: summary.totalTrips.toString(),
      icon: Car,
      accent: "bg-violet-500/10 text-violet-600",
      iconBg: "bg-violet-500",
    },
    {
      title: "Total Claims",
      value: summary.totalClaims.toString(),
      icon: FileText,
      accent: "bg-orange-500/10 text-orange-600",
      iconBg: "bg-orange-500",
    },
    {
      title: "Pending Claims",
      value: summary.pendingClaims.toString(),
      icon: AlertTriangle,
      accent: "bg-amber-500/10 text-amber-600",
      iconBg: "bg-amber-500",
    },
  ];

  let displayCards = cards;
  if (replaceNetProfitWithTotalExpenses) {
    displayCards = cards.map((c) =>
      c.title === "Net Profit"
        ? {
            title: "Total Expenses",
            value: `$${(summary.totalExpenses ?? 0).toLocaleString(undefined, { minimumFractionDigits: 0, maximumFractionDigits: 0 })}`,
            icon: Receipt,
            accent: "bg-red-500/10 text-red-600",
            iconBg: "bg-red-500",
            valueClass: "text-red-600",
          }
        : c
    );
  }

  const finalCards = hideNetProfit
    ? displayCards.filter((c) => c.title !== "Net Profit")
    : displayCards;

  return (
    <div className="grid grid-cols-2 gap-3 sm:grid-cols-3">
      {finalCards.map((card, index) => {
        const tooltipText =
          card.title === "Total Earnings"
            ? tooltips?.totalEarnings
            : card.title === "Net Profit"
            ? tooltips?.netProfit
            : card.title === "Total Expenses"
            ? tooltips?.totalExpenses
            : undefined;

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
                <div className={`w-8 h-8 rounded-xl ${card.accent} flex items-center justify-center`}>
                  <card.icon className="w-4 h-4" />
                </div>
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
