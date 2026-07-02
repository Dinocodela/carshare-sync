import { useEffect, useState } from "react";
import { Link, useParams, useNavigate } from "react-router-dom";
import { DashboardLayout } from "@/components/layout/DashboardLayout";
import { PageContainer } from "@/components/layout/PageContainer";
import { SEO } from "@/components/SEO";
import { supabase } from "@/integrations/supabase/client";
import { ArrowLeft, Car as CarIcon, ChevronDown, Loader2, MapPin, Copy, Truck } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { useWorkspace } from "@/hooks/useWorkspace";


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
  days: number;
  dailyRate: number;
  /** Daily rate exactly as reported by the platform (display-only). */
  actualDailyRate: number | null;
  /** Nights exactly as reported by the platform (display-only). */
  actualNights: number | null;
  platformFee: number;
  /** Eon commission rate applied (0.30 standard, 0.45 for 7+ day rentals). */
  platformPct: number;
  platformLabel: string;
  netFromPlatform: number;
  deliveryFee: number;
  rentalNet: number;
  expenses: { label: string; amount: number }[];
  totalExpenses: number;
  netAfterExpenses: number;
  clientPct: number;
  hostPct: number;
  managementFee: number;
  clientShare: number;
  tollCost: number;
  /** When true tolls are reimbursed to the client; otherwise to the host. */
  tollToClient: boolean;
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

// Eon retains a 30% platform commission before paying the host. For rentals of
// 7 nights or longer we apply a 15% long-stay discount, so Eon's effective
// commission becomes 45% of the rental.
const PLATFORM_COMMISSION_RATE = 0.3;
const LONG_RENTAL_COMMISSION_RATE = 0.45;
const LONG_RENTAL_MIN_DAYS = 7;

// Tolls are normally reimbursed BY the client TO the host. Geoff is the only
// exception: for his account tolls are a reimbursement TO the client.
const TOLL_TO_CLIENT_CLIENT_IDS = new Set<string>([
  "0b5a8c34-6ce4-4fd7-bd85-8a37d9836b3d", // geoff@trenkleland.com
]);

