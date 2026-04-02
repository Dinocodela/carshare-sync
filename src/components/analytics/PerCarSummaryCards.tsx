import {
  DollarSign,
  TrendingUp,
  TrendingDown,
  Calendar,
  Car,
  AlertTriangle,
  Activity,
  Target,
} from "lucide-react";
import { CarPerformance } from "@/hooks/usePerCarAnalytics";

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
    },
    {
      title: "Fixed Costs",
      value: `$${performance.monthlyFixedCosts.toFixed(0)}`,
      icon: TrendingDown,
      accent: "bg-red-500/10 text-red-600",
    },
    {
      title: "True Net Profit",
      value: `$${performance.trueNetProfit.toFixed(0)}`,
      icon: TrendingUp,
      accent: performance.trueNetProfit >= 0 ? "bg-emerald-500/10 text-emerald-600" : "bg-red-500/10 text-red-600",
      valueClass: performance.trueNetProfit >= 0 ? "text-emerald-600" : "text-red-600",
    },
    {
      title: "Profit Margin",
      value: `${performance.profitMargin.toFixed(1)}%`,
      icon: Target,
      accent: performance.profitMargin >= 0 ? "bg-blue-500/10 text-blue-600" : "bg-red-500/10 text-red-600",
      valueClass: performance.profitMargin >= 0 ? "text-emerald-600" : "text-red-600",
    },
    {
      title: "Active Days",
      value: performance.activeDays.toString(),
      icon: Calendar,
      accent: "bg-violet-500/10 text-violet-600",
    },
    {
      title: "Total Trips",
      value: performance.totalTrips.toString(),
      icon: Car,
      accent: "bg-indigo-500/10 text-indigo-600",
    },
    {
      title: "Avg Per Trip",
      value: `$${performance.averagePerTrip.toFixed(0)}`,
      icon: DollarSign,
      accent: "bg-teal-500/10 text-teal-600",
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
              <div className={`w-8 h-8 rounded-xl ${card.accent} flex items-center justify-center`}>
                <card.icon className="w-4 h-4" />
              </div>
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
