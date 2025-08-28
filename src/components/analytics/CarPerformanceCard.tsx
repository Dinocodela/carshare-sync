import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { CarPerformance } from "@/hooks/usePerCarAnalytics";
import {
  AlertTriangle,
  CheckCircle,
  Eye,
  Settings as Gear,
  Car as CarIcon,
} from "lucide-react";
import * as React from "react";

interface CarPerformanceCardProps {
  performance: CarPerformance;
  onViewDetails?: (carId: string) => void;
  onManageStatus?: (carId: string) => void;
}

/* ---------------- helpers ---------------- */
const recMap = {
  keep_active: {
    color: "bg-emerald-500",
    text: "Keep active",
    Icon: CheckCircle,
  },
  optimize: { color: "bg-sky-500", text: "Optimize", Icon: Gear },
  monitor: { color: "bg-amber-500", text: "Monitor", Icon: Eye },
  return: { color: "bg-red-500", text: "Return", Icon: AlertTriangle },
} as const;

function riskColor(score: number) {
  if (score < 30) return "text-emerald-600";
  if (score < 60) return "text-amber-600";
  return "text-red-600";
}

function barColor(scoreOrPct: number, inverse = false) {
  // For utilization (good high) inverse=false; for risk (good low) inverse=true
  if (!inverse) {
    if (scoreOrPct >= 60) return "bg-emerald-500";
    if (scoreOrPct >= 30) return "bg-amber-500";
    return "bg-red-500";
  }
  if (scoreOrPct < 30) return "bg-emerald-500";
  if (scoreOrPct < 60) return "bg-amber-500";
  return "bg-red-500";
}

/* ---------------- component ---------------- */
export function CarPerformanceCard({
  performance,
  onViewDetails,
  onManageStatus,
}: CarPerformanceCardProps) {
  const rec = recMap[performance.recommendation] ?? recMap.keep_active;

  const utilPct = Math.max(0, Math.min(100, performance.utilizationRate));
  const risk = Math.max(0, Math.min(100, performance.riskScore));

  return (
    <Card
      role="region"
      aria-labelledby={`car-${performance.car_id}-title`}
      className="relative overflow-hidden min-w-0"
    >
      {/* Left color rail keyed to recommendation */}
      <div
        className={`absolute left-0 top-0 h-full w-1 ${rec.color}`}
        aria-hidden="true"
      />

      <CardHeader className="pb-2">
        <div className="flex items-start justify-between gap-3">
          <CardTitle
            id={`car-${performance.car_id}-title`}
            className="flex min-w-0 items-center gap-2 text-base font-semibold text-xs sm:text-base"
            title={`${performance.car_year} ${performance.car_make} ${performance.car_model}`}
          >
            <CarIcon className="h-5 w-5 shrink-0 text-muted-foreground" />
            <span className="truncate">
              {performance.car_year} {performance.car_make}{" "}
              {performance.car_model}
            </span>
          </CardTitle>

          <Badge
            variant={
              performance.car_status === "available" ? "default" : "secondary"
            }
            className="shrink-0 capitalize"
            aria-label={`Status: ${performance.car_status}`}
          >
            {performance.car_status}
          </Badge>
        </div>
      </CardHeader>

      <CardContent className="space-y-4">
        {/* Hero KPI */}
        <div className="text-center">
          <p className="text-xs text-muted-foreground">Profit Margin</p>
          <p
            className={`mt-0.5 text-2xl font-extrabold tracking-tight ${
              performance.profitMargin >= 0
                ? "text-emerald-600"
                : "text-red-600"
            }`}
          >
            {performance.profitMargin.toFixed(1)}%
          </p>
        </div>

        {/* Micro stats */}
        <div className="grid grid-cols-3 gap-3 text-sm">
          {/* Trips */}
          <div className="min-w-0">
            <p className="text-xs text-muted-foreground">Trips</p>
            <div className="mt-0.5 inline-flex items-center rounded-full border px-2 py-0.5 font-semibold">
              {performance.totalTrips}
            </div>
          </div>

          {/* Utilization */}
          <div className="min-w-0">
            <p className="text-xs text-muted-foreground">Utilization</p>
            <div className="font-semibold">{utilPct.toFixed(1)}%</div>
            <div className="mt-1 h-1.5 w-full rounded-full bg-muted">
              <div
                className={`h-1.5 rounded-full ${barColor(utilPct)}`}
                style={{ width: `${utilPct}%` }}
              />
            </div>
          </div>

          {/* Risk */}
          <div className="min-w-0">
            <p className="text-xs text-muted-foreground">Risk Score</p>
            <div className={`font-semibold ${riskColor(risk)}`}>
              {Math.round(risk)}
            </div>
            <div className="mt-1 h-1.5 w-full rounded-full bg-muted">
              <div
                className={`h-1.5 rounded-full ${barColor(risk, true)}`}
                style={{ width: `${risk}%` }}
              />
            </div>
          </div>
        </div>

        {/* Recommendation banner */}
        <div className="rounded-xl border bg-muted/40 p-3">
          <div className="mb-1 flex items-center gap-2">
            <span
              className={`inline-flex h-6 w-6 items-center justify-center rounded-full ${rec.color} text-white`}
            >
              <rec.Icon className="h-4 w-4" />
            </span>
            <span className="text-sm font-medium">{rec.text}</span>
          </div>
          <p className="text-xs text-muted-foreground">
            {performance.recommendationReason}
          </p>
        </div>

        {/* Actions */}
        <div className="flex flex-col gap-2 pt-1 sm:flex-row">
          <Button
            variant="outline"
            size="sm"
            className="w-full sm:flex-1"
            onClick={() => onViewDetails?.(performance.car_id)}
            aria-label={`View details for ${performance.car_make} ${performance.car_model}`}
          >
            View Details
          </Button>
          <Button
            variant="outline"
            size="sm"
            className="w-full sm:w-auto"
            onClick={() => onManageStatus?.(performance.car_id)}
            aria-label={`Manage status for ${performance.car_make} ${performance.car_model}`}
          >
            Manage
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}
