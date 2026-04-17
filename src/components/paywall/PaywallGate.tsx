// components/paywall/PaywallGate.tsx
import { useEffect, useMemo, useRef, useState } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import { useSubscription } from "@/hooks/useSubscription";
import { SubscribeSheet } from "./SubscribeSheet";

export function PaywallGate() {
  const { pathname } = useLocation();
  const navigate = useNavigate();
  const { loading, active } = useSubscription();

  const [open, setOpen] = useState(false);
  const [snoozed, setSnoozed] = useState(false);
  const lastPath = useRef(pathname);

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

  const isRestricted = useMemo(
    () => !allowlist.some((p) => pathname.startsWith(p)),
    [pathname, allowlist]
  );

  // 🔑 Only clear the snooze when the user navigates to ANOTHER restricted page,
  // not when we send them to an allowed page like /settings.
  useEffect(() => {
    if (pathname !== lastPath.current) {
      const nowRestricted = !allowlist.some((p) => pathname.startsWith(p));
      if (nowRestricted) setSnoozed(false);
      lastPath.current = pathname;
    }
  }, [pathname, allowlist]);

  useEffect(() => {
    if (loading) return;
    if (!active && isRestricted && !snoozed) setOpen(true);
    else setOpen(false);
  }, [loading, active, isRestricted, snoozed]);

  return (
    <SubscribeSheet
      open={open}
      onOpenChange={(v) => {
        if (!v && !active && isRestricted) {
          setSnoozed(true); // don't reopen on this path
          navigate("/settings", { replace: true }); // move to allowed page
        }
        setOpen(v);
      }}
    />
  );
}
