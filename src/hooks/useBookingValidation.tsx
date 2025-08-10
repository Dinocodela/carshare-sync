import { useState, useCallback } from 'react';
import { supabase } from '@/integrations/supabase/client';

// Normalize date-time strings to unambiguous ISO 8601 (UTC) format
function toISO(value: string): string {
  try {
    // If it already contains a timezone (Z or +hh:mm/-hh:mm), toISOString() will normalize to UTC
    // If it is local time without TZ, this will convert local time to UTC to avoid RPC ambiguity
    return new Date(value).toISOString();
  } catch {
    return value;
  }
}


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

  const validateDateTimes = useCallback(async (
    carId: string,
    startDateTime: string,
    endDateTime: string,
    excludeId?: string
  ): Promise<ValidationResult> => {
    if (!carId || !startDateTime || !endDateTime) {
      return { isValid: false, conflicts: [], error: 'Missing required parameters' };
    }

    if (new Date(startDateTime) > new Date(endDateTime)) {
      return { isValid: false, conflicts: [], error: 'Start time must be before end time' };
    }

    setIsValidating(true);
    
    try {
      // Normalize inputs to avoid RPC overload ambiguity
      const pStart = toISO(startDateTime);
      const pEnd = toISO(endDateTime);
      // Call the database function to check for conflicts
      const { data, error } = await supabase.rpc('get_conflicting_earnings', {
        p_car_id: carId,
        p_start_date: pStart,
        p_end_date: pEnd
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
    startDateTime: string,
    endDateTime: string
  ): Promise<boolean> => {
    const result = await validateDateTimes(carId, startDateTime, endDateTime);
    return result.isValid;
  }, [validateDateTimes]);

  return {
    validateDateTimes,
    checkAvailability,
    isValidating
  };
}