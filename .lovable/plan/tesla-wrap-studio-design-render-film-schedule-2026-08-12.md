# Tesla Wrap Studio — design, render, film, schedule

An in-app studio at `/admin/wraps` that produces Tesla-valid wrap PNGs, generates a reel from each one, and hands the finished post to the Social scheduler you already have.

## What I learned from Tesla's repo

Tesla's `teslamotors/custom-wraps` is not "make a cool picture." Each vehicle has a **UV template** — a 1024x1024 PNG where white regions are the unwrapped body panels (hood, doors, roof, bumpers) laid out flat, and everything else is dead space. The car's 3D visualization samples only the white islands.

Rules from the spec:
- PNG, square, 512x512 to 1024x1024, **max 1 MB**
- Paint inside the white areas of that model's template only
- Upload: mobile app v4.59.0+ (Creations → Wrap → Upload) or USB folder named `Wraps`
- Apply: Toybox → Paint Shop → Wraps tab

This is exactly where the ChatGPT/Claude back-and-forth breaks down: an AI generates a pretty flat square, but the artwork isn't aligned to the UV islands, so panels come out sliced or misplaced on the car. The fix is mechanical, not creative — composite the art **through the template's mask** every single time. That step becomes code, not a prompt.

13 templates ship in the repo: Cybertruck, Model 3 (legacy / 2024 base / 2024 performance), Model Y (legacy / 2025 base / performance / premium / Model Y L), Model S (2021 / 2025 Plaid), Model X 2021.

## How the studio works

```text
1  Pick vehicle        -> loads that model's official UV template + mask
2  Source the art      -> AI prompt (Gemini/GPT image) or upload your own
3  UV compositing      -> art is masked to the white islands, off-panel
                          pixels dropped, edges bled to avoid seams
4  Validate            -> square, <=1024px, <=1 MB (auto-recompress), alpha OK
5  Preview             -> masked PNG + template overlay + panel-region check
6  Publish to catalog  -> saves PNG + 3:2 social preview, appears on /wraps
7  Make the reel       -> 8s AI video from the wrap art
8  Schedule            -> creates an approved social_posts row with caption,
                          hashtags, WRAP keyword, link to /wraps/<slug>
```

Steps 3-4 are the part that has been going wrong. Once it's code, every wrap is correct by construction.

## Scope

**Templates.** All 13 official templates are vendored into the repo under `public/wraps/templates/<model-key>/template.png`, with a generated mask and panel metadata per model, so the studio works offline and never depends on GitHub at runtime.

**Catalog goes database-backed.** Today the catalog is a hardcoded TypeScript array, which means every new wrap needs a code change. A `wrap_designs` table plus a public `wraps` storage bucket lets the studio publish without a deploy. The 15 existing wraps are migrated in as seed rows; `/wraps` and `/wraps/:slug` read from the table with the static list as fallback, so nothing breaks and SEO stays intact.

**Studio UI** at `/admin/wraps` (super-admin only, same gate as `/admin/social`): model picker, prompt box or file upload, live masked preview against the template, validation badges (dimensions / file size / coverage), title + description + category fields, and one button that publishes to the catalog.

**Video.** An 8s reel generated from the finished wrap art using the built-in AI video model, stored in the private `social-media` bucket and attached as the post's media asset. Generation only fires when you click it — it is the most expensive operation in the app.

**Scheduling.** A "Schedule post" step reuses the existing `social_posts` / `social_post_approvals` flow: pre-filled caption template, hashtags, `WRAP` comment keyword for your ManyChat automation, link to the wrap page, pre-stamped compliance checklist, status `scheduled` at the date/time you pick.

**On ManyChat:** the app already publishes to Instagram and receives Meta webhooks, so a native comment-to-DM automation is buildable later (keyword match on `social_webhook_events` → private reply via the IG API). Out of scope for this plan — keep ManyChat handling DMs for now, and I'll note the hook points.

## Technical notes

- **Compositing** runs in a Supabase edge function (`wrap-compose`) using a pure-WASM image library, not the browser, so results are deterministic and the same code powers batch/regeneration later. Mask math: multiply source alpha by template mask, dilate the mask a few pixels for bleed, flatten to RGB on a chosen base color, then quantize/compress until under 1 MB.
- **Mask derivation** is a one-time build script (`scripts/build-wrap-masks.mjs`) that reads each `template.png`, thresholds the white paintable regions to a 1-bit mask, and writes `mask.png` + a JSON of island bounding boxes used for the "coverage" validation and for prompt hints ("hood spans this box").
- **AI art generation** goes through a `wrap-generate-art` edge function calling the AI Gateway image endpoint with `LOVABLE_API_KEY`, streaming partials to the studio so you see it render. The prompt is auto-augmented with UV-layout guidance derived from the island metadata.
- **New tables:** `wrap_designs` (slug, title, description, category, model_key, png_path, preview_path, dimensions, file_size, source_prompt, published, created_by) with super-admin-only write policies, public read of published rows, and explicit GRANTs. Public `wraps` storage bucket for the PNGs.
- **Video** uses the async `/v1/videos` job pattern: create job → client polls → on completion the MP4 is downloaded server-side and stored, never linking the expiring gateway URL.
- Existing `/wraps` visual design, tan theme, SEO components, sitemap generation and disclosures are untouched — only the data source changes.

## Suggested build order

1. Vendor the 13 templates + mask build script + validation library
2. `wrap_designs` table, storage bucket, seed the 15 existing wraps, switch `/wraps` to read from the DB
3. `wrap-compose` edge function + `/admin/wraps` studio (upload path first, correctness provable immediately)
4. AI art generation inside the studio
5. Reel generation + schedule-to-social handoff
