

## Plan: Modernize Edit Expense & Edit Earning Popups + Fix Zero-Clear UX

### Problem
1. **Zero values stay in number inputs** -- when tapping a field showing "0", the zero remains and users must manually delete it before typing. This affects all numeric fields in both Expense and Earning forms (EV Charge, Carwash, Delivery, Toll, Other Expenses, Gross Earnings, Client/Host Profit %).
2. **Both popups (Edit Expense, Edit Earning)** use plain, unstyled form layouts without the glassmorphic, trust-focused design used elsewhere.
3. **Date fields** use native `<input type="date">` instead of the modern Shadcn Calendar/Popover datepicker.

### Changes

**1. Fix "select all on focus" for number inputs (all 4 form instances: mobile+desktop x expense+earning)**

For every `<Input type="number">` field, add an `onFocus` handler that selects all text so tapping/clicking clears the "0" and lets the user type fresh:

```tsx
onFocus={(e) => e.target.select()}
```

This applies to: `ev_charge_cost`, `carwash_cost`, `delivery_cost`, `toll_cost`, `amount` (other expenses), `gross_earnings`, `client_profit_percentage`, `host_profit_percentage`. Across 4 form instances (mobile Sheet + desktop Dialog for each popup) = ~32 input updates.

**2. Modernize Edit Expense popup (both mobile Sheet and desktop Dialog)**

- Add a sticky trust header with Shield icon and title/subtitle
- Group fields into glassmorphic sections (`bg-card/60 backdrop-blur-sm rounded-2xl border border-border/50`):
  - Section 1: "Trip & Vehicle" -- Trip ID, Car selector, Guest Name
  - Section 2: "Cost Breakdown" -- EV Charge, Carwash, Delivery, Toll in 2-col grid + Other Expenses
  - Section 3: "Details" -- Description textarea + Date picker
- Add a secure footer with Lock icon
- Style inputs with `rounded-xl` and section headers with icon + uppercase tracking labels
- Replace `<Input type="date">` with Shadcn Calendar Popover datepicker using `pointer-events-auto`

**3. Modernize Edit Earning popup (both mobile Sheet and desktop Dialog)**

- Same trust header/footer pattern
- Group fields into glassmorphic sections:
  - Section 1: "Trip & Vehicle" -- Trip selector/input, Car, Guest Name
  - Section 2: "Guest Contact" -- Phone, Email
  - Section 3: "Earning Details" -- Earning Type, Payment Source, Gross Earnings
  - Section 4: "Profit Calculation" -- the existing calculation card, styled with glassmorphic treatment + colored dividers
  - Section 5: "Profit Split" -- Client %, Host %
  - Section 6: "Schedule" -- Start Date/Time, End Date/Time (dates via Calendar Popover), Booking Calendar toggle
  - Section 7: "Payment" -- Payment Status, Date Paid (via Calendar Popover)
- Replace all `<Input type="date">` fields with Shadcn Calendar Popover datepickers
- Style the Profit Calculation breakdown with a premium glassmorphic card using colored text for each line

**4. Calendar Popover modernization**

Replace every `<Input type="date" ...>` with:
```tsx
<Popover>
  <PopoverTrigger asChild>
    <Button variant="outline" className="w-full justify-start rounded-xl ...">
      <CalendarIcon className="mr-2 h-4 w-4" />
      {value ? format(new Date(value), "MM/dd/yyyy") : "Pick a date"}
    </Button>
  </PopoverTrigger>
  <PopoverContent className="w-auto p-0" align="start">
    <Calendar mode="single" selected={...} onSelect={...} className="p-3 pointer-events-auto" />
  </PopoverContent>
</Popover>
```

Affected date fields: `expense_date`, `earning_period_start_date`, `earning_period_end_date`, `date_paid`.

### File Modified
- `src/pages/HostCarManagement.tsx` -- all changes in one file

### Technical Notes
- Need to add `format` from `date-fns`, `CalendarIcon` from `lucide-react`, and `Popover`/`PopoverTrigger`/`PopoverContent` + `Calendar` imports
- The `onFocus` select-all pattern is the standard UX fix for numeric inputs that default to 0
- All 4 form variants (mobile expense, desktop expense, mobile earning, desktop earning) will be updated consistently

