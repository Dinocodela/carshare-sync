import { useState, useEffect, useCallback, useMemo } from "react";
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
  payment_source: string | null;
  earning_period_start: string;
  earning_period_end: string;
  guest_name: string | null;
  payment_date: string | null;
  earning_type: string;
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

export interface HostCar {
  id: string;
  make: string;
  model: string;
  year: number;
}

const currentYear = new Date().getFullYear();

export function useHostAnalytics(initialYear: number | null = currentYear) {
  const { user } = useAuth();
  const [selectedYear, setSelectedYear] = useState<number | null>(initialYear);
  const [availableYears, setAvailableYears] = useState<number[]>([currentYear]);

  // New filter state
  const [selectedCarId, setSelectedCarId] = useState<string | null>(null);
  const [selectedPaymentSource, setSelectedPaymentSource] = useState<string | null>(null);
  const [selectedPaymentStatus, setSelectedPaymentStatus] = useState<string | null>(null);
  const [selectedMonth, setSelectedMonth] = useState<number | null>(null);

  // Cars for filter
  const [hostCars, setHostCars] = useState<HostCar[]>([]);

  const [rawEarnings, setRawEarnings] = useState<HostEarning[]>([]);
  const [rawExpenses, setRawExpenses] = useState<HostExpense[]>([]);
  const [rawClaims, setRawClaims] = useState<HostClaim[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Fetch host cars
  const fetchHostCars = useCallback(async () => {
    if (!user?.id) return;
    try {
      const { data } = await supabase
        .from("cars")
        .select("id, make, model, year")
        .eq("host_id", user.id);
      setHostCars((data as HostCar[]) || []);
    } catch (err) {
      console.error("Error fetching host cars:", err);
    }
  }, [user?.id]);

  // Fetch available years from database
  const fetchAvailableYears = useCallback(async () => {
    if (!user?.id) return;
    try {
      const [{ data: earningsData }, { data: expensesData }, { data: claimsData }] = await Promise.all([
        supabase.from("host_earnings").select("earning_period_start").eq("host_id", user.id),
        supabase.from("host_expenses").select("expense_date").eq("host_id", user.id),
        supabase.from("host_claims").select("incident_date").eq("host_id", user.id),
      ]);

      const yearsSet = new Set<number>();
      earningsData?.forEach(e => { if (e.earning_period_start) yearsSet.add(new Date(e.earning_period_start).getFullYear()); });
      expensesData?.forEach(e => { if (e.expense_date) yearsSet.add(new Date(e.expense_date).getFullYear()); });
      claimsData?.forEach(c => { if (c.incident_date) yearsSet.add(new Date(c.incident_date).getFullYear()); });
      yearsSet.add(currentYear);
      setAvailableYears(Array.from(yearsSet).sort((a, b) => b - a));
    } catch (err) {
      console.error("Error fetching available years:", err);
      setAvailableYears([currentYear]);
    }
  }, [user?.id]);

  const fetchHostAnalytics = useCallback(async () => {
    if (!user?.id) return;
    try {
      setLoading(true);
      setError(null);

      const yearStart = selectedYear ? `${selectedYear}-01-01` : null;
      const yearEnd = selectedYear ? `${selectedYear}-12-31T23:59:59` : null;

      // Earnings query
      let earningsQuery = supabase
        .from("host_earnings").select("*").eq("host_id", user.id)
        .order("earning_period_start", { ascending: false });
      if (yearStart && yearEnd) {
        earningsQuery = earningsQuery.gte("earning_period_start", yearStart).lte("earning_period_start", yearEnd);
      }
      if (selectedCarId) {
        earningsQuery = earningsQuery.eq("car_id", selectedCarId);
      }

      // Expenses query
      let expensesQuery = supabase
        .from("host_expenses").select("*").eq("host_id", user.id)
        .order("expense_date", { ascending: false });
      if (yearStart && yearEnd) {
        expensesQuery = expensesQuery.gte("expense_date", yearStart).lte("expense_date", yearEnd);
      }
      if (selectedCarId) {
        expensesQuery = expensesQuery.eq("car_id", selectedCarId);
      }

      // Claims query
      let claimsQuery = supabase
        .from("host_claims").select("*").eq("host_id", user.id)
        .order("incident_date", { ascending: false });
      if (yearStart && yearEnd) {
        claimsQuery = claimsQuery.gte("incident_date", yearStart).lte("incident_date", yearEnd);
      }
      if (selectedCarId) {
        claimsQuery = claimsQuery.eq("car_id", selectedCarId);
      }

      const [
        { data: earningsData, error: earningsError },
        { data: expensesData, error: expensesError },
        { data: claimsData, error: claimsError },
      ] = await Promise.all([earningsQuery, expensesQuery, claimsQuery]);

      if (earningsError) throw earningsError;
      if (expensesError) throw expensesError;
      if (claimsError) throw claimsError;

      setRawEarnings(earningsData || []);
      setRawExpenses(expensesData || []);
      setRawClaims(claimsData || []);
    } catch (err) {
      console.error("Error fetching host analytics:", err);
      setError(err instanceof Error ? err.message : "Failed to fetch analytics data");
    } finally {
      setLoading(false);
    }
  }, [user?.id, selectedYear, selectedCarId]);

  // Client-side filtered data
  const earnings = useMemo(() => {
    let filtered = rawEarnings;
    if (selectedPaymentSource) {
      filtered = filtered.filter(e => e.payment_source === selectedPaymentSource);
    }
    if (selectedPaymentStatus) {
      filtered = filtered.filter(e => e.payment_status === selectedPaymentStatus);
    }
    if (selectedMonth !== null && selectedYear) {
      filtered = filtered.filter(e => {
        const month = new Date(e.earning_period_start).getMonth();
        return month === selectedMonth;
      });
    }
    return filtered;
  }, [rawEarnings, selectedPaymentSource, selectedPaymentStatus, selectedMonth, selectedYear]);

  const expenses = useMemo(() => {
    let filtered = rawExpenses;
    if (selectedMonth !== null && selectedYear) {
      filtered = filtered.filter(e => {
        const month = new Date(e.expense_date).getMonth();
        return month === selectedMonth;
      });
    }
    return filtered;
  }, [rawExpenses, selectedMonth, selectedYear]);

  const claims = useMemo(() => {
    let filtered = rawClaims;
    if (selectedMonth !== null && selectedYear) {
      filtered = filtered.filter(c => {
        const month = new Date(c.incident_date).getMonth();
        return month === selectedMonth;
      });
    }
    return filtered;
  }, [rawClaims, selectedMonth, selectedYear]);

  // Distinct payment sources from raw earnings
  const availablePaymentSources = useMemo(() => {
    const sources = new Set<string>();
    rawEarnings.forEach(e => { if (e.payment_source) sources.add(e.payment_source); });
    return Array.from(sources).sort();
  }, [rawEarnings]);

  // Summary calculation
  const summary = useMemo<HostAnalyticsSummary>(() => {
    if (!earnings.length && !expenses.length && !claims.length) {
      return {
        totalEarnings: 0, totalExpenses: 0, netProfit: 0, totalTrips: 0,
        activeHostingDays: 0, totalClaims: 0, totalClaimAmount: 0,
        approvedClaimsAmount: 0, pendingClaims: 0, averageTripEarning: 0,
      };
    }

    const totalEarnings = earnings.reduce((sum, earning) => {
      const relatedExpenses = earning.trip_id
        ? expenses.filter(exp => exp.trip_id === earning.trip_id) : [];
      const totalExp = relatedExpenses.reduce((s, exp) =>
        s + (exp.amount || 0) + (exp.delivery_cost || 0) + (exp.toll_cost || 0) +
        (exp.ev_charge_cost || 0) + (exp.carwash_cost || 0), 0);
      const netProfit = (earning.amount || 0) - totalExp;
      const hostPct = earning.host_profit_percentage || 30;
      return sum + (netProfit * hostPct / 100);
    }, 0);

    const totalTrips = earnings.length;
    const averageTripEarning = totalTrips > 0 ? totalEarnings / totalTrips : 0;

    const uniqueDates = new Set(
      earnings.flatMap(earning => {
        const start = new Date(earning.earning_period_start);
        const end = new Date(earning.earning_period_end);
        const dates: string[] = [];
        for (let d = new Date(start); d <= end; d.setDate(d.getDate() + 1)) {
          dates.push(d.toISOString().split("T")[0]);
        }
        return dates;
      }),
    );

    const totalExpenses = expenses.reduce(
      (sum, e) => sum + (e.amount ?? 0) + (e.delivery_cost ?? 0) + (e.toll_cost ?? 0) +
        (e.ev_charge_cost ?? 0) + (e.carwash_cost ?? 0), 0);

    const totalClaims = claims.length;
    const totalClaimAmount = claims.reduce((sum, c) => sum + (c.claim_amount || 0), 0);
    const approvedClaimsAmount = claims
      .filter(c => c.claim_status === "approved")
      .reduce((sum, c) => sum + (c.claim_amount || 0), 0);
    const pendingClaims = claims.filter(c => c.claim_status === "pending").length;

    return {
      totalEarnings, totalExpenses, netProfit: totalEarnings - totalExpenses,
      totalTrips, activeHostingDays: uniqueDates.size, totalClaims,
      totalClaimAmount, approvedClaimsAmount, pendingClaims, averageTripEarning,
    };
  }, [earnings, expenses, claims]);

  useEffect(() => {
    if (user?.id) {
      fetchAvailableYears();
      fetchHostCars();
      fetchHostAnalytics();
    }
  }, [user?.id, fetchAvailableYears, fetchHostCars, fetchHostAnalytics]);

  const refetch = useCallback(() => {
    fetchAvailableYears();
    fetchHostCars();
    fetchHostAnalytics();
  }, [fetchAvailableYears, fetchHostCars, fetchHostAnalytics]);

  const clearFilters = useCallback(() => {
    setSelectedCarId(null);
    setSelectedPaymentSource(null);
    setSelectedPaymentStatus(null);
    setSelectedMonth(null);
  }, []);

  const hasActiveFilters = selectedCarId !== null || selectedPaymentSource !== null ||
    selectedPaymentStatus !== null || selectedMonth !== null;

  return {
    earnings, expenses, claims, summary,
    loading, error, refetch,
    selectedYear, setSelectedYear, availableYears,
    // New filter API
    selectedCarId, setSelectedCarId,
    selectedPaymentSource, setSelectedPaymentSource,
    selectedPaymentStatus, setSelectedPaymentStatus,
    selectedMonth, setSelectedMonth,
    hostCars, availablePaymentSources,
    clearFilters, hasActiveFilters,
  };
}
