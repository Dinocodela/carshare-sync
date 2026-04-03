

## Plan: Add Advanced Filters to Host Analytics

### What we're building
A filter bar below the trust banner with four additional filters that let hosts slice their analytics data by car, payment source, payment status, and month — all working alongside the existing year filter.

### Changes

**1. Add filter state and car lookup to `useHostAnalytics.tsx`**

- Add `payment_source` to the `HostEarning` interface (already fetched via `select("*")` but not typed)
- Fetch the host's cars from the `cars` table (just `id`, `make`, `model`, `year`) so we can show car names in the filter
- Expose new filter state: `selectedCarId`, `selectedPaymentSource`, `selectedPaymentStatus`, `selectedMonth`
- Apply filters to the earnings/expenses/claims queries (car_id filter at DB level, others client-side for simplicity)
- Recalculate summary when filters change

**2. Add filter bar UI to `HostAnalytics.tsx`**

Below the trust banner, add a responsive filter strip with four `Select` dropdowns:

| Filter | Options | Source |
|--------|---------|--------|
| Car | All Cars / {year make model} per car | `cars` table |
| Source | All Sources / Turo / GetAround / etc. | Distinct `payment_source` from earnings |
| Status | All / Paid / Pending | `payment_status` from earnings |
| Month | All Months / Jan–Dec | Derived from selected year |

- On mobile: 2-column grid of selects
- On desktop: horizontal flex row
- Each filter styled with glassmorphic `bg-card/80 backdrop-blur-sm` to match existing design
- Include a "Clear Filters" button that resets all to "All"

**3. Filter logic**

- Car filter: applied at DB query level (`eq("car_id", ...)`) for efficiency
- Payment source, payment status, month: applied client-side after fetch since data volume is small
- Summary cards, charts, and tables all recalculate based on filtered data
- Month filter only appears when a specific year is selected (not "All Time")

### Files Modified
- `src/hooks/useHostAnalytics.tsx` — add filter state, car fetching, filter application
- `src/pages/HostAnalytics.tsx` — add filter bar UI, pass filters through

