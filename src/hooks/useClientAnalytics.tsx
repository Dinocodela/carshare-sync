import { useState, useEffect, useCallback } from 'react';
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

export interface CarInfo {
  id: string;
  make: string;
  model: string;
  year: number;
  license_plate: string | null;
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

const getDateRange = (year: number | null, month: number | null) => {
  if (!year) return null;

  const monthIndex = month ?? 1;
  const lastDay = month ? new Date(year, month, 0).getDate() : 31;
  const endMonth = month ?? 12;

  return {
    timestampStart: `${year}-${String(monthIndex).padStart(2, '0')}-01T00:00:00`,
    timestampEnd: `${year}-${String(endMonth).padStart(2, '0')}-${String(lastDay).padStart(2, '0')}T23:59:59`,
    dateStart: `${year}-${String(monthIndex).padStart(2, '0')}-01`,
    dateEnd: `${year}-${String(endMonth).padStart(2, '0')}-${String(lastDay).padStart(2, '0')}`,
  };
};

export function useClientAnalytics(initialYear: number | null = new Date().getFullYear()) {
  const { user } = useAuth();
  const [selectedYear, setSelectedYear] = useState<number | null>(initialYear);
  const [selectedMonth, setSelectedMonth] = useState<number | null>(null);
  const [earnings, setEarnings] = useState<ClientEarning[]>([]);
  const [expenses, setExpenses] = useState<ClientExpense[]>([]);
  const [claims, setClaims] = useState<ClientClaim[]>([]);
  const [carsMap, setCarsMap] = useState<Record<string, CarInfo>>({});
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
  const [availableYears, setAvailableYears] = useState<number[]>([new Date().getFullYear()]);

  const fetchAvailableYears = useCallback(async (carIds: string[]) => {
    if (carIds.length === 0) return;
    try {
      const yearsSet = new Set<number>();
      const { data: e } = await supabase.from('host_earnings').select('earning_period_start').in('car_id', carIds);
      (e || []).forEach((r: any) => { if (r.earning_period_start) yearsSet.add(new Date(r.earning_period_start).getFullYear()); });
      const { data: x } = await supabase.from('host_expenses').select('expense_date').in('car_id', carIds);
      (x || []).forEach((r: any) => { if (r.expense_date) yearsSet.add(new Date(r.expense_date).getFullYear()); });
      const { data: c } = await supabase.from('host_claims').select('incident_date').in('car_id', carIds);
      (c || []).forEach((r: any) => { if (r.incident_date) yearsSet.add(new Date(r.incident_date).getFullYear()); });
      if (yearsSet.size > 0) setAvailableYears(Array.from(yearsSet).sort((a, b) => b - a));
    } catch (err) { console.error('Error fetching available years:', err); }
  }, []);

  const fetchClientAnalytics = useCallback(async () => {
    if (!user) return;

    try {
      setError(null);
      
      // Get accessible cars: owned + shared
      const { data: ownedCars, error: carsError } = await supabase
        .from('cars')
        .select('id, make, model, year, license_plate')
        .eq('client_id', user.id);
      if (carsError) throw carsError;

      const { data: access, error: accessErr } = await supabase
        .from('car_access')
        .select('car_id')
        .eq('user_id', user.id);
      if (accessErr) throw accessErr;

      // Build car info map from owned cars
      const carInfoMap: Record<string, CarInfo> = {};
      (ownedCars || []).forEach((c: any) => {
        carInfoMap[c.id] = { id: c.id, make: c.make, model: c.model, year: c.year, license_plate: c.license_plate };
      });

      const ownedIds = (ownedCars || []).map((c: any) => c.id);
      const sharedIds = (access || []).map((a: any) => a.car_id);
      const carIds = Array.from(new Set([...ownedIds, ...sharedIds]));

      if (carIds.length === 0) {
        setEarnings([]);
        setExpenses([]);
        setClaims([]);
        setCarsMap({});
        return;
      }

      // Fetch shared car details
      const missingIds = sharedIds.filter((id: string) => !carInfoMap[id]);
      if (missingIds.length > 0) {
        const { data: sharedCars } = await supabase
          .from('cars')
          .select('id, make, model, year, license_plate')
          .in('id', missingIds);
        (sharedCars || []).forEach((c: any) => {
          carInfoMap[c.id] = { id: c.id, make: c.make, model: c.model, year: c.year, license_plate: c.license_plate };
        });
      }

      setCarsMap(carInfoMap);

      fetchAvailableYears(carIds);
      let earningsQuery = supabase
        .from('host_earnings')
        .select('id, car_id, host_id, amount, commission, net_amount, gross_earnings, client_profit_percentage, host_profit_percentage, payment_date, earning_period_start, earning_period_end, payment_status, trip_id, guest_name, earning_type, payment_source, created_at')
        .in('car_id', carIds)
        .order('created_at', { ascending: false });

      const dateRange = getDateRange(selectedYear, selectedMonth);

      if (dateRange) {
        earningsQuery = earningsQuery
          .gte('earning_period_start', dateRange.timestampStart)
          .lte('earning_period_start', dateRange.timestampEnd);
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

      if (dateRange) {
        expensesQuery = expensesQuery
          .gte('expense_date', dateRange.dateStart)
          .lte('expense_date', dateRange.dateEnd);
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

      if (dateRange) {
        claimsQuery = claimsQuery
          .gte('incident_date', dateRange.dateStart)
          .lte('incident_date', dateRange.dateEnd);
      }

      const { data: claimsData, error: claimsError } = await claimsQuery;
      if (claimsError) throw claimsError;
      setClaims(claimsData || []);

    } catch (err) {
      console.error('Error fetching client analytics:', err);
      setError('Failed to load analytics data');
    }
  }, [user, selectedYear, selectedMonth]);

  const calculateSummary = () => {
    const totalEarnings = earnings.reduce((sum, earning) => {
      // Match expenses by trip_id and subtract before applying profit split
      const tripExpenses = earning.trip_id
        ? expenses
            .filter(exp => exp.trip_id === earning.trip_id)
            .reduce((s, exp) => s + (exp.amount || 0) + (exp.toll_cost || 0) + (exp.delivery_cost || 0) + (exp.carwash_cost || 0) + (exp.ev_charge_cost || 0), 0)
        : 0;
      const net = earning.amount - tripExpenses;
      return sum + ((net * (earning.client_profit_percentage || 70) / 100) || 0);
    }, 0);
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
  }, [user, selectedYear, selectedMonth, fetchClientAnalytics]);

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
    carsMap,
    summary,
    loading,
    error,
    refetch,
    selectedYear,
    setSelectedYear,
    selectedMonth,
    setSelectedMonth,
    availableYears,
  };
}