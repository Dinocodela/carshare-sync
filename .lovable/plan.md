

## Plan: Fix Dashboard Earnings and Activity Using Correct Date Column

### Problem
Two bugs on the Dashboard:

1. **"$0 This month"** — The earnings query filters on `payment_date`, but the app stores paid dates in `date_paid`. Since `payment_date` is always null, the query returns zero results.
2. **Activity feed showing $0 payouts** — Same root cause: the activity feed checks `e.payment_date` to determine if a payout exists, which is always null.

Both affect host AND client views.

### Root Cause
The `create-host-earning` edge function and the earning edit form both write to the `date_paid` column. The `payment_date` column is never populated. The Dashboard queries reference the wrong column.

### Changes

**File: `src/pages/Dashboard.tsx`**

1. **Host earnings query (line ~265):** Change `.select(...)` to include `date_paid` instead of `payment_date`, and change `.gte("payment_date", ...)` to `.gte("date_paid", ...)`

2. **Client earnings query (line ~278):** Same fix — select `date_paid` and filter `.gte("date_paid", ...)`

3. **Recent activity hook (line ~108):** Change the select to include `date_paid` instead of `payment_date`, and update the activity mapping (line ~155) to check `e.date_paid` instead of `e.payment_date`

### Technical Details
```
// Before (broken)
.select("amount, host_profit_percentage, payment_status, payment_date")
.gte("payment_date", from.toISOString())

// After (fixed)
.select("amount, host_profit_percentage, payment_status, date_paid")
.gte("date_paid", from.toISOString())
```

Same pattern applied to client query and activity feed.

