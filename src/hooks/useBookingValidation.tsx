import { useState, useCallback } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';

export interface ConflictingEarning {
  id: string;
  trip_id: string | null;
  earning_period_start: string;
  earning_period_end: string;
  guest_name: string | null;
  amount: number;
}

export interface ValidationResult {
  isValid: boolean;
  conflicts: ConflictingEarning[];
  error?: string;
}

export function useBookingValidation() {
  const [isValidating, setIsValidating] = useState(false);

  const validateDates = useCallback(async (
    carId: string,
    startDate: string,
    endDate: string,
    excludeId?: string
  ): Promise<ValidationResult> => {
    if (!carId || !startDate || !endDate) {
      return { isValid: false, conflicts: [], error: 'Missing required parameters' };
    }

    if (new Date(startDate) > new Date(endDate)) {
      return { isValid: false, conflicts: [], error: 'Start date must be before end date' };
    }

    setIsValidating(true);
    
    try {
      // Call the database function to check for conflicts
      const { data, error } = await supabase.rpc('get_conflicting_earnings', {
        p_car_id: carId,
        p_start_date: startDate,
        p_end_date: endDate
      });

      if (error) {
        console.error('Error checking date conflicts:', error);
        return { isValid: false, conflicts: [], error: error.message };
      }

      // Filter out the current record if we're updating
      const conflicts = excludeId 
        ? (data || []).filter((conflict: ConflictingEarning) => conflict.id !== excludeId)
        : (data || []);

      const isValid = conflicts.length === 0;

      if (!isValid) {
        toast.error('Date conflict detected', {
          description: `This car is already booked during the selected period`
        });
      }

      return { isValid, conflicts };
    } catch (err) {
      console.error('Validation error:', err);
      const errorMessage = err instanceof Error ? err.message : 'Unknown validation error';
      return { isValid: false, conflicts: [], error: errorMessage };
    } finally {
      setIsValidating(false);
    }
  }, []);

  const checkAvailability = useCallback(async (
    carId: string,
    startDate: string,
    endDate: string
  ): Promise<boolean> => {
    const result = await validateDates(carId, startDate, endDate);
    return result.isValid;
  }, [validateDates]);

  return {
    validateDates,
    checkAvailability,
    isValidating
  };
}