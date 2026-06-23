
-- 1) Cars: remove over-broad SELECT policies exposing VIN/plate to shared users and request hosts
DROP POLICY IF EXISTS "Shared users can view shared cars" ON public.cars;
DROP POLICY IF EXISTS "host_can_read_requested_car" ON public.cars;

-- 2) investor_payout_settings: allow investors to delete their own records
CREATE POLICY "investor_payout_settings: investor delete own"
  ON public.investor_payout_settings
  FOR DELETE
  TO authenticated
  USING (auth.uid() = investor_id);

-- 3) Authoritative super-admin source moved out of user-writable profiles
CREATE TABLE IF NOT EXISTS public.admin_grants (
  user_id uuid PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  granted_at timestamp with time zone NOT NULL DEFAULT now()
);

GRANT ALL ON public.admin_grants TO service_role;
ALTER TABLE public.admin_grants ENABLE ROW LEVEL SECURITY;
-- No user-facing INSERT/UPDATE/DELETE policies. Allow super admins to read for visibility.
CREATE POLICY "admin_grants: super admin read"
  ON public.admin_grants
  FOR SELECT
  TO authenticated
  USING (public.is_super(auth.uid()));

-- Seed from existing super admins
INSERT INTO public.admin_grants (user_id)
SELECT user_id FROM public.profiles WHERE is_super_admin = true
ON CONFLICT (user_id) DO NOTHING;

-- Update is_super to read from the admin-only table
CREATE OR REPLACE FUNCTION public.is_super(uid uuid)
 RETURNS boolean
 LANGUAGE sql
 STABLE SECURITY DEFINER
 SET search_path TO 'public'
AS $function$
  SELECT EXISTS (SELECT 1 FROM public.admin_grants WHERE user_id = uid);
$function$;

-- 4) Newsletter: stop unsubscribe token from being readable by subscribers/regular users
REVOKE SELECT (unsubscribe_token) ON public.newsletter_subscriptions FROM anon, authenticated;
