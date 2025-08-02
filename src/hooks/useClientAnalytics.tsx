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

export interface AnalyticsSummary {
  totalEarnings: number;
  totalExpenses: number;
  netProfit: number;
  activeDays: number;
  totalTrips: number;
  averagePerTrip: number;
}

export function useClientAnalytics() {
  const { user } = useAuth();
  const [earnings, setEarnings] = useState<ClientEarning[]>([]);
  const [expenses, setExpenses] = useState<ClientExpense[]>([]);
  const [summary, setSummary] = useState<AnalyticsSummary>({
    totalEarnings: 0,
    totalExpenses: 0,
    netProfit: 0,
    activeDays: 0,
    totalTrips: 0,
    averagePerTrip: 0,
  });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchClientEarnings = async () => {
    if (!user) return;

    try {
      setError(null);
      
      // First get user's cars
      const { data: userCars, error: carsError } = await supabase
        .from('cars')
        .select('id')
        .eq('client_id', user.id);

      if (carsError) throw carsError;

      if (!userCars || userCars.length === 0) {
        setEarnings([]);
        return;
      }

      const carIds = userCars.map(car => car.id);

      // Get earnings for user's cars
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

    } catch (err) {
      console.error('Error fetching client analytics:', err);
      setError('Failed to load analytics data');
    }
  };

  const calculateSummary = () => {
    const totalEarnings = earnings.reduce((sum, earning) => sum + (earning.client_profit_amount || 0), 0);
    const totalExpenses = expenses.reduce((sum, expense) => sum + expense.amount, 0);
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

    setSummary({
      totalEarnings,
      totalExpenses,
      netProfit,
      activeDays,
      totalTrips,
      averagePerTrip,
    });
  };

  useEffect(() => {
    const fetchData = async () => {
      setLoading(true);
      await fetchClientEarnings();
      setLoading(false);
    };

    fetchData();
  }, [user]);

  useEffect(() => {
    calculateSummary();
  }, [earnings, expenses]);

  const refetch = () => {
    fetchClientEarnings();
  };

  return {
    earnings,
    expenses,
    summary,
    loading,
    error,
    refetch,
  };
}