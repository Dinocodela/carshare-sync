import { useEffect, useState } from "react";
import { Link, useParams } from "react-router-dom";
import { DashboardLayout } from "@/components/layout/DashboardLayout";
import { PageContainer } from "@/components/layout/PageContainer";
import { SEO } from "@/components/SEO";
import { supabase } from "@/integrations/supabase/client";
import { ArrowLeft, Car as CarIcon, Loader2, MapPin, Copy } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { getClientShare } from "@/lib/expenseMatching";

function formatCurrency(n: number): string {
  return new Intl.NumberFormat("en-US", {
    style: "currency",
    currency: "USD",
    maximumFractionDigits: 0,
  }).format(n);
}

function money2(n: number): string {
  return new Intl.NumberFormat("en-US", {
    style: "currency",
    currency: "USD",
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  }).format(n);
}

function parseDate(s: string): Date {
  if (/^\d{4}-\d{2}-\d{2}$/.test(s)) return new Date(`${s}T00:00:00`);
  return new Date(s);
}

function formatDayShort(d: Date) {
  return d.toLocaleDateString("en-US", {
    weekday: "short",
    month: "short",
    day: "numeric",
    timeZone: "UTC",
  });
}

function getGuestInitials(name: string | null | undefined): string {
  if (!name) return "?";
  const parts = name.trim().split(/\s+/).filter(Boolean);
  if (parts.length === 0) return "?";
  if (parts.length === 1) return parts[0].charAt(0).toUpperCase();
  return (
    parts[0].charAt(0) + parts[parts.length - 1].charAt(0)
  ).toUpperCase();
}


function formatTime(d: Date) {
  return d.toLocaleTimeString("en-US", { hour: "2-digit", minute: "2-digit", hour12: false, timeZone: "UTC" });
}

function statusBanner(start: Date, end: Date): string {
  const now = new Date();
  if (now < start) {
    const diffMs = start.getTime() - now.getTime();
    const hours = Math.floor(diffMs / 3600000);
    return hours < 48
      ? `This trip starts in ${hours} hours.`
      : `Starts on ${start.toLocaleDateString("en-US", { month: "long", day: "numeric", timeZone: "UTC" })}.`;
  }
  if (now >= start && now <= end) {
    const diffMs = end.getTime() - now.getTime();
    const hours = Math.floor(diffMs / 3600000);
    const minutes = Math.floor((diffMs % 3600000) / 60000);
    return `This trip ends in ${hours} hours ${minutes} minutes.`;
  }
  return `Ended on ${end.toLocaleDateString("en-US", { month: "long", day: "numeric", year: "numeric", timeZone: "UTC" })}.`;
}

interface EarningsBreakdown {
  grossRental: number;
  platformFee: number;
  platformLabel: string;
  netFromPlatform: number;
  expenses: { label: string; amount: number }[];
  totalExpenses: number;
  netAfterExpenses: number;
  clientPct: number;
  hostPct: number;
  managementFee: number;
  clientEarnings: number;
}

interface TripFull {
  id: string;
  trip_id: string | null;
  guest_name: string | null;
  guest_initials: string | null;
  earning_period_start: string;
  earning_period_end: string;
  earning_type: string | null;
  payment_status: string | null;
  payment_source: string | null;
  pickup_address: string | null;
  return_address: string | null;
  delivery_address: string | null;
  net_amount: number | null;
  breakdown: EarningsBreakdown | null;
  date_paid: string | null;
  car: {
    make: string;
    model: string;
    year: number;
    color: string | null;
    mileage: number | null;
    license_plate: string | null;
    location: string | null;
    images: string[] | null;
  } | null;
  guest_email: string | null;
  guest_phone: string | null;
}

// Eon retains a 30% platform commission before paying the host.
const PLATFORM_COMMISSION_RATE = 0.3;

