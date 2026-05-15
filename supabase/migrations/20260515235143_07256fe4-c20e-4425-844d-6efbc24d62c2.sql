
-- 1) Restrict email_template_gallery SELECT to super-admins only
DROP POLICY IF EXISTS "Authenticated users can view gallery templates" ON public.email_template_gallery;
-- "Super admins can manage gallery templates" (FOR ALL) already covers super-admin SELECT.

-- 2) Profiles: require approved account_status to update own profile
DROP POLICY IF EXISTS "Users can only update own profile" ON public.profiles;
CREATE POLICY "Users can only update own profile"
ON public.profiles
FOR UPDATE
TO authenticated
USING (
  auth.uid() = user_id
  AND account_status = 'approved'
)
WITH CHECK (
  auth.uid() = user_id
  AND account_status = 'approved'
  AND role = (SELECT p.role FROM public.profiles p WHERE p.user_id = auth.uid())
  AND is_super_admin = (SELECT p.is_super_admin FROM public.profiles p WHERE p.user_id = auth.uid())
  AND account_status = (SELECT p.account_status FROM public.profiles p WHERE p.user_id = auth.uid())
);

-- 3) Allow car-owning clients to view guest contact tied to their cars' earnings
CREATE POLICY "Clients can view guest contact for their cars"
ON public.host_earnings_guest_contact
FOR SELECT
USING (
  EXISTS (
    SELECT 1
    FROM public.host_earnings he
    JOIN public.cars c ON c.id = he.car_id
    WHERE he.id = host_earnings_guest_contact.earning_id
      AND c.client_id = auth.uid()
  )
);
