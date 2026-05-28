import { DashboardLayout } from "@/components/layout/DashboardLayout";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  Dialog,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { ArrowLeft, Plus } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { useState } from "react";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { fmtCurrency } from "@/hooks/useInvestor";

export default function AdminInvestments() {
  const navigate = useNavigate();
  return (
    <DashboardLayout>
      <div className="px-4 sm:px-6 space-y-6">
        <Button variant="ghost" onClick={() => navigate("/dashboard")}>
          <ArrowLeft className="h-4 w-4 mr-2" /> Back
        </Button>
        <div>
          <h1 className="text-3xl font-bold">Investor management</h1>
          <p className="text-muted-foreground">
            Manage investable vehicles, fund investments, and record payouts.
          </p>
        </div>
        <Tabs defaultValue="investments">
          <TabsList>
            <TabsTrigger value="investments">Investments</TabsTrigger>
            <TabsTrigger value="vehicles">Vehicles</TabsTrigger>
          </TabsList>
          <TabsContent value="investments" className="mt-4">
            <InvestmentsTab />
          </TabsContent>
          <TabsContent value="vehicles" className="mt-4">
            <VehiclesTab />
          </TabsContent>
        </Tabs>
      </div>
    </DashboardLayout>
  );
}

/* ---------------- Investments ---------------- */

