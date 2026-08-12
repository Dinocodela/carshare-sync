# Wraps pages: brand match + offers

Bring `/wraps` and `/wraps/:slug` in line with the Teslys site design, add a clickable logo header, and monetize the free Instagram traffic with an offers band.

## 1. Brand match (design only, images untouched)

The wraps pages currently use a one-off hardcoded ivory/dark-teal palette (`#F7F2E9`, `#0E3D3A`, `#C6A15B`) and serif headings. Everything visual gets swapped to the same tokens the rest of teslys.app uses:

- Backgrounds `bg-background`, cards `bg-card` with `border-border`, text `text-foreground` / `text-muted-foreground`.
- Accents and buttons use `primary` (the site teal) and the existing shadcn `Button` component with the same pill/rounded treatment as the city pages.
- Dark panels ("How it works", coming-soon card, wrap image canvas) use the site `navy` token instead of `#0E3D3A`.
- Headings switch from `font-serif` to the site's Inter weight/scale used on marketing pages.
- Wrap PNGs, previews, and the aspect ratios stay exactly as they are.

## 2. Header with logo

Add the same sticky header the city landing pages use to both wraps pages: `Logo` linking to `/` on the left, a compact nav/CTA on the right. Existing routes and links unchanged.

## 3. Offers band (both pages, below the gallery / below the download section)

A four-card band, styled with site tokens:

1. **Rent a Tesla** — links to the existing EonRides rental URL.
2. **Make money with your Tesla** — links to `/earnings-calculator` with a secondary link to host signup.
3. **Buying a new Tesla?** — "Get 3 free months of FSD" → `http://ts.la/walter46402` (new tab, `rel="noopener nofollow"`).
4. **Want a discount on your Tesla?** — opens a short form (see below).

Copy stays factual: the referral card describes Tesla's referral program, the discount card says we can connect them with a sales contact — no guaranteed pricing claims.

## 4. Discount lead form

A dialog with Name, Email, Phone (optional), Model of interest, and an optional note, plus a honeypot field (same anti-spam pattern already used for investor inquiries).

Technical:
- New table `public.tesla_deal_leads` (name, email, phone, model_interest, note, source, utm fields, created_at) with `GRANT INSERT TO anon, authenticated`, RLS on, insert-only policy for anon and super-admin read.
- New edge function `notify-tesla-deal-lead` that inserts the lead server-side, applies the existing `check_and_record_rate_limit` guard, and posts to the existing Slack webhook secret.
- UTM values already persisted by `wrapAnalytics` are attached so IG traffic stays attributable.

## 5. Analytics

Add `wrap_offer_click` (with which offer) and `tesla_deal_lead_submit` to `src/lib/wrapAnalytics.ts`, following the existing event pattern.

## Out of scope

No changes to the wrap catalog, downloads, routes, SEO components, or sitemap.
