

# New SEO Landing Page: "Tesla Rental Near Me"

## Overview
Create a new optimized landing page at `/tesla-rental-near-me` targeting the keyword "tesla rental near me". This is a renter-facing page (unlike most existing pages which target car owners/hosts), positioned to capture high-intent local search traffic and direct users to book on Teslys.

## SEO Metadata
- **Title**: Tesla Rental Near Me | Rent a Tesla Today | Teslys (54 chars)
- **Meta**: Rent a Tesla near you with Teslys. Browse Model 3, Model Y, and Model X vehicles. Daily, weekly, and monthly rates with delivery to your door. (148 chars)
- **H1**: Tesla Rental Near Me — Find and Rent a Tesla Today

## Page Sections (~900 words total)
1. **Hero/CTA above the fold** — H1, subheadline emphasizing convenience and delivery, primary CTA to browse vehicles on eonrides link, secondary CTA to earnings calculator
2. **Available Tesla Models** — Model 3 (affordable), Model Y (versatile SUV), Model X (luxury) cards with daily rates and key specs
3. **Pricing Options** — Daily, weekly, monthly rate comparison table with savings percentages
4. **How It Works** — 4-step process: Browse, Verify, Pick Up/Delivery, Drive
5. **Charging & Tesla Superchargers** — Info about Tesla Supercharger network, charging tips, range by model
6. **Terms and Conditions Overview** — Insurance, mileage policy, age requirements, cancellation
7. **FAQ Section** — 6 questions covering cost, insurance, mileage, availability, charging, delivery (with JSON-LD FAQ schema)
8. **Bottom CTA** — Strong conversion section
9. **Footer** with internal links

## Internal Links
- Links to `/tesla-monthly-rental` and `/tesla-rental-cost` (existing pages — mapped from the requested `/rent-tesla-month` and `/rent-tesla-day`)
- Links to model-specific pages, city pages, earnings calculator, and blog

## Technical Details

**File to create:**
- `src/pages/TeslaRentalNearMe.tsx` — follows the same pattern as `TeslaMonthlyRental.tsx` with nav, SEO component, JsonLd for FAQ schema, content sections, newsletter signup, and footer

**File to edit:**
- `src/App.tsx` — add route `/tesla-rental-near-me` before the `/:slug` catch-all
- `public/sitemap.xml` — add new URL entry

**Keywords naturally woven in:** "tesla rental near me" (H1 + 2-3 times in body), "rent a tesla", "tesla vehicles", "tesla superchargers", "car rental", "charging stations" — all used naturally without stuffing.

