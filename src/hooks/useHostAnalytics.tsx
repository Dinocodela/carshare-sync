import { useState, useEffect, useCallback } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "./useAuth";

interface HostEarning {
  id: string;
  trip_id: string | null;
  car_id: string;
  amount: number;
  net_amount: number;
  gross_earnings: number | null;
  host_profit_percentage: number | null;
  payment_status: string;
  earning_period_start: string;
  earning_period_end: string;
  guest_name: string | null;
  payment_date: string | null;
  earning_type: string;
  payment_source: string | null;
  created_at: string;
}

interface HostExpense {
  id: string;
  trip_id: string | null;
  car_id: string | null;
  amount: number;
  expense_type: string;
  expense_date: string;
  description: string | null;
  guest_name: string | null;
  delivery_cost: number;
  toll_cost: number;
  ev_charge_cost: number;
  carwash_cost: number;
  created_at: string;
}

interface HostClaim {
  id: string;
  car_id: string;
  claim_type: string;
  claim_status: string;
  claim_amount: number | null;
  incident_date: string;
  description: string;
  created_at: string;
  trip_id: string | null;
  is_paid: boolean;
}

interface HostAnalyticsSummary {
  totalEarnings: number;
  totalExpenses: number;
  netProfit: number;
  totalTrips: number;
  activeHostingDays: number;
  totalClaims: number;
  totalClaimAmount: number;
  approvedClaimsAmount: number;
  pendingClaims: number;
  averageTripEarning: number;
}

const currentYear = new Date().getFullYear();

