import { useEffect, useState } from "react";
import { DashboardLayout } from "@/components/layout/DashboardLayout";
import { PageContainer } from "@/components/layout/PageContainer";
import { SEO } from "@/components/SEO";
import { useAuth } from "@/hooks/useAuth";
import { supabase } from "@/integrations/supabase/client";
import { TripCard, TripCardData } from "@/components/trips/TripCard";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import { Loader2, ChevronLeft, ChevronRight } from "lucide-react";
import { Button } from "@/components/ui/button";

const PAGE_SIZE = 10;

type Filter = "all" | "upcoming" | "active" | "past";

function filterTrips(trips: TripCardData[], filter: Filter): TripCardData[] {
  if (filter === "all") return trips;
  const now = new Date();
  return trips.filter((t) => {
    const start = new Date(
      /^\d{4}-\d{2}-\d{2}$/.test(t.earning_period_start)
        ? `${t.earning_period_start}T00:00:00`
        : t.earning_period_start,
    );
    const end = new Date(
      /^\d{4}-\d{2}-\d{2}$/.test(t.earning_period_end)
        ? `${t.earning_period_end}T00:00:00`
        : t.earning_period_end,
    );
    if (filter === "upcoming") return now < start;
    if (filter === "active") return now >= start && now <= end;
    return now > end;
  });
}

export default function Trips() {
  const { user } = useAuth();
  const [loading, setLoading] = useState(true);
  const [trips, setTrips] = useState<TripCardData[]>([]);
  const [filter, setFilter] = useState<Filter>("upcoming");
  const [page, setPage] = useState(1);

  useEffect(() => {
    setPage(1);
  }, [filter]);

  useEffect(() => {
    if (!user) return;
    let cancelled = false;
    (async () => {
      setLoading(true);

      // Fetch role
      const { data: profile } = await supabase
        .from("profiles")
        .select("role")
        .eq("user_id", user.id)
        .maybeSingle();

      let query = supabase
        .from("host_earnings")
        .select(
          "id, trip_id, guest_name, earning_period_start, earning_period_end, car_id, host_id, cars!fk_host_earnings_car_id(make, model, year, license_plate, location, images, client_id)",
        )
        .order("earning_period_start", { ascending: true });

      if (profile?.role === "host") {
        query = query.eq("host_id", user.id);
      }
      // For clients, RLS already restricts to their cars' earnings.

      const { data, error } = await query;
      if (cancelled) return;
      if (error) {
        console.error("Failed to load trips:", error);
        setTrips([]);
      } else {
        const rows = data || [];
        const tripIds = Array.from(
          new Set(
            rows
              .map((r: any) => r.trip_id)
              .filter((t: string | null): t is string => !!t),
          ),
        );
        let deliveryTripIds = new Set<string>();
        if (tripIds.length > 0) {
          const { data: expenses } = await supabase
            .from("host_expenses")
            .select("trip_id, delivery_cost")
            .in("trip_id", tripIds)
            .gt("delivery_cost", 0);
          deliveryTripIds = new Set(
            (expenses || [])
              .map((e: any) => e.trip_id)
              .filter((t: string | null): t is string => !!t),
          );
        }

        const mapped: TripCardData[] = rows.map((row: any) => ({
          id: row.id,
          trip_id: row.trip_id,
          guest_name: row.guest_name,
          earning_period_start: row.earning_period_start,
          earning_period_end: row.earning_period_end,
          is_delivery: row.trip_id ? deliveryTripIds.has(row.trip_id) : false,
          delivery_address: null,
          car: row.cars
            ? {
                make: row.cars.make,
                model: row.cars.model,
                year: row.cars.year,
                license_plate: row.cars.license_plate,
                location: row.cars.location,
                images: row.cars.images,
              }
            : null,
        }));
        setTrips(mapped);
      }
      setLoading(false);
    })();
    return () => {
      cancelled = true;
    };
  }, [user]);

  const filtered = filterTrips(trips, filter);

  return (
    <DashboardLayout>
      <SEO title="Trips | Teslys" description="View all your trips" />
      <PageContainer>
        <header className="mb-4">
          <h1 className="text-2xl font-bold">Trips</h1>
          <p className="text-sm text-muted-foreground">
            Sorted by start date, oldest first.
          </p>
        </header>

        <Tabs
          value={filter}
          onValueChange={(v) => setFilter(v as Filter)}
          className="mb-4"
        >
          <TabsList className="grid w-full grid-cols-4">
            <TabsTrigger value="upcoming">Upcoming</TabsTrigger>
            <TabsTrigger value="active">In progress</TabsTrigger>
            <TabsTrigger value="past">Past</TabsTrigger>
            <TabsTrigger value="all">All</TabsTrigger>
          </TabsList>
          <TabsContent value={filter} className="mt-4">
            {loading ? (
              <div className="flex items-center justify-center py-12 text-muted-foreground">
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Loading trips…
              </div>
            ) : filtered.length === 0 ? (
              <div className="rounded-2xl border border-dashed py-12 text-center text-muted-foreground">
                No trips to show.
              </div>
            ) : (
              <div className="space-y-5">
                {filtered.map((trip) => (
                  <TripCard key={trip.id} trip={trip} />
                ))}
              </div>
            )}
          </TabsContent>
        </Tabs>
      </PageContainer>
    </DashboardLayout>
  );
}
