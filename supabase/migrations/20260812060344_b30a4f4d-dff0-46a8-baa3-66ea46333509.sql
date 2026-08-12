CREATE TABLE public.wrap_designs (
  id uuid NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  slug text NOT NULL UNIQUE,
  title text NOT NULL,
  description text NOT NULL DEFAULT '',
  category text NOT NULL DEFAULT 'Featured',
  model_key text NOT NULL DEFAULT 'modely-2025-premium',
  png_path text NOT NULL,
  preview_path text,
  dimensions text NOT NULL DEFAULT '1024 × 1024 px',
  file_size text NOT NULL DEFAULT '',
  compatibility text NOT NULL DEFAULT '',
  source_prompt text,
  storage_kind text NOT NULL DEFAULT 'storage',
  published boolean NOT NULL DEFAULT true,
  sort_order integer NOT NULL DEFAULT 0,
  created_by uuid,
  created_at timestamp with time zone NOT NULL DEFAULT now(),
  updated_at timestamp with time zone NOT NULL DEFAULT now()
);

GRANT SELECT ON public.wrap_designs TO anon;
GRANT SELECT, INSERT, UPDATE, DELETE ON public.wrap_designs TO authenticated;
GRANT ALL ON public.wrap_designs TO service_role;

ALTER TABLE public.wrap_designs ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Published wraps are viewable by everyone"
ON public.wrap_designs FOR SELECT
USING (published = true OR public.is_super(auth.uid()));

CREATE POLICY "Super admins can insert wraps"
ON public.wrap_designs FOR INSERT TO authenticated
WITH CHECK (public.is_super(auth.uid()));

CREATE POLICY "Super admins can update wraps"
ON public.wrap_designs FOR UPDATE TO authenticated
USING (public.is_super(auth.uid()))
WITH CHECK (public.is_super(auth.uid()));

CREATE POLICY "Super admins can delete wraps"
ON public.wrap_designs FOR DELETE TO authenticated
USING (public.is_super(auth.uid()));

CREATE TRIGGER update_wrap_designs_updated_at
BEFORE UPDATE ON public.wrap_designs
FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

CREATE INDEX idx_wrap_designs_published ON public.wrap_designs (published, sort_order);

CREATE POLICY "Super admins can upload wrap files"
ON storage.objects FOR INSERT TO authenticated
WITH CHECK (bucket_id = 'wraps' AND public.is_super(auth.uid()));

CREATE POLICY "Super admins can update wrap files"
ON storage.objects FOR UPDATE TO authenticated
USING (bucket_id = 'wraps' AND public.is_super(auth.uid()))
WITH CHECK (bucket_id = 'wraps' AND public.is_super(auth.uid()));

CREATE POLICY "Super admins can read wrap files"
ON storage.objects FOR SELECT TO authenticated
USING (bucket_id = 'wraps' AND public.is_super(auth.uid()));

CREATE POLICY "Super admins can delete wrap files"
ON storage.objects FOR DELETE TO authenticated
USING (bucket_id = 'wraps' AND public.is_super(auth.uid()));