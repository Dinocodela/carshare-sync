
The `/earnings-calculator` page header uses `sticky top-0` without respecting the iOS safe-area inset, so the logo, back chevron, and "Get Started" button get hidden under the iPhone notch/status bar in the Capacitor app.

Same fix that was applied to the homepage's "Rent a Tesla" link needs to be applied here.

## The fix

In `src/pages/EarningsCalculator.tsx`, update the sticky `<header>` to add safe-area top padding so its content sits below the device status bar.

**Change:**
```tsx
<header className="sticky top-0 z-30 bg-navy/80 backdrop-blur-xl border-b border-white/10">
  <div className="mx-auto max-w-screen-lg px-4 sm:px-6 flex items-center justify-between py-3.5">
```

**To:**
```tsx
<header
  className="sticky top-0 z-30 bg-navy/80 backdrop-blur-xl border-b border-white/10"
  style={{ paddingTop: "env(safe-area-inset-top)" }}
>
  <div className="mx-auto max-w-screen-lg px-4 sm:px-6 flex items-center justify-between py-3.5">
```

This pushes the logo + back chevron + "Get Started" button down by the height of the iPhone status bar / notch on native, and has zero visual effect on web/desktop (the inset is `0`).

## Why this works

- Matches the pattern already used elsewhere (e.g. `PageContainer` uses `env(safe-area-inset-bottom)`).
- Capacitor on iOS exposes `env(safe-area-inset-top)` once the viewport meta has `viewport-fit=cover` (already configured in this project).
- No layout changes on desktop preview — only native devices get the offset.

## Files touched
- `src/pages/EarningsCalculator.tsx` — single header element update.
