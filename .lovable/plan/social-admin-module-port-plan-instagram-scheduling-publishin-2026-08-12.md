# Social Admin Module — Port Plan (Instagram scheduling, publishing, leads CRM)

Plan only. No code changes yet.

## a) Adapting the server boundary to our stack

The source app uses `@tanstack/react-start` server functions (typed RPC callable from React). We have no server runtime — only Supabase edge functions plus direct PostgREST access from the browser via `src/integrations/supabase/client.ts`. The port splits each source server function into one of three buckets:

- **Direct client queries (no edge function).** Anything that is plain CRUD on `social_*` tables where RLS can express the rule: listing/creating/editing posts, calendar reads, leads board reads and stage changes, reply templates, reading automation settings, media asset rows, audit-log reads. These become React Query hooks (`src/hooks/social/*`) hitting Supabase directly, matching how `useCars`/`useInvestor` work today.
- **Edge functions (privileged / secret-bearing / external-API).** Everything that touches Meta, tokens, or must not be trusted to the client:
  - `social-ig-oauth-start` and `social-ig-oauth-callback` (CSRF nonce, token exchange, AES-GCM encryption) — `verify_jwt = false`, admin verified in-code for start, callback is a redirect target.
  - `social-publish` (manual "Publish now" + used by the worker) — auth in code, service-role writes.
  - `social-publish-worker` (cron-invoked, due posts) — shared-secret header, no user JWT.
  - `social-token-refresh` (cron, refresh-before-expiry + expiry warning to Slack/email).
  - `social-webhook` (public: Meta GET verify challenge + POST `X-Hub-Signature-256` verification) — `verify_jwt = false`, no auth header from Meta.
  - `social-data-deletion` (Meta signed_request deletion callback), public.
  - `social-approve` (single + bulk approval): could be client-side, but approval is the legal audit trail, so it runs server-side to stamp `approver_user_id`/`approver_email` from the verified JWT rather than from client input.
- **Postgres functions/triggers.** Audit logging (`social_audit_log`) is written by an `AFTER INSERT/UPDATE` trigger on `social_posts`, `social_leads`, `social_accounts`, `social_automation_settings` capturing before/after JSONB plus `auth.uid()`, so no code path can skip it. Guardrail checks (allowed day/time window, daily cap) live in a `security definer` SQL function used by both the scheduler and the editor's validation.

Auth guard: all `social_*` RLS policies gate on the existing `public.is_super(auth.uid())` admin function (same predicate `RequireRole` uses via `profiles.is_super_admin`), `TO authenticated` only — no `anon` grants on any table or RPC, including status checks. Edge functions re-verify with the `requireAuth` helper in `supabase/functions/_shared/require-auth.ts` and then an explicit `is_super` check.

Cron: `pg_cron` + `pg_net` (already the pattern used for blog automation) invoking `social-publish-worker` every 5 minutes and `social-token-refresh` daily, registered via the insert tool (contains project URL + key), not a migration.

Media: a new **private** `social-media` storage bucket (our existing `car-images` is public — post media should not be). Uploads go through signed URLs; the publish function generates a short-lived signed URL to hand to Instagram's container API.

## b) Naming / foreign-key conflicts with our schema

- No existing table, enum, or function starts with `social_`, so table names are clean. Two adjacent names exist and are unrelated: `push_subscriptions` and `newsletter_subscriptions` (no collision), and `investor_inquiries` (no collision).
- **Enum collision risk:** proposed enum names like `post_status`, `lead_stage`, `account_status` are generic. Prefix all of them: `social_post_status`, `social_post_format`, `social_account_status`, `social_lead_stage`, `social_lead_source`, `social_publish_status`, `social_automation_mode`. Note `profiles.account_status` already exists as a text column — the prefixed enum avoids confusion.
- **Foreign keys:** per project convention, never FK to `auth.users`. `owner_user_id`, `created_by`, `approver_user_id`, `assigned_to`, `actor_user_id`, `connected_by`, `updated_by`, `triggered_by` are plain `uuid` columns (no FK), same as `host_earnings.host_id`. Intra-module FKs (`post_id`, `lead_id`) are real FKs with `on delete cascade` (assets/approvals/attempts) or `on delete set null` (interactions).
- **Function name collisions:** we already have `update_updated_at_column()` — reuse it for all `social_*` updated_at triggers rather than defining a new one. New functions get a `social_` prefix (`social_log_change()`, `social_can_schedule_at()`).
- **Rate limiting / audit:** we already have `host_audit_log` and `rate_limit_events`; `social_audit_log` stays separate (different entity shape), and the webhook function reuses `check_and_record_rate_limit` for abuse protection.
- **Routing:** `/social` at the top level would be swallowed by the catch-all `"/:slug"` programmatic-SEO route in `App.tsx`. Mount the module under `/admin/social/*` (nested under the existing `RequireAuth > RequireApproved > RequireSubscribed > RequireRole` chain, alongside `/admin/investments`), which is unambiguous. The OAuth callback goes to the edge function URL, not a React route, and redirects back to `/admin/social/settings`.
- Nav: add a "Social" entry to the admin section of `AppSidebar.tsx` only when `profile.is_super_admin`. Do **not** add it to `BottomNavBar` — that's capped at 5 items per our convention; it goes in the "More" drawer.

