
# Unified Account + Investor Portal

Two coordinated phases. Phase 1 restructures auth so every login can switch between Client, Host, and Investor workspaces. Phase 2 builds out the Investor Portal end-to-end.

---

## Phase 1 — Unified login & role switcher

### Behavior

- One signup form. No more "Register as Client" vs "Register as Host" split.
- Every user is auto-granted **all three capabilities**: client, host, investor.
- After login, a Turo-style **workspace switcher** lives in the header showing the active workspace. Switching swaps nav, routes, and dashboard.
- The first time a user enters a workspace (or any time from the switcher), they land on a **role landing page** explaining what that workspace is for and what they can do — then a "Continue to dashboard" CTA.
- Host workspace still requires admin approval before it unlocks data entry — landing page shows "pending approval" state instead of CTA when not yet approved. (Confirm if you'd rather skip approval entirely now that everyone is a host by default.)

### Data model

- New table `user_roles` (`user_id`, `role` enum: `client | host | investor`, `status` enum: `active | pending | suspended`, `activated_at`). Roles live here, not on `profiles`. Backfill: insert `client` + `host` + `investor` rows for every existing user; preserve current `account_status` on the host row.
- New `active_workspace` column on `profiles` (default `client`) so we remember the last-used workspace per device/login.
- Keep `profiles.role` for now but deprecate reads; security-definer `has_role(uid, role)` helper used in all new RLS.
- New `landing_seen` jsonb on `profiles` to track which role landing pages a user has dismissed.

### UI changes

- Delete `RegisterClient` / `RegisterHost` split — single `/register` page.
- New `WorkspaceSwitcher` component in the top nav (avatar dropdown style, Turo-like): shows current workspace + lets user pick another. Persists choice in `profiles.active_workspace`.
- New `WorkspaceProvider` context wraps the app and exposes `activeWorkspace` + `switchWorkspace()`. All `RequireRole` guards read from this context.
- Three new landing pages: `/welcome/client`, `/welcome/host`, `/welcome/investor`. Shown on first entry into a workspace and always reachable from the switcher.
- Routes reshuffled under workspace prefixes: `/client/*`, `/host/*`, `/investor/*`. Old routes 301 inside the app to the new ones to preserve bookmarks.

### Migration of existing accounts

- One-time SQL migration grants every existing user the three roles.
- Existing host approval state migrated onto the host role row.
- Default `active_workspace` set from current `profiles.role`.

---

## Phase 2 — Investor Portal

Built against the spec in your PDF.

### Database

New tables (all RLS'd, investors see only their own rows; super_admin sees all):

- `investor_vehicles` — pool of vehicles available for investment (make, model, year, vin, mileage, condition, location, status, purchase_price, estimated_resale_value, photos[]).
- `investments` — `investor_id`, `vehicle_id`, `amount` (default 50000), `monthly_return` (default 1000), `start_date`, `end_date` (start + 50 months), `months_completed`, `total_returns_paid`, `resale_upside_pct` (default 50), `status` (pending/active/completed/sold), `stripe_payment_intent_id`.
- `investment_payouts` — `investment_id`, `payout_month`, `amount`, `payout_date`, `method`, `status`.
- `investment_resales` — `investment_id`, `resale_date`, `resale_price`, `investor_upside_amount`, `payout_status`.
- `investor_payout_settings` — bank/check info per investor, tax info for 1099.

### Payments

- Enable Lovable's built-in Stripe payments (no key needed from you).
- One-time payment per vehicle ($50K). Fees absorbed — we add the Stripe fee on top in the charge.
- Edge function `create-investment-checkout` creates the Stripe Checkout Session.
- Edge function `stripe-webhook` listens for `payment_intent.succeeded` and flips investment status pending → active, sets `start_date = now()`.

### Investor screens

1. `/investor` dashboard: totals (invested, returns to date, projected remaining), active vehicle count, performance line chart.
2. `/investor/marketplace`: browseable vehicle cards with terms ($50K → $1K × 50 + 50% resale upside), availability badges, "Invest" CTA.
3. `/investor/checkout`: cart summary, billing address, Stripe Checkout redirect.
4. `/investor/portfolio`: list of owned investments with thumbnail, progress (months elapsed / 50), returns received, est. resale.
5. `/investor/vehicles/:id`: vehicle detail — photos, timeline progress bar, monthly payout history table, maintenance feed, utilization stats, resale projection.
6. `/investor/payouts`: payout history table, download receipts (PDF), payout settings, tax docs (1099 placeholder for now).
7. `/investor/settings`: payout method, tax info, notifications.

### Admin (super_admin) screens

Under existing admin area, new "Investors" section:

- Investors list — search/filter, view detail, send message, export CSV.
- Vehicles pool — add/edit/retire, assign to investor, mark sold + record resale (auto-creates `investment_resales` row + payout).
- Payout runs — monthly batch UI to mark payouts paid, with optional Stripe transfer hook later.
- Financial overview — capital raised, returns paid, outstanding obligations.

### Automation

- Daily pg_cron job: for each `active` investment past its next payout date, insert a `pending` row into `investment_payouts`. Admin marks paid (or future automated bank rail).
- Resend transactional emails: investment confirmation, monthly payout notice, resale payout notice, tax doc ready.

### Out of scope for v1 (flag for later)

- Auto-reinvest, secondary market (investor-to-investor transfers), multi-currency, referral program, native mobile app.

---

## Technical notes

```text
auth.users
  └── profiles (active_workspace, landing_seen)
        └── user_roles (client|host|investor, status)
              └── investments → investment_payouts → investment_resales
                                investor_vehicles
                                investor_payout_settings
```

- All new RLS uses `has_role(auth.uid(), 'investor')` etc. — never the old `profiles.role`.
- Workspace switching is purely a client-side context change; auth/JWT does not change. Server-side authorization always re-checks `user_roles`.
- Stripe is the new seamless Lovable integration, not BYOK.
- Existing host subscription gating (RevenueCat) stays untouched on the host workspace.

---

## Suggested build order

1. Migration: `user_roles` table, backfill, helpers, RLS updates.
2. `WorkspaceProvider` + header switcher + landing pages.
3. Collapse signup into one form; delete role-specific register pages.
4. Phase 2: investor tables + RLS + admin pool management.
5. Stripe enable + checkout + webhook.
6. Investor dashboard / portfolio / vehicle detail.
7. Payouts (cron + UI) + emails.
8. Admin investor management + financial overview.

Confirm and I'll start with Phase 1.
