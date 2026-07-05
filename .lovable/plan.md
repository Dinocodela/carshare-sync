## Goal
Fix the numbers on the `/calendar` booking bars. Instead of a raw per-day rate (`amount / days`), each bar should show the **booking total** of the relevant party's share, computed **after expenses**:

- **Client workspace** → the client's rental earnings for that booking
- **Host workspace** → the management fee (host's ~30% share) for that booking

## Data model (already available)
`host_earnings` rows carry `amount`, `client_profit_percentage`, and `host_profit_percentage`. Matched trip expenses live in `host_expenses` (joined by `trip_id`), the same source `TripDetail.tsx` and the analytics hooks use. Net share formula (matches the app's standard rule in `src/lib/expenseMatching.ts`):

```text
net   = amount - sum(matched trip expenses)
share = net × (split % / 100)
  client view → split % = client_profit_percentage (fallback 70)
  host view   → split % = host_profit_percentage   (fallback 30)
```

## Changes

### 1. `src/hooks/useBookingsCalendar.tsx`
- Extend the `host_earnings` select to also pull `client_profit_percentage` and `host_profit_percentage`.
- After loading bookings, fetch `host_expenses` (`trip_id, amount, toll_cost, delivery_cost, carwash_cost, ev_charge_cost`) for the `trip_id`s in the window and sum them per trip (reuse `getTripExpensesTotal` from `src/lib/expenseMatching.ts`).
- Compute a new `displayAmount` per booking:
  - `net = amount - tripExpenses`
  - pick the percentage based on `activeWorkspace` (`host` → host %, else client %), with the fallbacks above
  - `displayAmount = net × pct / 100`
- Add `displayAmount: number` to the `CalendarBooking` interface and set it on each row. Keep raw `amount` for the tooltip.

### 2. `src/components/calendar/BookingBar.tsx`
- Replace the `$X/day` label with the **booking total** of `booking.displayAmount`, rendered as a rounded currency chip (e.g. `$420`).
- Update the hover tooltip to describe the figure per role-agnostic wording (e.g. `Guest · $420`), keeping the Turo-style line + end dots unchanged.

## Notes
- No schema/RLS changes; `host_expenses` is already readable by both owners and hosts for their trips.
- Bars for bookings with no matched `trip_id`/expenses simply use `net = amount` (expenses = 0).