# Automated Daily Wrap Drops

Turn the manual Onyx-style process into a hands-off daily pipeline: a new wrap is designed, rendered, previewed, filmed, listed on `/wraps`, and published to Instagram — every day, rotating through all Tesla models.

## What happens each day

```text
06:00 PT  kick off  -> pick next model template (round-robin)
                    -> invent design brief (name, colors, motif)
                    -> generate UV texture PNG (Tesla spec: 1024x1024, <1MB)
                    -> generate photoreal preview of that model wearing the wrap
                    -> generate 8s vertical reel from the preview frame
                    -> upload assets, add wrap to the /wraps gallery
                    -> create pre-approved Instagram Reel post
09:00 PT  publish   -> existing social worker posts it with the WRAP CTA caption
```

Model rotation covers every template already mapped in the project: Model Y Juniper, Model 3 Highland, Cybertruck, Model S, Model X. The rotation always picks the model that has gone longest without a drop, so Cybertruck and Model 3 fill in first simply because they have none yet.

## Running it yourself

Two ways to trigger a drop besides the daily schedule:

- A **Run drop now** button in Wrap Studio (`/admin/wraps`) with an optional theme box ("desert camo", "chrome liquid") and a model override.
- A copy-paste prompt for chat when you want art direction I control by hand. It will live in the repo as `docs/wrap-drop-prompt.md` so you always have the exact wording.

Wrap Studio also gains a live status panel showing each drop's stage, so a failure is visible rather than silent.

## Safety and cost

- Fully automatic publishing, as chosen. Guardrails: the texture must pass Tesla's spec checks (square, 1024px, under 1MB) and the preview/reel must exist before anything is scheduled — any failed step aborts the drop and sends a Slack alert instead of posting.
- One reel per day at 8s / 1080x1920 on the cheapest Veo model. Cost is roughly one reel plus two images per day; the daily job is capped at one drop so a retry loop cannot fan out.
- Every generated wrap starts `published = true` in the gallery but is one click away from being hidden in Wrap Studio.

## Technical section

**New table `wrap_drop_jobs`** — state machine so no single request has to wait out a 1-3 minute video render. Columns: `status` (queued/brief/texture/preview/video/listing/scheduling/done/failed), `template_key`, `theme`, `design_id`, `video_job_id`, `asset_paths jsonb`, `error`, `attempts`, timestamps. Super-admin read via `is_super`; writes service-role only. Standard GRANTs.

**New edge function `wrap-auto-drop`** — idempotent step-runner, invoked repeatedly by cron; advances the oldest active job by exactly one stage per call:
1. `brief` — Gemini text call produces slug, title, description, category, palette and motif; slug uniqueness checked against `wrap_designs`.
2. `texture` — `google/gemini-3.1-flash-image` with the existing flat-texture prompt from `wrap-generate-art`, generated at the template's UV dimensions from `src/lib/wrapTemplates.ts`. Validated with ImageScript in Deno (dimensions + byte size), re-compressed if over 1MB, uploaded to the private `wraps` bucket.
3. `preview` — photoreal 3:2 gallery render, with per-template styling notes (e.g. Juniper full-width light bar, Cybertruck stainless facets) so the thumbnail always matches the model year the UV template targets — the exact bug we hit on Onyx.
4. `video` — `POST /v1/videos`, `google/veo-3.1-lite`, `seconds: "8"`, `size: "1080x1920"`, `input_reference` = base64 of a vertical hero render. Stores `video_job_id` and returns; later calls poll, then download the MP4 and upload it to the `social-media` bucket. No timeouts wrapped around Gateway calls.
5. `listing` — insert the `wrap_designs` row (`png_path`, `preview_path`, `model_key`, `compatibility`, `dimensions`, `file_size`), which is what `/wraps` already reads through `useWrapDesigns`.
6. `scheduling` — reuse `wrap-schedule-post` logic to create the `social_posts` Reel with the standard WRAP caption template, plus a `social_post_approvals` row with all nine checklist keys signed off and `approved_at` stamped (the exact field whose absence caused the repeated `missing_checklist` errors).

**Cron (via the insert tool, not a migration, since it embeds project URL + anon key)**
- `wrap-drop-kickoff` — daily at 13:00 UTC (06:00 PT): creates one queued job.
- `wrap-drop-tick` — every 2 minutes: calls `wrap-auto-drop` to advance whatever is in flight. Jobs older than 90 minutes or past 3 attempts are marked failed.
- Publishing continues to run through the existing `social-publish-worker`; no change there.

**Frontend** — Wrap Studio gets a `WrapDropPanel` (recent jobs, stage badges, Run drop now, theme/model inputs). No changes to `/wraps`, `src/data/wraps.ts`, routes, or the social module's existing screens.

**Slack** — reuse the existing webhook path for a failure alert and a success ping with the new wrap's title and gallery link.
