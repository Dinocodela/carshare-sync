DROP POLICY IF EXISTS "Users can only update own profile" ON public.profiles;

CREATE POLICY "Users can only update own profile"
ON public.profiles
FOR UPDATE
TO authenticated
USING ((auth.uid() = user_id) AND (account_status = 'approved'::text))
WITH CHECK (
  (auth.uid() = user_id)
  AND (account_status = 'approved'::text)
  AND (role = (SELECT p.role FROM public.profiles p WHERE p.user_id = auth.uid()))
  AND (is_super_admin = (SELECT p.is_super_admin FROM public.profiles p WHERE p.user_id = auth.uid()))
  AND (account_status = (SELECT p.account_status FROM public.profiles p WHERE p.user_id = auth.uid()))
  AND (is_subscribed IS NOT DISTINCT FROM (SELECT p.is_subscribed FROM public.profiles p WHERE p.user_id = auth.uid()))
  AND (rc_entitlements IS NOT DISTINCT FROM (SELECT p.rc_entitlements FROM public.profiles p WHERE p.user_id = auth.uid()))
  AND (rc_expiration_at IS NOT DISTINCT FROM (SELECT p.rc_expiration_at FROM public.profiles p WHERE p.user_id = auth.uid()))
  AND (rc_will_renew IS NOT DISTINCT FROM (SELECT p.rc_will_renew FROM public.profiles p WHERE p.user_id = auth.uid()))
  AND (custom_client_profit_percentage IS NOT DISTINCT FROM (SELECT p.custom_client_profit_percentage FROM public.profiles p WHERE p.user_id = auth.uid()))
  AND (active_workspace IS NOT DISTINCT FROM (SELECT p.active_workspace FROM public.profiles p WHERE p.user_id = auth.uid()))
);