import { DashboardLayout } from "@/components/layout/DashboardLayout";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { ArrowLeft, Car, CheckCircle2, MapPin, TrendingUp } from "lucide-react";
import { useNavigate, useParams } from "react-router-dom";
import { useState } from "react";
import {
  useInvestorVehicle,
  useInvestorCacheReset,
  fmtCurrency,
} from "@/hooks/useInvestor";
import { useAuth } from "@/hooks/useAuth";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";

export default function InvestorVehicleDetail() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { user } = useAuth();
  const { data: vehicle, isLoading } = useInvestorVehicle(id);
  const resetCache = useInvestorCacheReset();

  const [open, setOpen] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [done, setDone] = useState(false);
  const [paymentMethod, setPaymentMethod] = useState<string>("wire");
  const [notes, setNotes] = useState("");

  const handleInvest = async () => {
    if (!user || !vehicle) return;
    setSubmitting(true);
    try {
      const { data, error } = await supabase
        .from("investments")
        .insert({
          investor_id: user.id,
          vehicle_id: vehicle.id,
          amount: vehicle.investment_amount,
          monthly_return: vehicle.monthly_return,
          term_months: vehicle.term_months,
          resale_upside_pct: vehicle.resale_upside_pct,
          status: "pending",
          payment_method: paymentMethod as any,
          notes: notes || null,
        })
        .select("id")
        .single();
      if (error) throw error;

      // Notify admins (best-effort)
      supabase.functions
        .invoke("notify-admin-new-investment", {
          body: { investmentId: data.id },
        })
        .catch((e) => console.error("notify-admin-new-investment failed", e));

      resetCache();
      setDone(true);
    } catch (e: any) {
      console.error(e);
      toast.error(e?.message ?? "Could not submit your investment. Please try again.");
    } finally {
      setSubmitting(false);
    }
  };

  if (isLoading) {
    return (
      <DashboardLayout>
        <div className="px-4 sm:px-6 space-y-4">
          <Skeleton className="h-8 w-40" />
          <Skeleton className="h-72 w-full rounded-lg" />
        </div>
      </DashboardLayout>
    );
  }

  if (!vehicle) {
    return (
      <DashboardLayout>
        <div className="px-4 sm:px-6 space-y-4">
          <Button variant="ghost" onClick={() => navigate("/investor/marketplace")}>
            <ArrowLeft className="h-4 w-4 mr-2" /> Back to marketplace
          </Button>
          <Card>
            <CardContent className="p-8 text-center text-muted-foreground">
              This vehicle could not be found.
            </CardContent>
          </Card>
        </div>
      </DashboardLayout>
    );
  }

  const isAvailable = vehicle.status === "available";
  const totalReturns = vehicle.monthly_return * vehicle.term_months;

  return (
    <DashboardLayout>
      <div className="px-4 sm:px-6 space-y-6 max-w-5xl">
        <Button variant="ghost" onClick={() => navigate("/investor/marketplace")}>
          <ArrowLeft className="h-4 w-4 mr-2" /> Back to marketplace
        </Button>

        <div className="grid gap-6 lg:grid-cols-5">
          <div className="lg:col-span-3 space-y-4">
            <div className="aspect-video bg-muted rounded-lg overflow-hidden">
              {vehicle.photos?.[0] ? (
                <img
                  src={vehicle.photos[0]}
                  alt={`${vehicle.year} ${vehicle.make} ${vehicle.model}`}
                  className="h-full w-full object-cover"
                />
              ) : (
                <div className="h-full w-full flex items-center justify-center text-muted-foreground">
                  <Car className="h-16 w-16 opacity-40" />
                </div>
              )}
            </div>
            {vehicle.photos && vehicle.photos.length > 1 && (
              <div className="grid grid-cols-4 gap-2">
                {vehicle.photos.slice(1, 5).map((p, i) => (
                  <img
                    key={i}
                    src={p}
                    alt={`view ${i + 2}`}
                    className="aspect-video object-cover rounded-md"
                  />
                ))}
              </div>
            )}

            <div>
              <div className="flex items-center gap-3">
                <h1 className="text-2xl font-bold">
                  {vehicle.year} {vehicle.make} {vehicle.model}
                </h1>
                <Badge variant={isAvailable ? "default" : "secondary"} className="capitalize">
                  {isAvailable ? "Open" : vehicle.status}
                </Badge>
              </div>
              {vehicle.location && (
                <p className="text-muted-foreground flex items-center gap-1 mt-1">
                  <MapPin className="h-4 w-4" /> {vehicle.location}
                </p>
              )}
            </div>

            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 text-sm">
              <Spec label="Mileage" value={vehicle.mileage ? `${vehicle.mileage.toLocaleString()} mi` : "—"} />
              <Spec label="Color" value={vehicle.color ?? "—"} />
              <Spec label="Condition" value={vehicle.condition ?? "—"} />
              <Spec label="VIN" value={vehicle.vin ? `…${vehicle.vin.slice(-6)}` : "—"} />
            </div>

            {vehicle.description && (
              <div>
                <h2 className="font-semibold mb-1">About this vehicle</h2>
                <p className="text-muted-foreground whitespace-pre-line">
                  {vehicle.description}
                </p>
              </div>
            )}

            {vehicle.highlights && vehicle.highlights.length > 0 && (
              <ul className="space-y-1">
                {vehicle.highlights.map((h, i) => (
                  <li key={i} className="flex items-center gap-2 text-sm">
                    <CheckCircle2 className="h-4 w-4 text-primary" /> {h}
                  </li>
                ))}
              </ul>
            )}
          </div>

          <div className="lg:col-span-2">
            <Card className="sticky top-4">
              <CardHeader>
                <CardTitle>Investment terms</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <Row label="Investment" value={fmtCurrency(vehicle.investment_amount)} bold />
                <Row
                  label="Monthly return"
                  value={fmtCurrency(vehicle.monthly_return)}
                  accent
                />
                <Row label="Term" value={`${vehicle.term_months} months`} />
                <Row label="Total return over term" value={fmtCurrency(totalReturns)} />
                <Row label="Resale upside share" value={`${vehicle.resale_upside_pct}%`} />
                {vehicle.estimated_resale_value != null && (
                  <Row
                    label="Est. resale value"
                    value={fmtCurrency(vehicle.estimated_resale_value)}
                  />
                )}

                <Button
                  className="w-full"
                  size="lg"
                  disabled={!isAvailable}
                  onClick={() => {
                    setDone(false);
                    setOpen(true);
                  }}
                >
                  {isAvailable ? "Invest $50,000" : "Not available"}
                </Button>
                <p className="text-xs text-muted-foreground text-center">
                  No card charged now. We'll contact you to arrange wire or ACH transfer.
                </p>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>

      <Dialog open={open} onOpenChange={(o) => !submitting && setOpen(o)}>
        <DialogContent>
          {done ? (
            <>
              <DialogHeader>
                <DialogTitle className="flex items-center gap-2">
                  <CheckCircle2 className="h-5 w-5 text-primary" /> Investment requested
                </DialogTitle>
                <DialogDescription>
                  Your $50,000 position in the {vehicle.year} {vehicle.make}{" "}
                  {vehicle.model} has been recorded as pending. Our team will reach out
                  with funding instructions for your {paymentMethod.toUpperCase()} transfer.
                </DialogDescription>
              </DialogHeader>
              <DialogFooter>
                <Button
                  onClick={() => {
                    setOpen(false);
                    navigate("/investor");
                  }}
                >
                  View my portfolio
                </Button>
              </DialogFooter>
            </>
          ) : (
            <>
              <DialogHeader>
                <DialogTitle>Confirm your investment</DialogTitle>
                <DialogDescription>
                  You're committing {fmtCurrency(vehicle.investment_amount)} to the{" "}
                  {vehicle.year} {vehicle.make} {vehicle.model}. No payment is taken now —
                  we'll arrange funding with you directly.
                </DialogDescription>
              </DialogHeader>
              <div className="space-y-4 py-2">
                <div className="space-y-2">
                  <Label>Preferred funding method</Label>
                  <Select value={paymentMethod} onValueChange={setPaymentMethod}>
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="wire">Bank wire</SelectItem>
                      <SelectItem value="ach">ACH transfer</SelectItem>
                      <SelectItem value="check">Check</SelectItem>
                      <SelectItem value="other">Other / discuss</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-2">
                  <Label>Notes (optional)</Label>
                  <Textarea
                    value={notes}
                    onChange={(e) => setNotes(e.target.value)}
                    placeholder="Anything we should know?"
                  />
                </div>
              </div>
              <DialogFooter>
                <Button variant="outline" onClick={() => setOpen(false)} disabled={submitting}>
                  Cancel
                </Button>
                <Button onClick={handleInvest} disabled={submitting}>
                  {submitting ? "Submitting…" : "Confirm investment"}
                </Button>
              </DialogFooter>
            </>
          )}
        </DialogContent>
      </Dialog>
    </DashboardLayout>
  );
}

function Spec({ label, value }: { label: string; value: string }) {
  return (
    <div className="rounded-md border p-2">
      <p className="text-muted-foreground text-xs">{label}</p>
      <p className="font-medium">{value}</p>
    </div>
  );
}

function Row({
  label,
  value,
  bold,
  accent,
}: {
  label: string;
  value: string;
  bold?: boolean;
  accent?: boolean;
}) {
  return (
    <div className="flex items-center justify-between">
      <span className="text-sm text-muted-foreground">{label}</span>
      <span
        className={`${bold ? "text-lg font-bold" : "font-medium"} ${
          accent ? "text-primary flex items-center gap-1" : ""
        }`}
      >
        {accent && <TrendingUp className="h-4 w-4" />}
        {value}
      </span>
    </div>
  );
}
