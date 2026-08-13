# Onyx wrap: verify and fix the 2026 Juniper visuals

## What I verified

- The downloadable PNG (`public/wraps/model-y-premium/Onyx.png`) is built on the **Model Y Premium 2025+ Juniper** UV template (`modely-2025-premium`, 1024x1024, from Tesla's official custom-wraps repo). That is the correct template for a 2026 Model Y Premium, so the download itself is right.
- The listed compatibility line already reads "2025+ Tesla Model Y Premium (Juniper), including 2026 Model Y Premium."
- The problem is the **gallery thumbnail** (`public/wraps/previews/Onyx-preview-v1.jpg`): the rendered car shows pre-Juniper Model Y styling — separate slim headlights instead of the full-width front light bar, and the old rear lamp treatment. It does not read as a 2026 Juniper car.

## What to change

1. Regenerate the Onyx gallery preview as a photoreal **2026 Juniper Model Y Premium** in the same dark studio setting and 3:2 crop, carrying the same obsidian marble artwork, silver pinstripes and blackletter ONYX door lettering. Key Juniper cues: full-width front light bar, smoothed nose with no separate headlamp pods, reflected rear light bar, Juniper door handles and wheels.
2. Save as `Onyx-preview-v2.jpg` and point `src/data/wraps.ts` at the new filename (keep v1 on disk as fallback).
3. Update the `wrap_designs` row for the `onyx` slug so the admin/Wrap Studio preview URL matches.
4. Re-render the Onyx social Reel hero frames on the same Juniper body so the Instagram creative and the site agree, and swap the media on the scheduled post. If you'd rather leave the already-scheduled Reel alone, I'll skip this step.

## Technical notes

- No changes to the UV template, compositor, or the downloadable PNG — the asset pipeline is already correct.
- Files touched: `public/wraps/previews/Onyx-preview-v2.jpg` (new), `src/data/wraps.ts` (one field), plus one `wrap_designs` update and optionally the `social_posts` media row.
- Same 3:2 aspect and file-size budget as the other previews so the gallery grid stays consistent.
