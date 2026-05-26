import {
  DollarSign,
  TrendingUp,
  TrendingDown,
  Calendar,
  Car,
  AlertTriangle,
  Activity,
  Target,
  Info,
} from "lucide-react";
import { CarPerformance } from "@/hooks/usePerCarAnalytics";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";

interface PerCarSummaryCardsProps {
  performance: CarPerformance;
  loading?: boolean;
}

export function PerCarSummaryCards({ performance, loading }: PerCarSummaryCardsProps) {
  if (loading) {
    return (
      <div className="grid grid-cols-2 gap-3 sm:grid-cols-3">
        {[...Array(7)].map((_, i) => (
          <div key={i} className="rounded-2xl border border-border/60 bg-card/80 backdrop-blur-sm p-4 animate-pulse">
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
      value: `$${performance.totalEarnings.toFixed(0)}`,
      icon: DollarSign,
      accent: "bg-emerald-500/10 text-emerald-600",
      tooltip: "Your share after trip-related expenses are deducted and your profit split is applied. This is not the full guest payment.",
    },
    {
      title: "Fixed Costs",
      value: `$${performance.monthlyFixedCosts.toFixed(0)}`,
      icon: TrendingDown,
      accent: "bg-red-500/10 text-red-600",
      tooltip: "Monthly fixed costs entered for this car, such as payment, insurance, subscriptions, or other recurring costs.",
    },
    {
      title: "True Net Profit",
      value: `$${performance.trueNetProfit.toFixed(0)}`,
      icon: TrendingUp,
      accent: performance.trueNetProfit >= 0 ? "bg-emerald-500/10 text-emerald-600" : "bg-red-500/10 text-red-600",
      valueClass: performance.trueNetProfit >= 0 ? "text-emerald-600" : "text-red-600",
      tooltip: "Total Earnings minus this car's monthly fixed costs. This is the clearest estimate of what the car kept after recurring costs.",
    },
    {
      title: "Profit Margin",
      value: `${performance.profitMargin.toFixed(1)}%`,
      icon: Target,
      accent: performance.profitMargin >= 0 ? "bg-blue-500/10 text-blue-600" : "bg-red-500/10 text-red-600",
      valueClass: performance.profitMargin >= 0 ? "text-emerald-600" : "text-red-600",
      tooltip: "True Net Profit divided by Total Earnings, shown as a percentage. Higher means more of the earnings remain after fixed costs.",
    },
    {
      title: "Active Days",
      value: performance.activeDays.toString(),
      icon: Calendar,
      accent: "bg-violet-500/10 text-violet-600",
      tooltip: "Unique calendar days with recorded earnings for this car in the selected time range.",
    },
    {
      title: "Total Trips",
      value: performance.totalTrips.toString(),
      icon: Car,
      accent: "bg-indigo-500/10 text-indigo-600",
      tooltip: "Number of earning records or trips for this car in the selected time range.",
    },
    {
      title: "Avg Per Trip",
      value: `$${performance.averagePerTrip.toFixed(0)}`,
      icon: DollarSign,
      accent: "bg-teal-500/10 text-teal-600",
      tooltip: "Total Earnings divided by Total Trips for this car.",
    },
    {
      title: "Utilization",
      value: `${performance.utilizationRate.toFixed(1)}%`,
      icon: Activity,
      accent: performance.utilizationRate >= 50
        ? "bg-emerald-500/10 text-emerald-600"
        : performance.utilizationRate >= 25
        ? "bg-amber-500/10 text-amber-600"
        : "bg-red-500/10 text-red-600",
      valueClass: performance.utilizationRate >= 50
        ? "text-emerald-600"
        : performance.utilizationRate >= 25
        ? "text-amber-600"
        : "text-red-600",
      tooltip: "Rented calendar days divided by total days in the selected period. Long rentals count for every day they overlap the selected month or year.",
    },
    {
      title: "Risk Score",
      value: performance.riskScore.toFixed(0),
      icon: AlertTriangle,
      accent: performance.riskScore < 30
        ? "bg-emerald-500/10 text-emerald-600"
        : performance.riskScore < 60
        ? "bg-amber-500/10 text-amber-600"
        : "bg-red-500/10 text-red-600",
      valueClass: performance.riskScore < 30
        ? "text-emerald-600"
        : performance.riskScore < 60
        ? "text-amber-600"
        : "text-red-600",
      tooltip: "A 0–100 estimate based on claims, true net profit after fixed costs, profit margin, and utilization. Lower is better.",
    },
  ];

  return (
    <div className="grid grid-cols-2 gap-3 sm:grid-cols-3">
      {cards.map((card, index) => (
        <div
          key={index}
          className="group relative rounded-2xl border border-border/60 bg-card/80 backdrop-blur-sm p-4 transition-all duration-300 hover:shadow-md hover:border-primary/20"
          style={{ animation: `fade-in 0.4s ease-out ${index * 60}ms both` }}
        >
          <div className="absolute inset-0 rounded-2xl bg-gradient-to-br from-transparent to-muted/30 opacity-0 group-hover:opacity-100 transition-opacity" />
          <div className="relative">
            <div className="flex items-center justify-between mb-3">
              <span className="text-[11px] font-medium text-muted-foreground uppercase tracking-wider">
                {card.title}
              </span>
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
                    {card.tooltip}
                  </TooltipContent>
                </Tooltip>
              </TooltipProvider>
            </div>
            <p className={`text-xl font-bold tracking-tight ${card.valueClass || "text-foreground"}`}>
              {card.value}
            </p>
          </div>
        </div>
      ))}
    </div>
  );
}