export default function TripDetail() {
  const { earningId } = useParams<{ earningId: string }>();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [trip, setTrip] = useState<TripFull | null>(null);
  const [breakdownOpen, setBreakdownOpen] = useState(false);
  const [reimbursementOpen, setReimbursementOpen] = useState(false);
  const { toast } = useToast();
  const { activeWorkspace } = useWorkspace();

  useEffect(() => {
    if (!earningId) return;
    let cancelled = false;
    (async () => {
      setLoading(true);
      // Only the host workspace may read the base table (with guest PII). In the
      // client portal we always use the privacy-safe view (initials only).
      const isHost = activeWorkspace === "host";
      const { data, error } = isHost
        ? await supabase
            .from("host_earnings")
            .select(
              "id, trip_id, guest_name, earning_period_start, earning_period_end, earning_type, payment_status, payment_source, pickup_address, return_address, delivery_address, amount, daily_rate, nights, client_profit_percentage, date_paid, cars!fk_host_earnings_car_id(make, model, year, color, mileage, license_plate, location, images, client_id)",
            )
            .eq("id", earningId)
            .maybeSingle()
        : { data: null, error: null };

      const { data: contact } = isHost
        ? await supabase
            .from("host_earnings_guest_contact")
            .select("guest_email, guest_phone")
            .eq("earning_id", earningId)
            .maybeSingle()
        : { data: null };


      if (cancelled) return;

      // Clients have no access to the base table; fall back to the privacy-safe
      // view (excludes guest name and addresses) and fetch the car separately.
      let row: any = data;
      if (!row) {
        const { data: viewRow } = await (supabase as any)
          .from("client_visible_earnings")
          .select(
            "id, trip_id, guest_initials, earning_period_start, earning_period_end, earning_type, payment_status, payment_source, car_id, amount, daily_rate, nights, client_profit_percentage, date_paid, delivery_address",
          )
          .eq("id", earningId)
          .maybeSingle();
        if (viewRow) {
          let car: any = null;
          if (viewRow.car_id) {
            const { data: carRow } = await supabase
              .from("cars")
              .select("make, model, year, color, mileage, license_plate, location, images, client_id")
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

          // Build the breakdown for the client.
          // Earnings are based ONLY on the rental (daily price x days):
          // rental - Eon 30% - management fee. Expenses (EV, tolls, delivery,
          // etc.) are NOT deducted from earnings — they are reimbursed to the
          // host separately and shown in their own section.
          const netFromPlatform = Number(row.amount);

          const sum = (key: string) =>
            exps.reduce((s: number, x: any) => s + (Number(x[key]) || 0), 0);
          const tollCost = sum("toll_cost");
          // Whether tolls are reimbursed to the client (Geoff only) or, for
          // everyone else, to the host.
          const clientId = row.cars?.client_id ?? row.client_id ?? null;
          const tollToClient = clientId
            ? TOLL_TO_CLIENT_CLIENT_IDS.has(clientId)
            : false;
          // Host reimbursements. EV charging is always shown (as a $0
          // placeholder until the post-trip data is entered); the rest only
          // appear when there is a real amount. Tolls are NOT here — they are
          // charged to the client and shown separately.
          const expenseItems = [
            { label: "EV charging", amount: sum("ev_charge_cost"), always: true },
            { label: "Delivery", amount: sum("delivery_cost") },
            { label: "Car wash", amount: sum("carwash_cost") },
            { label: "Other expenses", amount: sum("amount") },
          ]
            .filter((e) => e.always || e.amount > 0)
            .map(({ label, amount }) => ({ label, amount }));
          const totalExpenses = expenseItems.reduce((s, e) => s + e.amount, 0);

          // Derive rental days from the trip period first — the commission rate
          // depends on the length of the stay.
          const startMs = new Date(row.earning_period_start).getTime();
          const endMs = new Date(row.earning_period_end).getTime();
          const days = Math.max(
            1,
            Math.round((endMs - startMs) / 86400000) || 1,
          );

          // 7-night (or longer) rentals get a 15% long-stay discount, so Eon's
          // commission becomes 45% of the rental instead of the standard 30%.
          const commissionRate =
            days >= LONG_RENTAL_MIN_DAYS
              ? LONG_RENTAL_COMMISSION_RATE
              : PLATFORM_COMMISSION_RATE;
          const platformPct = Math.round(commissionRate * 100);

          // The platform payout (amount) INCLUDES reimbursements that are paid
          // straight back to the host (EV charging, delivery, car wash, other)
          // and are NOT subject to Eon's commission. Strip ALL of them out so the
          // derived daily rate reflects the actual rental price only — never the
          // EV or delivery totals.
          const deliveryFee = sum("delivery_cost");
          const rentalNet = Math.max(0, netFromPlatform - totalExpenses);
          // Gross rental the guest paid for the car (before Eon's commission).
          const grossRental =
            commissionRate < 1
              ? rentalNet / (1 - commissionRate)
              : rentalNet;
          const platformFee = grossRental - rentalNet;
          const dailyRate = grossRental / days;

          const clientPct =
            row.client_profit_percentage != null
              ? Number(row.client_profit_percentage)
              : 70;
          const hostPct = 100 - clientPct;
          const clientShare = (rentalNet * clientPct) / 100;
          const managementFee = rentalNet - clientShare;
          // Tolls are a client reimbursement to the host, NOT an expense that
          // reduces rental earnings. The client earnings are based on the rental
          // only; tolls are shown separately as a positive amount added to the
          // host's reimbursement.
          const clientEarnings = clientShare;
          // Keep tollCost in the breakdown so the host can see how much the
          // client will reimburse for tolls, displayed as a positive amount.
          net = clientEarnings;

          breakdown = {
            grossRental,
            days,
            dailyRate,
            actualDailyRate:
              row.daily_rate != null ? Number(row.daily_rate) : null,
            actualNights: row.nights != null ? Number(row.nights) : null,
            platformFee,
            platformPct,
            platformLabel: row.payment_source || "Platform",
            netFromPlatform,
            deliveryFee,
            rentalNet,
            expenses: expenseItems,
            totalExpenses,
            netAfterExpenses: rentalNet,
            clientPct,
            hostPct,
            managementFee,
            clientShare,
            tollCost,
            tollToClient,
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
          delivery_address: row.delivery_address ?? null,
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
  }, [earningId, activeWorkspace]);

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
          <button
            type="button"
            onClick={() => {
              if (window.history.length > 1) navigate(-1);
              else navigate("/trips");
            }}
            className="rounded-full p-2 text-foreground hover:bg-accent"
            aria-label="Back to trips"
          >
            <ArrowLeft className="h-5 w-5" />
          </button>
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
            {trip.car?.license_plate && (
              <p className="text-sm font-medium text-foreground">{trip.car.license_plate}</p>
            )}
            {trip.trip_id && (
              <button
                type="button"
                onClick={() => {
                  navigator.clipboard.writeText(trip.trip_id!);
                  toast({
                    title: "Copied",
                    description: `Trip ID ${trip.trip_id} copied to clipboard.`,
                  });
                }}
                className="mt-0.5 inline-flex items-center gap-1 text-xs font-medium text-primary hover:underline"
                title="Copy trip ID"
              >
                <span>Trip #{trip.trip_id}</span>
                <Copy className="h-3 w-3" />
              </button>
            )}
          </div>
        </div>

        {/* Tabs (Details only) */}
        <div className="mb-6 border-b">
          <div className="inline-flex items-center gap-1 border-b-2 border-primary px-3 py-2 text-sm font-semibold uppercase tracking-wide text-primary">
            Details
          </div>
        </div>

        {trip.payment_status === "cancelled" && (
          <div className="mb-6 rounded-2xl border border-destructive/30 bg-destructive/10 p-4 text-sm font-medium text-destructive">
            This booking was cancelled. No payment is due for this trip.
          </div>
        )}



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
                  Net after Eon commission &amp; management fee
                </p>

              </div>
              <div className="flex flex-col items-end gap-1">
                <span
                  className={`rounded-md px-2.5 py-1 text-xs font-semibold uppercase tracking-wide ${
                    trip.payment_status === "cancelled"
                      ? "bg-destructive/15 text-destructive"
                      : trip.payment_status === "paid"
                        ? "bg-primary/15 text-primary"
                        : "bg-muted text-muted-foreground"
                  }`}
                >
                  {trip.payment_status === "cancelled"
                    ? "Cancelled"
                    : trip.payment_status === "paid"
                      ? "Paid"
                      : "Pending"}
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
                <button
                  type="button"
                  onClick={() => setBreakdownOpen((v) => !v)}
                  className="flex w-full items-center justify-between text-left"
                >
                  <span className="text-xs font-semibold uppercase tracking-wide text-primary">
                    How this is calculated
                  </span>
                  <ChevronDown
                    className={`h-5 w-5 shrink-0 text-primary transition-transform ${
                      breakdownOpen ? "rotate-180" : "animate-bounce"
                    }`}
                  />
                </button>
                {breakdownOpen && (
                <dl className="mt-3 space-y-2 text-sm">
                  <div className="flex items-center justify-between">
                    <dt className="text-muted-foreground">Rental total (guest paid)</dt>
                    <dd className="font-medium text-foreground">{money2(trip.breakdown.grossRental)}</dd>
                  </div>
                  <div className="flex items-center justify-between pl-3">
                    <dt className="text-xs text-muted-foreground">
                      {trip.breakdown.actualDailyRate != null
                        ? `${money2(trip.breakdown.actualDailyRate)}/day × ${trip.breakdown.actualNights ?? trip.breakdown.days} ${(trip.breakdown.actualNights ?? trip.breakdown.days) === 1 ? "night" : "nights"}`
                        : `${money2(trip.breakdown.dailyRate)}/day × ${trip.breakdown.days} ${trip.breakdown.days === 1 ? "day" : "days"}`}
                    </dt>
                    <dd className="text-xs text-muted-foreground">{money2(trip.breakdown.grossRental)}</dd>
                  </div>
                  <div className="flex items-center justify-between">
                    <dt className="text-muted-foreground">
                      {trip.breakdown.platformLabel} fee ({trip.breakdown.platformPct}% of rental)
                    </dt>

                    <dd className="font-medium text-foreground">−{money2(trip.breakdown.platformFee)}</dd>
                  </div>
                  <div className="flex items-center justify-between border-t pt-2">
                    <dt className="text-foreground">Net rental (after {trip.breakdown.platformLabel})</dt>
                    <dd className="font-semibold text-foreground">{money2(trip.breakdown.rentalNet)}</dd>
                  </div>

                  {trip.breakdown.deliveryFee > 0 && (
                    <p className="text-xs text-muted-foreground">
                      Delivery fee ({money2(trip.breakdown.deliveryFee)}) is reimbursed to the host separately and is not part of earnings.
                    </p>
                  )}

                  <div className="flex items-center justify-between">
                    <dt className="text-muted-foreground">
                      Management fee ({trip.breakdown.hostPct}%)
                    </dt>
                    <dd className="font-medium text-foreground">−{money2(trip.breakdown.managementFee)}</dd>
                  </div>
                  <div className="flex items-center justify-between border-t pt-2">
                    <dt className="text-foreground">Your share ({trip.breakdown.clientPct}%)</dt>
                    <dd className="font-semibold text-foreground">{money2(trip.breakdown.clientShare)}</dd>
                  </div>
                  {trip.breakdown.tollToClient && (
                    <div className="flex items-center justify-between">
                      <dt className="text-muted-foreground">
                        Toll (reimbursement to client)
                      </dt>
                      <dd className="font-medium text-foreground">+{money2(trip.breakdown.tollCost)}</dd>
                    </div>
                  )}
                  <div className="flex items-center justify-between border-t pt-2">
                    <dt className="text-base font-semibold text-foreground">
                      Your rental earnings
                    </dt>
                    <dd className="text-base font-bold text-primary">{money2(trip.breakdown.clientEarnings)}</dd>
                  </div>
                  <p className="pt-1 text-xs text-muted-foreground">
                    {trip.breakdown.tollToClient
                      ? "Tolls are reimbursed to you and are not part of your rental earnings. EV charging, delivery and other costs are reimbursed to the host and are not part of your earnings."
                      : "Tolls, EV charging, delivery and other costs are reimbursed to the host and are not part of your rental earnings."}
                  </p>



                </dl>
                )}
              </div>
            )}
          </section>

        )}

        {/* Reimbursed to host (separate from earnings) */}
        {trip.breakdown && trip.breakdown.expenses.length > 0 && (
          <section className="mb-6 rounded-2xl border bg-card p-5">
            <button
              type="button"
              onClick={() => setReimbursementOpen((v) => !v)}
              className="flex w-full items-center justify-between text-left"
            >
              <span className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">
                Reimbursed to host
              </span>
              <div className="flex items-center gap-2">
                <span className="text-sm font-semibold text-foreground">
                  {money2(
                    trip.breakdown.totalExpenses +
                      (trip.breakdown.tollToClient ? 0 : trip.breakdown.tollCost),
                  )}
                </span>
                <ChevronDown
                  className={`h-4 w-4 shrink-0 text-muted-foreground transition-transform ${
                    reimbursementOpen ? "rotate-180" : ""
                  }`}
                />
              </div>
            </button>
            {reimbursementOpen && (
              <>
                <dl className="mt-3 space-y-2 text-sm">
                  {trip.breakdown.expenses.map((e) => (
                    <div key={e.label} className="flex items-center justify-between">
                      <dt className="text-muted-foreground">{e.label}</dt>
                      <dd className="font-medium text-foreground">{money2(e.amount)}</dd>
                    </div>
                  ))}
                  {!trip.breakdown.tollToClient && (
                    <div className="flex items-center justify-between">
                      <dt className="text-muted-foreground">Toll</dt>
                      <dd className="font-medium text-foreground">{money2(trip.breakdown.tollCost)}</dd>
                    </div>
                  )}
                  <div className="flex items-center justify-between border-t pt-2">
                    <dt className="text-foreground">Total reimbursement</dt>
                    <dd className="font-semibold text-foreground">
                      {money2(
                        trip.breakdown.totalExpenses +
                          (trip.breakdown.tollToClient ? 0 : trip.breakdown.tollCost),
                      )}
                    </dd>
                  </div>
                </dl>
                <p className="pt-2 text-xs text-muted-foreground">
                  These costs (EV charging, delivery, etc.) are reimbursed to the host and are not part of your earnings. Amounts shown as $0.00 are placeholders until post-trip data is entered.
                </p>
              </>
            )}
          </section>
        )}






        {/* Dedicated delivery destination (separate from car home base) */}
        {trip.delivery_address && (
          <section className="mb-6 rounded-2xl border bg-primary/5 p-5">
            <p className="mb-1 text-xs font-semibold uppercase tracking-wide text-primary">
              Delivery destination
            </p>
            <div className="flex items-start justify-between gap-3">
              <p className="text-base text-foreground">{trip.delivery_address}</p>
              <Truck className="mt-1 h-5 w-5 shrink-0 text-primary" />
            </div>
          </section>
        )}

        {/* Location (car's general location) — only shown when no specific
            pickup/return/delivery addresses are available */}
        {trip.car?.location &&
          !trip.pickup_address &&
          !trip.return_address &&
          !trip.delivery_address && (
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

      </PageContainer>
    </DashboardLayout>
  );
}
