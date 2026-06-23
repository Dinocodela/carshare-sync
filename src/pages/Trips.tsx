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

export default function Trips() {
  const { user } = useAuth();
  const [loading, setLoading] = useState(true);
  const [pageItems, setPageItems] = useState<TripCardData[]>([]);
  const [totalCount, setTotalCount] = useState(0);
  const [filter, setFilter] = useState<Filter>("active");
  const [page, setPage] = useState(1);

  useEffect(() => {
    setPage(1);
  }, [filter]);

  useEffect(() => {
    if (!user) return;
    let cancelled = false;
    (async () => {
      setLoading(true);

      const { data: profile } = await supabase
        .from("profiles")
        .select("role")
        .eq("user_id", user.id)
        .maybeSingle();

      const nowIso = new Date().toISOString();

      let query = supabase
        .from("host_earnings")
        .select(
          "id, trip_id, guest_name, earning_period_start, earning_period_end, pickup_address, return_address, car_id, host_id, cars!fk_host_earnings_car_id(make, model, year, license_plate, location, images, client_id)",
          { count: "exact" },
        );

      if (profile?.role === "host") {
        query = query.eq("host_id", user.id);
      }

      // Tab-aware server-side filtering + ordering
      if (filter === "upcoming") {
        query = query
          .gt("earning_period_start", nowIso)
          .order("earning_period_start", { ascending: true });
      } else if (filter === "active") {
        query = query
          .lte("earning_period_start", nowIso)
          .gte("earning_period_end", nowIso)
          .order("earning_period_end", { ascending: true });
      } else if (filter === "past") {
        query = query
          .lt("earning_period_end", nowIso)
          .order("earning_period_end", { ascending: false });
      } else {
        query = query.order("earning_period_start", { ascending: true });
      }

      const from = (page - 1) * PAGE_SIZE;
      const to = from + PAGE_SIZE - 1;
      const { data, error, count } = await query.range(from, to);

      if (cancelled) return;
      if (error) {
        console.error("Failed to load trips:", error);
        setPageItems([]);
        setTotalCount(0);
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
        setPageItems(mapped);
        setTotalCount(count || 0);
      }
      setLoading(false);
    })();
    return () => {
      cancelled = true;
    };
  }, [user, filter, page]);

  const totalPages = Math.max(1, Math.ceil(totalCount / PAGE_SIZE));
  const currentPage = Math.min(page, totalPages);
  const pageStart = (currentPage - 1) * PAGE_SIZE;

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
          <TabsContent value={filter} className="mt-4 pb-20">
            {loading ? (
              <div className="flex items-center justify-center py-12 text-muted-foreground">
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Loading trips…
              </div>
            ) : totalCount === 0 ? (
              <div className="rounded-2xl border border-dashed py-12 text-center text-muted-foreground">
                No trips to show.
              </div>
            ) : (
              <>
                <div className="space-y-5">
                  {pageItems.map((trip) => (
                    <TripCard key={trip.id} trip={trip} />
                  ))}
                </div>
                {totalCount > PAGE_SIZE && (
                  <div className="mt-6 flex items-center justify-between gap-2">
                    <p className="text-sm text-muted-foreground">
                      Showing {pageStart + 1}–
                      {Math.min(pageStart + PAGE_SIZE, totalCount)} of{" "}
                      {totalCount}
                    </p>
                    <div className="flex items-center gap-2">
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => setPage((p) => Math.max(1, p - 1))}
                        disabled={currentPage === 1}
                      >
                        <ChevronLeft className="h-4 w-4" />
                        Previous
                      </Button>
                      <span className="text-sm text-muted-foreground">
                        Page {currentPage} of {totalPages}
                      </span>
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() =>
                          setPage((p) => Math.min(totalPages, p + 1))
                        }
                        disabled={currentPage === totalPages}
                      >
                        Next
                        <ChevronRight className="h-4 w-4" />
                      </Button>
                    </div>
                  </div>
                )}
              </>
            )}
          </TabsContent>
        </Tabs>
      </PageContainer>
    </DashboardLayout>
  );
}
