import { Navigate, Outlet, useLocation } from "react-router-dom";
import { useSubscription } from "@/hooks/useSubscription";

export default function RequireUnsubscribed() {
  const { loading, active } = useSubscription();
  const location = useLocation();
  if (loading) return null;
  // If they are already subscribed, bounce them to where they came from or dashboard.
  const to = (location.state as any)?.from?.pathname ?? "/dashboard";
  return active ? <Navigate to={to} replace /> : <Outlet />;
}
