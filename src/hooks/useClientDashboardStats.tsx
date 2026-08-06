import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { getTripExpensesTotal, getEarningsFromBreakdown } from "@/lib/expenseMatching";
import { getActiveRentalDays, buildCustomDateRange } from "@/lib/analyticsDateRanges";

export interface MonthPoint {
  key: string; // YYYY-MM
  label: string; // Mar
  total: number;
}

export interface CarPerformance {
  carId: string;
  label: string;
  sublabel?: string | null;
  month: number;
  lifetime: number;
  daysRented: number;
  utilization: number;
  trips: number;
}

export interface ClientDashboardStats {
  loading: boolean;
  thisMonth: number;
  lastMonth: number;
  momPct: number | null;
  ytd: number;
  lifetime: number;
  daysRentedThisMonth: number;
  utilization: number;
  avgPerTrip: number;
  totalTrips: number;
  bestMonth: MonthPoint | null;
  months: MonthPoint[];
  perCar: CarPerformance[];
  monthsActive: number;
  avgMonthly: number;
  firstEarningDate: string | null;
}

const EMPTY: ClientDashboardStats = {
  loading: false,
  thisMonth: 0,
  lastMonth: 0,
  momPct: null,
  ytd: 0,
  lifetime: 0,
  daysRentedThisMonth: 0,
  utilization: 0,
  avgPerTrip: 0,
  totalTrips: 0,
  bestMonth: null,
  months: [],
  perCar: [],
  monthsActive: 0,
  avgMonthly: 0,
  firstEarningDate: null,
};

const toDate = (v: string) => new Date(v.includes("T") ? v : `${v}T00:00:00`);
const monthKey = (d: Date) => `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}`;

/** Owner take for a single paid earning row: (gross - matched trip expenses) x client split. */
export function clientPayoutForEarning(row: any, expenses: any[]) {
  const fromBreakdown = getEarningsFromBreakdown(row.break_down, row.client_profit_percentage);
  if (fromBreakdown !== null) return fromBreakdown;
  const tripExp = getTripExpensesTotal(row.trip_id, expenses);
  const net = (Number(row.amount) || 0) - tripExp;
  return (net * (Number(row.client_profit_percentage) || 70)) / 100;
}

