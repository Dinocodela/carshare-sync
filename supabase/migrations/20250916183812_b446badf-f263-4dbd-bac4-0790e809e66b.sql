-- Fix security issue with profiles table RLS policies
-- Remove the problematic "Block anonymous access" policy that conflicts with other policies
DROP POLICY IF EXISTS "Block anonymous access to profiles" ON public.profiles;

-- Ensure we have secure, specific policies for each operation
DROP POLICY IF EXISTS "profiles: self or super read" ON public.profiles;
DROP POLICY IF EXISTS "profiles: user update own basic fields" ON public.profiles;

-- Create secure SELECT policy - only own profile or super admin
CREATE POLICY "Users can only view own profile or super admin can view all"
ON public.profiles
FOR SELECT
TO authenticated
USING (
  auth.uid() = user_id OR 
  public.is_super(auth.uid())
);

-- Create secure UPDATE policy - only own profile
CREATE POLICY "Users can only update own profile"
ON public.profiles
FOR UPDATE
TO authenticated
USING (auth.uid() = user_id)
WITH CHECK (auth.uid() = user_id);

-- Create secure INSERT policy - users can only create their own profile
CREATE POLICY "Users can only insert own profile"
ON public.profiles
FOR INSERT
TO authenticated
WITH CHECK (auth.uid() = user_id);

-- Create secure DELETE policy - only super admin can delete profiles
CREATE POLICY "Only super admin can delete profiles"
ON public.profiles
FOR DELETE
TO authenticated
USING (public.is_super(auth.uid()));

-- Ensure anonymous users have no access at all
-- This is handled by the "TO authenticated" clause in all policies above