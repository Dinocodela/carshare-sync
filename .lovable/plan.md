
The "Rent A Tesla" button uses `fixed top-4 right-4` which puts it 16px from the top of the viewport. On native iOS/Android, that area is covered by the status bar (battery, Wi-Fi, signal icons) because the app uses `overlaysWebView: true` (Capacitor StatusBar config) and `viewport-fit=cover`.

The fix: respect the safe-area inset on top so the button sits below the status bar on native devices, while staying in the same place on web.

## Plan

**File**: `src/components/RentATeslaLink.tsx`

Replace the static `top-4` with a safe-area-aware offset:
- Use Tailwind's arbitrary value: `top-[calc(env(safe-area-inset-top)+0.5rem)]`
- Keep `right-4` and the rest of the styling unchanged

This uses the iOS/Android safe-area inset (which is 0 on web/desktop, ~44–54px on iPhones with a notch/Dynamic Island, and the status bar height on Android), pushing the button just below the system status bar on native, with no visual change on web.

No other files need to change — `viewport-fit=cover` is already set in `index.html`, and `pt-safe-top` utility is already used elsewhere in the project, confirming safe-area CSS is wired up.
