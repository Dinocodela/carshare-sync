# Make the Client (Owner) Dashboard Come Alive

The owner dashboard currently shows one number ("$619 this month"), three small counters, quick actions, and two mostly-empty lists. This plan adds real, motivating numbers that show owners their car is performing — and nudges them toward adding a second vehicle.

Scope: client/owner workspace only. Host view stays as it is. No changes to earnings math — all figures reuse the existing breakdown logic (gross − platform fee − management fee, expenses matched by trip).

## What the owner will see

1. **Hero band (upgraded)**
   - Keeps "This month" total, adds a small comparison line: "+18% vs last month" (or "—" when there's no prior data).
   - Adds a second figure: **Lifetime earnings** paid to date.

2. **Performance strip (new, replaces the 3 thin counters)**
   Four tiles with real numbers, each tappable to Analytics:
   - Earned this year (YTD payouts)
   - Lifetime earnings
   - Days rented this month + utilization % (days rented ÷ days in month)
   - Average per trip

3. **Earnings trend (new)**
   A compact 6-month bar chart of monthly payouts with the best month highlighted and labeled ("Best month: $1,940 · March"). Uses the chart components already in the project.

4. **Per-vehicle performance card (new)**
   For each of the owner's cars: name/plate, earned this month, earned lifetime, days rented, and a thin progress bar for utilization. With one car this still fills the page and sets up the "add another" pitch.

5. **"Add another Tesla" growth card (new)**
   Personalized from their own data: "Your Model Y has earned $X in Y months — averaging $Z/month. A second vehicle could roughly double that." Primary button → `/add-car`. Only shown when the owner has at least one paid earning; falls back to generic copy otherwise.

6. **Milestones row (new)**
   Small achievement chips derived from real data: first payout, $1K / $5K / $10K lifetime earned, 10 / 25 / 50 trips hosted, X months with Teslys. Earned ones are gold-accented, the next one shows progress ("$3,140 / $5,000").

7. **Empty states with purpose**
   - No current trips → "No trips right now — your car is available and listed."
   - No activity → shows the last payout instead of "nothing new", when one exists.

## Design

Follows the existing dashboard language (rounded-2xl cards, teal gradient hero, soft borders), with the Luxury Concierge tokens: teal accents, gold used only for milestone chips and the trend highlight. Numbers use tabular figures, semibold. Fade-in reveals continue the existing stagger. Mobile-first — the performance strip is 2×2 on phones, 4-up on desktop.

## Technical notes

- New hook `useClientDashboardStats` (client workspace only) that fetches from `client_visible_earnings` + `host_expenses` for the owner's car IDs once, then derives: this month, last month, YTD, lifetime, per-month series (last 6), per-car totals, days rented (reusing `getActiveRentalDays` from `src/lib/analyticsDateRanges.ts`), trip count, and average per trip.
- Payout math reuses the current client formula in `Dashboard.tsx` (`getTripExpensesTotal` + `client_profit_percentage`) — extracted into one shared helper so the hero, tiles, chart, and per-car card can't drift apart.
- Only paid earnings count toward lifetime/YTD/milestones, matching the existing "Recent Activity is payouts received" rule. Date strings get the `T00:00:00` suffix before Date conversion.
- Dashboard sections split into small components under `src/components/dashboard/` to keep `Dashboard.tsx` manageable.
- Skeletons while loading; no layout shift.
- No new tables, routes, or edge functions.
