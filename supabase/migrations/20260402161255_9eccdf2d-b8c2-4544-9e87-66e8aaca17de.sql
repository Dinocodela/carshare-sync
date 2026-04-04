
-- Create blog_posts table
CREATE TABLE public.blog_posts (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  title text NOT NULL,
  slug text NOT NULL UNIQUE,
  excerpt text,
  content text NOT NULL,
  cover_image text,
  category text NOT NULL DEFAULT 'General',
  tags text[] DEFAULT '{}',
  author_name text NOT NULL DEFAULT 'Teslys Team',
  is_published boolean NOT NULL DEFAULT false,
  published_at timestamptz,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

-- Enable RLS
ALTER TABLE public.blog_posts ENABLE ROW LEVEL SECURITY;

-- Public can read published posts
CREATE POLICY "Anyone can view published blog posts"
  ON public.blog_posts
  FOR SELECT
  TO public
  USING (is_published = true);

-- Super admins have full access
CREATE POLICY "Super admins can manage blog posts"
  ON public.blog_posts
  FOR ALL
  TO public
  USING (is_super(auth.uid()))
  WITH CHECK (is_super(auth.uid()));
