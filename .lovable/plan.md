
## Audit: does the app support an Eon claim marked as paid?

Read-only inspection of the claims data model, edge function, and UI.

### 1) Will `claim_status: "paid"` be preserved?
**Yes.** `host_claims.claim_status` is a free-form `text` column (no CHECK constraint, no enum). The `upsert-claim` edge function (`supabase/functions/upsert-claim/index.ts`, line 153) writes `claim_status: payload.claim_status || "pending"` verbatim, so `"paid"` is stored as-is. Same for `is_paid: true` (line 155). No trigger rewrites it.

### 2) Does the UI display paid vs approved?
**Partially — inconsistent across the app.**

- ✅ Host management list (`src/pages/HostCarManagement.tsx` line 7354): explicitly checks `claim.is_paid || claim.claim_status === "paid"` and renders a distinct "Paid" badge. Filter tabs (line 996-1001) also treat paid separately from approved. This screen is correct.
- ✅ `ClaimsSummary` (client analytics, line 64): counts `paidAmount` off `is_paid === true`. Works.
- ⚠️ `RecentClaims` (`src/components/analytics/RecentClaims.tsx` line 20-31): `getStatusBadge` only styles `pending | approved | denied | closed`. A `"paid"` status falls through to the neutral muted style and just renders the raw label "Paid" — technically visible but has no dedicated color/icon and the surrounding component ignores `is_paid`.
- ⚠️ `useHostAnalytics.tsx` line 283-285 and `useClientAnalytics.tsx` line 293-295 bucket claims only by `approved` / `pending` — a paid claim is neither counted as pending nor called out as paid in those aggregates (it silently drops out of the "approved" bucket once status flips to "paid", though `is_paid` amounts are surfaced separately in `ClaimsSummary`).
- ⚠️ `get_host_claims_page` RPC already handles `p_claim_status = 'paid'` (treats `is_paid=true OR claim_status='paid'` as paid), so the server-side filter matches HostCarManagement's client-side logic.

Net: the host management screen shows Paid correctly; analytics widgets show Paid amount but Recent Claims / status pies don't have first-class Paid styling.

### 3) Is `date_paid` accepted/stored?
**No.**

- DB: `host_claims` has **no `date_paid` column** (confirmed via `information_schema` — columns are id, host_id, car_id, claim_type, claim_status, claim_amount, description, incident_date, claim_number, created_at, updated_at, accident_description, photos_taken, trip_id, payment_source, guest_name, is_paid, incident_id). `date_paid` exists on `host_earnings`, not on claims.
- Edge function: `ClaimPayload` interface (lines 8–22) does not declare `date_paid`, and `claimData` (lines 138–156) does not include it. Any `date_paid` sent by the automation is silently dropped.
- Types: `src/integrations/supabase/types.ts` `host_claims` Row/Insert/Update (lines 879–938) confirm the absence.

### 4) Files that need changes to fully support this
Only needed if you want `date_paid` persisted and paid-status treated as first-class everywhere:

1. **DB migration** (new) — add `date_paid date null` to `public.host_claims` (plus optional index if you'll filter/sort by it).
2. `supabase/functions/upsert-claim/index.ts` — add `date_paid?: string` to `ClaimPayload` and include `date_paid: payload.date_paid || null` in `claimData`.
3. `src/integrations/supabase/types.ts` — regenerated automatically after the migration; no hand edit.
4. `src/components/analytics/RecentClaims.tsx` — add a `paid` case in `getStatusBadge` (emerald/primary style) and optionally show `date_paid` next to "Filed …".
5. `src/components/analytics/ClaimsSummary.tsx` — add a "Paid" slice/legend entry so the pie reflects `paid` distinctly (currently paid claims are colored via the fallback `hsl(var(--muted))`).
6. `src/hooks/useHostAnalytics.tsx` and `src/hooks/useClientAnalytics.tsx` — extend the aggregation to count `paid` claims (and optionally expose `date_paid`) alongside approved/pending.
7. `src/pages/HostCarManagement.tsx` — optional: surface `date_paid` on the claim card (line ~7354 area) and in the edit form (mirroring the earnings `date_paid` field already at line 4481/5507).
8. `src/hooks/usePerCarAnalytics.tsx` (line 123 area) — include the new column in the select if per-car views should show it.

If you only care that the automation's writes don't error and the paid state shows up somewhere, **items 1 and 2 are the minimum** (persist `date_paid`); the UI already tolerates `claim_status: "paid"` on the primary Host Car Management screen.

### Recommendation
Say the word and I'll switch to build mode to (a) add the `date_paid` column + edge-function field, and (b) give `paid` first-class styling in `RecentClaims` and the analytics aggregates.
