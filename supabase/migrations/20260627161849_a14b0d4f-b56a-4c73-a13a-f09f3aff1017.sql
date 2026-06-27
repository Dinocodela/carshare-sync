-- Allow clients (car owners) to read earnings for their own cars so the
-- security_invoker view can resolve rows under their own privileges.
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_policy
    WHERE polrelid = 'public.host_earnings'::regclass
      AND polname = 'Clients can view earnings for their cars'
  ) THEN
    CREATE POLICY "Clients can view earnings for their cars"
      ON public.host_earnings
      FOR SELECT
      TO authenticated
      USING (
        car_id IN (
          SELECT c.id FROM public.cars c WHERE c.client_id = auth.uid()
        )
      );
  END IF;
END$$;

-- Convert the view to SECURITY INVOKER to satisfy the linter.
ALTER VIEW public.client_visible_earnings SET (security_invoker = on);
