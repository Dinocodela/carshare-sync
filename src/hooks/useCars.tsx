import { useState, useEffect } from 'react';
import { useAuth } from './useAuth';
import { supabase } from '@/integrations/supabase/client';

export interface Car {
  id: string;
  client_id: string;
  make: string;
  model: string;
  year: number;
  mileage: number;
  color: string;
  location: string;
  description: string | null;
  images: string[] | null;
  status: 'pending' | 'available' | 'hosted';
  host_id: string | null;
  created_at: string;
  updated_at: string;
  // Sharing metadata (not stored in DB row directly)
  is_shared?: boolean;
  share_permission?: 'viewer' | 'editor';
}


export interface Request {
  id: string;
  car_id: string;
  client_id: string;
  host_id: string;
  message: string;
  status: 'pending' | 'accepted' | 'declined';
  created_at: string;
  updated_at: string;
}

export function useCars() {
  const { user } = useAuth();
  const [cars, setCars] = useState<Car[]>([]);
  const [requests, setRequests] = useState<Request[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchAccessibleCars = async () => {
    if (!user) {
      setCars([]);
      return;
    }

    try {
      setError(null);
      // Use secure function instead of direct table access
      const { data: safeCarData, error: safeCarError } = await (supabase as any)
        .rpc('get_safe_car_info', { p_user_id: user.id });
      
      if (safeCarError) throw safeCarError;

      // For car owners, also get their full car data (including sensitive info)
      const { data: ownedCars, error: ownedErr } = await (supabase as any)
        .from('cars')
        .select('*')
        .eq('client_id', user.id);
      
      if (ownedErr && ownedErr.code !== 'PGRST116') throw ownedErr;

      // Merge safe car data with owned car data (owned cars get priority)
      const ownedCarIds = new Set((ownedCars || []).map((c: any) => c.id));
      const safeNonOwnedCars = (safeCarData || []).filter((c: any) => !ownedCarIds.has(c.id));
      
      // Add sharing metadata to non-owned cars
      const carsWithSharingInfo = safeNonOwnedCars.map((car: any) => ({
        ...car,
        is_shared: car.user_relationship === 'shared_access',
        share_permission: car.user_relationship === 'shared_access' ? 'viewer' : undefined,
      }));

      setCars([...(ownedCars || []), ...carsWithSharingInfo]);
    } catch (err) {
      console.error('Error fetching accessible cars:', err);
      setError('Failed to load cars');
    }
  };

  const fetchRequests = async () => {
    if (!user) {
      setRequests([]);
      return;
    }

    try {
      setError(null);
      const { data, error: fetchError } = await (supabase as any)
        .from('requests')
        .select('*')
        .eq('client_id', user.id)
        .order('created_at', { ascending: false });

      if (fetchError) throw fetchError;
      setRequests(data || []);
    } catch (err) {
      console.error('Error fetching requests:', err);
      setError('Failed to load requests');
    }
  };

  const fetchData = async () => {
    setLoading(true);
    await Promise.all([fetchAccessibleCars(), fetchRequests()]);
    setLoading(false);
  };

  useEffect(() => {
    fetchData();
  }, [user]);

  const refetch = () => {
    fetchData();
  };

  return {
    cars,
    requests,
    loading,
    error,
    refetch,
  };
}

export function useHostCars() {
  const { user } = useAuth();
  const [cars, setCars] = useState<Car[]>([]);
  const [requests, setRequests] = useState<Request[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchHostCars = async () => {
    if (!user) {
      setCars([]);
      return;
    }

    try {
      setError(null);
      // Use secure function for host car access (no sensitive identifiers exposed)
      const { data: safeCarData, error: safeCarError } = await (supabase as any)
        .rpc('get_safe_car_info', { p_user_id: user.id });
      
      if (safeCarError) throw safeCarError;

      // Filter to only cars where user is the host
      const hostCars = (safeCarData || []).filter((car: any) => 
        car.user_relationship === 'host'
      );

      setCars(hostCars);
    } catch (err) {
      console.error('Error fetching host cars:', err);
      setError('Failed to load cars');
    }
  };

  const fetchHostRequests = async () => {
    if (!user) {
      setRequests([]);
      return;
    }

    try {
      setError(null);
      const { data, error: fetchError } = await (supabase as any)
        .from('requests')
        .select('*')
        .eq('host_id', user.id)
        .order('created_at', { ascending: false });

      if (fetchError) throw fetchError;
      setRequests(data || []);
    } catch (err) {
      console.error('Error fetching host requests:', err);
      setError('Failed to load requests');
    }
  };

  const fetchData = async () => {
    setLoading(true);
    await Promise.all([fetchHostCars(), fetchHostRequests()]);
    setLoading(false);
  };

  useEffect(() => {
    fetchData();
  }, [user]);

  const refetch = () => {
    fetchData();
  };

  return {
    cars,
    requests,
    loading,
    error,
    refetch,
  };
}