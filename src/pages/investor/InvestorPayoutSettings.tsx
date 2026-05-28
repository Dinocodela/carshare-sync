import { DashboardLayout } from "@/components/layout/DashboardLayout";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Skeleton } from "@/components/ui/skeleton";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { ArrowLeft } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { useEffect, useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/useAuth";
import { toast } from "sonner";

type Settings = {
  preferred_method: string;
  bank_name: string;
  account_holder_name: string;
  account_last4: string;
  routing_last4: string;
  check_mailing_address: string;
  zelle_handle: string;
  tax_full_name: string;
  tax_address: string;
  tax_id_last4: string;
  notes: string;
};

const empty: Settings = {
  preferred_method: "ach",
  bank_name: "",
  account_holder_name: "",
  account_last4: "",
  routing_last4: "",
  check_mailing_address: "",
  zelle_handle: "",
  tax_full_name: "",
  tax_address: "",
  tax_id_last4: "",
  notes: "",
};

export default function InvestorPayoutSettings() {
  const navigate = useNavigate();
  const { user } = useAuth();
  const [form, setForm] = useState<Settings>(empty);
  const [saving, setSaving] = useState(false);

  const { data, isLoading } = useQuery({
    queryKey: ["investor-payout-settings", user?.id],
    enabled: !!user,
    queryFn: async () => {
      const { data, error } = await supabase
        .from("investor_payout_settings")
        .select("*")
        .eq("investor_id", user!.id)
        .maybeSingle();
      if (error) throw error;
      return data;
    },
  });

  useEffect(() => {
    if (data) {
      setForm({
        preferred_method: data.preferred_method ?? "ach",
        bank_name: data.bank_name ?? "",
        account_holder_name: data.account_holder_name ?? "",
        account_last4: data.account_last4 ?? "",
        routing_last4: data.routing_last4 ?? "",
        check_mailing_address: data.check_mailing_address ?? "",
        zelle_handle: data.zelle_handle ?? "",
        tax_full_name: data.tax_full_name ?? "",
        tax_address: data.tax_address ?? "",
        tax_id_last4: data.tax_id_last4 ?? "",
        notes: data.notes ?? "",
      });
    }
  }, [data]);

  const set = (k: keyof Settings, v: string) => setForm((f) => ({ ...f, [k]: v }));

  const save = async () => {
    if (!user) return;
    setSaving(true);
    try {
      const { error } = await supabase.from("investor_payout_settings").upsert(
        { investor_id: user.id, ...form, preferred_method: form.preferred_method as any },
        { onConflict: "investor_id" }
      );
      if (error) throw error;
      toast.success("Payout settings saved.");
    } catch (e: any) {
      console.error(e);
      toast.error(e?.message ?? "Could not save settings.");
    } finally {
      setSaving(false);
    }
  };

  return (
    <DashboardLayout>
      <div className="px-4 sm:px-6 space-y-6 max-w-2xl">
        <Button variant="ghost" onClick={() => navigate("/investor")}>
          <ArrowLeft className="h-4 w-4 mr-2" /> Back to portfolio
        </Button>

        <div>
          <h1 className="text-3xl font-bold">Payout &amp; tax settings</h1>
          <p className="text-muted-foreground">
            How you'd like to receive your monthly returns. Only the last 4 digits of
            sensitive numbers are stored.
          </p>
        </div>

        {isLoading ? (
          <Skeleton className="h-96 w-full rounded-lg" />
        ) : (
          <>
            <Card>
              <CardHeader>
                <CardTitle>Payout method</CardTitle>
                <CardDescription>Where we send your returns.</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-2">
                  <Label>Preferred method</Label>
                  <Select
                    value={form.preferred_method}
                    onValueChange={(v) => set("preferred_method", v)}
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="ach">ACH transfer</SelectItem>
                      <SelectItem value="wire">Bank wire</SelectItem>
                      <SelectItem value="check">Check</SelectItem>
                      <SelectItem value="zelle">Zelle</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                {(form.preferred_method === "ach" || form.preferred_method === "wire") && (
                  <div className="grid sm:grid-cols-2 gap-4">
                    <Field label="Bank name" value={form.bank_name} onChange={(v) => set("bank_name", v)} />
                    <Field
                      label="Account holder name"
                      value={form.account_holder_name}
                      onChange={(v) => set("account_holder_name", v)}
                    />
                    <Field
                      label="Account number (last 4)"
                      value={form.account_last4}
                      onChange={(v) => set("account_last4", v.slice(0, 4))}
                      maxLength={4}
                    />
                    <Field
                      label="Routing number (last 4)"
                      value={form.routing_last4}
                      onChange={(v) => set("routing_last4", v.slice(0, 4))}
                      maxLength={4}
                    />
                  </div>
                )}

                {form.preferred_method === "check" && (
                  <div className="space-y-2">
                    <Label>Mailing address</Label>
                    <Textarea
                      value={form.check_mailing_address}
                      onChange={(e) => set("check_mailing_address", e.target.value)}
                    />
                  </div>
                )}

                {form.preferred_method === "zelle" && (
                  <Field
                    label="Zelle email or phone"
                    value={form.zelle_handle}
                    onChange={(v) => set("zelle_handle", v)}
                  />
                )}
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Tax information</CardTitle>
                <CardDescription>Used for your year-end 1099.</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <Field
                  label="Legal full name"
                  value={form.tax_full_name}
                  onChange={(v) => set("tax_full_name", v)}
                />
                <div className="space-y-2">
                  <Label>Tax address</Label>
                  <Textarea
                    value={form.tax_address}
                    onChange={(e) => set("tax_address", e.target.value)}
                  />
                </div>
                <Field
                  label="SSN / EIN (last 4)"
                  value={form.tax_id_last4}
                  onChange={(v) => set("tax_id_last4", v.slice(0, 4))}
                  maxLength={4}
                />
              </CardContent>
            </Card>

            <div className="flex justify-end">
              <Button onClick={save} disabled={saving}>
                {saving ? "Saving…" : "Save settings"}
              </Button>
            </div>
          </>
        )}
      </div>
    </DashboardLayout>
  );
}

function Field({
  label,
  value,
  onChange,
  maxLength,
}: {
  label: string;
  value: string;
  onChange: (v: string) => void;
  maxLength?: number;
}) {
  return (
    <div className="space-y-2">
      <Label>{label}</Label>
      <Input value={value} maxLength={maxLength} onChange={(e) => onChange(e.target.value)} />
    </div>
  );
}
