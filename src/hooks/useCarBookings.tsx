import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import type { ClientEarning, ClientExpense } from "./useClientAnalytics";

export function useCarBookings(carId: string | null) {
  const [earnings, setEarnings] = useState<ClientEarning[]>([]);
  const [expenses, setExpenses] = useState<ClientExpense[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!carId) {
      setEarnings([]);
      setExpenses([]);
      return;
    }
    let cancelled = false;
    (async () => {
      setLoading(true);
      setError(null);
      try {
        const [{ data: e, error: eErr }, { data: x, error: xErr }] = await Promise.all([
          (supabase as any)
            .from("host_earnings")
            .select("*")
            .eq("car_id", carId)
            .order("earning_period_start", { ascending: false }),
          (supabase as any)
            .from("host_expenses")
            .select("*")
            .eq("car_id", carId),
        ]);
        if (eErr) throw eErr;
        if (xErr) throw xErr;
        if (!cancelled) {
          setEarnings((e || []) as ClientEarning[]);
          setExpenses((x || []) as ClientExpense[]);
        }
      } catch (err: any) {
        if (!cancelled) setError(err.message ?? "Failed to load bookings");
      } finally {
        if (!cancelled) setLoading(false);
      }
    })();
    return () => {
      cancelled = true;
    };
  }, [carId]);

  return { earnings, expenses, loading, error };
}
