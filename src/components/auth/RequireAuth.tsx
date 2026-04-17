// src/components/auth/RequireAuth.tsx
import { Navigate, Outlet, useLocation } from "react-router-dom";
import { useAuth } from "@/hooks/useAuth";

export default function RequireAuth() {
  const { user, loading } = useAuth();
  const location = useLocation();

  if (loading) return <></>;
  if (!user) return <Navigate to="/" replace state={{ from: location }} />;
  return <Outlet />;
}
