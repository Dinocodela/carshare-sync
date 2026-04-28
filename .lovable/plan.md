I’ll add a month filter to `/client-analytics` so you can filter analytics by car, year, and month.

## What will change

### 1. Add a Month dropdown next to the Year filter
In the analytics header controls, I’ll add:
- **All Months**
- January through December

The month filter will work together with the existing car and year filters.

### 2. Filter the portfolio and per-car data by month
The selected month will apply to:
- Overview summary cards
- Per-car summary cards
- Earnings chart
- Expense breakdown
- Recent trips
- Recent claims
- Comparison data where it uses the same analytics dataset

### 3. Keep behavior simple
- Default: current year + **All Months**
- If the user selects a specific month, results will show only that month in the selected year.
- If the user switches Year to **All Time**, the month filter will reset/disable because “March across all years” could be confusing.

## Technical details

I’ll update:
- `src/hooks/useClientAnalytics.tsx`
  - Add `selectedMonth` state.
  - Apply month date ranges to `host_earnings`, `host_expenses`, and `host_claims` queries.
  - Return `selectedMonth` and `setSelectedMonth`.

- `src/hooks/usePerCarAnalytics.tsx`
  - Add the same month filtering so per-car performance uses the same selected month.
  - Make sure the selected car cards and charts are based on the filtered month.

- `src/pages/ClientAnalytics.tsx`
  - Add the Month dropdown beside the Year dropdown.
  - Reset month when selecting “All Time.”
  - Pass the month filter into both analytics hooks.

## Date handling

For timestamp fields like `earning_period_start`, I’ll use month start/end ranges with proper time boundaries. For date-only fields like `expense_date` and `incident_date`, I’ll use date-only start/end strings. This keeps the filter accurate and avoids timezone/off-by-one issues.