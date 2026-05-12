# Per-Car Booking History on `/my-cars`

Add a way for clients to click a car card and see every booking/trip that car has had, with earnings, expenses, and payment status — all without leaving `/my-cars`.

## User flow

1. On `/my-cars`, each car card gets a new **"View bookings"** action (button on the card, plus the whole card image becomes clickable as a secondary entry point).
2. Clicking opens a **slide-over modal** ("Booking History — 2021 Tesla Model 3") that lists every trip for that car, newest first.
3. The modal stays scoped to the selected car. Closing it returns the user exactly where they were on the page (no scroll reset).

## Modal contents

**Header**
- Car name, plate, location.
- Summary chips for the visible list: total trips, total gross, total net (dynamic = gross − matched trip expenses), total paid, total pending.
- A simple time filter: `All time` (default) · `This year` · `This month` · `Custom range`.

**Trip list** — one row per `host_earnings` record for that car:
- Guest name + trip dates (`earning_period_start → earning_period_end`, parsed with the `T00:00:00` rule).
- Gross earnings, matched trip expenses, and the client's net share (computed dynamically — never read `net_amount`).
- Payment status badge (`Paid` / `Pending`) and `date_paid` when present.
- Trip ID and payment source (Turo, etc.).
- Row expands to show the breakdown of matched expenses (toll, delivery, carwash, EV charge, plus any `host_expenses` rows tied by `trip_id`).

**Empty state**
- Friendly message when the car has no bookings yet ("No bookings recorded for this car yet").

## Technical notes

- New component: `src/components/cars/CarBookingHistoryModal.tsx` using the existing `Sheet` (slide-over) primitive for desktop and full-screen on mobile.
- New hook: `src/hooks/useCarBookings.tsx` — fetches `host_earnings` and `host_expenses` for a single `car_id`, joined client-side by `trip_id`. RLS already lets clients read both tables for cars they own (`Clients can view earnings for their cars`, `Hosts and clients can view expenses for their cars`), so no migrations or policy changes are needed.
- Net profit math reuses the existing helper in `src/lib/expenseMatching.ts` to stay consistent with the dashboard and analytics.
- `MyCars.tsx` adds local state `bookingsCarId: string | null`, a "View bookings" button on each card, and renders `<CarBookingHistoryModal carId={bookingsCarId} onClose={...} />` once at the page level.
- No changes to the existing share / manage access / unhost flows.
- Date formatting follows the project standard (append `T00:00:00` before passing to `Date`).

## Out of scope (can follow up later)

- Editing trips from this modal (already handled in the analytics flow).
- Exporting the booking list to CSV/PDF.
- Per-trip claim linking.
