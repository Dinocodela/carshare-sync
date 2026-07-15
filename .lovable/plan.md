## Verify `feat/luxury-homepage-google-reviews` homepage

Now that the preview is on the target branch, run a read-only verification pass against the live homepage — no code changes.

### 1. Full-page mobile screenshots
Drive Playwright against `http://localhost:8080/` at three widths, seeding `localStorage.hasSeenOnboarding = "1"` first so the onboarding redirect doesn't intercept:
- 390 px
- 402 px
- 430 px

Save PNGs under `/tmp/browser/luxury-home/` and view each to confirm visually.

### 2. Interaction checks (per width where relevant)
1. Top-left back button — click and confirm behavior (history back or fallback route).
2. Crown "Sign in" pill — click, confirm navigation to `/login`.
3. "Explore Rentals" CTA — confirm it triggers the existing Eon rental flow (external `app.eonrides.com` open via `handleRent`; on web this opens a new tab — assert the anchor/handler target).
4. "Start Earning" CTA — confirm navigation to `/register/client`.
5. Earnings calculator entry — confirm it opens `/earnings-calculator`.
6. Google reviews carousel — click each of the 3 dots/cards and confirm the active review swaps.
7. "View all Google Reviews" — confirm it links to the supplied Google Business URL (`https://g.page/r/CSZM0Vxe9T-sEBE/review` or the URL present on this branch).
8. Layout — assert `document.documentElement.scrollWidth <= clientWidth` at each viewport (no horizontal scroll), and visually confirm no overlapping text.

### 3. Report
Return per-width screenshots plus a checklist with pass/fail for items 1–8 and any console errors captured during the run. If anything fails, stop and surface the failure — do not modify code in this pass.

### Technical notes
- Use the Playwright skeleton from the browser-use guide; `headless=True`, viewport height 1800.
- Seed `hasSeenOnboarding` via `page.evaluate` after the first `goto("http://localhost:8080")`, then navigate to `/`.
- For external-link CTAs, don't actually open the external site — read the resolved `href` / intercept the `window.open` call to confirm the target URL.
