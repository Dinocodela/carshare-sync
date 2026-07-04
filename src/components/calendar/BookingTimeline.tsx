import { useMemo, useRef, useEffect } from "react";
import { addDays, format, isToday, isWeekend } from "date-fns";
import { cn } from "@/lib/utils";
import { formatCarName } from "@/lib/carName";
import { CalendarCar, CalendarBooking } from "@/hooks/useBookingsCalendar";
import { BookingBar } from "./BookingBar";
import { Car as CarIcon } from "lucide-react";

interface BookingTimelineProps {
  cars: CalendarCar[];
  bookings: CalendarBooking[];
  windowStart: Date;
  days: number;
  toDate: (s: string) => Date;
}

const COL_WIDTH = 52;
const LEFT_WIDTH = 128;
const ROW_HEIGHT = 68;

export function BookingTimeline({
  cars,
  bookings,
  windowStart,
  days,
  toDate,
}: BookingTimelineProps) {
  const scrollRef = useRef<HTMLDivElement>(null);

  const dayList = useMemo(
    () => Array.from({ length: days }, (_, i) => addDays(windowStart, i)),
    [windowStart, days]
  );

  const bookingsByCar = useMemo(() => {
    const map = new Map<string, CalendarBooking[]>();
    bookings.forEach((b) => {
      const arr = map.get(b.car_id) || [];
      arr.push(b);
      map.set(b.car_id, arr);
    });
    return map;
  }, [bookings]);

  // Scroll so that "today" (or window start) is comfortably in view on mount.
  useEffect(() => {
    const el = scrollRef.current;
    if (!el) return;
    const todayIdx = dayList.findIndex((d) => isToday(d));
    if (todayIdx > 1) {
      el.scrollLeft = (todayIdx - 1) * COL_WIDTH;
    }
  }, [dayList]);

  const gridWidth = LEFT_WIDTH + days * COL_WIDTH;

  return (
    <div
      ref={scrollRef}
      className="overflow-auto rounded-xl border bg-card"
      style={{ maxHeight: "calc(100dvh - 220px)" }}
    >
      <div style={{ width: gridWidth }}>
        {/* Header */}
        <div className="flex sticky top-0 z-30 bg-card border-b">
          <div
            className="sticky left-0 z-40 bg-card border-r flex items-center px-3 text-xs font-semibold text-muted-foreground"
            style={{ width: LEFT_WIDTH, minWidth: LEFT_WIDTH }}
          >
            {format(windowStart, "MMMM yyyy")}
          </div>
          {dayList.map((d, i) => (
            <div
              key={i}
              className={cn(
                "flex flex-col items-center justify-center py-2 border-r last:border-r-0",
                isWeekend(d) && "bg-muted/40"
              )}
              style={{ width: COL_WIDTH, minWidth: COL_WIDTH }}
            >
              <span className="text-[10px] uppercase text-muted-foreground">
                {format(d, "EEE")}
              </span>
              <span
                className={cn(
                  "mt-0.5 flex h-6 w-6 items-center justify-center rounded-full text-xs font-medium",
                  isToday(d) && "bg-primary text-primary-foreground"
                )}
              >
                {format(d, "d")}
              </span>
            </div>
          ))}
        </div>

        {/* Rows */}
        {cars.map((car) => {
          const carBookings = bookingsByCar.get(car.id) || [];
          return (
            <div
              key={car.id}
              className="flex border-b last:border-b-0"
              style={{ height: ROW_HEIGHT }}
            >
              {/* Sticky car info */}
              <div
                className="sticky left-0 z-20 bg-card border-r flex items-center gap-2 px-2"
                style={{ width: LEFT_WIDTH, minWidth: LEFT_WIDTH }}
              >
                <div className="h-10 w-10 shrink-0 rounded-md bg-muted overflow-hidden flex items-center justify-center">
                  {car.images && car.images[0] ? (
                    <img
                      src={car.images[0]}
                      alt={car.model || "Car"}
                      className="h-full w-full object-cover"
                      loading="lazy"
                    />
                  ) : (
                    <CarIcon className="h-5 w-5 text-muted-foreground" />
                  )}
                </div>
                <div className="min-w-0">
                  <p className="text-xs font-semibold leading-tight truncate">
                    {car.model
                      ? `${car.year ?? ""} ${car.make ?? ""} ${car.model}`.trim()
                      : formatCarName(car)}
                  </p>
                  {car.license_plate && (
                    <p className="text-[10px] text-muted-foreground truncate">
                      {car.license_plate}
                    </p>
                  )}
                </div>
              </div>

              {/* Day grid + booking bars */}
              <div
                className="relative"
                style={{ width: days * COL_WIDTH, minWidth: days * COL_WIDTH }}
              >
                {/* grid lines */}
                <div className="absolute inset-0 flex">
                  {dayList.map((d, i) => (
                    <div
                      key={i}
                      className={cn(
                        "border-r last:border-r-0",
                        isWeekend(d) && "bg-muted/30",
                        isToday(d) && "bg-primary/5"
                      )}
                      style={{ width: COL_WIDTH, minWidth: COL_WIDTH }}
                    />
                  ))}
                </div>
                {/* bars */}
                {carBookings.map((b) => (
                  <BookingBar
                    key={b.id}
                    booking={b}
                    windowStart={windowStart}
                    days={days}
                    colWidth={COL_WIDTH}
                    toDate={toDate}
                  />
                ))}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
