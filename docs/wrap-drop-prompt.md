# Wrap drop — copy/paste prompt

The daily pipeline runs on its own (see `supabase/functions/wrap-auto-drop`). Use these
when you want a drop right now, or a hand-directed one.

## One click

Admin → Wrap Studio (`/admin/wraps`) → **Automated daily drop** → pick a model (or leave
"Next in rotation"), optionally type a theme, press **Run drop now**.

## Copy/paste prompt for chat

> Run a new Teslys wrap drop for **[MODEL — e.g. Cybertruck / Model 3 Highland / Model Y Juniper]**
> with the theme **[THEME — e.g. desert camo, liquid chrome, art-deco gold]**.
> Follow the full pipeline: build the UV texture PNG against Tesla's official template for
> that exact model (correct pixel size, under 1MB), render a photoreal 3:2 gallery preview
> and a 9:16 hero of that model year, generate an 8-second vertical reel from the hero,
> add the wrap to `/wraps` as published, and schedule an approved Instagram Reel for
> 9:00 AM PT tomorrow with the standard WRAP caption. Confirm the checklist is signed off.

## Caption template used automatically

```
{TITLE} — a free digital wrap for your Tesla.

Your Tesla deserves more than the same factory look.

Comment "WRAP" below and we'll send you the free link in your DMs.

More designs at https://teslys.app/wraps/{slug}
```

## Schedule

- `wrap-drop-kickoff` — 13:00 UTC (06:00 PT) daily: queues one drop.
- `wrap-drop-tick` — every 2 minutes: advances the in-flight drop one stage.
- Publishing itself stays with `social-publish-worker`.

Failures post to Slack and stop the drop before anything reaches Instagram.
