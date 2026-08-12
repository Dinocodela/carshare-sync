CREATE POLICY "super admins read social media" ON storage.objects
  FOR SELECT TO authenticated
  USING (bucket_id = 'social-media' AND public.is_super(auth.uid()));

CREATE POLICY "super admins upload social media" ON storage.objects
  FOR INSERT TO authenticated
  WITH CHECK (bucket_id = 'social-media' AND public.is_super(auth.uid()));

CREATE POLICY "super admins update social media" ON storage.objects
  FOR UPDATE TO authenticated
  USING (bucket_id = 'social-media' AND public.is_super(auth.uid()))
  WITH CHECK (bucket_id = 'social-media' AND public.is_super(auth.uid()));

CREATE POLICY "super admins delete social media" ON storage.objects
  FOR DELETE TO authenticated
  USING (bucket_id = 'social-media' AND public.is_super(auth.uid()));