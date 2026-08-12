# Sunset Boulevard — new Model 3 (2026) wrap

Add the first Model 3 wrap to the Wraps page, with a studio preview image, a downloadable Tesla-compatible PNG, and an Instagram Reel published to the Social module.

## 1. The wrap

**Sunset Boulevard** — LA golden-hour gradient: coral into peach into violet, soft horizontal light bands wrapping the body, subtle grain. Category: Featured. Free.

- Generate the Tesla paint-shop PNG texture (square UV art, same spec as existing wraps) and save it under a new `public/wraps/model-3/` folder.
- Generate a photoreal 3:2 concept preview of a 2026 Model 3 wearing the wrap for the gallery card and detail page.

## 2. Wraps page

- Flip Model 3 from "Coming soon" to available in the model selector, with a 2026 Model 3 compatibility note.
- Add the `sunset-boulevard` entry to the wrap catalog with model-3 paths, dimensions, and file size so it shows in the gallery, opens a detail page, and downloads the PNG.
- Model 3 wraps resolve their files from the Model 3 folder while Model Y wraps keep their current paths (small path lookup by model, no change to existing entries).

## 3. Instagram video + post

- Generate a slow rotating studio video: the wrapped Model 3 on a turntable in a dark studio, light sweeping across the sunset gradient. Rendered to Instagram Reel spec (1080x1920, 9:16) and hosted on the CDN.
- Create a new Social post (Reel format) with caption copy in the same style as the Neon Velocity post: free digital wrap, "Comment WRAP below and we'll send the link in your DMs", more designs at Teslys, plus hashtags.
- Attach the video as the post's media asset and insert the compliance checklist approval record so publishing doesn't fail with `missing_checklist`.
- Publish the site (Instagram fetches media from teslys.app), then publish the post live.

## Technical notes

- Files: `src/data/wraps.ts` (model status + new wrap + per-model base path), `src/pages/Wraps.tsx` / `WrapDetail.tsx` only if a path helper is needed; new assets in `public/wraps/model-3/` and `public/wraps/previews/`.
- Video is uploaded as a CDN asset (not committed to the repo) and referenced by URL in `social_media_assets`.
- DB writes limited to `social_posts`, `social_media_assets`, `social_post_approvals`. No schema changes.
- Disclosure text stays intact; it will mention that Model 3 previews illustrate artwork on a Model 3.
