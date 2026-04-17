// src/components/auth/RequireSubscribed.tsx
import { Navigate, Outlet, useLocation } from "react-router-dom";
import { useSubscription } from "@/hooks/useSubscription";

export default function RequireSubscribed() {
  const { loading, active } = useSubscription();
  console.log("active route", active);
  const location = useLocation();
  if (loading) return null; // or a skeleton
  return active ? (
    <Outlet />
  ) : (
    <Navigate to="/subscribe" replace state={{ from: location }} />
  );
}
