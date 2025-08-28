import { useEffect, useState } from "react";
import { Navigate, Outlet } from "react-router-dom";
import { useAuth } from "@/hooks/useAuth";
import { supabase } from "@/integrations/supabase/client";

export default function RequireRole() {
  const { user } = useAuth();
  const [ok, setOk] = useState<boolean | null>(null);

  useEffect(() => {
    let mounted = true;
    (async () => {
      if (!user) return setOk(false);
      const { data } = await supabase.from("profiles").select("is_super_admin").eq("user_id", user.id).single();
      if (!mounted) return;
      setOk(data?.is_super_admin);
    })();
    return () => { mounted = false; };
  }, [user?.id]);

  if (ok === null) return null;
  return ok ? <Outlet /> : <Navigate to="/dashboard" replace />;
}
