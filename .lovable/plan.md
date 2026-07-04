## Goal
Add a Turo-style **booking calendar** for both host and client workspaces: a horizontally scrollable timeline where each accessible car is a row, days run across the top, and bookings appear as bars spanning their date range. It respects the active workspace (host sees host cars, client sees owned/shared cars).

## Data reality (important)
- The app has **no per-day price or availability model** for cars. Prices only exist on actual bookings via `host_earnings` (`amount`, `earning_period_start`, `earning_period_end`, and the new `break_down` JSON).
- Therefore the calendar shows **booking bars** across their date ranges. For per-day display, we derive a daily rate on booked days only: `amount / number_of_days`. Open (unbooked) days render as empty cells, not priced cells like Turo's screenshot.
- No DB/schema/migration changes are needed. This is read-only, frontend-only work using existing tables and existing car-access logic.

## Layout (mobile-first, Turo-style)
```text
            | JUL 3 | 4 | 5 | 6 | 7 | 8 | 9 | ...
Model 3     |   [====$99/day====]        |
9CUJ351     |
Model Y     |          [==$112/day==]     |
9DZM189     |
```
- Sticky left column: car thumbnail + name + plate (reuse `carName` / existing car fields).
- Sticky top header row: day columns (weekday + date). Today highlighted.
- Body: one row per car; each booking rendered as a rounded bar positioned/spanning from `earning_period_start` to `earning_period_end`, tinted (amber accent like the reference), showing derived per-day rate (toggle-able / bar shows range).
- Horizontal scroll for the day axis; vertical scroll for cars. Left column and top header stay pinned.
- Default visible window: current month (or ~30 days from today), with prev/next month navigation and a "today" jump — matching the reference's `JULY 2026` selector and arrows.

## Placement
- New route `/calendar`, rendered inside the existing `DashboardLayout` (so it inherits sidebar/bottom-nav + workspace switcher).
- Add a **Calendar** nav item (icon + label) to both `AppSidebar.tsx` and `BottomNavBar.tsx`, visible in host and client workspaces. Keep bottom nav at 5 items max (per project rule) — if full, replace/relocate a lower-priority item or place Calendar in the sidebar + an entry point on Trips.

## Data fetching
- New hook `useBookingsCalendar()`:
  - Determine cars for the active workspace by reusing existing logic (`useHostCars` for host, `useCars` for client) so access rules/RLS are respected.
  - Fetch `host_earnings` for those `car_id`s within the visible date window (`id, car_id, trip_id, guest_name, amount, earning_period_start, earning_period_end, break_down`).
  - Group earnings by `car_id`; compute per-booking day span and derived daily rate.
- Respect the 1000-row default limit by scoping the query to the visible window and the user's car set.

## Components
- `src/pages/BookingCalendar.tsx` — page wrapper, month state, workspace-aware title, empty state.
- `src/components/calendar/BookingTimeline.tsx` — the scrollable grid (header, car rows, positioning math).
- `src/components/calendar/BookingBar.tsx` — a single booking bar (range, amount/daily rate, guest name on tap → link to `/trip/:tripId` when `trip_id` exists).
- Reuse shadcn `Card`, existing date helpers, and the `T00:00:00` date-parsing rule (per project memory) for all date-string → Date conversions to avoid off-by-one.

## Styling
- Use semantic tokens only (no hardcoded colors) — amber/primary accent for booking bars to echo the Turo look, muted grid lines, `bg-accent` for today.
- Mobile-first; also usable on desktop (wider visible window).

## Out of scope (unless you want it)
- Editing/creating bookings from the calendar (view-only for now).
- A real per-day pricing/availability calendar for open days (would need a new pricing model + schema).

## Verification
- Typecheck with `tsgo`.
- Playwright against localhost: load `/calendar` in host and client workspaces, confirm correct cars appear as rows and booking bars land on the right dates; screenshot mobile viewport.