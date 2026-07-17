## Goal
Let clients and hosts manually block dates on any car they can see in the calendar (like Turo's "Block availability"), and post a Slack notification whenever a block is created.

## UX (inspired by the Turo video)
On `/calendar` (`BookingTimeline`):
- Click-drag across empty cells on a car row to select a date range, OR click a single day.
- A bottom sheet / dialog opens titled **Block availability** with:
  - Start date + start time (default 09:00)
  - End date + end time (default 18:00)
  - Optional Notes (e.g. "Maintenance", "Owner using car") — 200 char max
  - **Block dates** primary button (teal, per design system)
- Existing blocks render on the row as a distinct bar (dark gray with diagonal-stripe pattern + lock icon), visually different from the teal booking bars.
- Tapping an existing block opens a small popover with the range, notes, and a **Remove block** button (with confirm).
- Blocks are ignored by earnings/booking logic — they are purely a visual/scheduling signal (matches user's phrasing "block it in the calendar").

## Access
- Both hosts (on their hosted cars) and clients (on cars they own OR have `shared_access` to) can create/remove blocks — same visibility rules the calendar already uses.
- RLS: creator can update/delete their own block; host of the car and client(s) with access can view all blocks on that car.

## Data model (new table)
`public.car_blocks`
- `id uuid pk`
- `car_id uuid` → `cars.id` (cascade)
- `created_by uuid` (auth user)
- `start_at timestamptz`
- `end_at timestamptz` (must be > start_at, trigger validation)
- `notes text` nullable
- `created_at`, `updated_at` timestamptz + update trigger
- Grants to `authenticated` (select/insert/update/delete) and `service_role`, plus RLS policies scoped via existing `car_access` / `cars.host_id` / `cars.client_id` and a `has_role(..,'admin')` bypass.

## Slack notification
Reuse the existing `SLACK_WEBHOOK_URL` secret (already used by `notify-admin-new-client`).
New edge function `notify-car-block` (verify_jwt = false, JWT validated in code) called from the client after a successful insert. Payload posted to Slack:

> 🔒 *Car blocked* — {Make} {Model} · plate **{license_plate}** · nickname *{nickname}*
> {start_at formatted} → {end_at formatted}  ({duration})
> By {user display name} ({host / client})
> Notes: {notes or "—"}

Function fetches the car row with service role to include plate/nickname reliably. Best-effort: if webhook missing or fails, log and return 200 so the UI flow isn't broken.

## Files to add / change
**New**
- Migration: `car_blocks` table + grants + RLS + updated_at trigger.
- `supabase/functions/notify-car-block/index.ts`
- `src/hooks/useCarBlocks.tsx` — fetch blocks in window + create/remove helpers.
- `src/components/calendar/BlockBar.tsx` — striped block bar renderer.
- `src/components/calendar/BlockAvailabilityDialog.tsx` — the create/edit sheet.

**Edited**
- `src/components/calendar/BookingTimeline.tsx` — add pointer drag-selection on each car row's day grid, render `BlockBar`s alongside `BookingBar`s, open dialog on selection, popover on existing block click.
- `src/hooks/useBookingsCalendar.tsx` — also return blocks (or leave separate hook — cleaner: separate `useCarBlocks`).
- `src/pages/BookingCalendar.tsx` — pass blocks through / add subtle helper text "Drag on a row to block dates".

## Technical details
- Times stored UTC (`timestamptz`); UI displays in local time. Date-only interpretation is not enough because the Turo flow includes hours — we mirror that.
- Drag selection: mousedown on a day cell captures `car_id + startIdx`; mousemove updates `endIdx`; mouseup opens dialog with prefilled dates (default 09:00 / 18:00). Touch handlers mirror the mouse events for mobile.
- After successful `insert` into `car_blocks`, invoke `notify-car-block` via `supabase.functions.invoke` with the new block id — the function looks up car + user server-side (never trusting client-side plate/name).
- Slack secret name reused: `SLACK_WEBHOOK_URL`. If not yet set for blocks specifically, we still use the same secret — no new secret needed.

## Out of scope (ask if wanted later)
- Recurring/weekly repeat (Turo's toggle) — can add later.
- Hourly-only blocks tab — we cover it with start/end datetime already.
- Blocking bookings from being created that overlap a block — currently the app has no runtime booking creation flow tied to this calendar, so no enforcement needed. Confirm if you want a warning surface.
