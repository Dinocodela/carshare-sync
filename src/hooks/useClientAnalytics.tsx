import { useState, useEffect, useCallback } from 'react';
import { useAuth } from './useAuth';
import { supabase } from '@/integrations/supabase/client';

const AVAILABLE_YEARS = [2022, 2023, 2024, 2025];

export interface ClientEarning {
  id: string;
  car_id: string;
  host_id: string;
  amount: number;
  commission: number;
  net_amount: number;
  gross_earnings: number;
  client_profit_percentage: number;
  host_profit_percentage: number;
  host_profit_amount: number;
  client_profit_amount: number;
  payment_date: string | null;
  earning_period_start: string;
  earning_period_end: string;
  payment_status: string;
  trip_id?: string | null;
  guest_name?: string | null;
  earning_type: string;
  payment_source: string;
  created_at: string;
}

export interface ClientExpense {
  id: string;
  car_id: string;
  host_id: string;
  expense_type: string;
  amount: number;
  expense_date: string;
  description?: string | null;
  trip_id?: string | null;
  guest_name?: string | null;
  toll_cost: number;
  delivery_cost: number;
  carwash_cost: number;
  ev_charge_cost: number;
  created_at: string;
}

export interface ClientClaim {
  id: string;
  car_id: string;
  host_id: string;
  claim_type: string;
  claim_amount: number | null;
  claim_status: string;
  incident_date: string;
  created_at: string;
  trip_id?: string | null;
  description: string;
}

export interface AnalyticsSummary {
  totalEarnings: number;
  totalExpenses: number;
  netProfit: number;
  activeDays: number;
  totalTrips: number;
  averagePerTrip: number;
  totalClaims: number;
  pendingClaims: number;
  approvedClaimsAmount: number;
}

export function useClientAnalytics(initialYear: number | null = new Date().getFullYear()) {
  const { user } = useAuth();
  const [selectedYear, setSelectedYear] = useState<number | null>(initialYear);
  const [earnings, setEarnings] = useState<ClientEarning[]>([]);
  const [expenses, setExpenses] = useState<ClientExpense[]>([]);
  const [claims, setClaims] = useState<ClientClaim[]>([]);
  const [summary, setSummary] = useState<AnalyticsSummary>({
    totalEarnings: 0,
    totalExpenses: 0,
    netProfit: 0,
    activeDays: 0,
    totalTrips: 0,
    averagePerTrip: 0,
    totalClaims: 0,
    pendingClaims: 0,
    approvedClaimsAmount: 0,
  });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchClientAnalytics = useCallback(async () => {
    if (!user) return;

    try {
      setError(null);
      
      // Get accessible cars: owned + shared
      const { data: ownedCars, error: carsError } = await supabase
        .from('cars')
        .select('id')
        .eq('client_id', user.id);
      if (carsError) throw carsError;

      const { data: access, error: accessErr } = await supabase
        .from('car_access')
        .select('car_id')
        .eq('user_id', user.id);
      if (accessErr) throw accessErr;

      const ownedIds = (ownedCars || []).map((c: any) => c.id);
      const sharedIds = (access || []).map((a: any) => a.car_id);
      const carIds = Array.from(new Set([...ownedIds, ...sharedIds]));

      if (carIds.length === 0) {
        setEarnings([]);
        setExpenses([]);
        setClaims([]);
        return;
      }

      // Build year filter for earnings (based on earning_period_start)
      let earningsQuery = supabase
        .from('host_earnings')
        .select('*')
        .in('car_id', carIds)
        .order('created_at', { ascending: false });

      if (selectedYear !== null) {
        const yearStart = `${selectedYear}-01-01T00:00:00`;
        const yearEnd = `${selectedYear}-12-31T23:59:59`;
        earningsQuery = earningsQuery
          .gte('earning_period_start', yearStart)
          .lte('earning_period_start', yearEnd);
      }

      const { data: earningsData, error: earningsError } = await earningsQuery;
      if (earningsError) throw earningsError;
      setEarnings(earningsData || []);

      // Build year filter for expenses (based on expense_date)
      let expensesQuery = supabase
        .from('host_expenses')
        .select('*')
        .in('car_id', carIds)
        .order('created_at', { ascending: false });

      if (selectedYear !== null) {
        const yearStart = `${selectedYear}-01-01`;
        const yearEnd = `${selectedYear}-12-31`;
        expensesQuery = expensesQuery
          .gte('expense_date', yearStart)
          .lte('expense_date', yearEnd);
      }

      const { data: expensesData, error: expensesError } = await expensesQuery;
      if (expensesError) throw expensesError;
      setExpenses(expensesData || []);

      // Build year filter for claims (based on incident_date)
      let claimsQuery = supabase
        .from('host_claims')
        .select('*')
        .in('car_id', carIds)
        .order('created_at', { ascending: false });

      if (selectedYear !== null) {
        const yearStart = `${selectedYear}-01-01`;
        const yearEnd = `${selectedYear}-12-31`;
        claimsQuery = claimsQuery
          .gte('incident_date', yearStart)
          .lte('incident_date', yearEnd);
      }

      const { data: claimsData, error: claimsError } = await claimsQuery;
      if (claimsError) throw claimsError;
      setClaims(claimsData || []);

    } catch (err) {
      console.error('Error fetching client analytics:', err);
      setError('Failed to load analytics data');
    }
  }, [user, selectedYear]);

  const calculateSummary = () => {
    const totalEarnings = earnings.reduce((sum, earning) => sum + (earning.client_profit_amount || 0), 0);
    // Calculate total expenses from individual cost components
    const totalExpenses = expenses.reduce((sum, expense) => {
      const expenseTotal = (expense.amount || 0) + 
                          (expense.toll_cost || 0) + 
                          (expense.delivery_cost || 0) + 
                          (expense.carwash_cost || 0) + 
                          (expense.ev_charge_cost || 0);
      return sum + expenseTotal;
    }, 0);
    const netProfit = totalEarnings - totalExpenses;
    const totalTrips = earnings.length;
    const averagePerTrip = totalTrips > 0 ? totalEarnings / totalTrips : 0;
    
    // Calculate active days (unique earning dates)
    const uniqueDates = new Set(
      earnings
        .filter(e => e.earning_period_start)
        .map(e => e.earning_period_start.split('T')[0])
    );
    const activeDays = uniqueDates.size;

    // Calculate claims summary
    const totalClaims = claims.length;
    const pendingClaims = claims.filter(claim => claim.claim_status === 'pending').length;
    const approvedClaimsAmount = claims
      .filter(claim => claim.claim_status === 'approved')
      .reduce((sum, claim) => sum + (claim.claim_amount || 0), 0);

    setSummary({
      totalEarnings,
      totalExpenses,
      netProfit,
      activeDays,
      totalTrips,
      averagePerTrip,
      totalClaims,
      pendingClaims,
      approvedClaimsAmount,
    });
  };

  useEffect(() => {
    const fetchData = async () => {
      setLoading(true);
      await fetchClientAnalytics();
      setLoading(false);
    };

    fetchData();
  }, [user, selectedYear, fetchClientAnalytics]);

  useEffect(() => {
    calculateSummary();
  }, [earnings, expenses, claims]);

  const refetch = useCallback(() => {
    fetchClientAnalytics();
  }, [fetchClientAnalytics]);

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
    availableYears: AVAILABLE_YEARS,
  };
}