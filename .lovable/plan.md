I’ll add clear explanations to the analytics cards so users understand exactly what each number means and how it is calculated.

## What will change

### 1. Add a small info legend on every analytics card
Each card will show an info/help indicator near the icon/title. On desktop, hovering will open the explanation. On mobile/app, tapping the icon/info indicator will show the same explanation.

This applies to:
- Total Earnings
- Fixed Costs / Total Expenses
- True Net Profit / Net Profit
- Profit Margin
- Active Days
- Total Trips
- Average Per Trip
- Utilization
- Risk Score
- Claims-related cards where shown

### 2. Use plain-language explanations
Examples of the wording I’ll add:

- **Total Earnings**: “Your share after trip-related expenses are deducted and your profit split is applied. This is not the full guest payment.”
- **Fixed Costs**: “Monthly fixed costs you entered for this car, such as car payment, insurance, subscriptions, or other recurring costs.”
- **True Net Profit**: “Total Earnings minus monthly fixed costs.”
- **Profit Margin**: “True Net Profit divided by Total Earnings, shown as a percentage.”
- **Active Days**: “Unique days with recorded earnings/trips in the selected time range.”
- **Total Trips**: “Number of earning records/trips in the selected time range.”
- **Average Per Trip**: “Total Earnings divided by Total Trips.”
- **Utilization**: “How many of the last 30 days had earnings, divided by 30.”
- **Risk Score**: “A 0–100 score based on claims, profitability, and utilization. Lower is better.”

### 3. Keep the design clean and TESLYS-branded
I’ll keep the current card layout, colors, rounded corners, and spacing. The help indicator will be subtle so the dashboard doesn’t feel cluttered, but visible enough that users know they can learn more.

### 4. Make it work across client, host, and per-car analytics
There are two summary-card components:
- `src/components/analytics/SummaryCards.tsx`
- `src/components/analytics/PerCarSummaryCards.tsx`

I’ll update both so the explanations are consistent wherever these metrics appear.

## Technical details

- Use the existing tooltip system in `src/components/ui/tooltip.tsx`.
- Expand the existing `tooltips` support in `SummaryCards` so every metric can have an explanation, not just a few fields.
- Add tooltip explanations directly in `PerCarSummaryCards` using the actual formulas from `usePerCarAnalytics`.
- Preserve mobile compatibility by using button-based tooltip triggers, so tap/focus works in the native app as well as hover on desktop.

## Files to update

- `src/components/analytics/SummaryCards.tsx`
- `src/components/analytics/PerCarSummaryCards.tsx`
- Possibly `src/pages/HostAnalytics.tsx` only if needed to pass more context-specific tooltip text for host earnings.