export function useClientDashboardStats(cars: any[] | undefined, enabled: boolean) {
  const [stats, setStats] = useState<ClientDashboardStats>({ ...EMPTY, loading: true });

  const carKey = (cars || []).map((c: any) => c.id).sort().join(",");

  useEffect(() => {
    let cancelled = false;
    (async () => {
      if (!enabled) {
        setStats({ ...EMPTY });
        return;
      }
      const carIds = (cars || []).map((c: any) => c.id).filter(Boolean);
      if (!carIds.length) {
        setStats({ ...EMPTY });
        return;
      }

      setStats((s) => ({ ...s, loading: true }));

      const [{ data: earnRows }, { data: expRows }] = await Promise.all([
        (supabase as any)
          .from("client_visible_earnings")
          .select(
            "id, amount, trip_id, car_id, client_profit_percentage, payment_status, date_paid, earning_period_start, earning_period_end, break_down"
          )
          .eq("payment_status", "paid")
          .in("car_id", carIds)
          .limit(1000),
        supabase
          .from("host_expenses")
          .select("trip_id, amount, toll_cost, delivery_cost, carwash_cost, ev_charge_cost")
          .in("car_id", carIds)
          .limit(1000),
      ]);

      if (cancelled) return;

      const earnings = (earnRows || []) as any[];
      const expenses = (expRows || []) as any[];

      const now = new Date();
      const thisKey = monthKey(now);
      const lastKey = monthKey(new Date(now.getFullYear(), now.getMonth() - 1, 1));
      const year = now.getFullYear();

      let thisMonth = 0;
      let lastMonth = 0;
      let ytd = 0;
      let lifetime = 0;
      const byMonth = new Map<string, number>();
      const byCar = new Map<string, { month: number; lifetime: number; trips: number }>();
      let earliest: Date | null = null;

      earnings.forEach((r) => {
        const payout = clientPayoutForEarning(r, expenses);
        const ref = r.date_paid || r.earning_period_end || r.earning_period_start;
        if (!ref) return;
        const d = toDate(ref);
        if (isNaN(d.getTime())) return;
        if (!earliest || d < earliest) earliest = d;

        const k = monthKey(d);
        byMonth.set(k, (byMonth.get(k) || 0) + payout);
        lifetime += payout;
        if (d.getFullYear() === year) ytd += payout;
        if (k === thisKey) thisMonth += payout;
        if (k === lastKey) lastMonth += payout;

        const cur = byCar.get(r.car_id) || { month: 0, lifetime: 0, trips: 0 };
        cur.lifetime += payout;
        cur.trips += 1;
        if (k === thisKey) cur.month += payout;
        byCar.set(r.car_id, cur);
      });

      // Last 6 months series (including current)
      const months: MonthPoint[] = [];
      for (let i = 5; i >= 0; i--) {
        const d = new Date(now.getFullYear(), now.getMonth() - i, 1);
        const k = monthKey(d);
        months.push({
          key: k,
          label: d.toLocaleDateString(undefined, { month: "short" }),
          total: byMonth.get(k) || 0,
        });
      }

      // Best month ever
      let bestMonth: MonthPoint | null = null;
      byMonth.forEach((total, k) => {
        if (!bestMonth || total > bestMonth.total) {
          const [y, m] = k.split("-").map(Number);
          bestMonth = {
            key: k,
            label: new Date(y, m - 1, 1).toLocaleDateString(undefined, { month: "long", year: "numeric" }),
            total,
          };
        }
      });

      // Days rented this month (across all cars)
      const monthStart = new Date(now.getFullYear(), now.getMonth(), 1);
      const monthEnd = new Date(now.getFullYear(), now.getMonth() + 1, 0);
      const range = buildCustomDateRange(monthStart, monthEnd);
      const daysInMonth = monthEnd.getDate();
      const daysRentedThisMonth = getActiveRentalDays(earnings as any, range);

      const perCar: CarPerformance[] = (cars || []).map((c: any) => {
        const agg = byCar.get(c.id) || { month: 0, lifetime: 0, trips: 0 };
        const carEarnings = earnings.filter((e) => e.car_id === c.id);
        const days = getActiveRentalDays(carEarnings as any, range);
        return {
          carId: c.id,
          label: `${c.year ?? ""} ${c.make ?? ""} ${c.model ?? ""}`.trim() || "Vehicle",
          sublabel: c.nickname || c.license_plate || null,
          month: agg.month,
          lifetime: agg.lifetime,
          trips: agg.trips,
          daysRented: days,
          utilization: daysInMonth ? Math.round((days / daysInMonth) * 100) : 0,
        };
      });

      const totalTrips = earnings.length;
      const first = earliest as Date | null;
      const monthsActive = first
        ? Math.max(1, (now.getFullYear() - first.getFullYear()) * 12 + (now.getMonth() - first.getMonth()) + 1)
        : 0;

      setStats({
        loading: false,
        thisMonth,
        lastMonth,
        momPct: lastMonth > 0 ? ((thisMonth - lastMonth) / lastMonth) * 100 : null,
        ytd,
        lifetime,
        daysRentedThisMonth,
        utilization: daysInMonth ? Math.round((daysRentedThisMonth / daysInMonth) * 100) : 0,
        avgPerTrip: totalTrips ? lifetime / totalTrips : 0,
        totalTrips,
        bestMonth,
        months,
        perCar,
        monthsActive,
        avgMonthly: monthsActive ? lifetime / monthsActive : 0,
        firstEarningDate: first ? first.toISOString().slice(0, 10) : null,
      });
    })();
    return () => {
      cancelled = true;
    };
  }, [carKey, enabled]);

  return stats;
}
