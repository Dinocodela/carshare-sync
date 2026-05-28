import { useQuery, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/useAuth";

export type InvestorVehicle = {
  id: string;
  make: string;
  model: string;
  year: number;
  vin: string | null;
  mileage: number | null;
  color: string | null;
  condition: string | null;
  location: string | null;
  status: string;
  purchase_price: number;
  investment_amount: number;
  monthly_return: number;
  term_months: number;
  resale_upside_pct: number;
  estimated_resale_value: number | null;
  photos: string[];
  description: string | null;
  highlights: string[];
  available_at: string;
};

export type Investment = {
  id: string;
  investor_id: string;
  vehicle_id: string;
  amount: number;
  monthly_return: number;
  term_months: number;
  resale_upside_pct: number;
  start_date: string | null;
  end_date: string | null;
  months_completed: number;
  total_returns_paid: number;
  status: string;
  payment_method: string | null;
  payment_reference: string | null;
  notes: string | null;
  requested_at: string;
  funded_at: string | null;
};

export type InvestmentPayout = {
  id: string;
  investment_id: string;
  payout_month: number;
  amount: number;
  scheduled_date: string;
  paid_date: string | null;
  method: string | null;
  reference: string | null;
  status: string;
};

export function useInvestorVehicles() {
  return useQuery({
    queryKey: ["investor-vehicles"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("investor_vehicles")
        .select("*")
        .in("status", ["available", "funded", "active", "sold"])
        .order("available_at", { ascending: false });
      if (error) throw error;
      return (data ?? []) as InvestorVehicle[];
    },
  });
}

export function useInvestorVehicle(id: string | undefined) {
  return useQuery({
    queryKey: ["investor-vehicle", id],
    enabled: !!id,
    queryFn: async () => {
      const { data, error } = await supabase
        .from("investor_vehicles")
        .select("*")
        .eq("id", id!)
        .maybeSingle();
      if (error) throw error;
      return data as InvestorVehicle | null;
    },
  });
}

export function useMyInvestments() {
  const { user } = useAuth();
  return useQuery({
    queryKey: ["my-investments", user?.id],
    enabled: !!user,
    queryFn: async () => {
      const { data, error } = await supabase
        .from("investments")
        .select("*")
        .eq("investor_id", user!.id)
        .order("requested_at", { ascending: false });
      if (error) throw error;
      return (data ?? []) as Investment[];
    },
  });
}

export function useMyPayouts() {
  const { user } = useAuth();
  return useQuery({
    queryKey: ["my-payouts", user?.id],
    enabled: !!user,
    queryFn: async () => {
      const { data, error } = await supabase
        .from("investment_payouts")
        .select("*")
        .order("scheduled_date", { ascending: false });
      if (error) throw error;
      return (data ?? []) as InvestmentPayout[];
    },
  });
}

export function useInvestorCacheReset() {
  const qc = useQueryClient();
  return () => {
    qc.invalidateQueries({ queryKey: ["my-investments"] });
    qc.invalidateQueries({ queryKey: ["my-payouts"] });
    qc.invalidateQueries({ queryKey: ["investor-vehicles"] });
  };
}

export const fmtCurrency = (n: number | null | undefined) =>
  new Intl.NumberFormat("en-US", {
    style: "currency",
    currency: "USD",
    maximumFractionDigits: 0,
  }).format(Number(n ?? 0));
