import { useState, useCallback } from 'react';

// This hook is deprecated - overlap validation has been removed.
// Keeping for backwards compatibility with any components that may import types.

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
  const [isValidating] = useState(false);

  // Overlap validation has been removed - always return valid
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

    // No overlap validation - always valid
    return { isValid: true, conflicts: [] };
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
