import { useEffect, useState } from "react";
import { Navigate, Outlet } from "react-router-dom";
import { useAuth } from "@/hooks/useAuth";
import { supabase } from "@/integrations/supabase/client";

export default function RequireApproved() {
  const { user } = useAuth();
  const [status, setStatus] = useState<"pending"|"approved"|"rejected"|null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let mounted = true;
    (async () => {
      if (!user) return; // RequireAuth will handle redirect
      const { data, error } = await supabase
        .from("profiles")
        .select("account_status")
        .eq("user_id", user.id)
        .single();
		console.log(data.account_status);
      if (!mounted) return;
      setStatus(error ? "pending" : (data?.account_status ?? "pending")); // default safe: treat unknown as pending
      setLoading(false);
    })();
    return () => { mounted = false; };
  }, [user?.id]);

  if (loading) return null; // or a spinner
  if (status !== "approved") {
    return <Navigate to="/account-pending" replace />;
  }
  return <Outlet />;
}
