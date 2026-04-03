

## Earnings Calculator for Potential Clients

### What We're Building
A public-facing "Earnings Calculator" page where potential car owners can input their vehicle details and get an estimated monthly earnings range. The calculator will use real historical data from your platform to provide credible projections.

### How It Will Work

The user selects their Tesla model, year range, and expected availability. The calculator displays estimated monthly earnings (low/mid/high range) based on your actual rental data. It will also show a CTA to register.

### Data Approach

Your actual data provides strong baselines per model:
- **Model 3** (2022): ~$2,100/mo avg across 166 trips
- **Model Y** (2022): ~$2,000/mo avg across 98 trips  
- **Model X** (2021): ~$1,800/mo avg across 32 trips
- **Cybertruck** (2024): ~$1,800/mo avg across 34 trips
- **Model Y** (2023): ~$1,260/mo avg across 25 trips

We'll hardcode these benchmarks (no live DB queries on a public page) and apply multipliers for availability percentage.

### Plan

1. **Create `src/pages/EarningsCalculator.tsx`**
   - Public page with car model selector (Model 3, Model Y, Model X, Model S, Cybertruck)
   - Year range selector (2018-2025)
   - Availability slider (50%-100%, default 80%)
   - Results card showing Low / Average / High monthly estimates
   - Earnings are scaled by availability (e.g., 80% availability = 80% of full-time average)
   - "Get Started" CTA button linking to registration
   - SEO component for discoverability

2. **Add route in `src/App.tsx`**
   - Public route at `/earnings-calculator`

3. **Link from landing page**
   - Add a "Calculate Your Earnings" button/link on the Index page hero or feature section

### Technical Details

- Benchmark data stored as a static TypeScript map keyed by `model + yearBucket`
- Year buckets: 2018-2020, 2021-2022, 2023-2025 (to smooth sparse data)
- Low estimate = 70% of average, High estimate = 130% of average
- All values scaled by availability slider
- Host commission (default 30%) deducted to show owner's net take-home
- Mobile-responsive layout using existing Card, Select, Slider components
- No database queries needed — purely client-side calculation

