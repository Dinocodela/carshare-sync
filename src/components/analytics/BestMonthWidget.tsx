import { useEffect, useMemo, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Trophy, TrendingUp, Calendar, Car as CarIcon } from "lucide-react";
import { Skeleton } from "@/components/ui/skeleton";

const MONTHS = [
  "January", "February", "March", "April", "May", "June",
  "July", "August", "September", "October", "November", "December",
];

interface MonthBucket {
  key: string; // YYYY-MM
  year: number;
  month: number; // 1-12
  earningsGross: number;
  netProfitClient: number;
  trips: number;
  expenses: number;
}

interface Props {
  carId: string;
  carName?: string | null;
}

export function BestMonthWidget({ carId, carName }: Props) {
  const [loading, setLoading] = useState(true);
  const [earnings, setEarnings] = useState<any[]>([]);
  const [expenses, setExpenses] = useState<any[]>([]);

  useEffect(() => {
    let active = true;
    if (!carId) return;
    setLoading(true);
    (async () => {
      const [e, x] = await Promise.all([
        (supabase as any)
          .from("client_visible_earnings")
          .select("amount, gross_earnings, client_profit_percentage, earning_period_start, trip_id")
          .eq("car_id", carId),
        supabase
          .from("host_expenses")
          .select("amount, toll_cost, delivery_cost, carwash_cost, ev_charge_cost, expense_date, trip_id")
          .eq("car_id", carId),
      ]);
      if (!active) return;
      setEarnings(e.data || []);
      setExpenses(x.data || []);
      setLoading(false);
    })();
    return () => {
      active = false;
    };
  }, [carId]);

  const best = useMemo<MonthBucket | null>(() => {
    if (earnings.length === 0) return null;
    const buckets = new Map<string, MonthBucket>();

    const expenseTotal = (exp: any) =>
      (exp.amount || 0) + (exp.toll_cost || 0) + (exp.delivery_cost || 0) +
      (exp.carwash_cost || 0) + (exp.ev_charge_cost || 0);

    for (const e of earnings) {
      if (!e.earning_period_start) continue;
      const d = new Date(`${e.earning_period_start}`);
      if (isNaN(d.getTime())) continue;
      const y = d.getFullYear();
      const m = d.getMonth() + 1;
      const key = `${y}-${String(m).padStart(2, "0")}`;
      const tripExpenses = e.trip_id
        ? expenses.filter((exp) => exp.trip_id === e.trip_id).reduce((s, exp) => s + expenseTotal(exp), 0)
        : 0;
      const net = (e.amount || 0) - tripExpenses;
      const clientPct = e.client_profit_percentage ?? 70;
      const clientNet = (net * clientPct) / 100;

      if (!buckets.has(key)) {
        buckets.set(key, { key, year: y, month: m, earningsGross: 0, netProfitClient: 0, trips: 0, expenses: 0 });
      }
      const b = buckets.get(key)!;
      b.earningsGross += e.amount || 0;
      b.netProfitClient += clientNet;
      b.trips += 1;
      b.expenses += tripExpenses;
    }

    if (buckets.size === 0) return null;
    return Array.from(buckets.values()).sort((a, b) => b.netProfitClient - a.netProfitClient)[0];
  }, [earnings, expenses]);

  if (loading) {
    return (
      <div className="rounded-2xl border border-border bg-card p-5">
        <Skeleton className="h-5 w-40 mb-3" />
        <Skeleton className="h-8 w-32 mb-2" />
        <Skeleton className="h-4 w-full" />
      </div>
    );
  }

  if (!best) {
    return (
      <div className="rounded-2xl border border-border bg-card p-5">
        <div className="flex items-center gap-2 mb-1">
          <Trophy className="w-4 h-4 text-muted-foreground" />
          <h3 className="text-sm font-semibold text-foreground">Best month</h3>
        </div>
        <p className="text-sm text-muted-foreground">
          No earnings data yet for this car. Once trips come in, your top month will appear here.
        </p>
      </div>
    );
  }

  const fmt = (n: number) =>
    `${n < 0 ? "-" : ""}$${Math.abs(n).toLocaleString("en-US", { maximumFractionDigits: 0 })}`;

  return (
    <div className="relative overflow-hidden rounded-2xl border border-amber-500/20 bg-gradient-to-br from-amber-500/10 via-amber-500/5 to-transparent p-5">
      <div className="absolute -top-6 -right-6 w-24 h-24 rounded-full bg-amber-500/10" />
      <div className="relative z-10 space-y-4">
        <div className="flex items-start justify-between gap-3">
          <div>
            <div className="flex items-center gap-2">
              <div className="w-8 h-8 rounded-lg bg-amber-500/20 flex items-center justify-center">
                <Trophy className="w-4 h-4 text-amber-600" />
              </div>
              <div>
                <p className="text-xs font-medium uppercase tracking-wider text-muted-foreground">
                  Best month
                </p>
                <p className="text-base font-bold text-foreground leading-tight">
                  {MONTHS[best.month - 1]} {best.year}
                </p>
              </div>
            </div>
            {carName && (
              <p className="text-xs text-muted-foreground mt-2 flex items-center gap-1">
                <CarIcon className="w-3 h-3" />
                {carName}
              </p>
            )}
          </div>
          <div className="text-right">
            <p className="text-xs text-muted-foreground">Net profit</p>
            <p className="text-2xl font-bold text-amber-700">{fmt(best.netProfitClient)}</p>
          </div>
        </div>

        <div className="grid grid-cols-3 gap-3 pt-3 border-t border-amber-500/15">
          <div>
            <div className="flex items-center gap-1 text-xs text-muted-foreground mb-0.5">
              <TrendingUp className="w-3 h-3" />
              Gross
            </div>
            <p className="text-sm font-semibold text-foreground">{fmt(best.earningsGross)}</p>
          </div>
          <div>
            <div className="flex items-center gap-1 text-xs text-muted-foreground mb-0.5">
              <Calendar className="w-3 h-3" />
              Trips
            </div>
            <p className="text-sm font-semibold text-foreground">{best.trips}</p>
          </div>
          <div>
            <div className="flex items-center gap-1 text-xs text-muted-foreground mb-0.5">
              Expenses
            </div>
            <p className="text-sm font-semibold text-foreground">{fmt(best.expenses)}</p>
          </div>
        </div>
      </div>
    </div>
  );
}
