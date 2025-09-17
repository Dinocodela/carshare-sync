-- Create a secure function to update user profiles
CREATE OR REPLACE FUNCTION public.update_user_profile(
  p_first_name TEXT DEFAULT NULL,
  p_last_name TEXT DEFAULT NULL,
  p_company_name TEXT DEFAULT NULL,
  p_phone TEXT DEFAULT NULL,
  p_bio TEXT DEFAULT NULL,
  p_location TEXT DEFAULT NULL,
  p_services TEXT[] DEFAULT NULL,
  p_turo_profile_url TEXT DEFAULT NULL
)
RETURNS json
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_user_id uuid;
  v_result json;
  v_profile profiles%ROWTYPE;
BEGIN
  -- Get the authenticated user ID
  v_user_id := auth.uid();
  
  -- Check if user is authenticated
  IF v_user_id IS NULL THEN
    RAISE EXCEPTION 'User not authenticated';
  END IF;
  
  -- Update or insert the profile
  INSERT INTO public.profiles (
    user_id,
    first_name,
    last_name,
    company_name,
    phone,
    bio,
    location,
    services,
    turo_profile_url,
    updated_at
  ) VALUES (
    v_user_id,
    p_first_name,
    p_last_name,
    p_company_name,
    p_phone,
    p_bio,
    p_location,
    p_services,
    p_turo_profile_url,
    now()
  )
  ON CONFLICT (user_id) 
  DO UPDATE SET
    first_name = COALESCE(p_first_name, profiles.first_name),
    last_name = COALESCE(p_last_name, profiles.last_name),
    company_name = COALESCE(p_company_name, profiles.company_name),
    phone = COALESCE(p_phone, profiles.phone),
    bio = COALESCE(p_bio, profiles.bio),
    location = COALESCE(p_location, profiles.location),
    services = COALESCE(p_services, profiles.services),
    turo_profile_url = COALESCE(p_turo_profile_url, profiles.turo_profile_url),
    updated_at = now()
  RETURNING * INTO v_profile;
  
  -- Return the updated profile as JSON
  v_result := row_to_json(v_profile);
  
  RETURN v_result;
EXCEPTION
  WHEN OTHERS THEN
    RAISE EXCEPTION 'Failed to update profile: %', SQLERRM;
END;
$$;