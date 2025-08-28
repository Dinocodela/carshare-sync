import { useEffect, useState } from "react";
import { Navigate, Outlet } from "react-router-dom";
import { useAuth } from "@/hooks/useAuth";
import { supabase } from "@/integrations/supabase/client";

export default function RequirePending() {
  const { user } = useAuth();
  const [status, setStatus] = useState<
    "pending" | "approved" | "rejected" | null
  >(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let mounted = true;
    (async () => {
      if (!user) return;
      const { data, error } = await supabase
        .from("profiles")
        .select("account_status")
        .eq("user_id", user.id)
        .single();

      if (!mounted) return;
      setStatus(error ? null : data?.account_status ?? null);
      setLoading(false);
    })();
    return () => {
      mounted = false;
    };
  }, [user?.id]);

  if (loading) return null; // or spinner

  // only allow if exactly pending
  if (status !== "pending") {
    return <Navigate to="/dashboard" replace />;
  }

  return <Outlet />;
}
