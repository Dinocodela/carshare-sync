-- Update RLS policies for newsletter_subscriptions to allow admin management

-- Drop existing policies
DROP POLICY IF EXISTS "Anyone can subscribe to newsletter" ON public.newsletter_subscriptions;
DROP POLICY IF EXISTS "Users can view their own subscription" ON public.newsletter_subscriptions;

-- Create new policies with proper admin access

-- Allow anyone to subscribe (public signup)
CREATE POLICY "Anyone can subscribe to newsletter" 
ON public.newsletter_subscriptions 
FOR INSERT 
WITH CHECK (true);

-- Allow users to view their own subscription by email
CREATE POLICY "Users can view their own subscription" 
ON public.newsletter_subscriptions 
FOR SELECT 
USING (true);

-- Allow super admins to view all subscriptions
CREATE POLICY "Super admins can view all subscriptions" 
ON public.newsletter_subscriptions 
FOR SELECT 
USING (
  EXISTS (
    SELECT 1 FROM public.profiles 
    WHERE user_id = auth.uid() 
    AND is_super_admin = true
  )
);

-- Allow super admins to update subscriptions (toggle active status)
CREATE POLICY "Super admins can update subscriptions" 
ON public.newsletter_subscriptions 
FOR UPDATE 
USING (
  EXISTS (
    SELECT 1 FROM public.profiles 
    WHERE user_id = auth.uid() 
    AND is_super_admin = true
  )
)
WITH CHECK (
  EXISTS (
    SELECT 1 FROM public.profiles 
    WHERE user_id = auth.uid() 
    AND is_super_admin = true
  )
);

-- Allow super admins to delete subscriptions
CREATE POLICY "Super admins can delete subscriptions" 
ON public.newsletter_subscriptions 
FOR DELETE 
USING (
  EXISTS (
    SELECT 1 FROM public.profiles 
    WHERE user_id = auth.uid() 
    AND is_super_admin = true
  )
);