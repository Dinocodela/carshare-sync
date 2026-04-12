

# SEO & GEO Improvement Strategy for Teslys.app (Semrush-Guided)

## Current State Assessment

Your site already has solid foundations: structured data (Organization, LocalBusiness, FAQ, BreadcrumbList), 40+ programmatic pages, GTM tracking, and a sitemap. Here's what to prioritize next, organized by impact.

---

## Priority 1 — Technical SEO Fixes (Quick Wins)

These are issues Semrush's Site Audit will flag immediately:

1. **Fix canonical tag in index.html** — Currently `<link rel="canonical" href="/" />` (relative). Must be absolute: `https://teslys.app/`
2. **Duplicate meta tags** — `index.html` has hardcoded OG/description tags AND the React `<SEO>` component injects them dynamically, causing duplicates. Remove the static ones from `index.html` and let React handle them.
3. **Missing hreflang** — Not critical yet but good practice if you plan international expansion.
4. **robots.txt enhancement** — Add `Disallow` rules for app-only routes (dashboard, settings, my-cars, etc.) that shouldn't be indexed.
5. **Sitemap automation** — Currently hand-maintained. Generate it at build time from the route config so new pages are never missed.

## Priority 2 — On-Page SEO Improvements

6. **Add `alt` text audit** — Ensure all images across landing pages have descriptive, keyword-rich alt attributes.
7. **Internal linking mesh** — Your pages link sparsely. Add a "Related Pages" section to every landing page (city pages link to model pages, model pages link to city pages, intent pages link to both).
8. **Heading hierarchy** — Audit all pages for proper H1 > H2 > H3 nesting. Some pages may skip levels.
9. **Page speed** — Lazy-load below-fold sections and images. Add `loading="lazy"` and consider code-splitting heavy pages.

## Priority 3 — Content & Keyword Gaps

10. **Blog internal links** — Each blog post should link to 2-3 money pages (earnings calculator, get-started, city pages). Currently blog posts likely have no internal links.
11. **New content clusters** based on Semrush keyword gaps:
    - "Tesla rental insurance" — dedicated page
    - "Turo vs Teslys" — expand the existing comparison page
    - "How to list your Tesla on Turo" — informational content that funnels to Teslys
    - "Electric car rental business" — broader funnel-top content
12. **FAQ expansion** — Add FAQ schema to every landing page (city pages, model pages) not just the main FAQ page.

## Priority 4 — GEO (Generative Engine Optimization)

This is about being cited by AI search engines (ChatGPT, Perplexity, Google AI Overviews):

13. **Entity-first structured data** — Your Organization and LocalBusiness schemas are good. Add `sameAs` links to any real social profiles, Crunchbase, LinkedIn company page.
14. **Authoritative "About" content** — Add founder bios with credentials, company founding date, and specific operational metrics (e.g., "managing 200+ Teslas across 14 cities").
15. **Cite-worthy statistics** — Create a `/tesla-rental-statistics` or `/tesla-sharing-report` page with original data (average earnings by city, booking rates, etc.). AI engines love citing original research.
16. **Clear, concise answers** — Structure FAQ answers as direct 1-2 sentence responses followed by detail. AI engines extract the first sentence.
17. **Topical authority** — Increase blog frequency and cover every angle of Tesla rentals so AI engines recognize Teslys as the authority on this topic.

## Priority 5 — Tracking & Measurement in Semrush

18. **Set up Position Tracking** in Semrush for your top 50 keywords
19. **Connect Google Search Console** to Semrush for real impression/click data
20. **Run Site Audit weekly** and track score improvements
21. **Set up Backlink monitoring** — Start building backlinks from EV blogs, local business directories, and automotive review sites

---

## Recommended Implementation Order

| Phase | Tasks | Impact |
|-------|-------|--------|
| Week 1 | Fix canonical, remove duplicate meta, update robots.txt | High (technical health) |
| Week 2 | Add FAQ schema to all city/model pages, internal linking mesh | High (rich snippets + crawl equity) |
| Week 3 | Create statistics page, enhance About page for GEO | Medium (AI visibility) |
| Week 4 | New content pages (insurance, Turo guide), blog internal links | Medium (keyword coverage) |
| Ongoing | Weekly blog posts, Semrush position tracking, backlink outreach | Compounding |

## Technical Details

**Files to edit:**
- `index.html` — fix canonical, remove duplicate meta tags
- `public/robots.txt` — add Disallow rules for app routes
- `src/components/StructuredData.tsx` — minor schema improvements
- `src/components/marketing/CityLandingPage.tsx` — add FAQ schema + cross-links
- `src/components/marketing/ModelCityLandingPage.tsx` — add FAQ schema + cross-links
- `src/components/marketing/ModelDetailPage.tsx` — add FAQ schema + cross-links
- Multiple landing pages — add "Related Pages" internal linking sections

**Files to create:**
- `src/pages/TeslaRentalStatistics.tsx` — original data page for GEO
- `src/pages/TeslaRentalInsurance.tsx` — new keyword target
- Build-time sitemap generation script

