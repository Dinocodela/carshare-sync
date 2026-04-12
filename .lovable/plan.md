

# SEO Landing Page Expansion from Keyword Data

## Analysis of Keyword File

The uploaded file contains ~40 keywords. After cross-referencing with existing pages, here's what's already covered vs. what's new:

**Already covered:** Model 3, Model Y, 12 city pages (LA, Miami, SF, NYC, Austin, San Diego, Dallas, Chicago, Seattle, Denver, Phoenix, Atlanta), earnings calculator, Turo comparison, blog engine

**Gaps identified from keywords:**

| Cluster | Keywords | Volume | Action |
|---------|----------|--------|--------|
| New Models | cybertruck rental (390+320), model x rental (390+320), model s rental (210) | 1,630 total | New model pages |
| New Cities | las vegas (260), okc (260) | 520 total | New city pages |
| Rental Type | monthly rental (170), long-term rental (110), rental cost (110) | 390 total | New intent pages |
| Blog Topics | how to charge rental tesla (110), insurance cover (260), uber tesla (210+110) | 690 total | Queue for blog engine |

## Implementation Plan (5 phases)

### Phase 1 -- Expand Model Data + Programmatic Pages
Add Model X, Model S, and Cybertruck to `src/data/modelCityPages.ts` with earnings data, highlights, and daily rates. This automatically generates 3 models x 6 existing cities = 18 new pages via the existing `/:slug` catch-all route.

### Phase 2 -- Add Las Vegas + OKC City Pages
Create `src/pages/cities/LasVegas.tsx` and `src/pages/cities/OklahomaCity.tsx` using the existing `CityLandingPage` template. Add routes in `App.tsx`. Also add these 2 cities to the `modelCityPages.ts` cities array so all 5 models generate pages for them too (10 more programmatic pages).

### Phase 3 -- Create Dedicated Model Pages
Create 3 standalone model comparison/detail pages:
- `/tesla-cybertruck-rental` -- Cybertruck-specific rental page with specs, pricing, comparison table vs Model Y
- `/tesla-model-x-rental` -- Model X page with family/luxury positioning
- `/tesla-model-s-rental` -- Model S page with premium/performance positioning

Each page includes: H1 targeting the keyword, pricing breakdown section, model comparison table, FAQ with schema markup, and CTA to register. Uses a new reusable `ModelDetailPage` component.

### Phase 4 -- Create Rental-Type Intent Pages
- `/tesla-monthly-rental` -- Targets "tesla monthly rental" + "long term tesla rental" keywords. Content about long-term rental benefits, monthly pricing tiers, cost comparison vs ownership.
- `/tesla-rental-cost` -- Targets "tesla rental cost" keyword. Pricing breakdown by model, daily vs weekly vs monthly rates, cost calculator CTA.

### Phase 5 -- Blog Topics + Sitemap + Internal Linking
- Add new keyword-derived topics to the `TOPIC_AREAS` array in `generate-blog-post/index.ts`: "How to charge a rental Tesla", "Does Tesla insurance cover rental cars", "Using Tesla for Uber and rideshare rentals", "Tesla Cybertruck rental market analysis"
- Update `public/sitemap.xml` with all new pages (~35 new URLs)
- Add internal links: model pages link to city pages, city pages link to model pages, all pages link to earnings calculator and blog
- Add conversion elements to all new pages: trust badges, earnings calculator CTA, "earn with your Tesla" upsell section (already in existing templates)

### Technical Details

**Files to create:**
- `src/pages/cities/LasVegas.tsx`
- `src/pages/cities/OklahomaCity.tsx`
- `src/components/marketing/ModelDetailPage.tsx` (reusable template)
- `src/pages/models/CybertruckRental.tsx`
- `src/pages/models/ModelXRental.tsx`
- `src/pages/models/ModelSRental.tsx`
- `src/pages/TeslaMonthlyRental.tsx`
- `src/pages/TeslaRentalCost.tsx`

**Files to edit:**
- `src/data/modelCityPages.ts` -- add 3 models + 2 cities
- `src/App.tsx` -- add ~8 new routes
- `public/sitemap.xml` -- add all new URLs
- `supabase/functions/generate-blog-post/index.ts` -- add new topics
- Existing city/model templates -- add cross-linking sections

**Total new pages generated:** ~38 (18 programmatic model+city, 2 city, 3 model detail, 2 intent pages, + blog topics queued for daily generation)

