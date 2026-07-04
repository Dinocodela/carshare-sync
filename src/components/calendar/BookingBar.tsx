import { Link } from "react-router-dom";
import { differenceInCalendarDays } from "date-fns";
import { cn } from "@/lib/utils";
import { CalendarBooking } from "@/hooks/useBookingsCalendar";

interface BookingBarProps {
  booking: CalendarBooking;
  windowStart: Date;
  days: number;
  colWidth: number;
  toDate: (s: string) => Date;
}

export function BookingBar({
  booking,
  windowStart,
  days,
  colWidth,
  toDate,
}: BookingBarProps) {
  const start = toDate(booking.start);
  const end = toDate(booking.end);

  const rawStartIdx = differenceInCalendarDays(start, windowStart);
  const rawEndIdx = differenceInCalendarDays(end, windowStart);

  const startIdx = Math.max(0, rawStartIdx);
  const endIdx = Math.min(days - 1, rawEndIdx);
  if (endIdx < 0 || startIdx > days - 1) return null;

  const spanDays = endIdx - startIdx + 1;
  const totalDays = Math.max(1, rawEndIdx - rawStartIdx + 1);
  const dailyRate = booking.amount / totalDays;

  const left = startIdx * colWidth + 3;
  const width = spanDays * colWidth - 6;

  const label =
    width > 64
      ? `$${Math.round(dailyRate)}/day`
      : `$${Math.round(dailyRate)}`;

  const content = (
    <div
      className={cn(
        "absolute top-1/2 -translate-y-1/2 h-9 rounded-full flex items-center justify-center px-2",
        "bg-primary/15 border border-primary/40 text-primary",
        "hover:bg-primary/25 transition-colors overflow-hidden whitespace-nowrap"
      )}
      style={{ left, width }}
      title={`${booking.guest_name || "Booking"} · $${Math.round(booking.amount)} total`}
    >
      <span className="text-xs font-semibold truncate">{label}</span>
    </div>
  );

  return (
    <Link to={`/trips/${booking.id}`} className="block">
      {content}
    </Link>
  );
}
