
## Problem

User is viewing the preview at desktop viewport (1357px wide) and sees Testimonials + SiteFooter. The current code in `Index.tsx` already hides these on native (`{!isNative && (...)}`), but:

1. On the **web preview**, `isNative` is `false`, so testimonials + footer still render. The user wants the landing page to feel like a "web app" not a marketing website — so these should go on web too.
2. The user is also worried they'll appear in the wrapped Capacitor app. Since `isNative` is correctly `true` inside Capacitor, the conditional already hides them there — but removing them entirely makes this guaranteed.

## Decision

Remove the Testimonials block AND the SiteFooter from `Index.tsx` entirely (web + native). The Testimonials and Footer components themselves stay in the codebase — they're still rendered on other marketing/SEO pages (city pages, model pages, blog, etc.), so SEO value is preserved across the site.

Also remove the `AppStoreBadges` block on the landing page for the same "web app, not website" reason — keep the page focused on the auth card.

## Changes

**File: `src/pages/Index.tsx`**

Remove the entire trailing block:
```tsx
{/* Web-only: App Store badges */}
{!isNative && (
  <div className="mt-4 mb-4">
    <AppStoreBadges heading="Available on mobile" size="small" />
  </div>
)}
...
{/* Web-only: Testimonials + Footer */}
{!isNative && (
  <>
    <div className="w-full py-8 mt-4">
      <Testimonials />
    </div>
    <SiteFooter />
  </>
)}
```

Also remove the now-unused imports: `AppStoreBadges`, `Testimonials`, `SiteFooter`.

Keep:
- Earnings Calculator CTA
- Trust Indicators (Fully Insured / Top Rated / Trusted Hosts)
- `ReadReviewsLink` (native only, as is)

## Result

- Web landing page: clean auth-focused "web app" feel — auth card, trust indicators, calculator CTA. No long marketing scroll.
- Native app: identical to web minus the AppStore badges (already hidden), plus the compact Read Reviews link.
- SEO: unaffected — Testimonials and SiteFooter still render on `/blog`, `/how-it-works`, all city/model SEO pages, etc.
