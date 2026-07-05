import { useEffect, useState } from "react";
import { useAuth } from "./useAuth";
import { useWorkspace } from "./useWorkspace";
import { supabase } from "@/integrations/supabase/client";

export interface CalendarCar {
  id: string;
  make: string | null;
  model: string | null;
  year: number | null;
  images: string[] | null;
  license_plate?: string | null;
  vin_number?: string | null;
  nickname?: string | null;
}

export interface CalendarBooking {
  id: string;
  car_id: string;
  trip_id: string | null;
  guest_name: string | null;
  amount: number;
  displayAmount: number; // party's share (net, after expenses)
  start: string; // date string
  end: string; // date string
}

// Always append T00:00:00 so date-only strings parse in local time (project rule)
const toDate = (s: string) => new Date(`${s.slice(0, 10)}T00:00:00`);

export function useBookingsCalendar(windowStart: Date, windowEnd: Date) {
  const { user } = useAuth();
  const { activeWorkspace } = useWorkspace();
  const [cars, setCars] = useState<CalendarCar[]>([]);
  const [bookings, setBookings] = useState<CalendarBooking[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const startISO = windowStart.toISOString().slice(0, 10);
  const endISO = windowEnd.toISOString().slice(0, 10);

  useEffect(() => {
    if (!user) {
      setCars([]);
      setBookings([]);
      setLoading(false);
      return;
    }
    let cancelled = false;

    (async () => {
      setLoading(true);
      setError(null);
      try {
        const carMap = new Map<string, CalendarCar>();

        if (activeWorkspace === "host") {
          // Hosts can read the full car rows they host (incl. plate/vin).
          const { data, error: e } = await supabase
            .from("cars")
            .select("id, make, model, year, images, license_plate, vin_number, nickname")
            .eq("host_id", user.id);
          if (e) throw e;
          (data || []).forEach((c: any) => carMap.set(c.id, c));
        } else {
          // Client workspace: owned cars (full row) + shared cars (safe rpc).
          const { data: owned, error: oErr } = await supabase
            .from("cars")
            .select("id, make, model, year, images, license_plate, vin_number, nickname")
            .eq("client_id", user.id);
          if (oErr) throw oErr;
          (owned || []).forEach((c: any) => carMap.set(c.id, c));

          const { data: safe, error: sErr } = await (supabase as any).rpc(
            "get_safe_car_info",
            { p_user_id: user.id }
          );
          if (sErr) throw sErr;
          (safe || [])
            .filter((c: any) => c.user_relationship === "shared_access")
            .forEach((c: any) => {
              if (!carMap.has(c.id)) {
                carMap.set(c.id, {
                  id: c.id,
                  make: c.make,
                  model: c.model,
                  year: c.year,
                  images: c.images,
                });
              }
            });
        }

        const carList = Array.from(carMap.values());
        const carIds = carList.map((c) => c.id);

        let bookingRows: CalendarBooking[] = [];
        if (carIds.length > 0) {
          // Overlap with the visible window: start <= windowEnd AND end >= windowStart
          const { data: earnings, error: eErr } = await supabase
            .from("host_earnings")
            .select(
              "id, car_id, trip_id, guest_name, amount, earning_period_start, earning_period_end"
            )
            .in("car_id", carIds)
            .lte("earning_period_start", endISO)
            .gte("earning_period_end", startISO);
          if (eErr) throw eErr;

          bookingRows = (earnings || [])
            .filter((r: any) => r.earning_period_start && r.earning_period_end)
            .map((r: any) => ({
              id: r.id,
              car_id: r.car_id,
              trip_id: r.trip_id,
              guest_name: r.guest_name,
              amount: Number(r.amount) || 0,
              start: r.earning_period_start,
              end: r.earning_period_end,
            }));
        }

        if (!cancelled) {
          // Sort cars: those with bookings first, then by model name.
          const withBookings = new Set(bookingRows.map((b) => b.car_id));
          carList.sort((a, b) => {
            const aHas = withBookings.has(a.id) ? 0 : 1;
            const bHas = withBookings.has(b.id) ? 0 : 1;
            if (aHas !== bHas) return aHas - bHas;
            return (a.model || "").localeCompare(b.model || "");
          });
          setCars(carList);
          setBookings(bookingRows);
        }
      } catch (err: any) {
        if (!cancelled) setError(err.message ?? "Failed to load calendar");
      } finally {
        if (!cancelled) setLoading(false);
      }
    })();

    return () => {
      cancelled = true;
    };
  }, [user?.id, activeWorkspace, startISO, endISO]);

  return { cars, bookings, loading, error, toDate };
}
