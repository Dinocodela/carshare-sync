import { Link } from "react-router-dom";
import { differenceInCalendarDays } from "date-fns";
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

  // Center the line over the booked day columns (start at mid of first day,
  // end at mid of last day) — Turo-style connecting line between dots.
  const left = startIdx * colWidth + colWidth / 2;
  const width = (spanDays - 1) * colWidth || 4;

  const showLabel = width > 44;

  const content = (
    <div
      className="group absolute top-1/2 -translate-y-1/2"
      style={{ left, width }}
      title={`${booking.guest_name || "Booking"} · $${Math.round(booking.amount)} total`}
    >
      {/* End dots */}
      <span className="absolute left-0 top-1/2 -translate-y-1/2 -translate-x-1/2 h-2.5 w-2.5 rounded-full bg-primary" />
      <span className="absolute right-0 top-1/2 -translate-y-1/2 translate-x-1/2 h-2.5 w-2.5 rounded-full bg-primary" />
      {/* Connecting line */}
      <div className="h-[3px] w-full rounded-full bg-primary group-hover:bg-primary/80 transition-colors" />
      {/* Price label */}
      {showLabel && (
        <span className="absolute left-1/2 -translate-x-1/2 -top-4 rounded-full bg-primary/10 px-2 py-0.5 text-[10px] font-semibold text-primary whitespace-nowrap">
          ${Math.round(dailyRate)}/day
        </span>
      )}
    </div>
  );

  return (
    <Link to={`/trips/${booking.id}`} className="block">
      {content}
    </Link>
  );
}
