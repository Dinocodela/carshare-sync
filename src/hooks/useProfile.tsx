// src/hooks/useProfile.ts
import { useState, useEffect } from "react";
import { useAuth } from "./useAuth";
import { supabase } from "@/integrations/supabase/client";

export interface Profile {
  user_id: string;
  role: "client" | "host";
  first_name?: string | null;
  last_name?: string | null;
  company_name?: string | null;
  account_status?: "pending" | "approved" | "rejected" | null;
  is_super_admin?: boolean | null;
  email?: string | null;
  phone?: string | null;
}

export function useProfile() {
  const { user } = useAuth();
  const [profile, setProfile] = useState<Profile | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let alive = true;

    (async () => {
      if (!user) {
        if (alive) {
          setProfile(null);
          setLoading(false);
        }
        return;
      }

      try {
        setError(null);
        const { data, error } = await supabase
          .from("profiles")
          .select(
            "user_id, role, first_name, last_name, company_name, account_status, is_super_admin, email, phone"
          )
          .eq("user_id", user.id)
          .maybeSingle();

        if (!alive) return;

        if (error) {
          // RLS or network errors: log, but don’t block UI
          console.warn("profile fetch error:", error);
          setError("Failed to load profile");
          setProfile(null);
        } else {
          setProfile((data as Profile) ?? null);
        }
      } catch (e) {
        if (!alive) return;
        console.warn("profile fetch threw:", e);
        setError("Failed to load profile");
        setProfile(null);
      } finally {
        if (alive) setLoading(false);
      }
    })();

    return () => {
      alive = false;
    };
  }, [user?.id]);

  return {
    profile,
    loading,
    error,
    refetch: () => {
      /* optional if you want */
    },
  };
}
