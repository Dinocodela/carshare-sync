

## Plan: Professional Blog Typography & Content Cleanup

### Problem
The blog post body has three issues visible in the screenshot:
1. **Emojis in subheadings** (📋, 🚀) — looks unprofessional, not befitting a premium brand
2. **Subheadings too small/not prominent enough** — need larger size and bolder weight
3. **Insufficient spacing** between paragraphs and subheading titles

### Root Cause
- The emojis are embedded in the **HTML content stored in the database** (inserted via the `insert-blog-post` edge function). The rendering styles can't remove them — they must be stripped at render time.
- The current prose styles for `h2` and `h3` are decent but could be more prominent, especially on mobile.

### Changes

**1. Strip emojis from rendered content (BlogPost.tsx)**

Add a sanitization step before rendering that removes emoji characters from `h2` and `h3` tags in the HTML string. This avoids needing to update every post in the database.

```tsx
// Strip emojis from headings before rendering
const cleanContent = post.content
  .replace(/(<h[23][^>]*>)\s*[\p{Emoji_Presentation}\p{Extended_Pictographic}]+\s*/gu, '$1');
```

**2. Increase subheading size and weight (BlogPost.tsx)**

Update the prose classes:
- `h2`: bump from `text-xl md:text-2xl` → `text-2xl md:text-3xl`, add `font-extrabold`
- `h3`: bump from `text-lg md:text-xl` → `text-xl md:text-2xl`, add `font-bold`
- Remove the bottom border on h2 (looks cleaner for a premium feel)

**3. Increase spacing between paragraphs and headings**

- `h2` margin-top: `mt-12` → `mt-14` (more breathing room above)
- `h2` margin-bottom: `mb-5` → `mb-6`
- `h3` margin-top: `mt-10` → `mt-12`
- Paragraph bottom margin: `mb-6` → `mb-7`
- Add `[&_h2+p]:mt-5` and `[&_h3+p]:mt-5` for consistent spacing after headings

**4. Update future blog content generation workflow**

Add a note/memory that future blog posts should NOT include emojis in headings, to maintain a professional brand image.

### Files Modified
- `src/pages/BlogPost.tsx` — emoji stripping + updated prose typography classes

