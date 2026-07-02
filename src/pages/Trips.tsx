import { useEffect, useState } from "react";
import { useSearchParams } from "react-router-dom";
import { DashboardLayout } from "@/components/layout/DashboardLayout";
import { PageContainer } from "@/components/layout/PageContainer";
import { SEO } from "@/components/SEO";
import { useAuth } from "@/hooks/useAuth";
import { useWorkspace } from "@/hooks/useWorkspace";
import { supabase } from "@/integrations/supabase/client";
import { TripCard, TripCardData } from "@/components/trips/TripCard";
import { getClientShare } from "@/lib/expenseMatching";
import { formatCarName } from "@/lib/carName";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import { Loader2, ChevronLeft, ChevronRight, Search, X, SlidersHorizontal } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { useIsMobile } from "@/hooks/use-mobile";
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetDescription,
} from "@/components/ui/sheet";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

const PAGE_SIZE = 10;

type Filter = "all" | "upcoming" | "active" | "past";

export default function Trips() {
  const { user } = useAuth();
  const { availableRoles, activeWorkspace } = useWorkspace();
  const [loading, setLoading] = useState(true);
  const [pageItems, setPageItems] = useState<TripCardData[]>([]);
  const [totalCount, setTotalCount] = useState(0);
  const [filterCounts, setFilterCounts] = useState<Record<Filter, number>>({
    all: 0,
    upcoming: 0,
    active: 0,
    past: 0,
  });
  const [searchParams, setSearchParams] = useSearchParams();
  const tabParam = searchParams.get("tab") as Filter | null;
  const validFilters: Filter[] = ["all", "upcoming", "active", "past"];
  const [filter, setFilter] = useState<Filter>(
    tabParam && validFilters.includes(tabParam) ? tabParam : "active"
  );
  const pageParam = parseInt(searchParams.get("page") || "1", 10);
  const [page, setPage] = useState(
    Number.isFinite(pageParam) && pageParam > 0 ? pageParam : 1
  );
  const [search, setSearch] = useState(searchParams.get("q") || "");
  const searchTerm = searchParams.get("q")?.trim() || "";

  // Recent trip-number searches (device-local memory).
  const RECENT_KEY = "trips_recent_searches";
  const RECENT_MAX = 8;
  const [recentSearches, setRecentSearches] = useState<string[]>(() => {
    try {
      const raw = localStorage.getItem(RECENT_KEY);
      const parsed = raw ? JSON.parse(raw) : [];
      return Array.isArray(parsed)
        ? parsed.filter((s): s is string => typeof s === "string")
        : [];
    } catch {
      return [];
    }
  });
  const [showRecent, setShowRecent] = useState(false);
  const isMobile = useIsMobile();

  // Live search: update the query as the user types (debounced), no Enter needed.
  useEffect(() => {
    const v = search.trim();
    if (v === searchTerm) return;
    const t = setTimeout(() => {
      setPage(1);
      setSearchParams((prev) => {
        if (v) prev.set("q", v);
        else prev.delete("q");
        prev.set("page", "1");
        return prev;
      });
    }, 300);
    return () => clearTimeout(t);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [search]);

  const persistRecent = (list: string[]) => {
    setRecentSearches(list);
    try {
      localStorage.setItem(RECENT_KEY, JSON.stringify(list));
    } catch {
      /* ignore storage errors */
    }
  };

  const addRecentSearch = (term: string) => {
    const t = term.trim();
    if (!t) return;
    persistRecent([t, ...recentSearches.filter((s) => s !== t)].slice(0, RECENT_MAX));
  };

  const clearRecentSearches = () => persistRecent([]);

  const runSearch = (term: string) => {
    const v = term.trim();
    setSearch(v);
    setShowRecent(false);
    setPage(1);
    if (v) addRecentSearch(v);
    setSearchParams((prev) => {
      if (v) prev.set("q", v);
      else prev.delete("q");
      prev.set("page", "1");
      return prev;
    });
  };

  const isHostRole =
    activeWorkspace === "host" && availableRoles.some((r) => r.role === "host");

  // Additional filters
  const [carFilter, setCarFilter] = useState(searchParams.get("car") || "all");
  const [sourceFilter, setSourceFilter] = useState(
    searchParams.get("source") || "all"
  );
  const [statusFilter, setStatusFilter] = useState(
    searchParams.get("status") || "all"
  );
  const [dateRange, setDateRange] = useState(searchParams.get("range") || "all");
  const [carOptions, setCarOptions] = useState<
    { id: string; label: string }[]
  >([]);
  const [filtersOpen, setFiltersOpen] = useState(false);

  const activeFilterCount =
    (carFilter !== "all" ? 1 : 0) +
    (sourceFilter !== "all" ? 1 : 0) +
    (statusFilter !== "all" ? 1 : 0) +
    (dateRange !== "all" ? 1 : 0) +
    (searchTerm ? 1 : 0);

  const updateFilterParam = (key: string, value: string) => {
    setPage(1);
    setSearchParams((prev) => {
      if (value && value !== "all") prev.set(key, value);
      else prev.delete(key);
      prev.set("page", "1");
      return prev;
    });
  };

  const clearAllFilters = () => {
    setSearch("");
    setCarFilter("all");
    setSourceFilter("all");
    setStatusFilter("all");
    setDateRange("all");
    setPage(1);
    setSearchParams((prev) => {
      ["q", "car", "source", "status", "range"].forEach((k) => prev.delete(k));
      prev.set("page", "1");
      return prev;
    });
  };

  // Load car options for the dropdown based on workspace/role.
  useEffect(() => {
    if (!user) return;
    let cancelled = false;
    (async () => {
      const col = isHostRole ? "host_id" : "client_id";
      const { data } = await supabase
        .from("cars")
        .select("id, model, vin_number, license_plate, nickname")
        .eq(col, user.id);
      if (cancelled) return;
      setCarOptions(
        (data || []).map((c: any) => ({
          id: c.id,
          label: formatCarName(c),
        }))
      );
    })();
    return () => {
      cancelled = true;
    };
  }, [user, isHostRole]);


  const goToPage = (updater: (p: number) => number) => {
    setPage((prev) => {
      const next = updater(prev);
      setSearchParams((sp) => {
        sp.set("page", String(next));
        return sp;
      });
      return next;
    });
  };

  useEffect(() => {
    if (!user) return;
    let cancelled = false;
    (async () => {
      setLoading(true);

      // Stored timestamps are naive wall-clock times (displayed in UTC), so
      // compare against "now" shifted into the same wall-clock-as-UTC frame.
      const localNow = new Date();
      const nowIso = new Date(
        localNow.getTime() - localNow.getTimezoneOffset() * 60000,
      ).toISOString();

      // Use the active workspace to decide which data source to read. In the
      // host workspace, show real guest names from host_earnings; the client
      // portal must only ever expose guest initials (no full names).

      // Compute date-range lower bound (against earning_period_start).
      let rangeStartIso: string | null = null;
      if (dateRange !== "all") {
        const d = new Date(localNow);
        if (dateRange === "today") {
          d.setHours(0, 0, 0, 0);
        } else if (dateRange === "week") {
          d.setDate(d.getDate() - 7);
        } else if (dateRange === "month") {
          d.setMonth(d.getMonth() - 1);
        }
        rangeStartIso = new Date(
          d.getTime() - d.getTimezoneOffset() * 60000,
        ).toISOString();
      }

      const buildBaseQuery = (countOnly = false) => {
        const opts = countOnly ? { count: "exact" as const } : undefined;
        const fields = countOnly
          ? "id"
          : "id, trip_id, guest_name, earning_period_start, earning_period_end, pickup_address, return_address, delivery_address, car_id, host_id, amount, client_profit_percentage, payment_status, cars!fk_host_earnings_car_id(make, model, year, license_plate, location, images, client_id)";
        const clientFields = countOnly
          ? "id"
          : "id, trip_id, guest_initials, earning_period_start, earning_period_end, pickup_address, return_address, delivery_address, car_id, host_id, amount, client_profit_percentage, payment_status";

        const q = isHostRole
          ? supabase.from("host_earnings").select(fields, opts)
          : (supabase as any).from("client_visible_earnings").select(clientFields, opts);

        const withFilters = (qq: any) => {
          let r = qq;
          if (searchTerm) r = r.ilike("trip_id", `%${searchTerm}%`);
          if (carFilter !== "all") r = r.eq("car_id", carFilter);
          if (statusFilter !== "all") r = r.eq("payment_status", statusFilter);
          // Payment source only exists on host_earnings.
          if (isHostRole && sourceFilter !== "all")
            r = r.eq("payment_source", sourceFilter);
          if (rangeStartIso) r = r.gte("earning_period_start", rangeStartIso);
          return r;
        };

        if (isHostRole) {
          return withFilters((q as any).eq("host_id", user.id));
        }
        return withFilters(q);
      };


      const applyFilter = (q: any, f: Filter) => {
        if (f === "upcoming") {
          return q.gt("earning_period_start", nowIso);
        } else if (f === "active") {
          return q.lte("earning_period_start", nowIso).gte("earning_period_end", nowIso);
        } else if (f === "past") {
          return q.lt("earning_period_end", nowIso);
        }
        return q;
      };

      // Fetch counts for all filters in parallel
      const filters: Filter[] = ["all", "upcoming", "active", "past"];
      const countResults = await Promise.all(
        filters.map(async (f) => {
          const q = applyFilter(buildBaseQuery(true), f);
          const { count, error } = await q;
          if (error) {
            console.error(`Failed to count ${f} trips:`, error);
            return { filter: f, count: 0 };
          }
          return { filter: f, count: count || 0 };
        }),
      );

      const newCounts = { all: 0, upcoming: 0, active: 0, past: 0 };
      countResults.forEach(({ filter, count }) => {
        newCounts[filter] = count;
      });
      setFilterCounts(newCounts);

      // Tab-aware server-side filtering + ordering for the current page
      let query = applyFilter(buildBaseQuery(false), filter);
      if (filter === "upcoming") {
        query = query.order("earning_period_start", { ascending: true });
      } else if (filter === "active") {
        query = query.order("earning_period_end", { ascending: true });
      } else if (filter === "past") {
        query = query.order("earning_period_end", { ascending: false });
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
        const rows: any[] = (data as any[]) || [];
        const tripIds: string[] = Array.from(
          new Set(
            rows
              .map((r: any) => r.trip_id)
              .filter((t: string | null): t is string => !!t),
          ),
        );
        let deliveryTripIds = new Set<string>();
        let tripExpenses: any[] = [];
        if (tripIds.length > 0) {
          const { data: expenses } = await supabase
            .from("host_expenses")
            .select(
              "trip_id, amount, toll_cost, delivery_cost, carwash_cost, ev_charge_cost",
            )
            .in("trip_id", tripIds);
          tripExpenses = expenses || [];
          deliveryTripIds = new Set(
            tripExpenses
              .filter((e: any) => (e.delivery_cost || 0) > 0)
              .map((e: any) => e.trip_id)
              .filter((t: string | null): t is string => !!t),
          );
        }

        // Clients: fetch car details separately (view has no embed).
        let carsById: Record<string, any> = {};
        if (!isHostRole) {
          const carIds: string[] = Array.from(
            new Set(
              rows
                .map((r: any) => r.car_id)
                .filter((c: string | null): c is string => !!c),
            ),
          );
          if (carIds.length > 0) {
            const { data: carRows } = await supabase
              .from("cars")
              .select("id, make, model, year, license_plate, location, images")
              .in("id", carIds);
            (carRows || []).forEach((c: any) => {
              carsById[c.id] = c;
            });
          }
        }

        const mapped: TripCardData[] = rows.map((row: any) => {
          const car = isHostRole ? row.cars : carsById[row.car_id];
          const hasDeliveryExpense = row.trip_id
            ? deliveryTripIds.has(row.trip_id)
            : false;
          return {
            id: row.id,
            trip_id: row.trip_id,
            guest_name: row.guest_name ?? null,
            guest_initials: row.guest_initials ?? null,
            earning_period_start: row.earning_period_start,
            earning_period_end: row.earning_period_end,
            is_delivery: hasDeliveryExpense,
            delivery_address: row.pickup_address || null,
            delivery_destination:
              row.delivery_address || (hasDeliveryExpense ? row.pickup_address : null),
            return_address: row.return_address || null,
            net_amount:
              row.amount != null
                ? getClientShare(
                    Number(row.amount),
                    row.client_profit_percentage,
                    row.trip_id,
                    tripExpenses as any,
                  )
                : null,
            payment_status: row.payment_status ?? null,
            car: car
              ? {
                  make: car.make,
                  model: car.model,
                  year: car.year,
                  license_plate: car.license_plate,
                  location: car.location,
                  images: car.images,
                }
              : null,
          };
        });
        setPageItems(mapped);
        setTotalCount(newCounts[filter] || count || mapped.length);
      }
      setLoading(false);
    })();
    return () => {
      cancelled = true;
    };
  }, [user, filter, page, availableRoles, activeWorkspace, searchTerm, carFilter, sourceFilter, statusFilter, dateRange]);

  const totalPages = Math.max(1, Math.ceil(totalCount / PAGE_SIZE));
  const currentPage = Math.min(page, totalPages);
  const pageStart = (currentPage - 1) * PAGE_SIZE;

  const renderFilterFields = (gridClass: string) => (
    <div className={`grid gap-3 ${gridClass}`}>
      {/* Trip Search */}
      <form
        className="relative"
        onSubmit={(e) => {
          e.preventDefault();
          runSearch(search);
        }}
      >
        <Label className="mb-1.5 block text-xs font-medium">
          Search by Trip#
        </Label>
        <div className="relative">
          <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
          <Input
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            onFocus={() => setShowRecent(true)}
            onBlur={() => setTimeout(() => setShowRecent(false), 150)}
            placeholder="Enter trip#..."
            className="h-9 pl-9"
            inputMode="numeric"
          />
          {search && (
            <button
              type="button"
              onClick={() => {
                setSearch("");
                setPage(1);
                setSearchParams((prev) => {
                  prev.delete("q");
                  prev.set("page", "1");
                  return prev;
                });
              }}
              className="absolute right-2 top-1/2 -translate-y-1/2 rounded-full p-1 text-muted-foreground hover:bg-muted"
              aria-label="Clear search"
            >
              <X className="h-4 w-4" />
            </button>
          )}
        </div>

        {showRecent && recentSearches.length > 0 && (
          <div className="absolute z-20 mt-1 w-full overflow-hidden rounded-xl border border-border bg-popover shadow-lg">
            <div className="flex items-center justify-between px-3 py-1.5">
              <span className="text-[0.65rem] font-medium uppercase tracking-wide text-muted-foreground">
                Recent searches
              </span>
              <button
                type="button"
                onMouseDown={(e) => {
                  e.preventDefault();
                  clearRecentSearches();
                }}
                className="text-[0.65rem] font-medium text-muted-foreground hover:text-foreground"
              >
                Clear history
              </button>
            </div>
            <ul className="max-h-56 overflow-y-auto pb-1">
              {recentSearches.map((term) => (
                <li key={term}>
                  <button
                    type="button"
                    onMouseDown={(e) => {
                      e.preventDefault();
                      runSearch(term);
                    }}
                    className="flex w-full items-center gap-2 px-3 py-2 text-left text-sm hover:bg-muted"
                  >
                    <Search className="h-3.5 w-3.5 text-muted-foreground" />
                    <span className="truncate">{term}</span>
                  </button>
                </li>
              ))}
            </ul>
          </div>
        )}
      </form>

      {/* Car Filter */}
      <div>
        <Label className="mb-1.5 block text-xs font-medium">Car</Label>
        <Select
          value={carFilter}
          onValueChange={(v) => {
            setCarFilter(v);
            updateFilterParam("car", v);
          }}
        >
          <SelectTrigger className="h-9">
            <SelectValue placeholder="All cars" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All cars</SelectItem>
            {carOptions.map((c) => (
              <SelectItem key={c.id} value={c.id}>
                {c.label}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      {/* Payment Source (host only) */}
      {isHostRole && (
        <div>
          <Label className="mb-1.5 block text-xs font-medium">
            Payment Source
          </Label>
          <Select
            value={sourceFilter}
            onValueChange={(v) => {
              setSourceFilter(v);
              updateFilterParam("source", v);
            }}
          >
            <SelectTrigger className="h-9">
              <SelectValue placeholder="All sources" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All sources</SelectItem>
              <SelectItem value="Turo">Turo</SelectItem>
              <SelectItem value="Eon">Eon</SelectItem>
              <SelectItem value="GetAround">GetAround</SelectItem>
              <SelectItem value="Private">Private</SelectItem>
              <SelectItem value="Other">Other</SelectItem>
            </SelectContent>
          </Select>
        </div>
      )}

      {/* Payment Status */}
      <div>
        <Label className="mb-1.5 block text-xs font-medium">
          Payment Status
        </Label>
        <Select
          value={statusFilter}
          onValueChange={(v) => {
            setStatusFilter(v);
            updateFilterParam("status", v);
          }}
        >
          <SelectTrigger className="h-9">
            <SelectValue placeholder="All statuses" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All statuses</SelectItem>
            <SelectItem value="paid">Paid</SelectItem>
            <SelectItem value="pending">Pending</SelectItem>
            <SelectItem value="cancelled">Cancelled</SelectItem>
          </SelectContent>
        </Select>
      </div>

      {/* Date Range */}
      <div>
        <Label className="mb-1.5 block text-xs font-medium">
          Date Range
        </Label>
        <Select
          value={dateRange}
          onValueChange={(v) => {
            setDateRange(v);
            updateFilterParam("range", v);
          }}
        >
          <SelectTrigger className="h-9">
            <SelectValue placeholder="All time" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All time</SelectItem>
            <SelectItem value="today">Today</SelectItem>
            <SelectItem value="week">This Week</SelectItem>
            <SelectItem value="month">This Month</SelectItem>
          </SelectContent>
        </Select>
      </div>
    </div>
  );



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

        {isMobile ? (
          <>
            <div className="mb-4 flex items-center gap-2">
              <Button
                variant="outline"
                size="sm"
                onClick={() => setFiltersOpen(true)}
                className="h-9"
                aria-label="Open filters"
              >
                <SlidersHorizontal className="mr-2 h-4 w-4" />
                Filters
                {activeFilterCount > 0 && (
                  <Badge variant="secondary" className="ml-2">
                    {activeFilterCount}
                  </Badge>
                )}
              </Button>
              {activeFilterCount > 0 && (
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={clearAllFilters}
                  className="h-9 text-muted-foreground hover:text-foreground"
                >
                  <X className="mr-1 h-3 w-3" />
                  Clear
                </Button>
              )}
            </div>

            <Sheet open={filtersOpen} onOpenChange={setFiltersOpen}>
              <SheetContent
                side="bottom"
                className="rounded-t-2xl p-4 pb-[calc(env(safe-area-inset-bottom)+16px)] max-h-[85vh] overflow-y-auto"
              >
                <SheetHeader className="mb-4 text-left">
                  <SheetTitle>Filter Trips</SheetTitle>
                  <SheetDescription>Refine the list of trips.</SheetDescription>
                </SheetHeader>
                {renderFilterFields("grid-cols-1")}
                <div className="mt-4 flex gap-2">
                  {activeFilterCount > 0 && (
                    <Button
                      variant="outline"
                      className="flex-1"
                      onClick={clearAllFilters}
                    >
                      Clear
                    </Button>
                  )}
                  <Button className="flex-1" onClick={() => setFiltersOpen(false)}>
                    Done
                  </Button>
                </div>
              </SheetContent>
            </Sheet>
          </>
        ) : (
          <div className="mb-6 rounded-2xl border bg-card p-5">
            <div className="mb-3 flex items-center justify-between">
              <h2 className="text-sm font-semibold">Filter Trips</h2>
              {activeFilterCount > 0 && (
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={clearAllFilters}
                  className="h-8 text-muted-foreground hover:text-foreground"
                >
                  <X className="mr-1 h-3 w-3" />
                  Clear
                </Button>
              )}
            </div>
            {renderFilterFields(
              isHostRole
                ? "grid-cols-2 md:grid-cols-3 lg:grid-cols-5"
                : "grid-cols-2 md:grid-cols-4",
            )}
          </div>
        )}




        <Tabs
          value={filter}
          onValueChange={(v) => {
            setFilter(v as Filter);
            setPage(1);
            setSearchParams((prev) => {
              prev.set("tab", v);
              prev.set("page", "1");
              return prev;
            });
          }}
          className="mb-4"
        >
          <TabsList className="grid w-full grid-cols-4">
            <TabsTrigger value="upcoming" className="flex items-center justify-center gap-1.5">
              <span>Upcoming</span>
              <span className="inline-flex min-w-[1.25rem] items-center justify-center rounded-full bg-primary/10 px-1.5 text-[0.65rem] font-semibold text-primary">
                {filterCounts.upcoming}
              </span>
            </TabsTrigger>
            <TabsTrigger value="active" className="flex items-center justify-center gap-1.5">
              <span>In progress</span>
              <span className="inline-flex min-w-[1.25rem] items-center justify-center rounded-full bg-primary/10 px-1.5 text-[0.65rem] font-semibold text-primary">
                {filterCounts.active}
              </span>
            </TabsTrigger>
            <TabsTrigger value="past" className="flex items-center justify-center gap-1.5">
              <span>Past</span>
              <span className="inline-flex min-w-[1.25rem] items-center justify-center rounded-full bg-primary/10 px-1.5 text-[0.65rem] font-semibold text-primary">
                {filterCounts.past}
              </span>
            </TabsTrigger>
            <TabsTrigger value="all" className="flex items-center justify-center gap-1.5">
              <span>All</span>
              <span className="inline-flex min-w-[1.25rem] items-center justify-center rounded-full bg-primary/10 px-1.5 text-[0.65rem] font-semibold text-primary">
                {filterCounts.all}
              </span>
            </TabsTrigger>
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
                        onClick={() => goToPage((p) => Math.max(1, p - 1))}
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
                          goToPage((p) => Math.min(totalPages, p + 1))
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
