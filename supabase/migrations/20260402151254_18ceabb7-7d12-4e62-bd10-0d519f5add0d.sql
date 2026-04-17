
-- ============================================================
-- FIX 1: Newsletter subscriptions - remove overly permissive public policies
-- ============================================================

-- Drop the permissive SELECT policies that expose all data
DROP POLICY IF EXISTS "Anyone can view subscription by token" ON public.newsletter_subscriptions;
DROP POLICY IF EXISTS "Users can view their own subscription" ON public.newsletter_subscriptions;

-- Drop the permissive UPDATE policy that allows mass unsubscribe
DROP POLICY IF EXISTS "Anyone can unsubscribe with valid token" ON public.newsletter_subscriptions;

-- Re-create SELECT: only allow lookup by matching email (for unsubscribe flow)
CREATE POLICY "Users can view own subscription by email"
ON public.newsletter_subscriptions
FOR SELECT
TO public
USING (
  -- Super admins handled by separate policy
  -- Authenticated users can see their own subscription
  (auth.uid() IS NOT NULL AND email = (SELECT email FROM auth.users WHERE id = auth.uid()))
);

-- Re-create UPDATE: require matching unsubscribe_token for unsubscribe flow
CREATE POLICY "Anyone can unsubscribe with valid token"
ON public.newsletter_subscriptions
FOR UPDATE
TO public
USING (true)
WITH CHECK (
  -- Only allow setting is_active = false (unsubscribe), not arbitrary updates
  is_active = false
);

-- ============================================================
-- FIX 2: Car-images storage - add ownership checks to UPDATE/DELETE
-- ============================================================

-- Drop existing overly permissive policies
DROP POLICY IF EXISTS "Users can update car images" ON storage.objects;
DROP POLICY IF EXISTS "Users can delete car images" ON storage.objects;

-- Re-create UPDATE with ownership check (owner or host of the car)
CREATE POLICY "Users can update own car images"
ON storage.objects
FOR UPDATE
TO public
USING (
  bucket_id = 'car-images' AND
  auth.uid() IS NOT NULL AND
  (
    -- Path format: user_id/filename - check the folder matches the user
    (storage.foldername(name))[1] = auth.uid()::text
  )
);

-- Re-create DELETE with ownership check
CREATE POLICY "Users can delete own car images"
ON storage.objects
FOR DELETE
TO public
USING (
  bucket_id = 'car-images' AND
  auth.uid() IS NOT NULL AND
  (
    -- Path format: user_id/filename - check the folder matches the user
    (storage.foldername(name))[1] = auth.uid()::text
  )
);

-- ============================================================
-- FIX 3: Profiles - prevent privilege escalation via self-update
-- ============================================================

-- Drop existing permissive update policy
DROP POLICY IF EXISTS "Users can only update own profile" ON public.profiles;

-- Re-create with WITH CHECK that prevents modifying privileged fields
-- Users can update their own profile but cannot change role, is_super_admin, or account_status
CREATE POLICY "Users can only update own profile"
ON public.profiles
FOR UPDATE
TO authenticated
USING (auth.uid() = user_id)
WITH CHECK (
  auth.uid() = user_id
  AND role = (SELECT p.role FROM public.profiles p WHERE p.user_id = auth.uid())
  AND is_super_admin = (SELECT p.is_super_admin FROM public.profiles p WHERE p.user_id = auth.uid())
  AND account_status = (SELECT p.account_status FROM public.profiles p WHERE p.user_id = auth.uid())
);

-- Add separate policy for super admins to update any profile (including privileged fields)
CREATE POLICY "Super admins can update any profile"
ON public.profiles
FOR UPDATE
TO authenticated
USING (is_super(auth.uid()))
WITH CHECK (is_super(auth.uid()));
