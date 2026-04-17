-- First, let's update the existing profile that has 'name' in raw_user_meta_data
-- We'll split the name field if it exists and update the first_name and last_name
UPDATE public.profiles 
SET 
  first_name = CASE 
    WHEN position(' ' in (SELECT raw_user_meta_data->>'name' FROM auth.users WHERE auth.users.id = profiles.user_id)) > 0 
    THEN split_part((SELECT raw_user_meta_data->>'name' FROM auth.users WHERE auth.users.id = profiles.user_id), ' ', 1)
    ELSE (SELECT raw_user_meta_data->>'name' FROM auth.users WHERE auth.users.id = profiles.user_id)
  END,
  last_name = CASE 
    WHEN position(' ' in (SELECT raw_user_meta_data->>'name' FROM auth.users WHERE auth.users.id = profiles.user_id)) > 0 
    THEN substring((SELECT raw_user_meta_data->>'name' FROM auth.users WHERE auth.users.id = profiles.user_id) from position(' ' in (SELECT raw_user_meta_data->>'name' FROM auth.users WHERE auth.users.id = profiles.user_id)) + 1)
    ELSE NULL
  END
WHERE first_name IS NULL 
  AND last_name IS NULL
  AND EXISTS (
    SELECT 1 FROM auth.users 
    WHERE auth.users.id = profiles.user_id 
    AND auth.users.raw_user_meta_data->>'name' IS NOT NULL
  );

-- Update the handle_new_user function to handle both 'name' and separate 'first_name'/'last_name'
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER SET search_path = ''
AS $$
BEGIN
  INSERT INTO public.profiles (user_id, role, first_name, last_name, company_name, phone)
  VALUES (
    NEW.id,
    COALESCE(NEW.raw_user_meta_data->>'role', 'client'),
    COALESCE(
      NEW.raw_user_meta_data->>'first_name',
      CASE 
        WHEN NEW.raw_user_meta_data->>'name' IS NOT NULL AND position(' ' in NEW.raw_user_meta_data->>'name') > 0
        THEN split_part(NEW.raw_user_meta_data->>'name', ' ', 1)
        ELSE NEW.raw_user_meta_data->>'name'
      END
    ),
    COALESCE(
      NEW.raw_user_meta_data->>'last_name',
      CASE 
        WHEN NEW.raw_user_meta_data->>'name' IS NOT NULL AND position(' ' in NEW.raw_user_meta_data->>'name') > 0
        THEN substring(NEW.raw_user_meta_data->>'name' from position(' ' in NEW.raw_user_meta_data->>'name') + 1)
        ELSE NULL
      END
    ),
    NEW.raw_user_meta_data->>'company_name',
    NEW.raw_user_meta_data->>'phone'
  );
  RETURN NEW;
END;
$$;