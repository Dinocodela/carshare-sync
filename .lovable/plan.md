# Redesign Plan — Safe, Incremental Rollout

## Why the last attempt got reverted
Big multi-file UI edits touch layouts, auth panels, and routing in one shot. If any single piece feels wrong, the only clean escape is a revert — which wipes the good parts too. The fix is to **change one surface at a time**, behind stable tokens, so any single step can be tuned or rolled back without losing the rest.

## Guiding principles
1. **Design tokens first, components second, pages third.** Never hand-tune colors inside components.
2. **One page or section per turn.** No sweeping cross-page rewrites.
3. **Functionality is frozen.** Routes, auth, Supabase queries, booking/payment flows stay untouched — this is purely visual/presentation work (matches the project's Luxury Concierge rule set already in memory).
4. **Checkpoint after every step.** You approve each surface before we move to the next. That way a revert costs one step, not the whole redesign.
5. **Reuse the existing design system.** `src/index.css` + `tailwind.config.ts` already define semantic HSL tokens — we extend those, we don't hardcode `bg-white`/`text-black` in components.

## Phased rollout

### Phase 0 — Lock the direction (no code)
Pick the visual language once, in writing, so every later step conforms:
- Confirm the "Luxury Concierge" palette already in project memory (ivory, porcelain, teal-deep, teal, gold, ink) is still the target — or swap it now.
- Confirm serif display (Playfair) + Inter body, or change.
- Confirm component shape language: rounded-3xl cards, pill buttons, hairline dividers, gold used sparingly.

Deliverable: a short written spec I keep referencing. Nothing shipped yet.

### Phase 1 — Foundation tokens
Update **only** `src/index.css` and `tailwind.config.ts`:
- Semantic HSL tokens for background, foreground, primary, secondary, accent, muted, border, card, popover — light + dark.
- Gradient tokens (`--gradient-hero`, `--gradient-primary`), shadow tokens (`--shadow-elegant`, `--shadow-card`), radii.
- Typography families wired through Tailwind `fontFamily`.

Nothing visually "redesigned" yet — but every existing page instantly picks up the new palette. Easy to tune, easy to revert (2 files).

### Phase 2 — Primitive components
Restyle shadcn primitives via variants only: `Button`, `Card`, `Input`, `Badge`, `Dialog`, `Sheet`, `Tabs`. No page edits. Every screen that uses these gets a consistent lift.

### Phase 3 — Shared shells
`DashboardLayout`, `AppSidebar`, `BottomNavBar`, `ScreenHeader`, `BreadcrumbNav`, `LegalFooter`. One at a time. These frame every authenticated page, so getting them right amplifies later work.

### Phase 4 — Public / marketing pages (one per turn)
Priority order (highest traffic + conversion first):
1. `Index` (landing) — including the intent chooser that just got reverted
2. `HowItWorks`, `About`
3. `EarningsCalculator`, `EarningsGuide`, `GetStarted`
4. City pages template + Model pages template (edit the shared template, not 14 files)
5. `Blog` + `BlogPost`
6. `Shop` + `ProductDetail`
7. Legal pages (`Privacy`, `Terms`, `FAQ`, `SMSConsent`, `DeleteAccount`)

### Phase 5 — Authenticated app (one per turn)
`Dashboard`, `Trips`/`TripDetail`, `BookingCalendar`, `MyCars`/`CarDetails`/`EditCar`, `HostCarManagement`/`HostRequests`/`HostingDetails`, `ClientAnalytics`/`HostAnalytics`, `Settings`, admin/investor screens.

### Phase 6 — Polish pass
Motion (respecting `prefers-reduced-motion`), empty states, loading skeletons, mobile safe-area audit (Capacitor iOS/Android), SEO components untouched but re-verified on every redesigned public page.

## Safety rails on every step
- Screenshot before + after (Playwright) so you can compare instead of relying on memory.
- No route or data-layer changes in a UI turn — if a step needs logic changes, we split it.
- Keep every existing link working (`/register/client`, `/register/host`, `/earnings-calculator`, city pages, etc.).
- If a step feels wrong, we tune that step. A single-step revert is cheap; a full-project revert never happens again.

## What I need from you to start
1. Confirm the Luxury Concierge visual direction (palette + Playfair/Inter) is still the target, or tell me what to change.
2. Green-light Phase 1 (tokens only) as the first turn. It's the lowest-risk change and unlocks everything else.

## Technical notes
- All tokens live in `src/index.css` as HSL, mirrored in `tailwind.config.ts` — components stay on semantic classes (`bg-background`, `text-foreground`, `bg-primary`, etc.).
- shadcn variants via `cva` for any new visual variants (e.g. `Button variant="premium"`), never inline color classes.
- Framer Motion for animation (already in stack), gated by `prefers-reduced-motion`.
- SEO components (`SEO.tsx`, `StructuredData`) preserved verbatim on every redesigned public page.
- Capacitor: safe-area insets (`pt-safe-top`, `pb-app-bottom`) preserved on every layout edit.
