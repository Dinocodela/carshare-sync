I’ll fix the analytics so utilization and risk score reflect how the car was actually rented during the selected period, especially for long rentals like Black Beauty.

## What is wrong right now

### Utilization
The current per-car utilization only counts the start date of each earning record. That makes a 30-day rental count as 1 active day instead of roughly 30 active days.

Example:
```text
Rental: Feb 28 → Mar 29
Current logic: 1 active day
Correct logic: count every rented calendar day in the selected period
```

It also compares against the last 30 days from today, even when the dashboard is filtered to a specific month or year. That makes filtered analytics misleading.

### Risk score
The current risk score depends heavily on that incorrect utilization number, so long rentals can look under-utilized and riskier than they really are. It also does not explain enough about why a car received that score.

## Planned fix

### 1. Calculate active rented days from trip date ranges
I’ll update per-car analytics to count every calendar day between `earning_period_start` and `earning_period_end`, clipped to the selected filter period.

So if a trip runs across two months:
```text
Trip: Feb 28 → Mar 29
March filter: counts Mar 1–Mar 29
February filter: counts Feb 28 only
Year filter: counts the full trip days inside that year
```

This will make long rentals correctly show high active days and utilization.

### 2. Make utilization period-aware
I’ll change utilization to:
```text
Utilization = active rented days in selected period / total days in selected period
```

Examples:
- March selected: active days / 31
- April selected: active days / 30
- Full 2026 selected: active days / 365
- All Time: active days / span between first trip start and last trip end

This means if Black Beauty was rented almost the whole month, utilization should be near 100%, not a low number.

### 3. Fix date filtering for trips that overlap the selected month
Right now the query only includes earnings where `earning_period_start` falls inside the selected month. That can miss rentals that started in a previous month but continued into the selected month.

I’ll update the earnings query to include trips that overlap the selected period:
```text
trip_start <= period_end AND trip_end >= period_start
```

That way a rental from Feb 28 to Mar 29 appears in March analytics.

### 4. Rework risk score to be more investor-friendly
I’ll adjust risk score so it is based on clearer factors:
- Claims count and claim amount
- Negative true net profit after fixed costs
- Low utilization during the selected period
- Low or negative profit margin

Because utilization will be corrected, risk score should become much more realistic for long active rentals.

### 5. Improve tooltips and recommendation language
I’ll update the utilization and risk explanations to make the formulas clear:
- Utilization: “rented days divided by days in selected period”
- Risk Score: “0–100 estimate based on claims, true net profit, profit margin, and utilization; lower is better”

I’ll also include a clearer reason in the recommendation text, such as:
```text
Strong utilization and positive true net profit. Continue current strategy.
```
or
```text
Good utilization, but fixed costs are causing negative true net profit.
```

### 6. Fix the current TypeScript build error
There is also a current build error in `HostAnalytics` because the shared summary card type now expects `totalFixedCosts` and `trueNetProfit`. I’ll add safe defaults there so the project builds cleanly.

## Files I’ll update

- `src/hooks/usePerCarAnalytics.tsx`
  - Correct overlapping trip filtering
  - Count rented days across full trip ranges
  - Make utilization period-aware
  - Recalculate risk score from corrected metrics

- `src/hooks/useClientAnalytics.tsx`
  - Apply the same overlapping trip filter to fleet-level analytics
  - Improve active day counting for summary cards

- `src/components/analytics/PerCarSummaryCards.tsx`
  - Update utilization/risk tooltip wording

- `src/components/analytics/CarPerformanceCard.tsx`
  - Update displayed utilization/risk labels/tooltips if needed

- `src/pages/HostAnalytics.tsx`
  - Fix the missing `totalFixedCosts` and `trueNetProfit` fields causing the build error

## Result

Black Beauty and other long-rented cars should show utilization that matches actual rented days, and the risk score should stop penalizing cars simply because a long rental was stored as one earning record.