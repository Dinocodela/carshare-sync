## Problem
Some claims have status `paid` (e.g. the one showing $2941.00 Amount Paid), but the **Claim Status** filter only offers All statuses / Pending / Approved / Rejected — so paid claims can't be filtered. The filter logic itself already works (it matches `claim_status` exactly); only the dropdown option is missing.

## Change
In `src/pages/HostCarManagement.tsx`, add a `<SelectItem value="paid">Paid</SelectItem>` option to both **filter** dropdowns bound to `claimsFilters.claimStatus`:

- Desktop filter dropdown (~line 6232–6236)
- Mobile/sheet filter dropdown (~line 6811–6814)

The claim-editing form's status `Select` (the one bound to `claimForm` `claim_status`) is left unchanged, since this request is only about filtering.

No backend, schema, or filter-logic changes are needed — the existing equality filter (`claim.claim_status === claimsFilters.claimStatus`) already handles `paid` once the option is selectable.
