# Port the Social automation module to dinocodeops (AI news reels)

You'll build this in the dinocodeops project. Since Lovable can only read across projects, this plan is the handoff brief: open dinocodeops, mention `@Teslys` (or paste this plan), and have that chat copy the module across and adapt it.

## What gets ported

The Teslys Social module is four layers. All of it comes over; only the daily content generator changes theme.

1. **Schema** — 13 `social_*` tables (posts, accounts, tokens, oauth states, media assets, approvals, publish attempts, leads, interactions, reply templates, automation settings, webhook events, audit log) with prefixed enums, GRANTs, RLS gated on a super-admin check, `updated_at` triggers, and an audit trigger. Plus a private `social-media` storage bucket. Plus a `content_drop_jobs` table (the Teslys `wrap_drop_jobs` equivalent) tracking each daily run through its stages.
2. **Edge functions** — `social-ig-oauth-start`, `social-ig-oauth-callback`, `social-publish`, `social-publish-worker`, `social-token-refresh`, `social-approve`, `social-webhook`, `social-data-deletion`, plus shared helpers `_shared/social-admin.ts`, `_shared/social-crypto.ts` (AES-GCM token vault), `_shared/social-publish-core.ts` (container create → poll → publish → permalink, with the safeguard set).
3. **Admin UI** — `/admin/social` with Calendar / Queue / Leads / Retries / Audit log / Settings tabs, `PostEditorDialog`, `ApproveDialog` (checklist + check-all), `StatusPill`; hooks in `src/hooks/social/`.
4. **Daily content pipeline** — cron kickoff → AI brief → media → reel → approved+scheduled post → auto-publish.

## The daily generator, retargeted to AI news

Teslys generates a car wrap; dinocodeops generates an **AI news reel**. Same job-state machine, new brief step:

- **Source**: each run pulls recent AI headlines via web search, dedupes against the last 30 days of `content_drop_jobs` topics, and picks one story.
- **Script**: a text model writes a 6–8 second hook + 3 beats + caption + hashtags + a CTA keyword (Teslys uses `WRAP`; pick yours, e.g. `AI`).
- **Visual**: image generation for the key frame, then video generation for the reel (Teslys uses an 8s cinematic clip).
- **Publish**: insert a `social_posts` row as `reel`, attach media, write a signed-off `social_post_approvals` row, set `scheduled_at`, and let the publish worker post it.

Human-in-the-loop is a settings toggle: `review_required` (queue it for you to approve) vs `auto_publish_approved` (fully hands-off).

## Crons

- `content-drop-kickoff` — daily at your chosen hour, creates the job.
- `content-drop-tick` — every 2 min, advances one stage (keeps each invocation short).
- `social-publish-worker` — every 5 min, publishes anything due.

Registered with `pg_cron` + `pg_net` via the insert tool (they embed the project URL + key, so not a migration).

## Secrets to add in dinocodeops

| Secret | Source |
|---|---|
| `META_APP_ID` / `META_APP_SECRET` | Meta app dashboard (Business type, Instagram Graph API + Webhooks) |
| `META_REDIRECT_URI` | deployed `social-ig-oauth-callback` URL, also added to Valid OAuth Redirect URIs |
| `META_WEBHOOK_VERIFY_TOKEN` | random string you also paste into Meta's webhook config |
| `SOCIAL_TOKEN_ENC_KEY` | `openssl rand -base64 32` |
| `SOCIAL_WORKER_SECRET` | random string, shared header for cron → worker |
| `SLACK_WEBHOOK_URL` | optional, failure + token-expiry alerts |

Meta side: an Instagram Professional account linked to a Facebook Page, scopes `instagram_basic`, `instagram_content_publish`, `instagram_manage_comments`, `instagram_manage_messages`, `pages_show_list`, `pages_read_engagement`, `pages_manage_metadata`, and App Review before it works on a non-test account.

## Build order in dinocodeops

1. Schema + RLS + storage bucket.
2. OAuth + token vault → account shows `connected`.
3. Publish pipeline → a post goes live end-to-end.
4. Webhooks + leads CRM + auto-reply.
5. Admin UI at `/admin/social`.
6. AI-news daily drop pipeline + crons.
7. Hardening: Slack alerts, retry UI, security scan.

## Notes for the dinocodeops chat

- Mount under `/admin/social` (a top-level `/social` can collide with catch-all slug routes).
- Never FK to `auth.users`; actor columns are plain `uuid`.
- Prefix every enum with `social_` to avoid collisions.
- Reuse the project's existing `update_updated_at_column()` if present.
- Gate every table, function, route, and nav entry on the project's admin predicate.
- The GitHub repo `Dinocodela/carshare-sync` can't be pushed to from Lovable; work in the Lovable project and let its Git sync handle the repo.