## c) Phased build order

**Phase 1 — Schema & RLS.** All 13 `social_*` tables in one migration, with prefixed enums, GRANTs (`authenticated` + `service_role`, no `anon`), RLS gated on `is_super`, `updated_at` triggers, and the `social_log_change()` audit trigger. Private `social-media` storage bucket + policies. Seed one `social_automation_settings` row (America/Los_Angeles) and the default reply templates. Deliverable: schema exists, nothing user-facing.

**Phase 2 — OAuth + token vault.** `social-ig-oauth-start` / `-callback`, AES-GCM encrypt/decrypt helper in `_shared/social-crypto.ts` (key from secret, `key_version` recorded, iv+tag stored in separate columns), `social_oauth_states` nonce lifecycle, `social-token-refresh` cron + expiry warning. Deliverable: you can connect an IG account and see status flip to `connected`.

**Phase 3 — Publishing pipeline.** `social-publish` (container create → poll → publish → permalink), `social_publish_attempts` with a unique `idempotency_key` and a partial unique index enforcing one active (`pending`) attempt per post, plus the safeguard set: approved + checklist complete + media present + account connected + not already published. `social-publish-worker` on cron adds only the `scheduled_at <= now()` gate; "Publish now" skips only that gate. Deliverable: a post can be published end-to-end via curl.

**Phase 4 — Webhooks + leads.** `social-webhook` (GET verify challenge, `X-Hub-Signature-256` HMAC check, dedupe on `event_id`, store raw payload), lead/interaction upsert, auto-reply via `social_reply_templates` respecting automation settings, escalation categories. `social-data-deletion` callback. Deliverable: comments/DMs land as leads.

**Phase 5 — Admin UI.** Shell at `/admin/social` with Calendar / Queue / Leads / Settings tabs, matching `DashboardLayout` + `PageContainer` and our design tokens. Order within the phase: Settings (needed to configure everything) → Post editor + Queue + StatusPill + disconnected banner → bulk Approve-all dialog (9-item checklist, optional notes, optional "also move to Scheduled") → Calendar month/week → Leads board.

**Phase 6 — Hardening.** Slack notification on publish failure and token expiry (reuse the existing webhook secret pattern), audit-log viewer, retry UI for failed attempts, security scan + linter pass.

Scheduling detail applied throughout: the editor sends an explicit `{ scheduled_at, clear_schedule: boolean }` shape; an absent `scheduled_at` is a no-op on the stored value, and only `clear_schedule: true` nulls it. Wall-clock → UTC conversion happens once, server-side, using the settings timezone, and per project convention any bare date string gets `T00:00:00` before JS `Date` conversion.

## d) Credentials and secrets you'll need to add yourself

Create a Meta app (Business type) at developers.facebook.com with the **Instagram Graph API** and **Webhooks** products, link an Instagram Professional account to a Facebook Page, and request the scopes `instagram_basic`, `instagram_content_publish`, `instagram_manage_comments`, `instagram_manage_messages`, `pages_show_list`, `pages_read_engagement`, `pages_manage_metadata`. App Review is required before it works on a non-test account.

Add these in Supabase (Edge Function secrets) — I will not enter any of them:

| Secret | Where it comes from |
|---|---|
| `META_APP_ID` | Meta app dashboard → Settings → Basic |
| `META_APP_SECRET` | same page (also used to verify webhook signatures) |
| `META_REDIRECT_URI` | the deployed `social-ig-oauth-callback` function URL; must be added to the app's Valid OAuth Redirect URIs |
| `META_WEBHOOK_VERIFY_TOKEN` | a strong random string you generate; paste the same value into Meta's webhook config |
| `SOCIAL_TOKEN_ENC_KEY` | 32-byte base64 key you generate (`openssl rand -base64 32`) for AES-GCM; rotating it bumps `key_version` |
| `SOCIAL_WORKER_SECRET` | random string; shared header between the cron job and the worker function |
| `SLACK_WEBHOOK_URL` | already configured for admin alerts — reused if present |

Also needed in the Meta dashboard (not secrets): the webhook callback URL pointing at `social-webhook` with `comments` and `messages` subscriptions, and the data-deletion callback URL pointing at `social-data-deletion`.

## Access scope (confirmed)

Strictly super-admin only. No read-only access for non-super-admin hosts, clients, or investors — every table, RPC, edge function, route, and nav entry gates on `is_super`.
