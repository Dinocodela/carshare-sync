import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/hooks/useAuth';
import { useToast } from '@/hooks/use-toast';

export interface ClientCarExpense {
  id: string;
  car_id: string;
  client_id: string;
  expense_type: string;
  amount: number;
  frequency: 'monthly' | 'quarterly' | 'yearly';
  provider_name?: string;
  policy_number?: string;
  start_date: string;
  end_date?: string;
  notes?: string;
  created_at: string;
  updated_at: string;
}

export interface CreateClientCarExpenseData {
  car_id: string;
  expense_type: string;
  amount: number;
  frequency: 'monthly' | 'quarterly' | 'yearly';
  provider_name?: string;
  policy_number?: string;
  start_date: string;
  end_date?: string;
  notes?: string;
}

export function useClientCarExpenses() {
  const [expenses, setExpenses] = useState<ClientCarExpense[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const { user } = useAuth();
  const { toast } = useToast();

  const fetchExpenses = async () => {
    if (!user) return;

    try {
      setLoading(true);
      setError(null);

      const { data, error: fetchError } = await supabase
        .from('client_car_expenses')
        .select('*')
        .eq('client_id', user.id)
        .order('created_at', { ascending: false });

      if (fetchError) throw fetchError;
      setExpenses((data || []) as ClientCarExpense[]);
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to fetch expenses';
      setError(errorMessage);
      toast({
        title: "Error",
        description: errorMessage,
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const createExpense = async (expenseData: CreateClientCarExpenseData): Promise<ClientCarExpense | null> => {
    if (!user) return null;

    try {
      const { data, error: createError } = await supabase
        .from('client_car_expenses')
        .insert([{
          ...expenseData,
          client_id: user.id,
        }])
        .select()
        .single();

      if (createError) throw createError;

      setExpenses(prev => [data as ClientCarExpense, ...prev]);
      toast({
        title: "Success",
        description: "Fixed expense added successfully",
      });

      return data as ClientCarExpense;
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to create expense';
      toast({
        title: "Error",
        description: errorMessage,
        variant: "destructive",
      });
      return null;
    }
  };

  const updateExpense = async (id: string, updates: Partial<CreateClientCarExpenseData>): Promise<boolean> => {
    try {
      const { data, error: updateError } = await supabase
        .from('client_car_expenses')
        .update(updates)
        .eq('id', id)
        .eq('client_id', user?.id)
        .select()
        .single();

      if (updateError) throw updateError;

      setExpenses(prev => prev.map(expense => 
        expense.id === id ? { ...expense, ...(data as ClientCarExpense) } : expense
      ));

      toast({
        title: "Success",
        description: "Fixed expense updated successfully",
      });

      return true;
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to update expense';
      toast({
        title: "Error",
        description: errorMessage,
        variant: "destructive",
      });
      return false;
    }
  };

  const deleteExpense = async (id: string): Promise<boolean> => {
    try {
      const { error: deleteError } = await supabase
        .from('client_car_expenses')
        .delete()
        .eq('id', id)
        .eq('client_id', user?.id);

      if (deleteError) throw deleteError;

      setExpenses(prev => prev.filter(expense => expense.id !== id));
      toast({
        title: "Success",
        description: "Fixed expense deleted successfully",
      });

      return true;
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to delete expense';
      toast({
        title: "Error",
        description: errorMessage,
        variant: "destructive",
      });
      return false;
    }
  };

  const getExpensesByCarId = (carId: string) => {
    return expenses.filter(expense => expense.car_id === carId);
  };

  const getMonthlyFixedCosts = (carId: string): number => {
    const carExpenses = getExpensesByCarId(carId);
    return carExpenses.reduce((total, expense) => {
      const currentDate = new Date();
      const startDate = new Date(expense.start_date);
      const endDate = expense.end_date ? new Date(expense.end_date) : null;
      
      // Check if expense is currently active
      const isActive = startDate <= currentDate && (!endDate || endDate >= currentDate);
      if (!isActive) return total;

      // Convert to monthly amount
      let monthlyAmount = expense.amount;
      if (expense.frequency === 'yearly') {
        monthlyAmount = expense.amount / 12;
      } else if (expense.frequency === 'quarterly') {
        monthlyAmount = expense.amount / 3;
      }

      return total + monthlyAmount;
    }, 0);
  };

  useEffect(() => {
    if (user) {
      fetchExpenses();
    }
  }, [user]);

  return {
    expenses,
    loading,
    error,
    createExpense,
    updateExpense,
    deleteExpense,
    getExpensesByCarId,
    getMonthlyFixedCosts,
    refetch: fetchExpenses,
  };
}