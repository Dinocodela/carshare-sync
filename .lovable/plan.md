## Add notes to Earnings & Expenses

Today `host_earnings` has no notes field and `host_expenses` only has a generic `description` (not surfaced as "Notes"). Neither the earnings card nor the expenses card shows notes on the summary view. This plan adds a real notes field to both and surfaces it on the card before the ⋯ menu.

### 1. Database
Migration:
- `ALTER TABLE public.host_earnings ADD COLUMN notes text;`
- `ALTER TABLE public.host_expenses ADD COLUMN notes text;` (kept separate from the legacy `description` column so nothing else breaks)

No RLS changes needed — existing host-scoped policies cover new columns.

### 2. Edge functions
- `supabase/functions/create-host-earning/index.ts`: accept optional `notes` in payload; include in insert/update builders.
- `supabase/functions/create-host-expense/index.ts`: accept optional `notes`; include in insert/update builders.

### 3. Forms (Host Car Management)
In `src/pages/HostCarManagement.tsx`:
- Extend `earningSchema` and `expenseSchema` with `notes: z.string().max(1000).optional()`.
- Add a "Notes" textarea (optional) at the bottom of the earning dialog and the expense dialog.
- Wire default values from the row being edited; pass `notes` through to the edge function calls.

### 4. Cards (visible before ⋯ menu)
- Earnings card in the Earnings tab: if `notes` is set, render a small block under the existing meta rows — muted label "Notes", clamped to 2 lines with `line-clamp-2`, full text visible in the edit dialog.
- Expenses card in the Expenses tab: same treatment.
- Style: `text-xs text-muted-foreground` label + `text-sm text-foreground` body, respects the Luxury Concierge tokens (no hardcoded colors).

### 5. Types
`src/integrations/supabase/types.ts` regenerates automatically after the migration; the new `notes` fields become typed. Local `Earning` / `Expense` interfaces in `HostCarManagement.tsx` get a `notes?: string | null` field.

### Out of scope
- Client-side visibility of host notes (notes stay host-only, matching existing RLS on host_earnings/host_expenses).
- Editing notes inline on the card (still done via the existing edit dialog).
- Migrating existing `host_expenses.description` values into the new `notes` column.

### Technical notes
- Paginated fetchers (`get_host_earnings_page`, `get_host_expenses_page`) use `SELECT *`, so `notes` flows through with no RPC change.
- No changes to Claims, Analytics, or client-facing screens.
