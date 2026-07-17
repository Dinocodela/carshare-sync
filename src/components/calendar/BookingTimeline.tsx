import { useMemo, useRef, useEffect, useState, useCallback } from "react";
import { addDays, format, isToday, isWeekend, isSameMonth } from "date-fns";
import { cn } from "@/lib/utils";
import { formatCarName } from "@/lib/carName";
import { CalendarCar, CalendarBooking } from "@/hooks/useBookingsCalendar";
import { CarBlock } from "@/hooks/useCarBlocks";
import { BookingBar } from "./BookingBar";
import { BlockBar } from "./BlockBar";
import { Car as CarIcon, EyeOff, Eye } from "lucide-react";
import { Button } from "@/components/ui/button";

interface BookingTimelineProps {
  cars: CalendarCar[];
  bookings: CalendarBooking[];
  blocks: CarBlock[];
  windowStart: Date;
  days: number;
  toDate: (s: string) => Date;
  onRangeSelected: (car: CalendarCar, startDate: Date, endDate: Date) => void;
  onBlockClick: (car: CalendarCar, block: CarBlock) => void;
}

const COL_WIDTH = 52;
const LEFT_WIDTH = 128;
const ROW_HEIGHT = 68;
const HIDDEN_KEY = "teslys.calendar.hiddenCarIds";

function loadHidden(): string[] {
  try {
    const raw = localStorage.getItem(HIDDEN_KEY);
    if (!raw) return [];
    const arr = JSON.parse(raw);
    return Array.isArray(arr) ? arr.filter((x) => typeof x === "string") : [];
  } catch {
    return [];
  }
}

