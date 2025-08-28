import { useState, useEffect } from 'react';
import { useAuth } from './useAuth';
import { supabase } from '@/integrations/supabase/client';

export interface Profile {
  user_id: string;
  role: 'client' | 'host' ;
  first_name?: string;
  is_super_admin?:boolean;
  last_name?: string;
  company_name?: string;
  phone: string;
  location?: string;
  bio?: string;
  rating?: number;
  turo_profile_url?: string;
  turo_reviews_count?: number;
}

export function useProfile() {
  const { user } = useAuth();
  const [profile, setProfile] = useState<Profile | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchProfile = async () => {
    if (!user) {
      setProfile(null);
      setLoading(false);
      return;
    }

    try {
      setError(null);
      const { data, error: fetchError } = await supabase
        .from('profiles')
        .select('*')
        .eq('user_id', user.id)
        .single();

      if (fetchError) {
        // If no profile exists, create one from user metadata
        if (fetchError.code === 'PGRST116') {
          const newProfile = {
            user_id: user.id,
            role: (user.user_metadata?.role as 'client' | 'host') || 'client',
            first_name: user.user_metadata?.first_name || user.user_metadata?.name,
            last_name: user.user_metadata?.last_name,
            company_name: user.user_metadata?.company_name,
            phone: user.user_metadata?.phone || '',
          };

          const { data: createdProfile, error: createError } = await supabase
            .from('profiles')
            .insert([newProfile])
            .select('*')
            .single();

          if (createError) throw createError;
          setProfile(createdProfile as Profile);
        } else {
          throw fetchError;
        }
      } else {
        setProfile(data as Profile);
      }
    } catch (err) {
      console.error('Error fetching profile:', err);
      setError('Failed to load profile');
      // Fallback to user metadata
      if (user?.user_metadata) {
        setProfile({
          user_id: user.id,
          role: (user.user_metadata.role as 'client' | 'host') || 'client',
          first_name: user.user_metadata.first_name || user.user_metadata.name,
          last_name: user.user_metadata.last_name,
          company_name: user.user_metadata.company_name,
          phone: user.user_metadata.phone || '',
        });
      }
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchProfile();
  }, [user]);

  const refetch = () => {
    fetchProfile();
  };

  return {
    profile,
    loading,
    error,
    refetch,
  };
}