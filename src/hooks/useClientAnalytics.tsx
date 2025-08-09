import { useState, useEffect } from 'react';
import { useAuth } from './useAuth';
import { supabase } from '@/integrations/supabase/client';

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
  approved_amount: number | null;
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

export function useClientAnalytics() {
  const { user } = useAuth();
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

  const fetchClientAnalytics = async () => {
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
      const { data: earningsData, error: earningsError } = await supabase
        .from('host_earnings')
        .select('*')
        .in('car_id', carIds)
        .order('created_at', { ascending: false });

      if (earningsError) throw earningsError;
      setEarnings(earningsData || []);

      // Get expenses for user's cars
      const { data: expensesData, error: expensesError } = await supabase
        .from('host_expenses')
        .select('*')
        .in('car_id', carIds)
        .order('created_at', { ascending: false });

      if (expensesError) throw expensesError;
      setExpenses(expensesData || []);

      // Get claims for user's cars
      const { data: claimsData, error: claimsError } = await supabase
        .from('host_claims')
        .select('*')
        .in('car_id', carIds)
        .order('created_at', { ascending: false });

      if (claimsError) throw claimsError;
      setClaims(claimsData || []);
      console.log('Client Analytics - Claims loaded:', claimsData?.length || 0, claimsData);

    } catch (err) {
      console.error('Error fetching client analytics:', err);
      setError('Failed to load analytics data');
    }
  };

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
      .reduce((sum, claim) => sum + (claim.approved_amount || claim.claim_amount || 0), 0);

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
  }, [user]);

  useEffect(() => {
    calculateSummary();
  }, [earnings, expenses, claims]);

  const refetch = () => {
    fetchClientAnalytics();
  };

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