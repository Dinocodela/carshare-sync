// src/pages/Subscribe.tsx
import { useEffect, useState } from "react";
import {
  getOfferings,
  purchasePackage,
  restorePurchases,
  syncDbWithRevenueCat,
} from "@/lib/revenuecat";
import { useSubscription } from "@/hooks/useSubscription";
import { toast } from "sonner";

export default function Subscribe() {
  const [loading, setLoading] = useState(true);
  const [offering, setOffering] = useState<any>(null);
  const [error, setError] = useState<string | null>(null);
  const { refresh } = useSubscription();
  const [restoring, setRestoring] = useState(false);

  useEffect(() => {
    (async () => {
      try {
        const offerings = await getOfferings();
        setOffering(offerings.current);
      } catch (e: any) {
        setError(e?.message ?? "Failed to load plans");
      } finally {
        setLoading(false);
      }
    })();
  }, []);

  if (loading) return <div className="p-4">Loading plans…</div>;
  if (error) return <div className="p-4 text-red-600">{error}</div>;

  return (
    <div className="p-4 space-y-3">
      <h1 className="text-xl font-semibold">Choose your plan</h1>
      {offering?.availablePackages?.map((pkg: any) => (
        <button
          key={pkg.identifier}
          className="w-full rounded-xl border p-4 text-left"
          onClick={async () => {
            try {
              await purchasePackage(pkg);
            } catch (e: any) {
              // user canceled is fine
            }
          }}
        >
          <div className="font-medium">{pkg.product.title}</div>
          <div className="text-sm text-muted-foreground">
            {pkg.product.priceString}
          </div>
        </button>
      ))}
      <button
        className="text-sm underline"
        onClick={async () => {
          try {
            const ci = await restorePurchases();
            await syncDbWithRevenueCat(ci);
            await refresh();
            toast.success("Checked for previous purchases");
          } catch (e: any) {
            toast.error(e?.message ?? "Restore failed");
          }
        }}
      >
        Restore purchases
      </button>
    </div>
  );
}
