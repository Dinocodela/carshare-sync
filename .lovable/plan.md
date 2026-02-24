

## Fix: Client Payout Not Deducting Trip Expenses

### Problem

The client's "Your Share" amount is being calculated as:
`earning.amount x client_profit_percentage%`

But the correct formula (already used in the per-car analytics and payout emails) is:
`(earning.amount - trip_expenses) x client_profit_percentage%`

This means the displayed payout is **higher than it should be** because trip-related expenses (tolls, delivery, carwash, EV charging, etc.) are not being subtracted before applying the profit split.

For example, if a trip earned $448.10 with $50 in expenses, the client's 70% share should be:
- Correct: ($448.10 - $50) x 70% = $278.67
- Currently showing: $448.10 x 70% = $313.67

### What Will Be Changed

**3 files need fixing:**

1. **`src/hooks/useClientAnalytics.tsx`** (summary calculation)
   - The `calculateSummary` function will match expenses to earnings by `trip_id`
   - Formula changes from `earning.amount * pct` to `(earning.amount - matched_expenses) * pct`
   - The expenses data is already fetched in this hook, so no additional API calls needed

2. **`src/components/analytics/RecentTrips.tsx`** (trip cards and table)
   - Will accept an `expenses` prop alongside `earnings`
   - Each earning card will look up related expenses by `trip_id` and subtract them before applying the percentage
   - The subtitle will show the net amount (e.g., "70% of $398.10" instead of "70% of $448.10")

3. **`src/components/analytics/EarningsChart.tsx`** (earnings chart)
   - Will accept an `expenses` prop
   - Chart aggregation will subtract matched expenses before applying the percentage

4. **`src/pages/ClientAnalytics.tsx`** (passing expenses to components)
   - Will pass the `expenses` array to `RecentTrips` and `EarningsChart` components

### Technical Details

The expense matching logic (already proven in `usePerCarAnalytics.tsx`) works like this:

```text
For each earning:
  1. Find expenses where expense.trip_id === earning.trip_id
  2. Sum all expense components (amount + toll + delivery + carwash + ev_charge)
  3. Net = earning.amount - total_expenses
  4. Client share = Net x client_profit_percentage / 100
```

A shared helper function will be created to avoid duplicating this logic across files.

### No Database or API Changes Required

All the data needed is already being fetched. The fix is purely in the frontend calculation logic.