function InvestmentsTab() {
  const qc = useQueryClient();
  const [processing, setProcessing] = useState<string | null>(null);

  const { data: investments } = useQuery({
    queryKey: ["admin-investments"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("investments")
        .select("*")
        .order("requested_at", { ascending: false });
      if (error) throw error;
      return data ?? [];
    },
  });

  const { data: vehicles } = useQuery({
    queryKey: ["admin-vehicles"],
    queryFn: async () => {
      const { data, error } = await supabase.from("investor_vehicles").select("*");
      if (error) throw error;
      return data ?? [];
    },
  });

  const { data: profiles } = useQuery({
    queryKey: ["admin-investor-profiles"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("profiles")
        .select("user_id, first_name, last_name, email");
      if (error) throw error;
      return data ?? [];
    },
  });

  const vehMap = new Map((vehicles ?? []).map((v: any) => [v.id, v]));
  const profMap = new Map((profiles ?? []).map((p: any) => [p.user_id, p]));

  const activate = async (inv: any) => {
    setProcessing(inv.id);
    try {
      const start = new Date();
      const startDate = start.toISOString().slice(0, 10);
      const end = new Date(start);
      end.setMonth(end.getMonth() + inv.term_months);

      const { error: updErr } = await supabase
        .from("investments")
        .update({
          status: "active",
          start_date: startDate,
          end_date: end.toISOString().slice(0, 10),
          funded_at: new Date().toISOString(),
        })
        .eq("id", inv.id);
      if (updErr) throw updErr;

      // Generate monthly payout schedule
      const rows = Array.from({ length: inv.term_months }, (_, i) => {
        const d = new Date(start);
        d.setMonth(d.getMonth() + i + 1);
        return {
          investment_id: inv.id,
          payout_month: i + 1,
          amount: inv.monthly_return,
          scheduled_date: d.toISOString().slice(0, 10),
          status: "scheduled" as const,

        };
      });
      const { error: poErr } = await supabase
        .from("investment_payouts")
        .upsert(rows, { onConflict: "investment_id,payout_month" });
      if (poErr) throw poErr;

      // Mark vehicle funded
      await supabase
        .from("investor_vehicles")
        .update({ status: "funded" })
        .eq("id", inv.vehicle_id);

      toast.success("Investment activated and payout schedule generated.");
      qc.invalidateQueries({ queryKey: ["admin-investments"] });
    } catch (e: any) {
      console.error(e);
      toast.error(e?.message ?? "Failed to activate.");
    } finally {
      setProcessing(null);
    }
  };

  const cancel = async (inv: any) => {
    setProcessing(inv.id);
    try {
      const { error } = await supabase
        .from("investments")
        .update({ status: "cancelled", cancelled_at: new Date().toISOString() })
        .eq("id", inv.id);
      if (error) throw error;
      toast.success("Investment cancelled.");
      qc.invalidateQueries({ queryKey: ["admin-investments"] });
    } catch (e: any) {
      toast.error(e?.message ?? "Failed.");
    } finally {
      setProcessing(null);
    }
  };

  if (!investments || investments.length === 0) {
    return (
      <Card>
        <CardContent className="p-8 text-center text-muted-foreground">
          No investments yet.
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardContent className="p-0 overflow-x-auto">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Investor</TableHead>
              <TableHead>Vehicle</TableHead>
              <TableHead>Amount</TableHead>
              <TableHead>Method</TableHead>
              <TableHead>Status</TableHead>
              <TableHead className="text-right">Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {investments.map((inv: any) => {
              const v = vehMap.get(inv.vehicle_id);
              const p = profMap.get(inv.investor_id);
              return (
                <TableRow key={inv.id}>
                  <TableCell>
                    <div className="font-medium">
                      {p ? `${p.first_name ?? ""} ${p.last_name ?? ""}`.trim() || p.email : "—"}
                    </div>
                    <div className="text-xs text-muted-foreground">{p?.email}</div>
                  </TableCell>
                  <TableCell>{v ? `${v.year} ${v.make} ${v.model}` : "—"}</TableCell>
                  <TableCell>{fmtCurrency(inv.amount)}</TableCell>
                  <TableCell className="uppercase text-xs">{inv.payment_method ?? "—"}</TableCell>
                  <TableCell>
                    <Badge variant={inv.status === "active" ? "default" : "secondary"} className="capitalize">
                      {inv.status}
                    </Badge>
                  </TableCell>
                  <TableCell className="text-right space-x-2">
                    {inv.status === "pending" && (
                      <>
                        <Button
                          size="sm"
                          disabled={processing === inv.id}
                          onClick={() => activate(inv)}
                        >
                          Activate
                        </Button>
                        <Button
                          size="sm"
                          variant="outline"
                          disabled={processing === inv.id}
                          onClick={() => cancel(inv)}
                        >
                          Cancel
                        </Button>
                      </>
                    )}
                    {inv.status === "active" && (
                      <PayoutManager investmentId={inv.id} />
                    )}
                  </TableCell>
                </TableRow>
              );
            })}
          </TableBody>
        </Table>
      </CardContent>
    </Card>
  );
}

function PayoutManager({ investmentId }: { investmentId: string }) {
  const qc = useQueryClient();
  const [open, setOpen] = useState(false);
  const { data: payouts } = useQuery({
    queryKey: ["admin-payouts", investmentId],
    enabled: open,
    queryFn: async () => {
      const { data, error } = await supabase
        .from("investment_payouts")
        .select("*")
        .eq("investment_id", investmentId)
        .order("payout_month");
      if (error) throw error;
      return data ?? [];
    },
  });

  const markPaid = async (po: any) => {
    try {
      const today = new Date().toISOString().slice(0, 10);
      const { error } = await supabase
        .from("investment_payouts")
        .update({ status: "paid", paid_date: today })
        .eq("id", po.id);
      if (error) throw error;

      // Update aggregate totals on the investment
      const { data: allPaid } = await supabase
        .from("investment_payouts")
        .select("amount")
        .eq("investment_id", investmentId)
        .eq("status", "paid");
      const total = (allPaid ?? []).reduce((s, r: any) => s + Number(r.amount), 0);
      await supabase
        .from("investments")
        .update({ total_returns_paid: total, months_completed: (allPaid ?? []).length })
        .eq("id", investmentId);

      toast.success("Payout marked paid.");
      qc.invalidateQueries({ queryKey: ["admin-payouts", investmentId] });
      qc.invalidateQueries({ queryKey: ["admin-investments"] });
    } catch (e: any) {
      toast.error(e?.message ?? "Failed.");
    }
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <Button size="sm" variant="outline" onClick={() => setOpen(true)}>
        Payouts
      </Button>
      <DialogContent className="max-w-lg">
        <DialogHeader>
          <DialogTitle>Manage payouts</DialogTitle>
        </DialogHeader>
        <div className="max-h-[60vh] overflow-y-auto">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>#</TableHead>
                <TableHead>Scheduled</TableHead>
                <TableHead>Amount</TableHead>
                <TableHead>Status</TableHead>
                <TableHead></TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {(payouts ?? []).map((po: any) => (
                <TableRow key={po.id}>
                  <TableCell>{po.payout_month}</TableCell>
                  <TableCell>{po.scheduled_date}</TableCell>
                  <TableCell>{fmtCurrency(po.amount)}</TableCell>
                  <TableCell className="capitalize">{po.status}</TableCell>
                  <TableCell>
                    {po.status !== "paid" && (
                      <Button size="sm" onClick={() => markPaid(po)}>
                        Mark paid
                      </Button>
                    )}
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </div>
      </DialogContent>
    </Dialog>
  );
}

/* ---------------- Vehicles ---------------- */

const emptyVehicle = {
  make: "Tesla",
  model: "",
  year: new Date().getFullYear(),
  vin: "",
  mileage: "",
  color: "",
  condition: "",
  location: "",
  status: "available",
  investment_amount: 50000,
  monthly_return: 1000,
  term_months: 50,
  resale_upside_pct: 50,
  estimated_resale_value: "",
  description: "",
  photos: "",
  highlights: "",
};

function VehiclesTab() {
  const qc = useQueryClient();
  const [open, setOpen] = useState(false);
  const [editing, setEditing] = useState<any>(null);
  const [form, setForm] = useState<any>(emptyVehicle);
  const [saving, setSaving] = useState(false);

  const { data: vehicles } = useQuery({
    queryKey: ["admin-vehicles"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("investor_vehicles")
        .select("*")
        .order("created_at", { ascending: false });
      if (error) throw error;
      return data ?? [];
    },
  });

  const openNew = () => {
    setEditing(null);
    setForm(emptyVehicle);
    setOpen(true);
  };

  const openEdit = (v: any) => {
    setEditing(v);
    setForm({
      ...v,
      mileage: v.mileage ?? "",
      estimated_resale_value: v.estimated_resale_value ?? "",
      photos: (v.photos ?? []).join("\n"),
      highlights: (v.highlights ?? []).join("\n"),
    });
    setOpen(true);
  };

  const set = (k: string, val: any) => setForm((f: any) => ({ ...f, [k]: val }));

  const save = async () => {
    setSaving(true);
    try {
      const payload = {
        make: form.make,
        model: form.model,
        year: Number(form.year),
        vin: form.vin || null,
        mileage: form.mileage ? Number(form.mileage) : null,
        color: form.color || null,
        condition: form.condition || null,
        location: form.location || null,
        status: form.status,
        investment_amount: Number(form.investment_amount),
        purchase_price: Number(form.investment_amount),
        monthly_return: Number(form.monthly_return),
        term_months: Number(form.term_months),
        resale_upside_pct: Number(form.resale_upside_pct),
        estimated_resale_value: form.estimated_resale_value
          ? Number(form.estimated_resale_value)
          : null,
        description: form.description || null,
        photos: String(form.photos || "")
          .split("\n")
          .map((s: string) => s.trim())
          .filter(Boolean),
        highlights: String(form.highlights || "")
          .split("\n")
          .map((s: string) => s.trim())
          .filter(Boolean),
      };
      if (editing) {
        const { error } = await supabase
          .from("investor_vehicles")
          .update(payload)
          .eq("id", editing.id);
        if (error) throw error;
      } else {
        const { error } = await supabase.from("investor_vehicles").insert(payload);
        if (error) throw error;
      }
      toast.success("Vehicle saved.");
      setOpen(false);
      qc.invalidateQueries({ queryKey: ["admin-vehicles"] });
    } catch (e: any) {
      console.error(e);
      toast.error(e?.message ?? "Failed to save vehicle.");
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="space-y-4">
      <div className="flex justify-end">
        <Button onClick={openNew}>
          <Plus className="h-4 w-4 mr-2" /> Add vehicle
        </Button>
      </div>

      {!vehicles || vehicles.length === 0 ? (
        <Card>
          <CardContent className="p-8 text-center text-muted-foreground">
            No vehicles yet. Add the first investable Tesla.
          </CardContent>
        </Card>
      ) : (
        <Card>
          <CardContent className="p-0 overflow-x-auto">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Vehicle</TableHead>
                  <TableHead>Amount</TableHead>
                  <TableHead>Monthly</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead></TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {vehicles.map((v: any) => (
                  <TableRow key={v.id}>
                    <TableCell className="font-medium">
                      {v.year} {v.make} {v.model}
                    </TableCell>
                    <TableCell>{fmtCurrency(v.investment_amount)}</TableCell>
                    <TableCell>{fmtCurrency(v.monthly_return)}</TableCell>
                    <TableCell>
                      <Badge variant="secondary" className="capitalize">
                        {v.status}
                      </Badge>
                    </TableCell>
                    <TableCell>
                      <Button size="sm" variant="outline" onClick={() => openEdit(v)}>
                        Edit
                      </Button>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </CardContent>
        </Card>
      )}

      <Dialog open={open} onOpenChange={setOpen}>
        <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>{editing ? "Edit vehicle" : "Add vehicle"}</DialogTitle>
          </DialogHeader>
          <div className="grid sm:grid-cols-2 gap-4">
            <F label="Make"><Input value={form.make} onChange={(e) => set("make", e.target.value)} /></F>
            <F label="Model"><Input value={form.model} onChange={(e) => set("model", e.target.value)} /></F>
            <F label="Year"><Input type="number" value={form.year} onChange={(e) => set("year", e.target.value)} /></F>
            <F label="VIN"><Input value={form.vin} onChange={(e) => set("vin", e.target.value)} /></F>
            <F label="Mileage"><Input type="number" value={form.mileage} onChange={(e) => set("mileage", e.target.value)} /></F>
            <F label="Color"><Input value={form.color} onChange={(e) => set("color", e.target.value)} /></F>
            <F label="Condition"><Input value={form.condition} onChange={(e) => set("condition", e.target.value)} /></F>
            <F label="Location"><Input value={form.location} onChange={(e) => set("location", e.target.value)} /></F>
            <F label="Status">
              <Select value={form.status} onValueChange={(v) => set("status", v)}>
                <SelectTrigger><SelectValue /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="draft">Draft</SelectItem>
                  <SelectItem value="available">Available</SelectItem>
                  <SelectItem value="funded">Funded</SelectItem>
                  <SelectItem value="active">Active</SelectItem>
                  <SelectItem value="sold">Sold</SelectItem>
                  <SelectItem value="retired">Retired</SelectItem>
                </SelectContent>
              </Select>
            </F>
            <F label="Investment amount"><Input type="number" value={form.investment_amount} onChange={(e) => set("investment_amount", e.target.value)} /></F>
            <F label="Monthly return"><Input type="number" value={form.monthly_return} onChange={(e) => set("monthly_return", e.target.value)} /></F>
            <F label="Term (months)"><Input type="number" value={form.term_months} onChange={(e) => set("term_months", e.target.value)} /></F>
            <F label="Resale upside %"><Input type="number" value={form.resale_upside_pct} onChange={(e) => set("resale_upside_pct", e.target.value)} /></F>
            <F label="Est. resale value"><Input type="number" value={form.estimated_resale_value} onChange={(e) => set("estimated_resale_value", e.target.value)} /></F>
          </div>
          <F label="Description">
            <Textarea value={form.description} onChange={(e) => set("description", e.target.value)} />
          </F>
          <F label="Photo URLs (one per line)">
            <Textarea value={form.photos} onChange={(e) => set("photos", e.target.value)} />
          </F>
          <F label="Highlights (one per line)">
            <Textarea value={form.highlights} onChange={(e) => set("highlights", e.target.value)} />
          </F>
          <DialogFooter>
            <Button variant="outline" onClick={() => setOpen(false)} disabled={saving}>
              Cancel
            </Button>
            <Button onClick={save} disabled={saving || !form.model}>
              {saving ? "Saving…" : "Save vehicle"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}

function F({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div className="space-y-2">
      <Label>{label}</Label>
      {children}
    </div>
  );
}
