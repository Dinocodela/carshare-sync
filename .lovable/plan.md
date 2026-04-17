
## Goal

On native mobile (Capacitor app), hide the marketing sections below the auth card so the app looks clean and app-like. On web, keep the existing experience. Replace the inline `Testimonials` block with a small, tappable "Read Reviews" link that opens the Teslys Google Business reviews page.

## What's currently rendered below the auth card on `Index.tsx`

1. Earnings Calculator CTA
2. Trust Indicators (Fully Insured / Top Rated / Trusted Hosts)
3. App Store badges ("Available on mobile")
4. Testimonials section (full grid)
5. SiteFooter (large premium footer)

## Changes

### 1. `src/pages/Index.tsx`
- Detect native via existing `isNative = Capacitor.isNativePlatform()` (already in the file).
- Wrap these sections so they only render on web (`!isNative`):
  - App Store badges (no point on native — they're already in the app)
  - Full `<Testimonials />` block
  - `<SiteFooter />`
- Keep on both web + native:
  - Earnings Calculator CTA
  - Trust Indicators (small, app-appropriate)
- On native only, render a new compact "Read Reviews" pill/link below the trust indicators that opens the Google Business reviews page in the system browser.

### 2. New component: `src/components/ReadReviewsLink.tsx`
A small, cute card-style link:
- Star icon + "Read Our Reviews" + chevron
- Subtle muted card styling matching the auth card aesthetic
- Opens the Google Business reviews URL in a new tab / system browser

### Google Business URL
I need one quick clarification before building — what URL should the link open?

Options:
- A Google Maps reviews URL (e.g. `https://g.page/r/<id>/review` or `https://search.google.com/local/reviews?placeid=...`)
- A general Google search for "Teslys reviews"
- The Teslys Google Business Profile page

I'll ask the user for the exact link.

## Files touched
- `src/pages/Index.tsx` — conditionally render marketing sections based on `isNative`; add `ReadReviewsLink` for native
- `src/components/ReadReviewsLink.tsx` — new small reviews link component

## Open question for user
Need the exact Google Business / reviews URL to link to.
