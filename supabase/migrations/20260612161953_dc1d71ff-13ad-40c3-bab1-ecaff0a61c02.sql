
DROP POLICY IF EXISTS "Super admins can delete subscriptions" ON public.newsletter_subscriptions;
DROP POLICY IF EXISTS "Super admins can update subscriptions" ON public.newsletter_subscriptions;
DROP POLICY IF EXISTS "Super admins can view all subscriptions" ON public.newsletter_subscriptions;

CREATE POLICY "Super admins can delete subscriptions"
ON public.newsletter_subscriptions FOR DELETE
USING (public.is_super(auth.uid()));

CREATE POLICY "Super admins can update subscriptions"
ON public.newsletter_subscriptions FOR UPDATE
USING (public.is_super(auth.uid()))
WITH CHECK (public.is_super(auth.uid()));

CREATE POLICY "Super admins can view all subscriptions"
ON public.newsletter_subscriptions FOR SELECT
USING (public.is_super(auth.uid()));
