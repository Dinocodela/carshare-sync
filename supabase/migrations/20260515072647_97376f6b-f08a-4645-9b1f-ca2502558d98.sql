
-- 1) Email template gallery: require authentication to view templates
DROP POLICY IF EXISTS "Anyone can view gallery templates" ON public.email_template_gallery;
CREATE POLICY "Authenticated users can view gallery templates"
  ON public.email_template_gallery
  FOR SELECT
  TO authenticated
  USING (true);

-- 2) Storage policies for blog-images bucket (public read, super-admin writes only)
DROP POLICY IF EXISTS "Public can read blog images" ON storage.objects;
CREATE POLICY "Public can read blog images"
  ON storage.objects FOR SELECT
  USING (bucket_id = 'blog-images');

DROP POLICY IF EXISTS "Super admins can upload blog images" ON storage.objects;
CREATE POLICY "Super admins can upload blog images"
  ON storage.objects FOR INSERT
  TO authenticated
  WITH CHECK (bucket_id = 'blog-images' AND public.is_super(auth.uid()));

DROP POLICY IF EXISTS "Super admins can update blog images" ON storage.objects;
CREATE POLICY "Super admins can update blog images"
  ON storage.objects FOR UPDATE
  TO authenticated
  USING (bucket_id = 'blog-images' AND public.is_super(auth.uid()))
  WITH CHECK (bucket_id = 'blog-images' AND public.is_super(auth.uid()));

DROP POLICY IF EXISTS "Super admins can delete blog images" ON storage.objects;
CREATE POLICY "Super admins can delete blog images"
  ON storage.objects FOR DELETE
  TO authenticated
  USING (bucket_id = 'blog-images' AND public.is_super(auth.uid()));

-- 3) Reservations: drop guest PII columns (the reservations system has been removed)
ALTER TABLE public.reservations DROP COLUMN IF EXISTS guest_email;
ALTER TABLE public.reservations DROP COLUMN IF EXISTS guest_phone;
