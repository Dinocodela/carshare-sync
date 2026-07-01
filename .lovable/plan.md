# Recent Trip Searches

Add a "recently searched" memory to the **Search by Trip#** field on `/trips` so you can quickly re-run past searches.

## Behavior
- Every time you submit a trip-number search, the term is saved to a recent-searches list.
- When you focus/tap the search box (and it's empty), a dropdown shows your recent trip numbers (most recent first).
- Tap any recent term to instantly re-run that search.
- Duplicates are de-duplicated (re-searching moves it to the top).
- Keep the last 8 searches; show a small "Clear history" action to wipe the list.
- History persists across sessions on the same device.

## Technical details
- Store the list in `localStorage` under a key like `trips_recent_searches` (device-local, no backend needed).
- Add a small `useRecentSearches` helper (or inline state) in `src/pages/Trips.tsx` that reads/writes the array.
- Render a dropdown panel anchored under the existing search `Input` in the Filter Trips card, reusing existing styling tokens (no hardcoded colors).
- Selecting an item sets `search`, updates the `q` URL param, resets to page 1 — reusing the current submit logic.
- Only the frontend `Trips.tsx` changes; no schema or query changes.

## Optional
- If you'd prefer the history to follow you across devices (stored in your account) instead of per-device, that's a larger change — let me know and I'll adjust.
