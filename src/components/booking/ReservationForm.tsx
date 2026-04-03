import { useState } from "react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { differenceInDays } from "date-fns";

interface Props {
  cars: any[];
  userId: string;
  onSuccess: () => void;
  onCancel: () => void;
}

export function ReservationForm({ cars, userId, onSuccess, onCancel }: Props) {
  const { toast } = useToast();
  const [submitting, setSubmitting] = useState(false);
  const [form, setForm] = useState({
    car_id: "",
    guest_name: "",
    guest_email: "",
    guest_phone: "",
    start_date: "",
    end_date: "",
    daily_rate: "",
    notes: "",
    payment_source: "Direct",
  });

  const days = form.start_date && form.end_date
    ? Math.max(1, differenceInDays(new Date(form.end_date), new Date(form.start_date)))
    : 0;
  const totalAmount = days * (parseFloat(form.daily_rate) || 0);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!form.car_id || !form.guest_name || !form.start_date || !form.end_date) {
      toast({ title: "Missing fields", description: "Please fill in all required fields.", variant: "destructive" });
      return;
    }
    setSubmitting(true);
    try {
      const { error } = await supabase.from("reservations").insert({
        host_id: userId,
        car_id: form.car_id,
        guest_name: form.guest_name.trim(),
        guest_email: form.guest_email.trim() || null,
        guest_phone: form.guest_phone.trim() || null,
        start_date: form.start_date,
        end_date: form.end_date,
        daily_rate: parseFloat(form.daily_rate) || 0,
        total_amount: totalAmount,
        notes: form.notes.trim() || null,
        payment_source: form.payment_source,
        status: "pending",
      });
      if (error) throw error;
      toast({ title: "Reservation created!" });
      onSuccess();
    } catch (err: any) {
      toast({ title: "Error", description: err?.message || "Failed to create reservation", variant: "destructive" });
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <Card className="p-6">
      <h2 className="text-lg font-semibold text-foreground mb-4">New Reservation</h2>
      <form onSubmit={handleSubmit} className="space-y-4">
        <div className="grid gap-4 sm:grid-cols-2">
          <div className="space-y-1.5 sm:col-span-2">
            <Label>Vehicle *</Label>
            <Select value={form.car_id} onValueChange={(v) => setForm({ ...form, car_id: v })}>
              <SelectTrigger><SelectValue placeholder="Select a car" /></SelectTrigger>
              <SelectContent>
                {cars.map((c: any) => (
                  <SelectItem key={c.id} value={c.id}>{c.make} {c.model} ({c.year})</SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          <div className="space-y-1.5">
            <Label>Guest Name *</Label>
            <Input value={form.guest_name} onChange={(e) => setForm({ ...form, guest_name: e.target.value })} required />
          </div>
          <div className="space-y-1.5">
            <Label>Guest Email</Label>
            <Input type="email" value={form.guest_email} onChange={(e) => setForm({ ...form, guest_email: e.target.value })} />
          </div>
          <div className="space-y-1.5">
            <Label>Guest Phone</Label>
            <Input type="tel" value={form.guest_phone} onChange={(e) => setForm({ ...form, guest_phone: e.target.value })} />
          </div>
          <div className="space-y-1.5">
            <Label>Payment Source</Label>
            <Select value={form.payment_source} onValueChange={(v) => setForm({ ...form, payment_source: v })}>
              <SelectTrigger><SelectValue /></SelectTrigger>
              <SelectContent>
                <SelectItem value="Direct">Direct</SelectItem>
                <SelectItem value="Turo">Turo</SelectItem>
                <SelectItem value="Other">Other</SelectItem>
              </SelectContent>
            </Select>
          </div>
          <div className="space-y-1.5">
            <Label>Start Date *</Label>
            <Input type="date" value={form.start_date} onChange={(e) => setForm({ ...form, start_date: e.target.value })} required />
          </div>
          <div className="space-y-1.5">
            <Label>End Date *</Label>
            <Input type="date" value={form.end_date} min={form.start_date} onChange={(e) => setForm({ ...form, end_date: e.target.value })} required />
          </div>
          <div className="space-y-1.5">
            <Label>Daily Rate ($)</Label>
            <Input type="number" min={0} step="0.01" value={form.daily_rate} onChange={(e) => setForm({ ...form, daily_rate: e.target.value })} />
          </div>
          <div className="space-y-1.5">
            <Label>Total Amount</Label>
            <div className="h-10 flex items-center px-3 bg-muted rounded-md text-foreground font-semibold">
              ${totalAmount.toLocaleString(undefined, { minimumFractionDigits: 2 })}
              {days > 0 && <span className="text-xs text-muted-foreground ml-2">({days} day{days !== 1 ? "s" : ""})</span>}
            </div>
          </div>
          <div className="space-y-1.5 sm:col-span-2">
            <Label>Notes</Label>
            <Textarea value={form.notes} onChange={(e) => setForm({ ...form, notes: e.target.value })} rows={2} />
          </div>
        </div>
        <div className="flex gap-3 justify-end">
          <Button type="button" variant="outline" onClick={onCancel}>Cancel</Button>
          <Button type="submit" disabled={submitting}>{submitting ? "Creating…" : "Create Reservation"}</Button>
        </div>
      </form>
    </Card>
  );
}
