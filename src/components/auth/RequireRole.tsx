// src/components/auth/RequireRole.tsx
import { Navigate, Outlet } from "react-router-dom";
import { useAuth } from "@/hooks/useAuth";
import { useProfile } from "@/hooks/useProfile";

export default function RequireRole() {
  const { user, loading: authLoading } = useAuth();
  const { profile, loading: profileLoading } = useProfile();

  if (authLoading || profileLoading) return <></>;
  if (!user) return <Navigate to="/login" replace />;
  return profile?.is_super_admin ? (
    <Outlet />
  ) : (
    <Navigate to="/dashboard" replace />
  );
}
