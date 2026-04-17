import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { CarPerformance } from "@/hooks/usePerCarAnalytics";
import {
  ArrowDownWideNarrow,
  ArrowUpNarrowWide,
  ArrowUpDown,
  Eye,
  Settings,
  TrendingUp,
  TrendingDown,
} from "lucide-react";
import * as React from "react";

/* ---------------- helpers ---------------- */
type SortField = keyof CarPerformance;
type SortDirection = "asc" | "desc";

function utilColor(pct: number) {
  if (pct >= 60) return "text-emerald-600";
  if (pct >= 30) return "text-amber-600";
  return "text-red-600";
}
function utilBar(pct: number) {
  if (pct >= 60) return "bg-emerald-500";
  if (pct >= 30) return "bg-amber-500";
  return "bg-red-500";
}
function riskColor(score: number) {
  if (score < 30) return "text-emerald-600";
  if (score < 60) return "text-amber-600";
  return "text-red-600";
}
function riskBar(score: number) {
  if (score < 30) return "bg-emerald-500";
  if (score < 60) return "bg-amber-500";
  return "bg-red-500";
}
const recBadgeVariant: Record<CarPerformance["recommendation"], any> = {
  keep_active: "default",
  optimize: "secondary",
  monitor: "outline",
  return: "destructive",
};

/* small, reusable progress bar */
function MiniBar({
  value,
  className,
}: {
  value: number; // 0..100
  className: string;
}) {
  const w = Math.max(0, Math.min(100, value));
  return (
    <div className="mt-1 h-1.5 w-full rounded-full bg-muted">
      <div
        className={`h-1.5 rounded-full ${className}`}
        style={{ width: `${w}%` }}
      />
    </div>
  );
}

/* ---------------- component ---------------- */
interface CarComparisonTableProps {
  carPerformanceData: CarPerformance[];
  onViewDetails?: (carId: string) => void;
  onManageStatus?: (carId: string) => void;
}

