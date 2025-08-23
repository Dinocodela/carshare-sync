-- EMERGENCY: Check if RLS is actually enabled on profiles table
SELECT schemaname, tablename, rowsecurity 
FROM pg_tables 
WHERE schemaname = 'public' AND tablename = 'profiles';

-- Force enable RLS on profiles table 
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;

-- Drop potentially problematic policies and recreate with bulletproof security
DROP POLICY IF EXISTS "Users can view their own profile" ON public.profiles;
DROP POLICY IF EXISTS "Users can update their own profile" ON public.profiles;
DROP POLICY IF EXISTS "Users can insert their own profile" ON public.profiles;

-- Create bulletproof RLS policies with null checks
CREATE POLICY "Users can only view their own profile" 
ON public.profiles 
FOR SELECT 
TO authenticated
USING (auth.uid() IS NOT NULL AND user_id = auth.uid());

CREATE POLICY "Users can only update their own profile" 
ON public.profiles 
FOR UPDATE 
TO authenticated
USING (auth.uid() IS NOT NULL AND user_id = auth.uid())
WITH CHECK (auth.uid() IS NOT NULL AND user_id = auth.uid());

CREATE POLICY "Users can only insert their own profile" 
ON public.profiles 
FOR INSERT 
TO authenticated
WITH CHECK (auth.uid() IS NOT NULL AND user_id = auth.uid());

-- Block all access for anonymous users
CREATE POLICY "Block anonymous access to profiles" 
ON public.profiles 
FOR ALL 
TO anon
USING (false);

-- Verify RLS is working by checking table security status
SELECT 
  schemaname, 
  tablename, 
  rowsecurity as rls_enabled,
  COUNT(*) as policy_count
FROM pg_tables pt
LEFT JOIN pg_policies pp ON pt.tablename = pp.tablename AND pt.schemaname = pp.schemaname
WHERE pt.schemaname = 'public' AND pt.tablename = 'profiles'
GROUP BY schemaname, tablename, rowsecurity;