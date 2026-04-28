Understood. We should keep the field name **Other Expenses** exactly as-is because it may be tied to the automated Turo data flow. The fix should be client-facing explanation only.

## Plan

1. **Keep the existing label**
   - Do not rename `Other Expenses` in the database, host form, API payload, or analytics category.
   - Do not change how the `amount` field is collected from Turo/imports.

2. **Add a custom tooltip for the analytics bar chart**
   - Update the `ExpenseBreakdown` chart so when someone hovers over the **Other Expenses** bar, the popover explains what it means.
   - Suggested copy:

   ```text
   Other Expenses may include Turo long-term rental discounts or guest discounts applied by Turo for monthly/subscription-style rentals. These are platform adjustments to the trip payout, not unexpected charges from Teslys or the host.
   ```

3. **Add the same explanation in the legend/list below the chart**
   - Keep the visible row label as `Other Expenses`.
   - Add a small info icon next to `Other Expenses` only.
   - On hover/tap, show a short peace-of-mind explanation:

   ```text
   This often reflects Turo discounts given to guests on longer rentals. It helps explain the net payout and does not mean the client is being charged extra.
   ```

4. **Make it work on mobile too**
   - Since hover is not reliable on mobile, the info icon should be tappable/focusable.
   - The chart tooltip will still work when tapping the bar if supported, but the legend info icon gives a reliable fallback.

5. **No calculation changes**
   - Total expenses, net trip profit, client profit, true net profit, and per-car analytics remain unchanged.
   - This is only a UI explanation layer.

## Technical details

- Primary file to update: `src/components/analytics/ExpenseBreakdown.tsx`.
- Reuse the existing tooltip components already used in analytics summary cards.
- Replace the generic chart tooltip formatter/content for `Other Expenses` with a custom tooltip that includes explanatory copy only for that category.
- Keep all current category names and existing `amount` summation intact.