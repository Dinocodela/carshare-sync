/**
 * Wall-clock <-> UTC conversion for a configurable posting timezone.
 * Scheduling is entered by admins as local wall-clock time in the
 * automation-settings timezone, and stored in UTC.
 */

function offsetMinutes(utcDate: Date, timeZone: string): number {
  // Format the UTC instant in the target zone, then read it back as if UTC
  // to derive the zone's offset at that instant (DST-aware).
  const dtf = new Intl.DateTimeFormat("en-US", {
    timeZone,
    hour12: false,
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
    hour: "2-digit",
    minute: "2-digit",
    second: "2-digit",
  });
  const parts = dtf.formatToParts(utcDate);
  const get = (type: string) => Number(parts.find((p) => p.type === type)?.value ?? "0");
  const asUtc = Date.UTC(
    get("year"),
    get("month") - 1,
    get("day"),
    get("hour") % 24,
    get("minute"),
    get("second"),
  );
  return (asUtc - utcDate.getTime()) / 60000;
}

/** "2026-08-12" + "14:30" in `timeZone` -> UTC ISO string. */
export function zonedWallClockToUtcISO(
  dateStr: string,
  timeStr: string,
  timeZone: string,
): string {
  const [y, m, d] = dateStr.split("-").map(Number);
  const [hh, mm] = timeStr.split(":").map(Number);
  const naive = Date.UTC(y, (m ?? 1) - 1, d ?? 1, hh ?? 0, mm ?? 0, 0);

  // Two passes settles DST boundaries.
  let guess = new Date(naive);
  for (let i = 0; i < 2; i++) {
    const off = offsetMinutes(guess, timeZone);
    guess = new Date(naive - off * 60000);
  }
  return guess.toISOString();
}

/** UTC ISO -> { date: "YYYY-MM-DD", time: "HH:mm" } in `timeZone`. */
export function utcISOToZonedParts(
  iso: string | null | undefined,
  timeZone: string,
): { date: string; time: string } {
  if (!iso) return { date: "", time: "" };
  const dtf = new Intl.DateTimeFormat("en-CA", {
    timeZone,
    hour12: false,
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
    hour: "2-digit",
    minute: "2-digit",
  });
  const parts = dtf.formatToParts(new Date(iso));
  const get = (type: string) => parts.find((p) => p.type === type)?.value ?? "";
  const hour = get("hour") === "24" ? "00" : get("hour");
  return { date: `${get("year")}-${get("month")}-${get("day")}`, time: `${hour}:${get("minute")}` };
}

export function formatInZone(iso: string | null | undefined, timeZone: string): string {
  if (!iso) return "—";
  return new Intl.DateTimeFormat("en-US", {
    timeZone,
    month: "short",
    day: "numeric",
    hour: "numeric",
    minute: "2-digit",
  }).format(new Date(iso));
}

/** Project convention: bare date strings need an explicit local midnight. */
export function parseDateOnly(value: string): Date {
  return new Date(`${value}T00:00:00`);
}
