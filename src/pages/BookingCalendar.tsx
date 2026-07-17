import { useMemo, useState } from "react";
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
import { useBookingsCalendar, CalendarCar } from "@/hooks/useBookingsCalendar";
import { useCarBlocks, CarBlock } from "@/hooks/useCarBlocks";
import { BookingTimeline } from "@/components/calendar/BookingTimeline";
import {
  BlockAvailabilityDialog,
  BlockDialogState,
} from "@/components/calendar/BlockAvailabilityDialog";

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
  const carIds = useMemo(() => cars.map((c) => c.id), [cars]);
  const { blocks, createBlock, deleteBlock } = useCarBlocks(
    carIds,
    windowStart,
    windowEnd
  );

  const [dialogState, setDialogState] = useState<BlockDialogState | null>(null);

  const handleRangeSelected = (
    car: CalendarCar,
    startDate: Date,
    endDate: Date
  ) => {
    setDialogState({ car, startDate, endDate, existing: null });
  };

  const handleBlockClick = (car: CalendarCar, block: CarBlock) => {
    setDialogState({
      car,
      startDate: new Date(block.start_at),
      endDate: new Date(block.end_at),
      existing: block,
    });
  };

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
                ? "Bookings across the cars you host — drag on a row to block dates."
                : "Bookings across your vehicles — drag on a row to block dates when you need the car back."}
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
              blocks={blocks}
              windowStart={windowStart}
              days={days}
              toDate={toDate}
              onRangeSelected={handleRangeSelected}
              onBlockClick={handleBlockClick}
            />
          )}
        </div>

        <BlockAvailabilityDialog
          state={dialogState}
          onClose={() => setDialogState(null)}
          onCreate={createBlock}
          onDelete={deleteBlock}
        />
      </PageContainer>
    </DashboardLayout>
  );
}
