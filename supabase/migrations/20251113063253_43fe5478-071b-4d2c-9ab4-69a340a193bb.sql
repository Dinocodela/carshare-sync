-- Add advanced personalization fields to profiles table
ALTER TABLE profiles
ADD COLUMN IF NOT EXISTS signup_source text,
ADD COLUMN IF NOT EXISTS signup_metadata jsonb DEFAULT '{}'::jsonb,
ADD COLUMN IF NOT EXISTS last_login_at timestamp with time zone,
ADD COLUMN IF NOT EXISTS login_count integer DEFAULT 0,
ADD COLUMN IF NOT EXISTS custom_properties jsonb DEFAULT '{}'::jsonb,
ADD COLUMN IF NOT EXISTS user_segment text,
ADD COLUMN IF NOT EXISTS tags text[] DEFAULT '{}';

-- Create index for faster queries on segments and tags
CREATE INDEX IF NOT EXISTS idx_profiles_user_segment ON profiles(user_segment);
CREATE INDEX IF NOT EXISTS idx_profiles_tags ON profiles USING GIN(tags);
CREATE INDEX IF NOT EXISTS idx_profiles_signup_source ON profiles(signup_source);

-- Create function to update last_login_at and login_count
CREATE OR REPLACE FUNCTION public.update_user_login_stats()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  UPDATE profiles
  SET 
    last_login_at = now(),
    login_count = COALESCE(login_count, 0) + 1
  WHERE user_id = NEW.id;
  RETURN NEW;
END;
$$;

-- Create trigger to track user logins
DROP TRIGGER IF EXISTS on_user_login ON auth.users;
CREATE TRIGGER on_user_login
  AFTER UPDATE OF last_sign_in_at ON auth.users
  FOR EACH ROW
  WHEN (OLD.last_sign_in_at IS DISTINCT FROM NEW.last_sign_in_at)
  EXECUTE FUNCTION public.update_user_login_stats();

COMMENT ON COLUMN profiles.signup_source IS 'Source of user signup (e.g., organic, referral, ad_campaign)';
COMMENT ON COLUMN profiles.signup_metadata IS 'Additional metadata about signup (utm params, referrer, etc.)';
COMMENT ON COLUMN profiles.custom_properties IS 'Custom key-value properties for advanced personalization';
COMMENT ON COLUMN profiles.user_segment IS 'User segment for targeted campaigns (e.g., power_user, new_user, inactive)';
COMMENT ON COLUMN profiles.tags IS 'Tags for categorizing users';