export function BookingTimeline({
  cars,
  bookings,
  windowStart,
  days,
  toDate,
}: BookingTimelineProps) {
  const scrollRef = useRef<HTMLDivElement>(null);
  const [hiddenIds, setHiddenIds] = useState<string[]>(() => loadHidden());
  const [showHidden, setShowHidden] = useState(false);

  const persist = useCallback((ids: string[]) => {
    setHiddenIds(ids);
    try {
      localStorage.setItem(HIDDEN_KEY, JSON.stringify(ids));
    } catch {
      /* ignore */
    }
  }, []);

  const hideCar = (id: string) => {
    if (hiddenIds.includes(id)) return;
    persist([...hiddenIds, id]);
  };
  const unhideCar = (id: string) => {
    persist(hiddenIds.filter((x) => x !== id));
  };

  const visibleCars = useMemo(
    () => (showHidden ? cars : cars.filter((c) => !hiddenIds.includes(c.id))),
    [cars, hiddenIds, showHidden]
  );
  const hiddenCount = cars.filter((c) => hiddenIds.includes(c.id)).length;

  const dayList = useMemo(
    () => Array.from({ length: days }, (_, i) => addDays(windowStart, i)),
    [windowStart, days]
  );

  const monthSegments = useMemo(() => {
    const segments: { label: string; startIdx: number; span: number }[] = [];
    dayList.forEach((d, i) => {
      const last = segments[segments.length - 1];
      if (last && isSameMonth(d, addDays(windowStart, last.startIdx))) {
        last.span += 1;
      } else {
        segments.push({ label: format(d, "MMMM yyyy"), startIdx: i, span: 1 });
      }
    });
    return segments;
  }, [dayList, windowStart]);

  const bookingsByCar = useMemo(() => {
    const map = new Map<string, CalendarBooking[]>();
    bookings.forEach((b) => {
      const arr = map.get(b.car_id) || [];
      arr.push(b);
      map.set(b.car_id, arr);
    });
    return map;
  }, [bookings]);

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
    <div className="flex flex-col gap-2">
      {hiddenCount > 0 && (
        <div className="flex items-center justify-end">
          <Button
            variant="ghost"
            size="sm"
            className="h-7 text-xs text-muted-foreground gap-1.5"
            onClick={() => setShowHidden((v) => !v)}
          >
            <Eye className="h-3.5 w-3.5" />
            {showHidden
              ? `Hide ${hiddenCount} hidden car${hiddenCount === 1 ? "" : "s"}`
              : `Show ${hiddenCount} hidden car${hiddenCount === 1 ? "" : "s"}`}
          </Button>
        </div>
      )}
      <div
        ref={scrollRef}
        className="overflow-auto rounded-xl border bg-card"
        style={{ maxHeight: "calc(100dvh - 220px)" }}
      >
        <div style={{ width: gridWidth }}>
          {/* Month band */}
          <div className="flex sticky top-0 z-40 bg-card border-b">
            <div
              className="sticky left-0 z-50 bg-card border-r"
              style={{ width: LEFT_WIDTH, minWidth: LEFT_WIDTH }}
            />
            <div className="relative" style={{ width: days * COL_WIDTH }}>
              {monthSegments.map((seg, i) => (
                <div
                  key={i}
                  className="absolute top-0 flex h-8 items-center px-3 text-xs font-bold text-foreground"
                  style={{ left: seg.startIdx * COL_WIDTH, width: seg.span * COL_WIDTH }}
                >
                  <span className="sticky left-[136px] whitespace-nowrap">
                    {seg.label}
                  </span>
                </div>
              ))}
              <div className="h-8" />
            </div>
          </div>

          {/* Day header */}
          <div className="flex sticky top-8 z-30 bg-card border-b">
            <div
              className="sticky left-0 z-40 bg-card border-r"
              style={{ width: LEFT_WIDTH, minWidth: LEFT_WIDTH }}
            />
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
          {visibleCars.map((car) => {
            const carBookings = bookingsByCar.get(car.id) || [];
            const isHidden = hiddenIds.includes(car.id);
            return (
              <div
                key={car.id}
                className={cn(
                  "flex border-b last:border-b-0 group",
                  isHidden && "opacity-50"
                )}
                style={{ height: ROW_HEIGHT }}
              >
                {/* Sticky car info */}
                <div
                  className="sticky left-0 z-20 bg-card border-r flex items-center gap-2 px-2 relative"
                  style={{ width: LEFT_WIDTH, minWidth: LEFT_WIDTH }}
                >
                  <div className="h-11 w-11 shrink-0 rounded-lg bg-muted overflow-hidden flex items-center justify-center ring-1 ring-border">
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
                  <div className="min-w-0 flex-1">
                    <p className="text-xs font-semibold leading-tight truncate">
                      {car.nickname?.trim() ||
                        (car.model
                          ? `${car.make ?? ""} ${car.model}`.trim()
                          : formatCarName(car))}
                    </p>
                    {car.license_plate && (
                      <p className="mt-0.5 inline-block rounded bg-muted px-1.5 py-0.5 text-[10px] font-medium tracking-wide text-muted-foreground truncate max-w-full">
                        {car.license_plate.toUpperCase()}
                      </p>
                    )}
                  </div>
                  <button
                    type="button"
                    onClick={() => (isHidden ? unhideCar(car.id) : hideCar(car.id))}
                    aria-label={isHidden ? "Show car in calendar" : "Hide car from calendar"}
                    title={isHidden ? "Show in calendar" : "Hide from calendar"}
                    className="absolute right-1 top-1 rounded-md p-1 text-muted-foreground opacity-0 group-hover:opacity-100 hover:bg-muted hover:text-foreground focus:opacity-100 transition"
                  >
                    {isHidden ? (
                      <Eye className="h-3.5 w-3.5" />
                    ) : (
                      <EyeOff className="h-3.5 w-3.5" />
                    )}
                  </button>
                </div>

                {/* Day grid + booking bars */}
                <div
                  className="relative"
                  style={{ width: days * COL_WIDTH, minWidth: days * COL_WIDTH }}
                >
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
    </div>
  );
}
