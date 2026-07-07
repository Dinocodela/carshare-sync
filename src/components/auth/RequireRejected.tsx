// src/components/auth/RequireRejected.tsx
import { Navigate, Outlet } from "react-router-dom";
import { useAuth } from "@/hooks/useAuth";
import { useProfile } from "@/hooks/useProfile";

export default function RequireRejected() {
  const { user, loading: authLoading } = useAuth();
  const { profile, loading: profileLoading } = useProfile();

  if (authLoading || profileLoading) return <></>;
  if (!user) return <Navigate to="/" replace />;
  if (profile?.account_status !== "rejected")
    return <Navigate to="/dashboard" replace />;
  return <Outlet />;
}
