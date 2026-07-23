## Goal

When a visitor picks "Rent a Tesla" on the homepage, show a short renter onboarding that hits the three highest-converting selling points before handing them off to the booking site (eonrides.com). Host onboarding stays exactly as-is.

## Three renter selling points

1. **Discounted Long-Term Rates** — "Save up to 25% on weekly rentals and up to 40% on monthly rentals."
2. **Full Self-Driving Included** — "Every Tesla ships with Full Self-Driving activated at no extra cost."
3. **Return Without Recharging** — "No charge-back fees. Drop it off at any battery level — we handle the recharge."

The two percentages above are placeholders — please confirm the real numbers before I build, or I'll ship with these defaults and you can tweak the copy in a one-line edit later.

## Files to add

- `src/components/onboarding/RentOnboardingScreen1.tsx` — Discounted long-term rates. Icon: `CalendarDays` / `Percent`. Three feature rows: Daily / Weekly (up to 25% off) / Monthly (up to 40% off).
- `src/components/onboarding/RentOnboardingScreen2.tsx` — Full FSD included. Icon: `Sparkles` / `Navigation`. Feature rows: Autosteer on city streets, Smart Summon, Auto lane change — all activated on every car.
- `src/components/onboarding/RentOnboardingScreen3.tsx` — Return without recharging. Icon: `BatteryCharging`. Feature rows: No recharge fee, No mandatory Supercharger stop, Return at any battery level. Final CTA copy: "Browse available Teslas".
- `src/components/onboarding/RentOnboardingFlow.tsx` — Copy of `OnboardingFlow.tsx` structure (progress dots, swipe, animated transitions, WhatsApp bubble removed since this is renter-facing). Final button opens `https://app.eonrides.com` via Capacitor Browser on native, `window.open` on web, and sets `localStorage.hasSeenRentOnboarding = "true"`.
- `src/pages/RentOnboarding.tsx` — Page wrapper with SEO tags ("Rent a Tesla in Los Angeles | Teslys") + `<RentOnboardingFlow />`.

Each screen follows the exact visual pattern of the existing `OnboardingScreen1/2/3` (rounded icon halo, gradient background glow, animated feature cards, teal/gradient headline word). No new design tokens.

## Files to modify

- `src/App.tsx` — Add public route `<Route path="/rent" element={<RentOnboarding />} />`.
- `src/components/landing/IntentChooser.tsx` — In `handleRent`, if `localStorage.getItem("hasSeenRentOnboarding") !== "true"`, `navigate("/rent")` instead of opening eonrides.com directly. Otherwise keep current behavior (straight to eonrides). Requires switching `Car`-button handler to use `useNavigate`. Analytics tracking (`landing_intent_selected` + `teslys_intent`) stays identical.

## Non-goals / guardrails

- Host onboarding files (`OnboardingScreen1/2/3.tsx`, `OnboardingFlow.tsx`, `Onboarding.tsx`) are not touched.
- No changes to Supabase, auth, booking, or the eonrides destination URL.
- Skip-onboarding behavior: repeat visitors who've completed it once go straight to eonrides on the next "Rent" click.
- Skip link ("Skip") in top-right of the flow so users who already know what they want can bypass in one tap.

## User flow

```text
Homepage → IntentChooser
   ├── "Rent a Tesla" (first time)  → /rent (3 screens) → eonrides.com
   ├── "Rent a Tesla" (return)      → eonrides.com directly
   └── "List my Tesla"              → existing auth/host flow (unchanged)
```

## Open question

Confirm the exact discount numbers to display on Screen 1. If you don't have them handy, I'll ship with "up to 25% weekly / up to 40% monthly" as sensible defaults.
