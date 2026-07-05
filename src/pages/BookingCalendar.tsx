import { useMemo } from "react";
import {
  startOfMonth,
  endOfMonth,
  addMonths,
  subMonths,
  differenceInCalendarDays,
} from "date-fns";
import { Loader2, CalendarDays } from "lucide-react";
import { DashboardLayout } from "@/components/layout/DashboardLayout";
import { PageContainer } from "@/components/layout/PageContainer";
import { SEO } from "@/components/SEO";
import { useWorkspace } from "@/hooks/useWorkspace";
import { useBookingsCalendar } from "@/hooks/useBookingsCalendar";
import { BookingTimeline } from "@/components/calendar/BookingTimeline";

// Continuous rolling window: 1 month back → 12 months ahead.
const MONTHS_BACK = 1;
const MONTHS_AHEAD = 12;

export default function BookingCalendar() {
  const { activeWorkspace } = useWorkspace();

  const windowStart = useMemo(
    () => startOfMonth(subMonths(new Date(), MONTHS_BACK)),
    []
  );
  const windowEnd = useMemo(
    () => endOfMonth(addMonths(new Date(), MONTHS_AHEAD)),
    []
  );
  const days = differenceInCalendarDays(windowEnd, windowStart) + 1;

  const { cars, bookings, loading, error, toDate } = useBookingsCalendar(
    windowStart,
    windowEnd
  );

  return (
    <DashboardLayout>
      <SEO
        title="Booking Calendar | Teslys"
        description="See all your bookings across every vehicle in one timeline view."
      />
      <PageContainer>
        <div className="flex flex-col gap-4">
          <div>
            <h1 className="text-2xl font-bold flex items-center gap-2">
              <CalendarDays className="h-6 w-6 text-primary" />
              Booking Calendar
            </h1>
            <p className="text-sm text-muted-foreground">
              {activeWorkspace === "host"
                ? "Bookings across the cars you host — scroll sideways to move through the months"
                : "Bookings across your vehicles — scroll sideways to move through the months"}
            </p>
          </div>

          {loading ? (
            <div className="flex items-center justify-center py-24 text-muted-foreground">
              <Loader2 className="h-6 w-6 animate-spin" />
            </div>
          ) : error ? (
            <div className="rounded-xl border bg-card p-8 text-center text-sm text-destructive">
              {error}
            </div>
          ) : cars.length === 0 ? (
            <div className="rounded-xl border bg-card p-12 text-center">
              <CalendarDays className="h-10 w-10 mx-auto mb-3 text-muted-foreground opacity-50" />
              <p className="font-medium">No vehicles yet</p>
              <p className="text-sm text-muted-foreground">
                Your bookings will appear here once you have cars.
              </p>
            </div>
          ) : (
            <BookingTimeline
              cars={cars}
              bookings={bookings}
              windowStart={windowStart}
              days={days}
              toDate={toDate}
            />
          )}
        </div>
      </PageContainer>
    </DashboardLayout>
  );
}
