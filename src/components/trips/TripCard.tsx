import { Link } from "react-router-dom";
import { Car as CarIcon, Clock, Copy, MapPin, Truck, ExternalLink } from "lucide-react";
import { toast } from "@/hooks/use-toast";

export interface TripCardData {
  id: string;
  trip_id: string | null;
  guest_name: string | null;
  earning_period_start: string;
  earning_period_end: string;
  is_delivery?: boolean;
  delivery_address?: string | null;
  return_address?: string | null;
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

// Timestamps from host_earnings come from Turo/Eon as the trip's local
// pickup/return wall-clock time, but are stored as UTC (e.g. 07:00:00+00
// means a 7:00 AM pickup). Render in UTC so the viewer's browser timezone
// doesn't shift the displayed time.
function formatDateHeader(d: Date): string {
  return d
    .toLocaleDateString("en-US", {
      weekday: "long",
      month: "long",
      day: "numeric",
      year: "numeric",
      timeZone: "UTC",
    })
    .toUpperCase();
}

function formatTime(d: Date): string {
  return d.toLocaleTimeString("en-US", {
    hour: "numeric",
    minute: "2-digit",
    timeZone: "UTC",
  });
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
  const time = d.toLocaleTimeString("en-US", {
    hour: "numeric",
    minute: "2-digit",
    timeZone: "UTC",
  });
  return `${weekday}, ${date}, ${time}`;
}

function getStatus(start: Date, end: Date) {
  const now = new Date();
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
  const start = parseDate(trip.earning_period_start);
  const end = parseDate(trip.earning_period_end);
  const status = getStatus(start, end);
  const carTitle = trip.car
    ? `${trip.car.make} ${trip.car.model} ${trip.car.year}`
    : "Vehicle";
  const carImage = trip.car?.images?.[0];

  const statusClasses =
    status.tone === "active"
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
      <div className="mb-2 text-center text-xs font-semibold tracking-wider text-muted-foreground">
        {formatDateHeader(end)}
      </div>
      <article className="rounded-2xl border bg-card p-5 shadow-sm transition hover:bg-accent/40">
        <div className="flex items-start justify-between gap-4">
          <div className="min-w-0 flex-1">
            <span
              className={`inline-block rounded-md px-2.5 py-1 text-sm font-medium ${statusClasses}`}
            >
              {status.label}
            </span>
            <h3 className="mt-3 truncate text-xl font-bold text-foreground">
              {carTitle}
            </h3>
            <div className="mt-1 flex items-center gap-1.5 text-sm text-muted-foreground">
              <Clock className="h-3.5 w-3.5" />
              <span>
                {formatDateTime(start)} – {formatDateTime(end)}
              </span>
            </div>
            {trip.is_delivery ? (
              <div className="mt-2 flex items-start gap-1.5 rounded-md bg-accent/40 px-2 py-1.5 text-sm">
                <Truck className="mt-0.5 h-3.5 w-3.5 shrink-0 text-primary" />
                <div className="min-w-0">
                  <div className="text-xs font-semibold uppercase tracking-wide text-primary">
                    Delivery
                  </div>
                  {trip.delivery_address ? (
                    <div className="space-y-0.5 text-foreground">
                      <div>
                        <span className="text-muted-foreground">Pickup: </span>
                        {trip.delivery_address}
                      </div>
                      {trip.return_address &&
                        trip.return_address !== trip.delivery_address && (
                          <div>
                            <span className="text-muted-foreground">
                              Return:{" "}
                            </span>
                            {trip.return_address}
                          </div>
                        )}
                    </div>
                  ) : (
                    trip.car?.location && (
                      <div className="text-foreground">{trip.car.location}</div>
                    )
                  )}
                </div>
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
            <div className="mt-3 flex items-center gap-2 text-sm">
              <div className="flex h-7 w-7 items-center justify-center rounded-full bg-muted text-xs font-medium uppercase text-muted-foreground">
                {(trip.guest_name || "?").charAt(0)}
              </div>
              <span className="text-foreground">
                {trip.guest_name || "Unknown guest"}
              </span>
              {trip.trip_id && (
                <div className="mt-2 flex items-center gap-2">
                  <Link
                    to={`/host-car-management#earnings?trip_id=${trip.trip_id}`}
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
          </div>
          <div className="flex flex-col items-end gap-1">
            <div className="h-16 w-20 overflow-hidden rounded-lg bg-muted">
              {carImage ? (
                <img
                  src={carImage}
                  alt={carTitle}
                  className="h-full w-full object-cover"
                  loading="lazy"
                />
              ) : (
                <div className="flex h-full w-full items-center justify-center text-muted-foreground">
                  <CarIcon className="h-6 w-6" />
                </div>
              )}
            </div>
            {trip.car?.license_plate && (
              <span className="text-xs text-muted-foreground">
                {trip.car.license_plate}
              </span>
            )}
          </div>
        </div>
      </article>
    </Link>
  );
}
