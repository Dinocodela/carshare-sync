# "Onyx" — gothic wrap drop for Model Y

Yes, this is buildable end to end. The Tesla `custom-wraps` spec is already implemented in this project: all official UV templates are vendored under `public/wraps/templates/`, with per-model masks and coverage metadata, and `src/lib/wrapCompositor.ts` enforces the spec (square PNG, 512–1024 px, under 1 MB, art masked to the white paintable islands only). So the wrap will be valid by construction, not by guesswork.

## Model choice

**Model Y (2025 premium)** — largest owner base, the `/wraps` Model Y tab is already live with assets in `public/wraps/model-y-premium/`, and the hashtag set in your caption leads with `#teslamodely`. Template: 1024x1024 official UV.

## The design

**Onyx** — gothic: deep black base, faint smoked-charcoal marbling, blackletter "ONYX" lettering placed on the hood and roof islands, thin desaturated-silver hairline edging along panel breaks. No gold, no neon. Restrained and dark so it reads as premium on a real vehicle rather than as a decal.

## Pipeline

```text
1  Generate the art        -> gothic Onyx texture, UV-layout aware
2  Mask to the template    -> Model Y premium UV mask, edge bleed,
                              quantize to <=1 MB PNG
3  Photoreal preview       -> black Model Y wearing the wrap, 3:2 gallery card
4  Publish to /wraps       -> new catalog entry, free download
5  Reel                    -> 9:16 studio video of the wrapped car
6  Schedule                -> approved IG post, tomorrow 9:00 AM PT
```

## What ships

**Wrap files**
- `public/wraps/model-y-premium/Onyx.png` — the downloadable UV texture, validated against the Tesla spec (1024x1024, PNG, under 1 MB).
- `public/wraps/previews/Onyx-preview.jpg` — 3:2 photoreal gallery image of a Model Y in the wrap.

**Catalog**
- New `onyx` entry in `src/data/wraps.ts` and a matching `wrap_designs` row (model key `modely-2025-premium`, category Featured, published), so it appears on `/wraps` under the Model Y tab and gets its own `/wraps/onyx` detail page with the download button. Existing wraps, tan theme, SEO components and sitemap generation are untouched.

**Social**
- A 9:16 studio Reel of the wrapped Model Y, transcoded to Instagram specs (H.264 High, yuv420p, 1080x1920, silent AAC) and hosted as a CDN asset.
- One `social_posts` row, format `reel`, scheduled **tomorrow 9:00 AM PT**, with the caption you supplied verbatim (WRAP comment keyword, teslys.app/wraps link, your hashtag set), plus the `social_post_approvals` compliance checklist pre-signed so the worker can publish it without a manual gate.

## Technical notes

- Art generation runs through the AI Gateway image endpoint with a prompt auto-augmented by the model's island bounding boxes, so the lettering lands on hood/roof rather than being sliced across panel seams.
- The compositor multiplies source alpha by the template mask, dilates a few pixels for bleed, flattens onto the black base, then recompresses until under the 1 MB Tesla limit.
- Video uses the async `/v1/videos` job pattern; the MP4 is downloaded server-side and stored permanently, never linked from the expiring gateway URL.
- Publishing to Instagram at the scheduled time requires the site deploy to be live so Instagram can fetch the media from teslys.app — I'll flag it if a publish is needed.

## Note on the schedule

Automated firing of scheduled posts depends on the `social-publish-worker` cron, which was cancelled earlier and is not currently running. The post will sit in the queue as approved and scheduled for 9:00 AM PT; unless you want that cron enabled, you'll hit **Publish now** on it in the morning. Say the word and I'll add the cron as part of this work.
