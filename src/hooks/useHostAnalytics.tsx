import { useState, useEffect, useCallback } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from './useAuth';

interface HostEarning {
  id: string;
  trip_id: string | null;
  car_id: string;
  amount: number;
  host_profit_amount: number;
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
  approved_amount: number | null;
  incident_date: string;
  description: string;
  created_at: string;
  trip_id: string | null;
}

interface HostAnalyticsSummary {
  totalEarnings: number;
  totalExpenses: number;
  netProfit: number;
  totalTrips: number;
  activeHostingDays: number;
  totalClaims: number;
  totalClaimAmount: number;
  approvedClaimAmount: number;
  pendingClaims: number;
  averageTripEarning: number;
}

export function useHostAnalytics() {
  const { user } = useAuth();
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
    approvedClaimAmount: 0,
    pendingClaims: 0,
    averageTripEarning: 0,
  });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchHostAnalytics = useCallback(async () => {
    if (!user?.id) return;

    try {
      setLoading(true);
      setError(null);

      // Fetch host earnings
      const { data: earningsData, error: earningsError } = await supabase
        .from('host_earnings')
        .select('*')
        .eq('host_id', user.id)
        .order('earning_period_start', { ascending: false });

      if (earningsError) throw earningsError;

      // Fetch host expenses
      const { data: expensesData, error: expensesError } = await supabase
        .from('host_expenses')
        .select('*')
        .eq('host_id', user.id)
        .order('expense_date', { ascending: false });

      if (expensesError) throw expensesError;

      // Fetch host claims
      const { data: claimsData, error: claimsError } = await supabase
        .from('host_claims')
        .select('*')
        .eq('host_id', user.id)
        .order('incident_date', { ascending: false });

      if (claimsError) throw claimsError;

      setEarnings(earningsData || []);
      setExpenses(expensesData || []);
      setClaims(claimsData || []);
    } catch (err) {
      console.error('Error fetching host analytics:', err);
      setError(err instanceof Error ? err.message : 'Failed to fetch analytics data');
    } finally {
      setLoading(false);
    }
  }, [user?.id]);

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
        approvedClaimAmount: 0,
        pendingClaims: 0,
        averageTripEarning: 0,
      });
      return;
    }

    // Calculate earnings metrics
    const totalEarnings = earnings.reduce((sum, earning) => sum + (earning.host_profit_amount || 0), 0);
    const totalTrips = earnings.length;
    const averageTripEarning = totalTrips > 0 ? totalEarnings / totalTrips : 0;

    // Calculate unique hosting days
    const uniqueDates = new Set(
      earnings.flatMap(earning => {
        const start = new Date(earning.earning_period_start);
        const end = new Date(earning.earning_period_end);
        const dates = [];
        for (let d = new Date(start); d <= end; d.setDate(d.getDate() + 1)) {
          dates.push(d.toISOString().split('T')[0]);
        }
        return dates;
      })
    );
    const activeHostingDays = uniqueDates.size;

    // Calculate expense metrics
    const totalExpenses = expenses.reduce((sum, expense) => sum + expense.amount, 0);

    // Calculate net profit
    const netProfit = totalEarnings - totalExpenses;

    // Calculate claims metrics
    const totalClaims = claims.length;
    const totalClaimAmount = claims.reduce((sum, claim) => sum + (claim.claim_amount || 0), 0);
    const approvedClaimAmount = claims
      .filter(claim => claim.claim_status === 'approved')
      .reduce((sum, claim) => sum + (claim.approved_amount || 0), 0);
    const pendingClaims = claims.filter(claim => claim.claim_status === 'pending').length;

    setSummary({
      totalEarnings,
      totalExpenses,
      netProfit,
      totalTrips,
      activeHostingDays,
      totalClaims,
      totalClaimAmount,
      approvedClaimAmount,
      pendingClaims,
      averageTripEarning,
    });
  }, [earnings, expenses, claims]);

  useEffect(() => {
    if (user?.id) {
      fetchHostAnalytics();
    }
  }, [user?.id, fetchHostAnalytics]);

  useEffect(() => {
    calculateSummary();
  }, [calculateSummary]);

  const refetch = useCallback(() => {
    fetchHostAnalytics();
  }, [fetchHostAnalytics]);

  return {
    earnings,
    expenses,
    claims,
    summary,
    loading,
    error,
    refetch,
  };
}