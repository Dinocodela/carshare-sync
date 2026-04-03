

## SEO & Growth Strategy for Teslys

### What you have today

- Landing page with structured data (Organization, Website, Service, LocalBusiness, Software)
- Blog system at `/blog` with published posts
- FAQ page with structured data
- Sitemap (outdated — missing `/blog`, `/register/*`, `/forgot-password`)
- robots.txt
- SEO component on key pages
- Business address and phone in footer + structured data

### What I can build for you (code changes)

#### 1. Local SEO City Landing Pages

Create SEO-optimized pages like `/tesla-car-sharing-los-angeles`, `/tesla-car-sharing-miami`, etc. Each page targets a specific city with:
- Unique H1 and meta tags (e.g., "Tesla Car Sharing in Los Angeles")
- City-specific content about the local market
- LocalBusiness structured data with city-specific `areaServed`
- CTA buttons linking to registration
- Reusable template component so adding new cities is trivial

**Suggested initial cities:** Los Angeles, Miami, San Francisco, New York, Austin, San Diego

#### 2. "How It Works" Page (`/how-it-works`)

A public, crawlable page explaining the process for both clients and hosts with:
- Step-by-step flow with icons
- SEO-rich content targeting "how to rent my Tesla" / "Tesla rental management"
- Structured data (HowTo schema)

#### 3. "About Us" Page (`/about`)

Builds E-E-A-T (Experience, Expertise, Authority, Trust) signals:
- Company story, mission, team
- Address and contact info
- AboutPage structured data

#### 4. Fix Sitemap

Update `sitemap.xml` to include all public routes: `/blog`, `/register/client`, `/register/host`, `/how-it-works`, `/about`, city pages, and set current `lastmod` dates.

#### 5. Add Google Tag Manager / Analytics Snippet

Add a GTM container to `index.html` so you can run Google Ads, Meta Pixel, and conversion tracking without code changes each time.

---

### Ads strategy (guidance, not code)

**Google Ads:**
- **Search campaigns** targeting high-intent keywords: "rent my Tesla," "Tesla car sharing," "earn money with Tesla," "Tesla rental management"
- **Local campaigns** targeting your city pages for geo-specific queries
- Set up conversion tracking (GTM event when someone completes registration)

**Meta/Instagram Ads:**
- Carousel ads showing earnings potential and testimonials
- Target Tesla owner communities, EV enthusiasts, side-hustle audiences
- Retarget website visitors who didn't sign up

**Key metrics to track:** Cost per registration, cost per approved account, client vs. host acquisition cost

---

### Implementation plan (what I'll build)

| Step | Files |
|---|---|
| Create reusable `CityLandingPage` component | `src/components/marketing/CityLandingPage.tsx` |
| Create 6 city page files | `src/pages/cities/*.tsx` |
| Create How It Works page | `src/pages/HowItWorks.tsx` |
| Create About page | `src/pages/About.tsx` |
| Add routes for all new pages | `src/App.tsx` |
| Update sitemap with all public URLs | `public/sitemap.xml` |
| Add GTM snippet to index.html | `index.html` |
| Add new pages to footer navigation | `src/pages/Index.tsx` |

This gives you ~8+ new indexable pages targeting valuable keywords and local search intent, plus the infrastructure to track ad conversions.

