import { useState, useEffect } from "react";
import { DashboardLayout } from "@/components/layout/DashboardLayout";
import { PageContainer } from "@/components/layout/PageContainer";
import { ScreenHeader } from "@/components/ScreenHeader";
import { SEO } from "@/components/SEO";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { useAuth } from "@/hooks/useAuth";
import { useHostCars } from "@/hooks/useCars";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { Plus, Calendar, User, DollarSign } from "lucide-react";
import { format } from "date-fns";
import { ReservationForm } from "@/components/booking/ReservationForm";

interface Reservation {
  id: string;
  car_id: string;
  guest_name: string;
  guest_email: string | null;
  guest_phone: string | null;
  start_date: string;
  end_date: string;
  daily_rate: number;
  total_amount: number;
  status: string;
  notes: string | null;
  payment_source: string | null;
  created_at: string;
}

export default function HostReservations() {
  const { user } = useAuth();
  const { cars } = useHostCars();
  const { toast } = useToast();
  const [reservations, setReservations] = useState<Reservation[]>([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);

  const fetchReservations = async () => {
    if (!user) return;
    setLoading(true);
    const { data, error } = await supabase
      .from("reservations")
      .select("*")
      .eq("host_id", user.id)
      .order("start_date", { ascending: false });
    if (error) {
      toast({ title: "Error loading reservations", description: error.message, variant: "destructive" });
    } else {
      setReservations(data || []);
    }
    setLoading(false);
  };

  useEffect(() => {
    fetchReservations();
  }, [user]);

  const carMap = Object.fromEntries(cars.map((c: any) => [c.id, `${c.make} ${c.model} (${c.year})`]));

  const statusColor = (s: string) => {
    switch (s) {
      case "confirmed": return "default";
      case "completed": return "secondary";
      case "cancelled": return "destructive";
      default: return "outline";
    }
  };

  return (
    <>
      <SEO title="Reservations | Teslys Host" description="Manage guest reservations for your hosted vehicles." />
      <DashboardLayout>
        <ScreenHeader title="Reservations" fallbackHref="/dashboard" />
        <PageContainer className="py-6">
          <div className="max-w-4xl mx-auto space-y-6">
            <div className="flex items-center justify-between">
              <p className="text-muted-foreground text-sm">
                {reservations.length} reservation{reservations.length !== 1 ? "s" : ""}
              </p>
              <Button onClick={() => setShowForm(true)} size="sm">
                <Plus className="w-4 h-4 mr-1" /> New Reservation
              </Button>
            </div>

            {showForm && (
              <ReservationForm
                cars={cars}
                userId={user?.id || ""}
                onSuccess={() => { setShowForm(false); fetchReservations(); }}
                onCancel={() => setShowForm(false)}
              />
            )}

            {loading ? (
              <div className="text-center py-12 text-muted-foreground">Loading reservations…</div>
            ) : reservations.length === 0 ? (
              <Card className="p-12 text-center space-y-3">
                <Calendar className="w-12 h-12 text-muted-foreground mx-auto" />
                <h2 className="text-lg font-semibold text-foreground">No reservations yet</h2>
                <p className="text-sm text-muted-foreground">
                  Create your first reservation to start booking guests for your clients' cars.
                </p>
                <Button onClick={() => setShowForm(true)} className="mt-2">
                  <Plus className="w-4 h-4 mr-1" /> Create Reservation
                </Button>
              </Card>
            ) : (
              <div className="space-y-3">
                {reservations.map((r) => (
                  <Card key={r.id} className="p-4">
                    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                      <div className="space-y-1">
                        <div className="flex items-center gap-2">
                          <User className="w-4 h-4 text-muted-foreground" />
                          <span className="font-semibold text-foreground">{r.guest_name}</span>
                          <Badge variant={statusColor(r.status)}>{r.status}</Badge>
                        </div>
                        <p className="text-sm text-muted-foreground">
                          {carMap[r.car_id] || "Unknown car"} · {format(new Date(r.start_date), "MMM d")} – {format(new Date(r.end_date), "MMM d, yyyy")}
                        </p>
                      </div>
                      <div className="flex items-center gap-1 text-foreground font-semibold">
                        <DollarSign className="w-4 h-4" />
                        {Number(r.total_amount).toLocaleString(undefined, { minimumFractionDigits: 2 })}
                      </div>
                    </div>
                    {r.notes && <p className="mt-2 text-xs text-muted-foreground">{r.notes}</p>}
                  </Card>
                ))}
              </div>
            )}
          </div>
        </PageContainer>
      </DashboardLayout>
    </>
  );
}
