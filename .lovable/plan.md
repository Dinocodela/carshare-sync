

## Problem

The top section of the onboarding screen appears gray because:

1. **The `--gradient-hero` CSS variable** uses gray-ish colors: `hsl(220 15% 85%)` to `hsl(180 20% 88%)` — these are light grays with barely any blue/teal tint.
2. **The status bar meta tag** (`apple-mobile-web-app-status-bar-style`) is set to `default`, which renders a white/gray bar on iOS Safari, creating a visible color mismatch at the top.
3. **The `theme-color` meta tag** is `#000000` (black), which doesn't match the desired teal/blue background.

## Plan

### 1. Update `--gradient-hero` to a teal-tinted gradient (src/index.css)

Change the light-mode hero gradient from gray to a soft teal/mint that matches the brand:

```
--gradient-hero: linear-gradient(
  135deg,
  hsl(175 25% 90%),
  hsl(180 30% 92%),
  hsl(185 25% 88%)
);
```

This gives a consistent light teal wash instead of the current neutral gray.

### 2. Update `theme-color` and status bar style (index.html)

- Change `theme-color` from `#000000` to a teal value like `#d4eeec` (matching the gradient top)
- Change `apple-mobile-web-app-status-bar-style` from `default` to `black-translucent` so the status bar blends with the page background instead of rendering its own white/gray bar

### 3. Set `--secondary` to match (src/index.css)

Update the `--secondary` color from `220 15% 96%` to a teal-tinted value (e.g., `175 20% 94%`) so any elements using `bg-secondary` also blend seamlessly.

These three changes together will eliminate the gray band at the top and create a unified teal-blue background across the entire viewport on all screens.