export function useHostAnalytics(initialYear: number | null = currentYear) {
  const { user } = useAuth();
  const [selectedYear, setSelectedYear] = useState<number | null>(initialYear);
  const [availableYears, setAvailableYears] = useState<number[]>([currentYear]);
  const [earnings, setEarnings] = useState<HostEarning[]>([]);
  const [expenses, setExpenses] = useState<HostExpense[]>([]);
  const [claims, setClaims] = useState<HostClaim[]>([]);
  const [summary, setSummary] = useState<HostAnalyticsSummary>({
    totalEarnings: 0,
    totalExpenses: 0,
    netProfit: 0,
    totalTrips: 0,
    activeHostingDays: 0,
    totalClaims: 0,
    totalClaimAmount: 0,
    approvedClaimsAmount: 0,
    pendingClaims: 0,
    averageTripEarning: 0,
  });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Fetch available years from database
  const fetchAvailableYears = useCallback(async () => {
    if (!user?.id) return;

    try {
      // Fetch years from earnings
      const { data: earningsData } = await supabase
        .from("host_earnings")
        .select("earning_period_start")
        .eq("host_id", user.id);

      // Fetch years from expenses  
      const { data: expensesData } = await supabase
        .from("host_expenses")
        .select("expense_date")
        .eq("host_id", user.id);

      // Fetch years from claims
      const { data: claimsData } = await supabase
        .from("host_claims")
        .select("incident_date")
        .eq("host_id", user.id);

      // Extract unique years from all sources
      const yearsSet = new Set<number>();
      
      earningsData?.forEach(e => {
        if (e.earning_period_start) {
          yearsSet.add(new Date(e.earning_period_start).getFullYear());
        }
      });
      
      expensesData?.forEach(e => {
        if (e.expense_date) {
          yearsSet.add(new Date(e.expense_date).getFullYear());
        }
      });
      
      claimsData?.forEach(c => {
        if (c.incident_date) {
          yearsSet.add(new Date(c.incident_date).getFullYear());
        }
      });

      // Always include current year
      yearsSet.add(currentYear);

      // Sort descending (most recent first)
      const sortedYears = Array.from(yearsSet).sort((a, b) => b - a);
      setAvailableYears(sortedYears);
    } catch (err) {
      console.error("Error fetching available years:", err);
      // Fallback to current year
      setAvailableYears([currentYear]);
    }
  }, [user?.id]);

  const fetchHostAnalytics = useCallback(async () => {
    if (!user?.id) return;

    try {
      setLoading(true);
      setError(null);

      // Build date range for filtering
      const yearStart = selectedYear ? `${selectedYear}-01-01` : null;
      const yearEnd = selectedYear ? `${selectedYear}-12-31T23:59:59` : null;

      // Fetch host earnings
      let earningsQuery = supabase
        .from("host_earnings")
        .select("*")
        .eq("host_id", user.id)
        .order("earning_period_start", { ascending: false });

      if (yearStart && yearEnd) {
        earningsQuery = earningsQuery
          .gte("earning_period_start", yearStart)
          .lte("earning_period_start", yearEnd);
      }

      const { data: earningsData, error: earningsError } = await earningsQuery;
      if (earningsError) throw earningsError;

      // Fetch host expenses
      let expensesQuery = supabase
        .from("host_expenses")
        .select("*")
        .eq("host_id", user.id)
        .order("expense_date", { ascending: false });

      if (yearStart && yearEnd) {
        expensesQuery = expensesQuery
          .gte("expense_date", yearStart)
          .lte("expense_date", yearEnd);
      }

      const { data: expensesData, error: expensesError } = await expensesQuery;
      if (expensesError) throw expensesError;

      // Fetch host claims
      let claimsQuery = supabase
        .from("host_claims")
        .select("*")
        .eq("host_id", user.id)
        .order("incident_date", { ascending: false });

      if (yearStart && yearEnd) {
        claimsQuery = claimsQuery
          .gte("incident_date", yearStart)
          .lte("incident_date", yearEnd);
      }

      const { data: claimsData, error: claimsError } = await claimsQuery;
      if (claimsError) throw claimsError;

      setEarnings(earningsData || []);
      setExpenses(expensesData || []);
      setClaims(claimsData || []);
    } catch (err) {
      console.error("Error fetching host analytics:", err);
      setError(err instanceof Error ? err.message : "Failed to fetch analytics data");
    } finally {
      setLoading(false);
    }
  }, [user?.id, selectedYear]);

  const calculateSummary = useCallback(() => {
    if (!earnings.length && !expenses.length && !claims.length) {
      setSummary({
        totalEarnings: 0,
        totalExpenses: 0,
        netProfit: 0,
        totalTrips: 0,
        activeHostingDays: 0,
        totalClaims: 0,
        totalClaimAmount: 0,
        approvedClaimsAmount: 0,
        pendingClaims: 0,
        averageTripEarning: 0,
      });
      return;
    }

    // Calculate host earnings: (earning.amount - related expenses) * host_profit_percentage
    const totalEarnings = earnings.reduce((sum, earning) => {
      // Find related expenses for this earning's trip
      const relatedExpenses = earning.trip_id 
        ? expenses.filter(exp => exp.trip_id === earning.trip_id)
        : [];
      const totalExp = relatedExpenses.reduce((expSum, exp) => 
        expSum + (exp.amount || 0) + (exp.delivery_cost || 0) + (exp.toll_cost || 0) + 
        (exp.ev_charge_cost || 0) + (exp.carwash_cost || 0), 0);
      const netProfit = (earning.amount || 0) - totalExp;
      const hostPct = earning.host_profit_percentage || 30;
      return sum + (netProfit * hostPct / 100);
    }, 0);
    const totalTrips = earnings.length;
    const averageTripEarning = totalTrips > 0 ? totalEarnings / totalTrips : 0;

    // Calculate unique hosting days
    const uniqueDates = new Set(
      earnings.flatMap((earning) => {
        const start = new Date(earning.earning_period_start);
        const end = new Date(earning.earning_period_end);
        const dates = [];
        for (let d = new Date(start); d <= end; d.setDate(d.getDate() + 1)) {
          dates.push(d.toISOString().split("T")[0]);
        }
        return dates;
      }),
    );
    const activeHostingDays = uniqueDates.size;

    // Calculate expense metrics
    const totalExpenses = expenses.reduce(
      (sum, e) =>
        sum +
        (e.amount ?? 0) +
        (e.delivery_cost ?? 0) +
        (e.toll_cost ?? 0) +
        (e.ev_charge_cost ?? 0) +
        (e.carwash_cost ?? 0),
      0,
    );

    // Calculate net profit
    const netProfit = totalEarnings - totalExpenses;

    // Calculate claims metrics
    const totalClaims = claims.length;
    const totalClaimAmount = claims.reduce((sum, claim) => sum + (claim.claim_amount || 0), 0);
    const approvedClaimsAmount = claims
      .filter((claim) => claim.claim_status === "approved")
      .reduce((sum, claim) => sum + (claim.claim_amount || 0), 0);
    const pendingClaims = claims.filter((claim) => claim.claim_status === "pending").length;

    setSummary({
      totalEarnings,
      totalExpenses,
      netProfit,
      totalTrips,
      activeHostingDays,
      totalClaims,
      totalClaimAmount,
      approvedClaimsAmount,
      pendingClaims,
      averageTripEarning,
    });
  }, [earnings, expenses, claims]);

  useEffect(() => {
    if (user?.id) {
      fetchAvailableYears();
      fetchHostAnalytics();
    }
  }, [user?.id, fetchAvailableYears, fetchHostAnalytics]);

  useEffect(() => {
    calculateSummary();
  }, [calculateSummary]);

  const refetch = useCallback(() => {
    fetchAvailableYears();
    fetchHostAnalytics();
  }, [fetchAvailableYears, fetchHostAnalytics]);

  return {
    earnings,
    expenses,
    claims,
    summary,
    loading,
    error,
    refetch,
    selectedYear,
    setSelectedYear,
    availableYears,
  };
}
