import { Car, TrendingUp, CalendarDays, Wallet, Trophy, Plus, ArrowUpRight } from "lucide-react";
import { Button } from "@/components/ui/button";
import type { ClientDashboardStats } from "@/hooks/useClientDashboardStats";

const money = (v: number, decimals = 0) =>
  `$${Number(v || 0).toLocaleString(undefined, {
    minimumFractionDigits: decimals,
    maximumFractionDigits: decimals,
  })}`;

/* ─────────── Performance strip ─────────── */
export function PerformanceStrip({
  stats,
  onOpenAnalytics,
}: {
  stats: ClientDashboardStats;
  onOpenAnalytics: () => void;
}) {
  const tiles = [
    { label: "Earned this year", value: money(stats.ytd), icon: TrendingUp, accent: "bg-primary/10 text-primary" },
    { label: "Lifetime earnings", value: money(stats.lifetime), icon: Wallet, accent: "bg-emerald-50 text-emerald-600" },
    {
      label: `Days rented · ${stats.utilization}% used`,
      value: String(stats.daysRentedThisMonth),
      icon: CalendarDays,
      accent: "bg-amber-50 text-amber-600",
    },
    { label: "Average per trip", value: money(stats.avgPerTrip), icon: Car, accent: "bg-primary/10 text-primary" },
  ];

  return (
    <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
      {tiles.map((t) => (
        <button
          key={t.label}
          onClick={onOpenAnalytics}
          className="group relative rounded-2xl bg-card border border-border/60 p-4 text-left transition-all duration-200 hover:shadow-md hover:border-primary/20 active:scale-[0.97]"
        >
          <div className={`w-9 h-9 rounded-xl ${t.accent} flex items-center justify-center mb-3`}>
            <t.icon className="w-[18px] h-[18px]" />
          </div>
          <p className="text-2xl font-bold text-foreground tracking-tight tabular-nums">
            {stats.loading ? "—" : t.value}
          </p>
          <p className="text-[11px] text-muted-foreground font-medium mt-0.5">{t.label}</p>
          <ArrowUpRight className="absolute top-3 right-3 w-3.5 h-3.5 text-muted-foreground/40 opacity-0 group-hover:opacity-100 transition-opacity" />
        </button>
      ))}
    </div>
  );
}

/* ─────────── Earnings trend ─────────── */
export function EarningsTrend({ stats }: { stats: ClientDashboardStats }) {
  const max = Math.max(...stats.months.map((m) => m.total), 1);
  const hasData = stats.months.some((m) => m.total > 0);
  if (stats.loading || !hasData) return null;

  return (
    <div className="rounded-2xl bg-card border border-border/60 p-4">
      <div className="flex items-baseline justify-between mb-4">
        <h2 className="text-sm font-semibold text-foreground">Earnings trend</h2>
        {stats.bestMonth && stats.bestMonth.total > 0 && (
          <span className="text-[11px] text-muted-foreground">
            Best month:{" "}
            <span className="font-semibold text-foreground tabular-nums">{money(stats.bestMonth.total)}</span> ·{" "}
            {stats.bestMonth.label}
          </span>
        )}
      </div>
      <div className="flex items-end gap-2 h-28">
        {stats.months.map((m) => {
          const isBest = stats.bestMonth?.key === m.key;
          const h = Math.max(4, Math.round((m.total / max) * 100));
          return (
            <div key={m.key} className="flex-1 flex flex-col items-center gap-1.5">
              <span className="text-[10px] text-muted-foreground tabular-nums">
                {m.total > 0 ? money(m.total) : ""}
              </span>
              <div className="w-full flex-1 flex items-end">
                <div
                  className={`w-full rounded-t-md transition-all ${isBest ? "bg-[hsl(var(--primary))]" : "bg-primary/25"}`}
                  style={{ height: `${h}%` }}
                />
              </div>
              <span className="text-[10px] text-muted-foreground font-medium">{m.label}</span>
            </div>
          );
        })}
      </div>
    </div>
  );
}

/* ─────────── Per-vehicle performance ─────────── */
export function VehiclePerformance({
  stats,
  onSelect,
}: {
  stats: ClientDashboardStats;
  onSelect: () => void;
}) {
  if (stats.loading || stats.perCar.length === 0) return null;

  return (
    <div className="space-y-2">
      <h2 className="text-sm font-semibold text-foreground px-1">Vehicle performance</h2>
      <div className="space-y-3">
        {stats.perCar.map((c) => (
          <button
            key={c.carId}
            onClick={onSelect}
            className="w-full rounded-2xl bg-card border border-border/60 p-4 text-left transition-all hover:shadow-sm hover:border-primary/20 active:scale-[0.99]"
          >
            <div className="flex items-start justify-between gap-3">
              <div className="min-w-0">
                <p className="text-sm font-semibold text-foreground truncate">{c.label}</p>
                {c.sublabel && (
                  <p className="text-[11px] text-muted-foreground truncate">{c.sublabel}</p>
                )}
              </div>
              <div className="text-right shrink-0">
                <p className="text-lg font-bold text-foreground tabular-nums">{money(c.month)}</p>
                <p className="text-[10px] text-muted-foreground">this month</p>
              </div>
            </div>

            <div className="mt-3 grid grid-cols-3 gap-2 text-center">
              <div>
                <p className="text-sm font-semibold text-foreground tabular-nums">{money(c.lifetime)}</p>
                <p className="text-[10px] text-muted-foreground">lifetime</p>
              </div>
              <div>
                <p className="text-sm font-semibold text-foreground tabular-nums">{c.trips}</p>
                <p className="text-[10px] text-muted-foreground">trips</p>
              </div>
              <div>
                <p className="text-sm font-semibold text-foreground tabular-nums">{c.daysRented}</p>
                <p className="text-[10px] text-muted-foreground">days rented</p>
              </div>
            </div>

            <div className="mt-3">
              <div className="h-1.5 w-full rounded-full bg-muted overflow-hidden">
                <div
                  className="h-full rounded-full bg-primary transition-all"
                  style={{ width: `${Math.min(100, c.utilization)}%` }}
                />
              </div>
              <p className="text-[10px] text-muted-foreground mt-1">
                {c.utilization}% utilization this month
              </p>
            </div>
          </button>
        ))}
      </div>
    </div>
  );
}

