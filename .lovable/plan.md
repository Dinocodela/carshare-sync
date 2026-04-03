

# Phase 4: Tax/Business FAQs + Ad Landing Page Infrastructure

## What We're Building

Two things:
1. **New FAQ entries** about tax write-offs and business advantages of renting out vehicles through Teslys
2. **Ad-optimized landing page** at `/get-started` designed as a conversion-focused destination for Google/Meta ad campaigns

---

## 1. Add Tax & Business Owner FAQ Entries

Add 4-5 new questions to the existing FAQ page covering:

- **"What tax deductions can I claim when renting my Tesla?"** — depreciation (Section 179 & bonus depreciation), mileage/actual expenses, insurance, cleaning, maintenance, management fees, and home office if applicable
- **"Can I write off my Tesla as a business expense?"** — if used for rental income, the vehicle qualifies as a business asset; mention LLC/S-Corp structuring benefits
- **"What are the advantages for business owners listing their Tesla with Teslys?"** — passive income stream, fleet diversification, all management handled, analytics for bookkeeping, potential to offset car payments entirely
- **"Should I form an LLC for my Tesla rental business?"** — liability protection, tax flexibility, separating personal/business finances; recommend consulting a CPA
- **"Does Teslys provide reports I can use for taxes?"** — yes, earnings/expense dashboard with exportable data for Schedule C or business tax filings

These get added to the existing `faqs` array in `src/pages/FAQ.tsx` and automatically included in the FAQ structured data for Google rich snippets.

## 2. Ad Landing Page (`/get-started`)

A dedicated, distraction-free landing page optimized for paid traffic (Google Ads, Meta Ads):

- **No navigation/sidebar** — clean, focused layout to minimize bounce
- **Hero section**: bold headline ("Turn Your Tesla Into a Tax-Deductible Income Machine"), subheadline about passive income + tax benefits
- **3 value props**: Earn $1,500-$3,000+/mo, Tax deductions on your vehicle, We handle everything
- **Social proof**: testimonial quotes or stats (e.g., "500+ Teslas managed")
- **Single CTA**: "Get Started" button → links to `/register/client`
- **SEO tags** targeting "rent my Tesla for income", "Tesla tax write off rental"
- **UTM-aware**: reads `utm_source`, `utm_campaign` from URL params and stores them in localStorage for attribution tracking when user eventually registers

### Files affected:
- **Edit**: `src/pages/FAQ.tsx` — add 4-5 new FAQ entries
- **Create**: `src/pages/GetStarted.tsx` — ad landing page
- **Edit**: `src/App.tsx` — add `/get-started` route
- **Edit**: `public/sitemap.xml` — add new URL

