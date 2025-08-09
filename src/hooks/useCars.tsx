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
      // Owned cars
      const { data: owned, error: ownedErr } = await (supabase as any)
        .from('cars')
        .select('*')
        .eq('client_id', user.id)
        .order('created_at', { ascending: false });
      if (ownedErr) throw ownedErr;

      // Shared cars via car_access
      const { data: access, error: accessErr } = await (supabase as any)
        .from('car_access')
        .select('car_id, permission')
        .eq('user_id', user.id);
      if (accessErr) throw accessErr;

      let sharedCars: Car[] = [];
      if (access && access.length > 0) {
        const sharedIds = access
          .map((a: any) => a.car_id)
          .filter((id: string) => !(owned || []).some((c: any) => c.id === id));

        if (sharedIds.length > 0) {
          const { data: sharedData, error: sharedErr } = await (supabase as any)
            .from('cars')
            .select('*')
            .in('id', sharedIds);
          if (sharedErr) throw sharedErr;

          const permMap: Record<string, 'viewer' | 'editor'> = {};
          access.forEach((a: any) => { permMap[a.car_id] = a.permission; });

          sharedCars = (sharedData || []).map((c: any) => ({
            ...c,
            is_shared: true,
            share_permission: permMap[c.id],
          }));
        }
      }

      setCars([...(owned || []), ...sharedCars]);
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
      const { data, error: fetchError } = await (supabase as any)
        .from('cars')
        .select('*')
        .eq('host_id', user.id)
        .order('created_at', { ascending: false });

      if (fetchError) throw fetchError;
      setCars(data || []);
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