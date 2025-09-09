// src/components/paywall/SubscribeSheet.tsx
import { useEffect, useMemo, useState } from "react";
import { Sheet, SheetContent } from "@/components/ui/sheet";
import { Badge } from "@/components/ui/badge";
import {
  getOfferings,
  restorePurchases,
  syncDbWithRevenueCat,
} from "@/lib/revenuecat";
import { toast } from "sonner";
import { useSubscription } from "@/hooks/useSubscription";
import { useNavigate } from "react-router-dom";
import { Purchases } from "@revenuecat/purchases-capacitor";
type Props = { open: boolean; onOpenChange: (v: boolean) => void };

export function SubscribeSheet({ open, onOpenChange }: Props) {
  const { refresh, profile, active } = useSubscription();
  const navigate = useNavigate();

  const [loading, setLoading] = useState(true);
  const [offering, setOffering] = useState<any>(null);
  const [error, setError] = useState<string | null>(null);
  const [restoring, setRestoring] = useState(false);

  const currentSku = (profile?.rc_product_id || "").toLowerCase();
  const currentIsMonthly = active && currentSku.includes("month");
  const currentIsAnnual = active && currentSku.includes("annual");
  const renewAt = profile?.rc_expiration_at
    ? new Date(profile.rc_expiration_at).toLocaleString()
    : null;

  useEffect(() => {
    if (!open) return;
    (async () => {
      try {
        setLoading(true);
        const offerings = await getOfferings();
        setOffering(offerings.current);
      } catch (e: any) {
        setError(e?.message ?? "Failed to load plans");
      } finally {
        setLoading(false);
      }
    })();
  }, [open]);

  const packages = useMemo(() => offering?.availablePackages ?? [], [offering]);

  const allPkgs = offering?.availablePackages ?? [];

  // Filter list:
  // - If not subscribed → show all packages
  // - If subscribed monthly → show only annual (upgrade)
  // - If subscribed annual → show none; show “already active”
  const pkgsToShow = useMemo(() => {
    if (!active) return allPkgs;
    if (currentIsMonthly)
      return allPkgs.filter(
        (p: any) =>
          (p.identifier || "").toLowerCase().includes("annual") ||
          p.packageType === "ANNUAL"
      );
    if (currentIsAnnual) return [];
    return allPkgs;
  }, [active, allPkgs, currentIsMonthly, currentIsAnnual]);

  async function onPurchase(pkg: any) {
    try {
      // Purchase via RC
      const { customerInfo } = await Purchases.purchasePackage({
        aPackage: pkg,
      });
      // Mirror -> DB
      //   await syncDbWithRevenueCat(customerInfo);
      await refresh();
      toast.success("Purchase successful");
      onOpenChange(false);
      navigate("/dashboard", { replace: true });
    } catch (e: any) {
      if (e?.userCancelled) return;
      toast.error(e?.message ?? "Purchase failed");
    }
  }

  async function onRestore() {
    try {
      setRestoring(true);
      const ci = await restorePurchases();
      //   await syncDbWithRevenueCat(ci);
      await refresh();
      toast.success("Restored subscription");
      onOpenChange(false);
      navigate("/dashboard", { replace: true });
    } catch (e: any) {
      toast.error(e?.message ?? "Restore failed");
    } finally {
      setRestoring(false);
    }
  }

  return (
    <Sheet open={open} onOpenChange={onOpenChange}>
      <SheetContent
        side="bottom"
        className="rounded-t-2xl p-4 pb-[calc(env(safe-area-inset-bottom)+16px)] max-h-[82vh] overflow-y-auto text-base"
      >
        <div className="space-y-4">
          <div className="space-y-1">
            <div className="text-lg font-semibold">
              {active ? "Manage subscription" : "Choose your plan"}
            </div>
            <div className="text-sm text-muted-foreground">
              {active
                ? currentIsMonthly
                  ? "Upgrade to Annual for the best value."
                  : currentIsAnnual
                  ? "You already have an active Annual subscription."
                  : "Manage your subscription."
                : "Subscribe to unlock Host & Client features."}
            </div>
            {active && renewAt && (
              <div className="text-xs text-muted-foreground">
                Renews / expires: {renewAt}
              </div>
            )}
          </div>

          {loading && <div className="text-sm">Loading plans…</div>}
          {error && <div className="text-sm text-red-600">{error}</div>}

          {!loading && !error && pkgsToShow.length > 0 && (
            <div className="space-y-3">
              {pkgsToShow.map((pkg: any) => {
                const isAnnual =
                  (pkg.identifier || "").toLowerCase().includes("annual") ||
                  pkg.packageType === "ANNUAL";
                return (
                  <button
                    key={pkg.identifier}
                    className="w-full text-left rounded-2xl border p-4 hover:bg-muted/40 transition"
                    onClick={() => onPurchase(pkg)}
                  >
                    <div className="flex items-center justify-between">
                      <div>
                        <div className="font-medium">
                          {pkg.product.title ||
                            (isAnnual ? "Annual" : "Monthly")}
                        </div>
                        {!!pkg.product.description && (
                          <div className="text-sm text-muted-foreground">
                            {pkg.product.description}
                          </div>
                        )}
                      </div>
                      <div className="text-right">
                        <div className="font-semibold">
                          {pkg.product.priceString}
                        </div>
                        {isAnnual && (
                          <Badge className="mt-1" variant="secondary">
                            Best value
                          </Badge>
                        )}
                      </div>
                    </div>
                  </button>
                );
              })}{" "}
            </div>
          )}

          {/* Restore shown for unsubscribed only */}
          {!active && (
            <div className="mt-4 flex items-center justify-between">
              <button
                type="button"
                onClick={onRestore}
                disabled={restoring}
                className="text-sm underline underline-offset-2 text-primary disabled:opacity-60 px-0"
              >
                {restoring ? "Restoring…" : "Restore purchases"}
              </button>
            </div>
          )}

          <p className="text-xs text-muted-foreground leading-relaxed">
            Payment will be charged to your App Store / Play account.
            Subscription renews automatically unless canceled at least 24 hours
            before the end of the current period. Manage in your store
            subscriptions.
          </p>
        </div>
      </SheetContent>
    </Sheet>
  );
}
