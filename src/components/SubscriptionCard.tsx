// components/settings/SubscriptionCard.tsx
import { useEffect, useMemo, useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { useSubscription } from "@/hooks/useSubscription";
import {
  getOfferings,
  openManage,
  restorePurchases,
  syncDbWithRevenueCat,
} from "@/lib/revenuecat";
import { SubscribeSheet } from "@/components/paywall/SubscribeSheet";
import { toast } from "sonner";

function humanizeProduct(id?: string) {
  if (!id) return "Unknown plan";
  const map: Record<string, string> = {
    pro_monthly: "Pro – Monthly",
    pro_annual: "Pro – Annual",
  };
  if (map[id]) return map[id];
  if (id.toLowerCase().includes("monthly")) return "Monthly";
  if (id.toLowerCase().includes("annual")) return "Annual";
  return id; // fallback to raw id
}

export function SubscriptionCard() {
  const { loading, active, profile, refresh } = useSubscription();
  const [sheetOpen, setSheetOpen] = useState(false);

  useEffect(() => {
    let cancelled = false;
    (async () => {
      try {
        if (!profile?.rc_product_id) {
          setPlanLabel("Unknown plan");
          return;
        }
        const offerings = await getOfferings();
        const pkgs = Object.values(offerings?.all ?? {}).flatMap(
          (o: any) => o?.availablePackages ?? []
        );
        const prod = pkgs.find(
          (p: any) => p?.product?.identifier === profile.rc_product_id
        );
        if (!cancelled) {
          setPlanLabel(
            prod?.product?.title || humanizeProduct(profile.rc_product_id)
          );
        }
      } catch {
        if (!cancelled) setPlanLabel(humanizeProduct(profile?.rc_product_id));
      }
    })();
    return () => {
      cancelled = true;
    };
  }, [profile?.rc_product_id]);

  const statusChip = useMemo(
    () => (
      <span
        className={`inline-flex items-center gap-1 rounded-full px-2.5 py-1 text-xs ${
          active ? "bg-emerald-50 text-emerald-700" : "bg-rose-50 text-rose-700"
        }`}
      >
        ● {active ? "Active" : "Inactive"}
      </span>
    ),
    [active]
  );
  const dateOnly = profile?.rc_expiration_at
    ? new Date(profile.rc_expiration_at).toLocaleDateString(undefined, {
        year: "numeric",
        month: "long",
        day: "numeric",
      })
    : null;
  //   const plan = profile?.rc_product_id ?? "Unknown plan";
  //   const date = profile?.rc_expiration_at
  //     ? new Date(profile.rc_expiration_at).toLocaleString()
  //     : null;

  const [planLabel, setPlanLabel] = useState<string>(
    humanizeProduct(profile?.rc_product_id)
  );

  return (
    <>
      <Card>
        <CardHeader className="pb-2">
          <div className="flex items-center justify-between">
            <CardTitle className="text-xl">Subscription</CardTitle>
            {statusChip}
          </div>
        </CardHeader>
        <CardContent className="space-y-4">
          {loading ? (
            <div className="h-16 rounded-md bg-muted/50 animate-pulse" />
          ) : active ? (
            <>
              <div className="text-sm">{planLabel}</div>
              {dateOnly && (
                <div className="text-xs text-muted-foreground">
                  Renews : {dateOnly}
                </div>
              )}
              {
                <div className="flex gap-2">
                  <Button
                    className="w-full sm:w-auto"
                    onClick={() => setSheetOpen(true)}
                  >
                    Manage
                  </Button>
                </div>
              }
            </>
          ) : (
            <>
              <div className="text-sm text-muted-foreground">
                You don’t have an active subscription.
              </div>
              <div className="flex flex-col gap-2">
                <Button
                  className="w-full sm:w-auto"
                  onClick={() => setSheetOpen(true)}
                >
                  Choose a plan
                </Button>
                <Button
                  variant="link"
                  className="px-0 font-normal"
                  onClick={async () => {
                    try {
                      const ci = await restorePurchases();
                      //   await syncDbWithRevenueCat(ci);
                      await refresh();
                      toast.success("Checked for previous purchases");
                    } catch (e: any) {
                      toast.error(e?.message ?? "Restore failed");
                    }
                  }}
                >
                  Restore purchases
                </Button>
              </div>
            </>
          )}

          <p className="text-xs text-muted-foreground">
            Payment is managed by your App Store / Play account. Subscriptions
            renew automatically unless canceled at least 24 hours before the end
            of the period. You can cancel anytime in your store subscriptions.
          </p>
        </CardContent>
      </Card>

      <SubscribeSheet open={sheetOpen} onOpenChange={setSheetOpen} />
    </>
  );
}
