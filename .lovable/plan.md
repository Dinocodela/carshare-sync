
## Goal
Stop losing rental leads on teslys.app. Right now the landing page pushes visitors toward "sign in" and "list your Tesla," and the only rental affordance is a tiny top-right pill. We'll make Rent a Tesla a first-class, unmissable choice on the landing hero.

## Approach: Two-card intent gate above the fold

Replace the current single-purpose hero (Logo + "Welcome to Teslys" + login form) with an intent chooser that appears first, on both web and native.

```text
┌───────────────────────────────────┐
│           Teslys logo             │
│  What brings you to Teslys?       │
├──────────────┬────────────────────┤
│  🚗 Rent     │  🔑 List / Manage  │
│  a Tesla     │  my Tesla          │
│              │                    │
│  Book a      │  Earn passive      │
│  Tesla by    │  income — we       │
│  the day     │  handle rentals,   │
│  or month.   │  cleaning, guests. │
│              │                    │
│  [Rent now →]│  [Get started →]   │
└──────────────┴────────────────────┘
   Already have an account? Sign in
```

### Behavior
- **Rent a Tesla card** → opens `https://app.eonrides.com` in a new tab (web) / external browser (native via `@capacitor/browser` or `window.open`).
- **List/Manage card** → reveals the existing login + client register panel (current `panel` state machine) inline below, or scrolls to it.
- **"Already have an account? Sign in"** link → collapses cards and shows the login form for returning users, so we don't add friction for them.
- Persist the choice in `localStorage` (`teslys_intent`) so returning visitors on the same device skip straight to their side. Add a small "Not you? Switch" link to reset.

### Secondary cleanup on the same page
- Remove the "Rent A Tesla" floating pill in the top-right — it's now redundant and was being missed anyway. Keep it only on interior pages where the hero cards aren't present.
- Keep the existing "Become a host" and "Invest in our fleet" cards, but push them below the fold so the two primary intents dominate.
- Keep the Earnings Calculator CTA and trust indicators as-is.

### Scope
- **Web**: `src/pages/Index.tsx` — restructure the hero.
- **Native (Capacitor)**: same file, same UI. The Rent card uses `Browser.open({ url })` from `@capacitor/browser` when `Capacitor.isNativePlatform()` is true, otherwise `window.open`.
- **Component**: new `src/components/landing/IntentChooser.tsx` to keep `Index.tsx` clean.
- **Analytics**: fire an event on each card click (`landing_intent_selected` with `rent` | `manage`) via existing `src/analytics/events.ts` so we can measure lift.

### Copy (draft)
- Headline: **"What brings you to Teslys?"**
- Rent card: **"Rent a Tesla"** — "Book a Tesla by the day, week, or month. Delivered ready to drive."
- Manage card: **"List & earn from my Tesla"** — "Turn your Tesla into passive income. We handle rentals, cleaning, and guest support."

### Visual direction
- Two equal-height cards, mobile-stacked / desktop side-by-side.
- Distinct accent per card (Rent = electric blue accent, Manage = existing primary green) so they read as two clearly separate paths, not variations of the same product.
- Large icon, bold title, one-line value prop, primary CTA button. Same card language as the existing "Become a host" cards so it fits the design system.

## Non-goals
- No changes to auth, registration flow, or backend.
- No first-visit modal (rejected in favor of persistent hero cards — no dismissal friction, always visible).
- No changes to the mobile app native shell beyond the landing screen.

## Follow-up (not in this change)
- After 1–2 weeks, review analytics on `landing_intent_selected` vs. client register completions to confirm rental leads are being captured.