export function CarComparisonTable({
  carPerformanceData,
  onViewDetails,
  onManageStatus,
}: CarComparisonTableProps) {
  const [sortField, setSortField] = React.useState<SortField>("profitMargin");
  const [sortDirection, setSortDirection] =
    React.useState<SortDirection>("desc");

  const handleSort = (field: SortField) => {
    if (sortField === field)
      setSortDirection((d) => (d === "asc" ? "desc" : "asc"));
    else {
      setSortField(field);
      setSortDirection("desc");
    }
  };

  const sorted = React.useMemo(() => {
    const data = [...carPerformanceData];
    return data.sort((a, b) => {
      const av = a[sortField] as any;
      const bv = b[sortField] as any;
      if (typeof av === "number" && typeof bv === "number") {
        return sortDirection === "asc" ? av - bv : bv - av;
      }
      return sortDirection === "asc"
        ? String(av).localeCompare(String(bv))
        : String(bv).localeCompare(String(av));
    });
  }, [carPerformanceData, sortField, sortDirection]);

  /* ----- MOBILE: stacked cards ----- */
  return (
    <>
      <div className="space-y-3 md:hidden">
        {sorted.map((car) => {
          const util = Math.max(0, Math.min(100, car.utilizationRate));
          const risk = Math.max(0, Math.min(100, car.riskScore));
          return (
            <div
              key={car.car_id}
              className="rounded-xl border p-4 shadow-sm bg-background"
            >
              <div className="flex items-start justify-between gap-2">
                <div className="min-w-0">
                  <p className="font-semibold truncate text-xs sm:text-base">
                    {car.car_year} {car.car_make} {car.car_model}
                  </p>
                  <p className="text-xs text-muted-foreground">
                    {car.activeDays} active days • Avg $
                    {car.averagePerTrip.toFixed(0)}/trip
                  </p>
                </div>
                <Badge
                  variant={
                    car.car_status === "available" ? "default" : "secondary"
                  }
                  className="capitalize shrink-0"
                >
                  {car.car_status}
                </Badge>
              </div>

              <div className="mt-3 grid grid-cols-2 gap-3 text-sm">
                <div className="min-w-0">
                  <p className="text-xs text-muted-foreground">Margin %</p>
                  <p
                    className={`font-semibold ${
                      car.profitMargin >= 0
                        ? "text-emerald-600"
                        : "text-red-600"
                    }`}
                  >
                    {car.profitMargin.toFixed(1)}%
                  </p>
                </div>
                <div className="min-w-0">
                  <p className="text-xs text-muted-foreground">Trips</p>
                  <p className="font-semibold">{car.totalTrips}</p>
                </div>

                <div className="min-w-0">
                  <p className="text-xs text-muted-foreground">Utilization</p>
                  <p className={`font-semibold ${utilColor(util)}`}>
                    {util.toFixed(1)}%
                  </p>
                  <MiniBar value={util} className={utilBar(util)} />
                </div>
                <div className="min-w-0">
                  <p className="text-xs text-muted-foreground">Risk</p>
                  <p className={`font-semibold ${riskColor(risk)}`}>
                    {Math.round(risk)}
                  </p>
                  <MiniBar value={risk} className={riskBar(risk)} />
                </div>
              </div>

              <div className="mt-3 flex items-center justify-between">
                <Badge
                  variant={recBadgeVariant[car.recommendation]}
                  className="capitalize"
                >
                  {car.recommendation.replace("_", " ")}
                </Badge>
                <div className="flex gap-1">
                  <Button
                    variant="ghost"
                    size="icon"
                    aria-label="View details"
                    onClick={() => onViewDetails?.(car.car_id)}
                  >
                    <Eye className="h-4 w-4" />
                  </Button>
                  <Button
                    variant="ghost"
                    size="icon"
                    aria-label="Manage status"
                    onClick={() => onManageStatus?.(car.car_id)}
                  >
                    <Settings className="h-4 w-4" />
                  </Button>
                </div>
              </div>
            </div>
          );
        })}
      </div>

      {/* ----- DESKTOP: table ----- */}
      <div className="relative mt-2 hidden md:block">
        <div className="max-w-full overflow-x-auto rounded-xl border">
          <Table className="min-w-[860px]">
            <TableHeader className="sticky top-0 z-10 bg-background/95 backdrop-blur">
              <TableRow>
                <TableHead className="w-[28%]">Vehicle</TableHead>

                <SortHead
                  current={{ field: sortField, dir: sortDirection }}
                  onSort={handleSort}
                  field="profitMargin"
                  right
                >
                  Margin %
                </SortHead>
                <SortHead
                  current={{ field: sortField, dir: sortDirection }}
                  onSort={handleSort}
                  field="totalTrips"
                  right
                >
                  Trips
                </SortHead>
                <SortHead
                  current={{ field: sortField, dir: sortDirection }}
                  onSort={handleSort}
                  field="utilizationRate"
                  right
                >
                  Utilization
                </SortHead>
                <SortHead
                  current={{ field: sortField, dir: sortDirection }}
                  onSort={handleSort}
                  field="riskScore"
                  right
                >
                  Risk
                </SortHead>

                <SortHead
                  current={{ field: sortField, dir: sortDirection }}
                  onSort={handleSort}
                  field="recommendation"
                >
                  Recommendation
                </SortHead>
                <TableHead>Status</TableHead>
                <TableHead className="w-[120px]">Actions</TableHead>
              </TableRow>
            </TableHeader>

            <TableBody>
              {sorted.map((car, i) => {
                const util = Math.max(0, Math.min(100, car.utilizationRate));
                const risk = Math.max(0, Math.min(100, car.riskScore));
                return (
                  <TableRow
                    key={car.car_id}
                    className={i % 2 ? "bg-muted/20" : undefined}
                  >
                    <TableCell className="align-top">
                      <div className="min-w-0">
                        <p className="font-semibold truncate">
                          {car.car_year} {car.car_make} {car.car_model}
                        </p>
                        <p className="text-xs text-muted-foreground">
                          {car.activeDays} active days • Avg $
                          {car.averagePerTrip.toFixed(0)}/trip
                        </p>
                      </div>
                    </TableCell>

                    <TableCell className="text-right align-top">
                      <span
                        className={`font-semibold ${
                          car.profitMargin >= 0
                            ? "text-emerald-600"
                            : "text-red-600"
                        }`}
                      >
                        {car.profitMargin.toFixed(1)}%
                      </span>
                    </TableCell>

                    <TableCell className="text-right align-top">
                      {car.totalTrips}
                    </TableCell>

                    <TableCell className="text-right align-top">
                      <div className="inline-block min-w-[120px] text-right">
                        <span className={`font-semibold ${utilColor(util)}`}>
                          {util.toFixed(1)}%
                        </span>
                        <MiniBar value={util} className={utilBar(util)} />
                      </div>
                    </TableCell>

                    <TableCell className="text-right align-top">
                      <div className="inline-block min-w-[120px] text-right">
                        <span className={`font-semibold ${riskColor(risk)}`}>
                          {Math.round(risk)}
                        </span>
                        <MiniBar value={risk} className={riskBar(risk)} />
                      </div>
                    </TableCell>

                    <TableCell className="align-top">
                      <Badge
                        variant={recBadgeVariant[car.recommendation]}
                        className="capitalize"
                      >
                        {car.recommendation.replace("_", " ")}
                      </Badge>
                    </TableCell>

                    <TableCell className="align-top">
                      <Badge
                        variant={
                          car.car_status === "available"
                            ? "default"
                            : "secondary"
                        }
                        className="capitalize"
                      >
                        {car.car_status}
                      </Badge>
                    </TableCell>

                    <TableCell className="align-top">
                      <div className="flex justify-end gap-1">
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => onViewDetails?.(car.car_id)}
                        >
                          <Eye className="h-4 w-4" />
                        </Button>
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => onManageStatus?.(car.car_id)}
                        >
                          <Settings className="h-4 w-4" />
                        </Button>
                      </div>
                    </TableCell>
                  </TableRow>
                );
              })}
            </TableBody>
          </Table>
        </div>
      </div>
    </>
  );
}

/* --- Sortable header with direction indicator --- */
function SortHead({
  field,
  children,
  onSort,
  current,
  right,
}: {
  field: SortField;
  children: React.ReactNode;
  onSort: (f: SortField) => void;
  current: { field: SortField; dir: SortDirection };
  right?: boolean;
}) {
  const isActive = current.field === field;
  const DirIcon = !isActive
    ? ArrowUpDown
    : current.dir === "asc"
    ? ArrowUpNarrowWide
    : ArrowDownWideNarrow;
  return (
    <TableHead
      onClick={() => onSort(field)}
      className={`cursor-pointer select-none hover:bg-muted/50 ${
        right ? "text-right" : ""
      }`}
      aria-sort={
        isActive ? (current.dir === "asc" ? "ascending" : "descending") : "none"
      }
    >
      <span
        className={`inline-flex items-center gap-1 ${
          right ? "justify-end" : ""
        }`}
      >
        {children}
        <DirIcon className="h-3.5 w-3.5" />
      </span>
    </TableHead>
  );
}
