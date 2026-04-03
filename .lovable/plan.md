

## Problem

The blog article body looks like a wall of text because the Tailwind Typography plugin (`@tailwindcss/typography`) is installed but **not registered** in `tailwind.config.ts`. The `prose` classes on the blog content div have zero effect.

## Fix

**One line change** in `tailwind.config.ts`:

Add `require("@tailwindcss/typography")` to the plugins array (line 118):

```ts
plugins: [require("tailwindcss-animate"), require("@tailwindcss/typography")],
```

This single change will activate all the existing `prose` styling classes already applied in `BlogPost.tsx` — headings will get proper sizing/spacing, bullet lists will display with markers and indentation, paragraphs will have breathing room, and blockquotes will render correctly.

No other file changes needed — the `BlogPost.tsx` prose classes are already well-configured.

