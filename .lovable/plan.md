

## Problem Analysis

The three summary cards on the Earnings tab have accuracy and UX issues:

1. **Total Earnings** — sums `e.amount` (gross earnings), not net profit. Should be gross minus trip expenses.
2. **Pending Payments** — same issue, uses gross `amount` for pending records.
3. **This Month** — uses gross `amount` AND has a bug: it only checks `.getMonth()` without comparing the year, so January 2025 earnings would show in January 2026.
4. **No explanation tooltips** — user wants hover tooltips explaining what each number means.

## Plan

### 1. Fix the three summary card calculations (HostCarManagement.tsx ~lines 5031-5060)

For each earning, calculate net amount as `earning.amount - totalTripExpenses` (matching the pattern already used on line 5067-5068 for individual cards). The summary cards will use these net values:

- **Total Earnings**: Sum of `(earning.amount - matchedExpenses)` for all filtered earnings
- **Pending Payments**: Same calculation but only for `payment_status === "pending"`
- **This Month**: Same calculation but filtered to current month AND current year

### 2. Add info icon with hover tooltip to each card

Add a small `Info` (lucide) icon in the bottom-right corner of each card. Wrap it in a `Tooltip` component (already available in the project). Tooltip content:

- **Total Earnings**: "Sum of gross earnings minus trip expenses for all displayed earnings"
- **Pending Payments**: "Sum of net earnings (gross - expenses) for trips with pending payment status"
- **This Month**: "Sum of net earnings (gross - expenses) for trips starting in the current calendar month"

### Files to edit
- `src/pages/HostCarManagement.tsx` — lines ~5031-5060 (summary cards section)

