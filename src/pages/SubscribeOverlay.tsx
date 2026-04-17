// src/pages/SubscribeOverlay.tsx
import { useEffect, useMemo } from "react";
import { SubscribeSheet } from "@/components/paywall/SubscribeSheet";
import { useSubscription } from "@/hooks/useSubscription";
import { useLocation, useNavigate } from "react-router-dom";

export default function SubscribeOverlay() {
  const { loading, active } = useSubscription();
  const navigate = useNavigate();
  const { state } = useLocation() as {
    state?: { from?: { pathname?: string } };
  };

  // Allowed routes that won't trigger the paywall
  const allowlist = useMemo(
    () => [
      "/subscribe",
      "/settings",
      "/account-pending",
      "/register/client",
      "/register/host",
      "/",
    ],
    []
  );

  const isAllowed = (p?: string) =>
    !!p && allowlist.some((a) => p.startsWith(a));

  // If already subscribed, leave here immediately
  useEffect(() => {
    if (!loading && active) {
      console.log("loading active", active);
      navigate(
        state?.from?.pathname && isAllowed(state.from.pathname)
          ? state.from.pathname
          : "/dashboard",
        {
          replace: true,
        }
      );
    }
  }, [loading, active]);

  // Keep the sheet open as long as we're here & not subscribed
  const open = !loading && !active;

  return (
    <SubscribeSheet
      open={open}
      onOpenChange={(v) => {
        // If user dismisses:
        // - subscribed → go back to prior or /dashboard
        // - NOT subscribed → push to /settings (allowed), so we don't ping-pong back here
        if (!v) {
          if (active) {
            navigate(
              state?.from?.pathname && isAllowed(state.from.pathname)
                ? state.from.pathname
                : "/dashboard",
              {
                replace: true,
              }
            );
          } else {
            navigate("/settings", { replace: true });
          }
        }
      }}
    />
  );
}
