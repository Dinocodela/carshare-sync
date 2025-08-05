import { useState, useEffect, useMemo } from 'react';
import { useAuth } from './useAuth';
import { supabase } from '@/integrations/supabase/client';
import { ClientEarning, ClientExpense, ClientClaim } from './useClientAnalytics';
import { useClientCarExpenses } from './useClientCarExpenses';

export interface CarPerformance {
  car_id: string;
  car_make: string;
  car_model: string;
  car_year: number;
  car_status: string;
  totalEarnings: number;
  totalExpenses: number;
  monthlyFixedCosts: number;
  trueNetProfit: number;
  netProfit: number; // Keep for backward compatibility
  profitMargin: number;
  totalTrips: number;
  averagePerTrip: number;
  activeDays: number;
  utilizationRate: number;
  totalClaims: number;
  claimsAmount: number;
  lastTripDate: string | null;
  recommendation: 'keep_active' | 'monitor' | 'return' | 'optimize';
  recommendationReason: string;
  roi: number;
  riskScore: number;
  breakEvenTrips: number;
}

export interface CarAnalyticsData {
  earnings: ClientEarning[];
  expenses: ClientExpense[];
  claims: ClientClaim[];
}

export function usePerCarAnalytics(selectedCarId?: string) {
  const { user } = useAuth();
  const { getMonthlyFixedCosts } = useClientCarExpenses();
  const [cars, setCars] = useState<any[]>([]);
  const [allData, setAllData] = useState<{
    earnings: ClientEarning[];
    expenses: ClientExpense[];
    claims: ClientClaim[];
  }>({
    earnings: [],
    expenses: [],
    claims: []
  });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchAllData = async () => {
    if (!user) return;

    try {
      setError(null);
      setLoading(true);
      
      // First get user's cars with details
      const { data: userCars, error: carsError } = await supabase
        .from('cars')
        .select('*')
        .eq('client_id', user.id);

      if (carsError) throw carsError;
      setCars(userCars || []);

      if (!userCars || userCars.length === 0) {
        setAllData({ earnings: [], expenses: [], claims: [] });
        return;
      }

      const carIds = userCars.map(car => car.id);

      // Get all analytics data
      const [earningsResult, expensesResult, claimsResult] = await Promise.all([
        supabase
          .from('host_earnings')
          .select('*')
          .in('car_id', carIds)
          .order('earning_period_start', { ascending: false }),
        
        supabase
          .from('host_expenses')
          .select('*')
          .in('car_id', carIds)
          .order('expense_date', { ascending: false }),
        
        supabase
          .from('host_claims')
          .select('*')
          .in('car_id', carIds)
          .order('incident_date', { ascending: false })
      ]);

      if (earningsResult.error) throw earningsResult.error;
      if (expensesResult.error) throw expensesResult.error;
      if (claimsResult.error) throw claimsResult.error;

      setAllData({
        earnings: earningsResult.data || [],
        expenses: expensesResult.data || [],
        claims: claimsResult.data || []
      });

    } catch (err) {
      console.error('Error fetching per-car analytics:', err);
      setError('Failed to load analytics data');
    } finally {
      setLoading(false);
    }
  };

  // Calculate performance metrics for each car
  const carPerformanceData = useMemo((): CarPerformance[] => {
    return cars.map(car => {
      const carEarnings = allData.earnings.filter(e => e.car_id === car.id);
      const carExpenses = allData.expenses.filter(e => e.car_id === car.id);
      const carClaims = allData.claims.filter(c => c.car_id === car.id);

      // totalEarnings is already net of operational expenses (client_profit_amount)
      const netEarningsFromTrips = carEarnings.reduce((sum, e) => sum + (e.client_profit_amount || 0), 0);
      
      // Operational expenses (for reference, but not deducted since client_profit_amount is already net)
      const totalOperationalExpenses = carExpenses.reduce((sum, e) => {
        return sum + (e.amount || 0) + (e.toll_cost || 0) + (e.delivery_cost || 0) + 
               (e.carwash_cost || 0) + (e.ev_charge_cost || 0);
      }, 0);
      
      // Get monthly fixed costs for this car
      const monthlyFixedCosts = getMonthlyFixedCosts(car.id);
      
      // True Net Profit = Net Earnings From Trips - Monthly Fixed Costs
      const trueNetProfit = netEarningsFromTrips - monthlyFixedCosts;
      
      // Keep netProfit for backward compatibility (same as trueNetProfit now)
      const netProfit = trueNetProfit;
      const profitMargin = netEarningsFromTrips > 0 ? (trueNetProfit / netEarningsFromTrips) * 100 : 0;
      const totalTrips = carEarnings.length;
      const averagePerTrip = totalTrips > 0 ? netEarningsFromTrips / totalTrips : 0;
      
      // Calculate active days
      const uniqueDates = new Set(
        carEarnings
          .filter(e => e.earning_period_start)
          .map(e => e.earning_period_start.split('T')[0])
      );
      const activeDays = uniqueDates.size;
      
      // Calculate utilization rate (active days in last 30 days)
      const thirtyDaysAgo = new Date();
      thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);
      const recentEarnings = carEarnings.filter(e => 
        new Date(e.earning_period_start) >= thirtyDaysAgo
      );
      const recentActiveDays = new Set(
        recentEarnings.map(e => e.earning_period_start.split('T')[0])
      ).size;
      const utilizationRate = (recentActiveDays / 30) * 100;

      const totalClaims = carClaims.length;
      const claimsAmount = carClaims.reduce((sum, c) => 
        sum + (c.approved_amount || c.claim_amount || 0), 0
      );

      // Get last trip date
      const lastTripDate = carEarnings.length > 0 
        ? carEarnings[0].earning_period_end 
        : null;

      // Calculate ROI (assuming some investment cost or use gross earnings as base)
      const grossEarnings = carEarnings.reduce((sum, e) => sum + (e.gross_earnings || 0), 0);
      const roi = grossEarnings > 0 ? (netProfit / grossEarnings) * 100 : 0;

      // Calculate break-even trips needed to cover monthly fixed costs
      const breakEvenTrips = averagePerTrip > 0 ? Math.ceil(monthlyFixedCosts / averagePerTrip) : 0;

      // Calculate risk score based on claims and profitability (now using true net profit)
      const claimsRisk = Math.min((totalClaims * 20), 50); // Max 50 points for claims
      const profitabilityRisk = trueNetProfit < 0 ? 30 : Math.max(0, 30 - profitMargin); // Up to 30 points
      const utilizationRisk = Math.max(0, 20 - utilizationRate * 0.2); // Up to 20 points
      const riskScore = Math.min(100, claimsRisk + profitabilityRisk + utilizationRisk);

      // Generate recommendation (now considering fixed costs)
      let recommendation: CarPerformance['recommendation'] = 'keep_active';
      let recommendationReason = '';

      if (riskScore > 70 || trueNetProfit < -500) {
        recommendation = 'return';
        recommendationReason = 'High risk and significant losses including fixed costs. Consider returning this vehicle.';
      } else if (riskScore > 50 || (profitMargin < 10 && utilizationRate < 30)) {
        recommendation = 'monitor';
        recommendationReason = 'Moderate risk or low performance. Monitor closely and consider improvements.';
      } else if (utilizationRate < 50 && trueNetProfit > 0) {
        recommendation = 'optimize';
        recommendationReason = 'Good profitability but low utilization. Optimize pricing or availability.';
      } else if (trueNetProfit < 0 && breakEvenTrips > totalTrips) {
        recommendation = 'monitor';
        recommendationReason = `Not covering fixed costs. Need ${breakEvenTrips} trips/month to break even.`;
      } else {
        recommendation = 'keep_active';
        recommendationReason = 'Good performance. Continue current strategy.';
      }

      return {
        car_id: car.id,
        car_make: car.make,
        car_model: car.model,
        car_year: car.year,
        car_status: car.status,
        totalEarnings: netEarningsFromTrips,
        totalExpenses: totalOperationalExpenses,
        monthlyFixedCosts,
        trueNetProfit,
        netProfit,
        profitMargin,
        totalTrips,
        averagePerTrip,
        activeDays,
        utilizationRate,
        totalClaims,
        claimsAmount,
        lastTripDate,
        recommendation,
        recommendationReason,
        roi,
        riskScore,
        breakEvenTrips
      };
    });
  }, [cars, allData]);

  // Filter data for selected car
  const selectedCarData = useMemo((): CarAnalyticsData | null => {
    if (!selectedCarId) return null;
    
    return {
      earnings: allData.earnings.filter(e => e.car_id === selectedCarId),
      expenses: allData.expenses.filter(e => e.car_id === selectedCarId),
      claims: allData.claims.filter(c => c.car_id === selectedCarId)
    };
  }, [selectedCarId, allData]);

  const selectedCarPerformance = useMemo(() => {
    if (!selectedCarId) return null;
    return carPerformanceData.find(car => car.car_id === selectedCarId) || null;
  }, [selectedCarId, carPerformanceData]);

  useEffect(() => {
    fetchAllData();
  }, [user]);

  const refetch = () => {
    fetchAllData();
  };

  return {
    cars,
    carPerformanceData,
    selectedCarData,
    selectedCarPerformance,
    allData,
    loading,
    error,
    refetch,
  };
}