

## Blog Section for Teslys — Teslarati-Inspired Design

### Overview
Create a public-facing blog at `/blog` with individual post pages at `/blog/:slug`. Posts are stored in a Supabase `blog_posts` table. You can ask me each morning to create a post and I'll insert it directly into the database — no code changes needed.

### Database

**New table: `blog_posts`**
- `id` (uuid, PK)
- `title` (text)
- `slug` (text, unique) — URL-friendly identifier
- `excerpt` (text) — short summary for cards
- `content` (text) — full article body (HTML)
- `cover_image` (text) — URL to hero image
- `category` (text) — e.g. "Tesla News", "Passive Income", "Car Sharing Tips"
- `tags` (text[]) — for filtering
- `author_name` (text, default "Teslys Team")
- `is_published` (boolean, default false)
- `published_at` (timestamptz)
- `created_at`, `updated_at`
- **RLS**: Public SELECT where `is_published = true`. Super-admin full access for management.

### Pages and Components

1. **`/blog` — Blog Index Page** (Teslarati-inspired layout)
   - Hero section with the latest featured post (large image + overlay text, like Teslarati's center column)
   - Left sidebar: "Trending" numbered list of recent posts with thumbnails
   - Right sidebar: "Latest" tab with compact post list (thumbnail + title + date)
   - Below hero: grid of remaining posts as cards
   - Category filter chips at the top
   - Fully responsive — stacks vertically on mobile

2. **`/blog/:slug` — Individual Post Page**
   - Large cover image
   - Category badge + published date
   - Article title (large heading)
   - HTML content rendered safely
   - "Related posts" section at the bottom
   - Social share buttons (copy link, Twitter/X)

3. **Components**
   - `BlogHeroPost` — large featured card with image overlay
   - `BlogPostCard` — compact card for grids
   - `BlogSidebarItem` — small thumbnail + title for sidebar lists
   - `BlogCategoryFilter` — category chip selector

### Routing
- Add `/blog` and `/blog/:slug` as public routes in `App.tsx`
- Add "Blog" link to the landing page nav/footer

### SEO
- Each post page gets dynamic `<title>`, meta description, and Open Graph tags via the existing `<SEO>` component
- Structured data (Article schema) for each post

### Daily Workflow
Each morning you tell me the topic and I'll:
1. Generate the article content
2. Insert it into `blog_posts` via the Supabase insert tool
3. It appears live immediately — no rebuild needed

### Technical Details
- Content stored as HTML in the `content` column — rendered with `dangerouslySetInnerHTML` (safe since only admin inserts content)
- Images can use the existing `car-images` public bucket or external URLs
- Uses `@tanstack/react-query` for data fetching with caching
- Dark/light mode compatible using existing Tailwind theme tokens

