// src/components/auth/RequirePending.tsx
import { Navigate, Outlet } from "react-router-dom";
import { useAuth } from "@/hooks/useAuth";
import { useProfile } from "@/hooks/useProfile";

export default function RequirePending() {
  const { user, loading: authLoading } = useAuth();
  const { profile, loading: profileLoading } = useProfile();

  if (authLoading || profileLoading)
    return <div style={{ padding: 24 }}>Loading…</div>;
  if (!user) return <Navigate to="/login" replace />;
  // only allow exactly pending
  if (profile?.account_status !== "pending")
    return <Navigate to="/dashboard" replace />;
  return <Outlet />;
}