/* ─────────── Growth / add another vehicle ─────────── */
export function GrowthCard({
  stats,
  onAddVehicle,
}: {
  stats: ClientDashboardStats;
  onAddVehicle: () => void;
}) {
  if (stats.loading) return null;
  const hasHistory = stats.lifetime > 0 && stats.monthsActive > 0;
  const topCar = [...stats.perCar].sort((a, b) => b.lifetime - a.lifetime)[0];

  return (
    <div className="relative overflow-hidden rounded-2xl bg-gradient-primary p-5 text-primary-foreground">
      <div className="absolute -top-10 -right-10 w-32 h-32 rounded-full bg-white/10" />
      <div className="relative z-10 space-y-3">
        <div className="flex items-center gap-2">
          <TrendingUp className="w-4 h-4" />
          <span className="text-xs font-medium uppercase tracking-wider opacity-90">Grow your fleet</span>
        </div>
        <p className="text-base font-bold leading-snug">
          {hasHistory && topCar
            ? `Your ${topCar.label} has earned ${money(stats.lifetime)} in ${stats.monthsActive} ${
                stats.monthsActive === 1 ? "month" : "months"
              } — about ${money(stats.avgMonthly)}/month.`
            : "Owners with more than one Tesla scale their monthly income without extra work."}
        </p>
        <p className="text-xs opacity-85">
          {hasHistory
            ? "Adding a second vehicle could roughly double that — we handle listing, guests, cleaning and support."
            : "We handle listing, guests, cleaning and support. You collect the payouts."}
        </p>
        <Button
          onClick={onAddVehicle}
          size="sm"
          variant="secondary"
          className="rounded-full mt-1"
        >
          <Plus className="w-4 h-4 mr-1" />
          Add another Tesla
        </Button>
      </div>
    </div>
  );
}

/* ─────────── Milestones ─────────── */
export function Milestones({ stats }: { stats: ClientDashboardStats }) {
  if (stats.loading || (stats.lifetime === 0 && stats.totalTrips === 0)) return null;

  const earned: string[] = [];
  if (stats.totalTrips >= 1) earned.push("First payout received");
  [1000, 5000, 10000, 25000].forEach((t) => {
    if (stats.lifetime >= t) earned.push(`${money(t)} earned`);
  });
  [10, 25, 50, 100].forEach((t) => {
    if (stats.totalTrips >= t) earned.push(`${t} trips hosted`);
  });
  if (stats.monthsActive >= 1)
    earned.push(`${stats.monthsActive} ${stats.monthsActive === 1 ? "month" : "months"} with Teslys`);

  const nextTier = [1000, 5000, 10000, 25000, 50000].find((t) => stats.lifetime < t);

  return (
    <div className="space-y-2">
      <h2 className="text-sm font-semibold text-foreground px-1 flex items-center gap-1.5">
        <Trophy className="w-3.5 h-3.5 text-muted-foreground" />
        Milestones
      </h2>
      <div className="rounded-2xl bg-card border border-border/60 p-4 space-y-3">
        <div className="flex flex-wrap gap-2">
          {earned.map((m) => (
            <span
              key={m}
              className="inline-flex items-center gap-1 rounded-full border border-[#C6A15B]/40 bg-[#C6A15B]/10 px-2.5 py-1 text-[11px] font-medium text-foreground"
            >
              <Trophy className="w-3 h-3 text-[#C6A15B]" />
              {m}
            </span>
          ))}
        </div>

        {nextTier && (
          <div>
            <div className="flex items-center justify-between text-[11px] text-muted-foreground mb-1">
              <span>Next milestone</span>
              <span className="tabular-nums font-medium text-foreground">
                {money(stats.lifetime)} / {money(nextTier)}
              </span>
            </div>
            <div className="h-1.5 w-full rounded-full bg-muted overflow-hidden">
              <div
                className="h-full rounded-full bg-[#C6A15B]"
                style={{ width: `${Math.min(100, (stats.lifetime / nextTier) * 100)}%` }}
              />
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
