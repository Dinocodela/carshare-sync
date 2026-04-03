

# SEO & Organic Lead Generation Plan for Teslys

## Current State Assessment

**What's already in place (solid foundation):**
- SEO component with meta tags, OG tags, Twitter cards, canonical URLs
- Structured data (Organization, Website, Service, FAQ, LocalBusiness, SoftwareApplication)
- 6 city landing pages targeting local "Tesla car sharing" keywords
- Sitemap.xml and robots.txt properly configured
- Blog system with published posts
- FAQ page with structured data
- GTM integration (active container GTM-WJ443454)
- Earnings Calculator page

**Gaps and opportunities:**

### 1. Fix Critical OG Image Issue
The `index.html` still points to the default Lovable placeholder OG image (`lovable.dev/opengraph-image-p98pqg.png`) instead of a Teslys-branded image. This hurts click-through rates from social shares and search previews.

### 2. Add More High-Intent Landing Pages
Currently only 6 cities. High-value additions:
- **"Tesla Turo Management" comparison page** -- captures searchers comparing platforms
- **"How Much Can I Earn Renting My Tesla" guide** -- long-form content page targeting the #1 question prospects ask
- **More city pages** (Dallas, Chicago, Seattle, Denver, Phoenix, Atlanta) -- each generates its own local search footprint

### 3. Blog Content Pipeline
The blog infrastructure exists but needs consistent content targeting high-volume keywords:
- "Is renting my Tesla on Turo worth it?"
- "Tesla Model 3 vs Model Y rental income"
- "How to make passive income with a Tesla"
- "Tesla car sharing insurance guide"
- "Best cities to rent out a Tesla"

### 4. Lead Capture & Conversion Optimization
- **Newsletter signup** on blog pages and landing pages (email capture for nurture sequences)
- **Exit-intent or scroll-triggered CTA** on content pages
- **Earnings calculator as a lead magnet** -- gate detailed results behind email capture
- **"Get a Free Earnings Estimate" form** on city pages that captures email + car model

### 5. Technical SEO Improvements
- Add `hreflang` tag if targeting multiple regions
- Improve internal linking between blog posts, city pages, FAQ, and calculator
- Add breadcrumb structured data to all content pages
- Create a `/glossary` or `/resources` hub page for topical authority
- Ensure all images have proper `alt` text and `loading="lazy"`

### 6. Programmatic SEO Pages
Auto-generate pages for keyword combinations:
- `/tesla-model-3-car-sharing-[city]`
- `/tesla-model-y-rental-income-[city]`
- These can reuse the `CityLandingPage` template with model-specific data

---

## Recommended Implementation Priority

### Phase 1 -- Quick Wins (implement now)
1. **Fix OG image** in `index.html` to use Teslys branding
2. **Add newsletter signup component** to blog and content pages
3. **Add 4-6 more city pages** using the existing template
4. **Improve internal linking** -- cross-link blog, FAQ, calculator, and city pages in footers and sidebars

### Phase 2 -- Content & Conversion
5. **Create a "Tesla Turo Management" comparison page** targeting competitive keywords
6. **Create a long-form "How Much Can I Earn" guide** with embedded calculator
7. **Add email capture to the earnings calculator** before showing detailed results
8. **Add breadcrumb structured data** to all content pages consistently

### Phase 3 -- Scale
9. **Programmatic model+city pages** (Model 3 in LA, Model Y in Miami, etc.)
10. **Blog editorial calendar** with 2-4 SEO-optimized posts per month
11. **Google Search Console integration** for monitoring and iteration

---

## Technical Details

| Item | Files Affected |
|------|---------------|
| Fix OG image | `index.html` (lines 49-50, 57-58) |
| New city pages | New files in `src/pages/cities/`, route additions in `App.tsx`, sitemap update |
| Newsletter component | New `src/components/marketing/NewsletterSignup.tsx`, added to blog/content pages |
| Comparison page | New `src/pages/TuroComparison.tsx`, route in `App.tsx` |
| Earnings guide | New `src/pages/EarningsGuide.tsx`, route in `App.tsx` |
| Email gate on calculator | Modify `src/pages/EarningsCalculator.tsx` |
| Breadcrumbs | Add `<StructuredData type="breadcrumblist">` to pages missing it |
| Internal linking | Modify footer sections in content pages to cross-link |

All new pages follow the existing pattern: SEO component + StructuredData + reusable layout templates.

