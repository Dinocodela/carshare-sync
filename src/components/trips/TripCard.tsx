import { useState } from "react";
import { Link } from "react-router-dom";
import { Car as CarIcon, ChevronDown, Clock, Copy, MapPin, Truck, ExternalLink } from "lucide-react";
import { toast } from "@/hooks/use-toast";
import { useWorkspace } from "@/hooks/useWorkspace";

export interface TripCardData {
  id: string;
  trip_id: string | null;
  guest_name: string | null;
  guest_initials?: string | null;
  earning_period_start: string;
  earning_period_end: string;
  is_delivery?: boolean;
  delivery_address?: string | null;
  delivery_destination?: string | null;
  return_address?: string | null;
  net_amount?: number | null;
  payment_status?: string | null;
  car: {
    make: string;
    model: string;
    year: number;
    license_plate: string | null;
    location: string | null;
    images: string[] | null;
  } | null;
}

function parseDate(s: string): Date {
  // Project rule: append T00:00:00 to plain date strings
  if (/^\d{4}-\d{2}-\d{2}$/.test(s)) return new Date(`${s}T00:00:00`);
  return new Date(s);
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


// Timestamps from host_earnings come from Turo/Eon as the trip's local
// pickup/return wall-clock time, but are stored as UTC (e.g. 07:00:00+00
// means a 7:00 AM pickup). Render in UTC so the viewer's browser timezone
// doesn't shift the displayed time.
function formatTime(d: Date): string {
  return d.toLocaleTimeString("en-US", {
    hour: "numeric",
    minute: "2-digit",
    timeZone: "UTC",
  });
}

function formatCurrency(n: number): string {
  return new Intl.NumberFormat("en-US", {
    style: "currency",
    currency: "USD",
    maximumFractionDigits: 0,
  }).format(n);
}

function formatDateTime(d: Date): string {
  const weekday = d.toLocaleDateString("en-US", {
    weekday: "short",
    timeZone: "UTC",
  });
  const date = d.toLocaleDateString("en-US", {
    month: "short",
    day: "numeric",
    timeZone: "UTC",
  });
  const time = d
    .toLocaleTimeString("en-US", {
      hour: "numeric",
      minute: "2-digit",
      timeZone: "UTC",
    })
    .replace(":00", "");
  return `${weekday} ${date}, ${time}`;
}

function getStatus(start: Date, end: Date) {
  // Stored timestamps are naive wall-clock times displayed in UTC, so compare
  // against "now" shifted into the same wall-clock-as-UTC frame.
  const local = new Date();
  const now = new Date(local.getTime() - local.getTimezoneOffset() * 60000);
  if (now < start) {
    return {
      label: `Starts ${start.toLocaleDateString("en-US", { month: "short", day: "numeric", timeZone: "UTC" })}`,
      tone: "upcoming" as const,
    };
  }
  if (now >= start && now <= end) {
    return { label: `Ending at ${formatTime(end)}`, tone: "active" as const };
  }
  return {
    label: `Ended ${end.toLocaleDateString("en-US", { month: "short", day: "numeric", timeZone: "UTC" })}`,
    tone: "past" as const,
  };
}

export function TripCard({ trip }: { trip: TripCardData }) {
  const { activeWorkspace } = useWorkspace();
  const isHost = activeWorkspace === "host";
  const [deliveryOpen, setDeliveryOpen] = useState(false);
  const start = parseDate(trip.earning_period_start);
  const end = parseDate(trip.earning_period_end);
  const status = getStatus(start, end);
  const carTitle = trip.car
    ? `${trip.car.make} ${trip.car.model} ${trip.car.year}`
    : "Vehicle";
  const carImage = trip.car?.images?.[0];
  const isCancelled = trip.payment_status === "cancelled";

  const statusClasses = isCancelled
    ? "bg-destructive/15 text-destructive"
    : status.tone === "active"
      ? "bg-destructive/15 text-destructive"
      : status.tone === "upcoming"
        ? "bg-primary/15 text-primary"
        : "bg-muted text-muted-foreground";

  return (
    <Link
      to={`/trips/${trip.id}`}
      className="block"
      aria-label={`View trip details for ${carTitle}`}
    >
      <article className="rounded-2xl border bg-card p-3.5 shadow-sm transition hover:bg-accent/40 sm:p-5">
        <div className="flex items-start justify-between gap-3 sm:gap-4">
          <div className="min-w-0 flex-1">
            <span
              className={`inline-block rounded-md px-2 py-0.5 text-xs font-medium sm:px-2.5 sm:py-1 sm:text-sm ${statusClasses}`}
            >
              {isCancelled ? "Cancelled" : status.label}
            </span>
            <h3 className="mt-2 truncate text-base font-bold text-foreground sm:mt-3 sm:text-xl">
              {carTitle}
            </h3>
            <div className="mt-1 flex items-start gap-1.5 text-xs text-muted-foreground sm:text-sm">
              <Clock className="mt-0.5 h-3.5 w-3.5 shrink-0" />
              <span>
                {formatDateTime(start)} – {formatDateTime(end)}
              </span>
            </div>
            {trip.is_delivery || trip.delivery_destination ? (
              <div className="mt-2 rounded-md bg-accent/40 text-sm">
                <button
                  type="button"
                  onClick={(e) => {
                    e.preventDefault();
                    e.stopPropagation();
                    setDeliveryOpen((v) => !v);
                  }}
                  className="flex w-full items-center gap-1.5 px-2 py-1.5 text-left"
                >
                  <Truck className="h-3.5 w-3.5 shrink-0 text-primary" />
                  <span className="text-xs font-semibold uppercase tracking-wide text-primary">
                    Delivery
                  </span>
                  <ChevronDown
                    className={`ml-auto h-4 w-4 shrink-0 text-muted-foreground transition-transform ${
                      deliveryOpen ? "rotate-180" : ""
                    }`}
                  />
                </button>
                {deliveryOpen && (
                  <div className="px-2 pb-2 pl-7">
                    {trip.delivery_destination || trip.delivery_address ? (
                      <div className="text-foreground">
                        <span className="text-muted-foreground">Delivered to: </span>
                        {trip.delivery_destination || trip.delivery_address}
                      </div>
                    ) : (
                      trip.car?.location && (
                        <div className="text-foreground">{trip.car.location}</div>
                      )
                    )}
                  </div>
                )}
              </div>
            ) : trip.delivery_address ? (
              <p className="mt-1 flex items-start gap-1.5 text-sm text-muted-foreground">
                <MapPin className="mt-0.5 h-3.5 w-3.5 shrink-0" />
                {trip.delivery_address}
              </p>
            ) : (
              trip.car?.location && (
                <p className="mt-1 flex items-center gap-1.5 text-sm text-muted-foreground line-clamp-1">
                  <MapPin className="h-3.5 w-3.5" />
                  {trip.car.location}
                </p>
              )
            )}
            <div className="mt-2.5 flex items-center gap-2 text-xs sm:mt-3 sm:text-sm">
              <div className="flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-muted text-[0.65rem] font-bold uppercase tracking-tight text-muted-foreground sm:h-7 sm:w-7 sm:text-xs">
                {trip.guest_name
                  ? getGuestInitials(trip.guest_name)
                  : trip.guest_initials || "?"}
              </div>
              <span className="truncate text-foreground">
                {trip.guest_name || trip.guest_initials || "Guest"}
              </span>
            </div>
            {trip.trip_id && (
              <div className="mt-1.5 flex items-center gap-2">
                <Link
                  to={
                    isHost
                      ? `/host-car-management?trip_id=${trip.trip_id}#earnings`
                      : `/trips/${trip.id}`
                  }
                  onClick={(e) => e.stopPropagation()}
                  className="inline-flex items-center gap-1 text-xs font-medium text-primary hover:underline"
                >
                  <span>Trip #{trip.trip_id}</span>
                  <ExternalLink className="h-3 w-3" />
                </Link>
                <button
                  type="button"
                  onClick={(e) => {
                    e.preventDefault();
                    e.stopPropagation();
                    navigator.clipboard.writeText(trip.trip_id!);
                    toast({
                      title: "Copied",
                      description: `Trip ID ${trip.trip_id} copied to clipboard.`,
                    });
                  }}
                  className="inline-flex items-center text-muted-foreground transition-colors hover:text-foreground"
                  title="Copy trip ID"
                >
                  <Copy className="h-3 w-3" />
                </button>
              </div>
            )}
          </div>
          <div className="flex shrink-0 flex-col items-end gap-1">
            <div className="h-12 w-16 overflow-hidden rounded-lg bg-muted sm:h-16 sm:w-20">
              {carImage ? (
                <img
                  src={carImage}
                  alt={carTitle}
                  className="h-full w-full object-cover"
                  loading="lazy"
                />
              ) : (
                <div className="flex h-full w-full items-center justify-center text-muted-foreground">
                  <CarIcon className="h-5 w-5 sm:h-6 sm:w-6" />
                </div>
              )}
            </div>
            {trip.car?.license_plate && (
              <span className="text-xs text-muted-foreground">
                {trip.car.license_plate}
              </span>
            )}
            {trip.net_amount != null && (
              <div className="mt-1 flex flex-col items-end">
                <span
                  className={`text-sm font-bold sm:text-base ${
                    isCancelled
                      ? "text-muted-foreground line-through"
                      : "text-foreground"
                  }`}
                >
                  {formatCurrency(trip.net_amount)}
                </span>
                {trip.payment_status && (
                  <span
                    className={`rounded px-1.5 py-0.5 text-[0.6rem] font-medium uppercase tracking-wide ${
                      isCancelled
                        ? "bg-destructive/15 text-destructive"
                        : trip.payment_status === "paid"
                          ? "bg-primary/15 text-primary"
                          : "bg-muted text-muted-foreground"
                    }`}
                  >
                    {isCancelled
                      ? "Cancelled"
                      : trip.payment_status === "paid"
                        ? "Paid"
                        : "Pending"}
                  </span>
                )}
              </div>
            )}
          </div>
        </div>
      </article>
    </Link>
  );
}
