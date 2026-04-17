import { useState } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';

interface EmergencyVehicleData {
  masked_license_plate: string;
  partial_vin: string;
  full_location: string;
}

type EmergencyPurpose = 'police_report' | 'insurance_claim' | 'emergency_contact' | 'accident_report';

export function useVehicleEmergency() {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const { toast } = useToast();

  const getEmergencyVehicleInfo = async (
    carId: string, 
    purpose: EmergencyPurpose,
    confirmationCallback?: () => Promise<boolean>
  ): Promise<EmergencyVehicleData | null> => {
    try {
      setLoading(true);
      setError(null);

      // Optional confirmation step for sensitive data access
      if (confirmationCallback) {
        const confirmed = await confirmationCallback();
        if (!confirmed) {
          return null;
        }
      }

      // Show warning toast about sensitive data access
      toast({
        title: "Accessing Sensitive Vehicle Information",
        description: `This action will be logged for security purposes. Purpose: ${purpose.replace('_', ' ')}`,
        variant: "default",
      });

      const { data, error: emergencyError } = await supabase
        .rpc('get_vehicle_identifiers_emergency', {
          p_car_id: carId,
          p_purpose: purpose
        });

      if (emergencyError) {
        throw emergencyError;
      }

      if (!data || data.length === 0) {
        throw new Error('No emergency vehicle data available');
      }

      // Log successful access
      toast({
        title: "Vehicle Information Retrieved",
        description: "Sensitive information has been provided for emergency use only.",
        variant: "default",
      });

      return data[0] as EmergencyVehicleData;
      
    } catch (err: any) {
      const errorMessage = err.message || 'Failed to access emergency vehicle information';
      setError(errorMessage);
      
      toast({
        title: "Access Denied",
        description: errorMessage,
        variant: "destructive",
      });
      
      return null;
    } finally {
      setLoading(false);
    }
  };

  return {
    getEmergencyVehicleInfo,
    loading,
    error,
  };
}

// Utility function to show confirmation dialog for sensitive access
export const createEmergencyAccessConfirmation = (
  purpose: EmergencyPurpose,
  carInfo: { make: string; model: string; year: number }
): (() => Promise<boolean>) => {
  return async () => {
    const purposeDescriptions = {
      police_report: 'filing a police report',
      insurance_claim: 'processing an insurance claim', 
      emergency_contact: 'emergency contact purposes',
      accident_report: 'accident documentation'
    };

    const message = `You are requesting access to sensitive vehicle identifiers (VIN/License Plate) for ${carInfo.year} ${carInfo.make} ${carInfo.model}.\n\nPurpose: ${purposeDescriptions[purpose]}\n\nThis access will be logged and monitored. Do you confirm this is for legitimate emergency/legal purposes only?`;

    return window.confirm(message);
  };
};