# Trips Tab + Trip Detail Page

## Goal
Add a new **Trips** section (for both hosts and clients) that lists trips as cards in the style of the attached mock, sorted **ascending by trip date**. Tapping a card opens a **Trip Detail** page showing all available info (no prices, no rating, no messages/help tabs — replace "Contact guest" with the guest's email/phone if we have it).

## Data source
Trips = rows in `host_earnings`. Each row already has:
- `car_id` → join `cars` for make/model/year/license_plate/images
- `earning_period_start` / `earning_period_end` (trip start/end)
- `guest_name`, `trip_id`
- `host_id` (filter for hosts)
- For clients: filter by `cars.client_id = user.id`
- Guest contact (email/phone): join `host_earnings_guest_contact` on `earning_id`

No new tables or migrations needed.

## Pages & routes

1. **`/trips`** — Trips list (works for both hosts and clients; query branches by role)
2. **`/trips/:earningId`** — Trip detail page

Both gated by `RequireAuth` + `RequireApproved` + `RequireSubscribed` (same as Dashboard).

## Navigation
Bottom nav currently has 5 items (max per memory). Replace the **Hosted** item (host) and the **Add** item is kept; for clients replace **Add**? — to avoid breaking, the plan is: add a **Trips** entry that **replaces the Analytics item** in the bottom nav for both roles, and keep Analytics reachable from the Dashboard. If you'd rather keep Analytics in the nav, tell me which item to drop.

Also add a "View all trips" link from the Dashboard.

## Trips list UI (matches attached mock)

Card layout (dark, rounded, per trip):
- Top date header (e.g., `THURSDAY, MAY 21, 2026`) — grouped/displayed per card
- Status pill: "Ending at HH:MM" if trip is in progress, "Starts MMM D" if upcoming, "Ended MMM D" if past
- Car: `{year} {make} {model}` + license plate badge + car thumbnail (from `cars.images[0]`)
- Address: `cars.location` (general area only — using same masking as elsewhere)
- Guest: avatar placeholder + `guest_name` + `#trip_id`

**Sort:** ascending by `earning_period_start`.
Optional filter tabs at top: **Upcoming / In progress / Past** (default: all).

## Trip Detail UI (`/trips/:earningId`)

Following the screenshots, **Details only** (no Messages/Help tabs):
- Header: car thumbnail + "Booked trip" + guest name + back button
- Date row: `Start → End` with times
- **Location**: `cars.location`
- Status banner: "This trip ends in Xh Ym" / "Starts in …" / "Ended on …"
- **Your guest** card: avatar + `guest_name` + `trip_id` + **email/phone** (from `host_earnings_guest_contact`) instead of "Contact guest" button. If no contact on file, show "No contact info on file."
- **Trip info**: `trip_id`, `earning_type`, `payment_status`, `payment_source` (whatever is non-null)
- **About the car**: `{year} {make} {model}`, `license_plate`, `color`, `mileage` (if available)
- No prices, no rating, no mileage caps, no driver's license/photos sections (we don't have that data)

Detail page is a placeholder to expand later — you mentioned "we'll develop that soon."

## Files to add
- `src/pages/Trips.tsx` — list page
- `src/pages/TripDetail.tsx` — detail page
- `src/components/trips/TripCard.tsx` — card component
- Register both routes in `src/App.tsx`
- Update `src/components/layout/BottomNavBar.tsx` to include the Trips nav item

## Technical notes
- Dates: append `T00:00:00` before `new Date(...)` (project rule).
- No price fields displayed anywhere.
- Role determined via `profiles.role`; query branches:
  - Host: `host_earnings` where `host_id = user.id`
  - Client: `host_earnings` joined to `cars` where `cars.client_id = user.id`
- Guest contact join is a single optional row from `host_earnings_guest_contact`.

## Out of scope
- Messages, Help, prices, ratings, driver's license, trip photos, mileage caps, cancellation policy (we don't store these).
- Editing trips from this page (existing flows already handle that).