export default function TripDetail() {
  const { earningId } = useParams<{ earningId: string }>();
  const [loading, setLoading] = useState(true);
  const [trip, setTrip] = useState<TripFull | null>(null);
  const { toast } = useToast();

  useEffect(() => {
    if (!earningId) return;
    let cancelled = false;
    (async () => {
      setLoading(true);
      // Hosts can read the base table (with guest PII + embedded car).
      const { data, error } = await supabase
        .from("host_earnings")
        .select(
          "id, trip_id, guest_name, earning_period_start, earning_period_end, earning_type, payment_status, payment_source, pickup_address, return_address, delivery_address, amount, client_profit_percentage, date_paid, cars!fk_host_earnings_car_id(make, model, year, color, mileage, license_plate, location, images)",
        )
        .eq("id", earningId)
        .maybeSingle();

      const { data: contact } = await supabase
        .from("host_earnings_guest_contact")
        .select("guest_email, guest_phone")
        .eq("earning_id", earningId)
        .maybeSingle();

      if (cancelled) return;

      // Clients have no access to the base table; fall back to the privacy-safe
      // view (excludes guest name and addresses) and fetch the car separately.
      let row: any = data;
      if (!row) {
        const { data: viewRow } = await (supabase as any)
          .from("client_visible_earnings")
          .select(
            "id, trip_id, guest_initials, earning_period_start, earning_period_end, earning_type, payment_status, payment_source, car_id, amount, client_profit_percentage, date_paid, delivery_address",
          )
          .eq("id", earningId)
          .maybeSingle();
        if (viewRow) {
          let car: any = null;
          if (viewRow.car_id) {
            const { data: carRow } = await supabase
              .from("cars")
              .select("make, model, year, color, mileage, license_plate, location, images")
              .eq("id", viewRow.car_id)
              .maybeSingle();
            car = carRow;
          }
          row = { ...viewRow, cars: car };
        }
      }

      if (cancelled) return;
      if (!row) {
        setTrip(null);
      } else {
        let net: number | null = null;
        let breakdown: EarningsBreakdown | null = null;
        if (row.amount != null) {
          let exps: any[] = [];
          if (row.trip_id) {
            const { data: e } = await supabase
              .from("host_expenses")
              .select(
                "trip_id, amount, toll_cost, delivery_cost, carwash_cost, ev_charge_cost",
              )
              .eq("trip_id", row.trip_id);
            exps = e || [];
          }
          if (cancelled) return;
          net = getClientShare(
            Number(row.amount),
            row.client_profit_percentage,
            row.trip_id,
            exps as any,
          );

          // Build a fully transparent breakdown for the client.
          const netFromPlatform = Number(row.amount);
          const grossRental =
            PLATFORM_COMMISSION_RATE < 1
              ? netFromPlatform / (1 - PLATFORM_COMMISSION_RATE)
              : netFromPlatform;
          const platformFee = grossRental - netFromPlatform;

          const sum = (key: string) =>
            exps.reduce((s: number, x: any) => s + (Number(x[key]) || 0), 0);
          const expenseItems = [
            { label: "EV charging", amount: sum("ev_charge_cost") },
            { label: "Tolls", amount: sum("toll_cost") },
            { label: "Delivery", amount: sum("delivery_cost") },
            { label: "Car wash", amount: sum("carwash_cost") },
            { label: "Other expenses", amount: sum("amount") },
          ].filter((e) => e.amount > 0);
          const totalExpenses = expenseItems.reduce((s, e) => s + e.amount, 0);
          const netAfterExpenses = netFromPlatform - totalExpenses;
          const clientPct =
            row.client_profit_percentage != null
              ? Number(row.client_profit_percentage)
              : 70;
          const hostPct = 100 - clientPct;
          const clientEarnings = (netAfterExpenses * clientPct) / 100;
          const managementFee = netAfterExpenses - clientEarnings;

          breakdown = {
            grossRental,
            platformFee,
            platformLabel: row.payment_source || "Platform",
            netFromPlatform,
            expenses: expenseItems,
            totalExpenses,
            netAfterExpenses,
            clientPct,
            hostPct,
            managementFee,
            clientEarnings,
          };
        }
        setTrip({
          id: row.id,
          trip_id: row.trip_id,
          guest_name: row.guest_name ?? null,
          guest_initials: row.guest_initials ?? null,
          earning_period_start: row.earning_period_start,
          earning_period_end: row.earning_period_end,
          earning_type: row.earning_type,
          payment_status: row.payment_status,
          payment_source: row.payment_source,
          pickup_address: row.pickup_address ?? null,
          return_address: row.return_address ?? null,
          net_amount: net,
          breakdown,
          date_paid: row.date_paid ?? null,
          car: row.cars
            ? {
                make: row.cars.make,
                model: row.cars.model,
                year: row.cars.year,
                color: row.cars.color,
                mileage: row.cars.mileage,
                license_plate: row.cars.license_plate,
                location: row.cars.location,
                images: row.cars.images,
              }
            : null,
          guest_email: contact?.guest_email ?? null,
          guest_phone: contact?.guest_phone ?? null,
        });
      }
      setLoading(false);
    })();
    return () => {
      cancelled = true;
    };
  }, [earningId]);

  if (loading) {
    return (
      <DashboardLayout>
        <PageContainer>
          <div className="flex items-center justify-center py-16 text-muted-foreground">
            <Loader2 className="mr-2 h-4 w-4 animate-spin" /> Loading trip…
          </div>
        </PageContainer>
      </DashboardLayout>
    );
  }

  if (!trip) {
    return (
      <DashboardLayout>
      <PageContainer className="pb-40 md:pb-8">
          <div className="py-12 text-center">
            <p className="mb-4 text-muted-foreground">Trip not found.</p>
            <Link to="/trips" className="text-primary underline">
              Back to trips
            </Link>
          </div>
        </PageContainer>
      </DashboardLayout>
    );
  }

  const start = parseDate(trip.earning_period_start);
  const end = parseDate(trip.earning_period_end);
  const carTitle = trip.car
    ? `${trip.car.year} ${trip.car.make} ${trip.car.model}`
    : "Vehicle";
  const carImage = trip.car?.images?.[0];

  return (
    <DashboardLayout>
      <SEO title={`Booked trip · ${trip.guest_name || trip.guest_initials || "Guest"} | Teslys`} description="Trip details" />
      <PageContainer className="pb-40 md:pb-8">
        {/* Header */}
        <div className="mb-6 flex items-center gap-3">
          <Link
            to="/trips"
            className="rounded-full p-2 text-foreground hover:bg-accent"
            aria-label="Back to trips"
          >
            <ArrowLeft className="h-5 w-5" />
          </Link>
          <div className="h-12 w-12 overflow-hidden rounded-lg bg-muted">
            {carImage ? (
              <img src={carImage} alt={carTitle} className="h-full w-full object-cover" />
            ) : (
              <div className="flex h-full w-full items-center justify-center text-muted-foreground">
                <CarIcon className="h-5 w-5" />
              </div>
            )}
          </div>
          <div>
            <h1 className="text-xl font-bold leading-tight">Booked trip</h1>
            <p className="text-sm text-muted-foreground">{trip.guest_name || trip.guest_initials || "Guest"}</p>
          </div>
        </div>

        {/* Tabs (Details only) */}
        <div className="mb-6 border-b">
          <div className="inline-flex items-center gap-1 border-b-2 border-primary px-3 py-2 text-sm font-semibold uppercase tracking-wide text-primary">
            Details
          </div>
        </div>

        {/* Date range */}
        <section className="mb-6 rounded-2xl border bg-card p-5">
          <div className="flex items-center justify-around text-center">
            <div>
              <p className="text-lg font-bold">{formatDayShort(start)}</p>
              <p className="text-sm text-muted-foreground">{formatTime(start)}</p>
            </div>
            <div className="text-muted-foreground">→</div>
            <div>
              <p className="text-lg font-bold">{formatDayShort(end)}</p>
              <p className="text-sm text-muted-foreground">{formatTime(end)}</p>
            </div>
          </div>
        </section>

        {/* Your earnings */}
        {trip.net_amount != null && (
          <section className="mb-6 rounded-2xl border bg-card p-5">
            <p className="mb-3 text-xs font-semibold uppercase tracking-wide text-muted-foreground">
              Your earnings
            </p>
            <div className="flex items-end justify-between gap-3">
              <div>
                <p className="text-3xl font-bold text-foreground">
                  {formatCurrency(trip.net_amount)}
                </p>
                <p className="mt-1 text-sm text-muted-foreground">
                  Net after commission &amp; trip expenses
                </p>
              </div>
              <div className="flex flex-col items-end gap-1">
                <span
                  className={`rounded-md px-2.5 py-1 text-xs font-semibold uppercase tracking-wide ${
                    trip.payment_status === "paid"
                      ? "bg-primary/15 text-primary"
                      : "bg-muted text-muted-foreground"
                  }`}
                >
                  {trip.payment_status === "paid" ? "Paid" : "Pending"}
                </span>
                {trip.payment_status === "paid" && trip.date_paid && (
                  <span className="text-xs text-muted-foreground">
                    {formatDayShort(parseDate(trip.date_paid))}
                  </span>
                )}
              </div>
            </div>

            {/* Full transparency breakdown */}
            {trip.breakdown && (
              <div className="mt-5 border-t pt-4">
                <p className="mb-3 text-xs font-semibold uppercase tracking-wide text-muted-foreground">
                  How this is calculated
                </p>
                <dl className="space-y-2 text-sm">
                  <div className="flex items-center justify-between">
                    <dt className="text-muted-foreground">Rental total (guest paid)</dt>
                    <dd className="font-medium text-foreground">{money2(trip.breakdown.grossRental)}</dd>
                  </div>
                  <div className="flex items-center justify-between">
                    <dt className="text-muted-foreground">
                      {trip.breakdown.platformLabel} fee (30%)
                    </dt>
                    <dd className="font-medium text-foreground">−{money2(trip.breakdown.platformFee)}</dd>
                  </div>
                  <div className="flex items-center justify-between border-t pt-2">
                    <dt className="text-foreground">After {trip.breakdown.platformLabel}</dt>
                    <dd className="font-semibold text-foreground">{money2(trip.breakdown.netFromPlatform)}</dd>
                  </div>

                  {trip.breakdown.expenses.map((e) => (
                    <div key={e.label} className="flex items-center justify-between">
                      <dt className="text-muted-foreground">{e.label}</dt>
                      <dd className="font-medium text-foreground">−{money2(e.amount)}</dd>
                    </div>
                  ))}

                  {trip.breakdown.totalExpenses > 0 && (
                    <div className="flex items-center justify-between border-t pt-2">
                      <dt className="text-foreground">Net after expenses</dt>
                      <dd className="font-semibold text-foreground">{money2(trip.breakdown.netAfterExpenses)}</dd>
                    </div>
                  )}

                  <div className="flex items-center justify-between">
                    <dt className="text-muted-foreground">
                      Management fee ({trip.breakdown.hostPct}%)
                    </dt>
                    <dd className="font-medium text-foreground">−{money2(trip.breakdown.managementFee)}</dd>
                  </div>
                  <div className="flex items-center justify-between border-t pt-2">
                    <dt className="text-base font-semibold text-foreground">
                      Your earnings ({trip.breakdown.clientPct}%)
                    </dt>
                    <dd className="text-base font-bold text-primary">{money2(trip.breakdown.clientEarnings)}</dd>
                  </div>
                </dl>
              </div>
            )}
          </section>

        )}



        {/* Location (car's general location) — only shown when no specific
            pickup/return addresses are available */}
        {trip.car?.location && !trip.pickup_address && !trip.return_address && (
          <section className="mb-6 rounded-2xl border bg-card p-5">
            <p className="mb-1 text-xs font-semibold uppercase tracking-wide text-muted-foreground">
              Location
            </p>
            <div className="flex items-start justify-between gap-3">
              <p className="text-base text-foreground">{trip.car.location}</p>
              <MapPin className="mt-1 h-5 w-5 shrink-0 text-muted-foreground" />
            </div>
          </section>
        )}

        {/* Pickup / Return addresses */}
        {(trip.pickup_address || trip.return_address) && (
          <section className="mb-6 grid grid-cols-1 gap-3 sm:grid-cols-2">
            {trip.pickup_address && (
              <div className="rounded-2xl border bg-card p-5">
                <p className="mb-1 text-xs font-semibold uppercase tracking-wide text-muted-foreground">
                  Pickup
                </p>
                <div className="flex items-start justify-between gap-3">
                  <p className="text-base text-foreground">{trip.pickup_address}</p>
                  <MapPin className="mt-1 h-5 w-5 shrink-0 text-muted-foreground" />
                </div>
              </div>
            )}
            {trip.return_address && (
              <div className="rounded-2xl border bg-card p-5">
                <p className="mb-1 text-xs font-semibold uppercase tracking-wide text-muted-foreground">
                  Return
                </p>
                <div className="flex items-start justify-between gap-3">
                  <p className="text-base text-foreground">{trip.return_address}</p>
                  <MapPin className="mt-1 h-5 w-5 shrink-0 text-muted-foreground" />
                </div>
              </div>
            )}
          </section>
        )}

        {/* Status banner */}
        <section className="mb-6 rounded-2xl border bg-card p-5 text-sm text-foreground">
          {statusBanner(start, end)}
        </section>

        {/* Guest */}
        <section className="mb-6">
          <p className="mb-2 text-xs font-semibold uppercase tracking-wide text-muted-foreground">
            Your guest
          </p>
          <p className="mb-3 text-sm text-muted-foreground">
            This is the primary driver and they must be present for pickup and drop-off.
          </p>
          <div className="rounded-2xl border bg-card p-5">
            <div className="flex items-center gap-4">
              <div className="flex h-14 w-14 items-center justify-center rounded-full bg-muted text-lg font-bold uppercase tracking-tight text-muted-foreground">
                {trip.guest_name ? getGuestInitials(trip.guest_name) : trip.guest_initials || "?"}
              </div>
              <div className="min-w-0 flex-1">
                <p className="font-semibold text-foreground">
                  {trip.guest_name || trip.guest_initials || "Guest"}
                </p>
                {trip.trip_id && (
                  <p className="text-sm text-muted-foreground">Trip #{trip.trip_id}</p>
                )}
              </div>
            </div>
            <div className="mt-4 space-y-1 text-sm">
              {trip.guest_email ? (
                <a
                  href={`mailto:${trip.guest_email}`}
                  className="block text-primary hover:underline"
                >
                  {trip.guest_email}
                </a>
              ) : null}
              {trip.guest_phone ? (
                <a
                  href={`tel:${trip.guest_phone}`}
                  className="block text-primary hover:underline"
                >
                  {trip.guest_phone}
                </a>
              ) : null}
              {!trip.guest_email && !trip.guest_phone && (
                <p className="text-muted-foreground">No contact info on file.</p>
              )}
            </div>
          </div>
        </section>

        {/* Trip info */}
        <section className="mb-6 rounded-2xl border bg-card p-5">
          <p className="mb-3 text-xs font-semibold uppercase tracking-wide text-muted-foreground">
            Trip info
          </p>
          <dl className="space-y-2 text-sm">
            {trip.trip_id && (
              <div className="flex justify-between gap-3 items-center">
                <dt className="text-muted-foreground">Trip ID</dt>
                <dd className="font-medium flex items-center gap-2">
                  #{trip.trip_id}
                  <button
                    type="button"
                    onClick={() => {
                      navigator.clipboard.writeText(trip.trip_id!);
                      toast({
                        title: "Copied",
                        description: `Trip ID ${trip.trip_id} copied to clipboard.`,
                      });
                    }}
                    className="inline-flex items-center text-muted-foreground transition-colors hover:text-foreground"
                    title="Copy trip ID"
                  >
                    <Copy className="h-3.5 w-3.5" />
                  </button>
                </dd>
              </div>
            )}
            {trip.earning_type && (
              <div className="flex justify-between gap-3">
                <dt className="text-muted-foreground">Type</dt>
                <dd className="font-medium capitalize">{trip.earning_type}</dd>
              </div>
            )}
            {trip.payment_source && (
              <div className="flex justify-between gap-3">
                <dt className="text-muted-foreground">Source</dt>
                <dd className="font-medium">{trip.payment_source}</dd>
              </div>
            )}
            {trip.payment_status && (
              <div className="flex justify-between gap-3">
                <dt className="text-muted-foreground">Status</dt>
                <dd className="font-medium capitalize">{trip.payment_status}</dd>
              </div>
            )}
          </dl>
        </section>

        {/* About the car */}
        {trip.car && (
          <section className="mb-6 rounded-2xl border bg-card p-5">
            <p className="mb-3 text-xs font-semibold uppercase tracking-wide text-muted-foreground">
              About the car
            </p>
            <p className="text-base font-semibold text-foreground">{carTitle}</p>
            <dl className="mt-3 space-y-2 text-sm">
              {trip.car.license_plate && (
                <div className="flex justify-between gap-3">
                  <dt className="text-muted-foreground">License plate</dt>
                  <dd className="font-medium">{trip.car.license_plate}</dd>
                </div>
              )}
              {trip.car.color && (
                <div className="flex justify-between gap-3">
                  <dt className="text-muted-foreground">Color</dt>
                  <dd className="font-medium">{trip.car.color}</dd>
                </div>
              )}
              {trip.car.mileage != null && (
                <div className="flex justify-between gap-3">
                  <dt className="text-muted-foreground">Mileage</dt>
                  <dd className="font-medium">{trip.car.mileage.toLocaleString()} mi</dd>
                </div>
              )}
            </dl>
          </section>
        )}
      </PageContainer>
    </DashboardLayout>
  );
}
