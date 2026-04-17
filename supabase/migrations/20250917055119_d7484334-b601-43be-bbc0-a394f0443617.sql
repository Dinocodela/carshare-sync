-- Update the update_user_profile function to include rating and review count parameters
CREATE OR REPLACE FUNCTION public.update_user_profile(
  p_first_name text DEFAULT NULL::text, 
  p_last_name text DEFAULT NULL::text, 
  p_company_name text DEFAULT NULL::text, 
  p_phone text DEFAULT NULL::text, 
  p_bio text DEFAULT NULL::text, 
  p_location text DEFAULT NULL::text, 
  p_services text[] DEFAULT NULL::text[], 
  p_turo_profile_url text DEFAULT NULL::text,
  p_role text DEFAULT NULL::text,
  p_rating numeric DEFAULT NULL::numeric,
  p_turo_reviews_count integer DEFAULT NULL::integer
)
RETURNS json
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $function$
DECLARE
  v_user_id uuid;
  v_result json;
  v_profile profiles%ROWTYPE;
  v_current_role text;
BEGIN
  -- Get the authenticated user ID
  v_user_id := auth.uid();
  
  -- Check if user is authenticated
  IF v_user_id IS NULL THEN
    RAISE EXCEPTION 'User not authenticated';
  END IF;
  
  -- Get current role from profile or user metadata
  SELECT role INTO v_current_role 
  FROM public.profiles 
  WHERE user_id = v_user_id;
  
  -- If no current role found, try to get from auth metadata
  IF v_current_role IS NULL AND p_role IS NULL THEN
    SELECT COALESCE(raw_user_meta_data->>'role', 'client') INTO v_current_role
    FROM auth.users 
    WHERE id = v_user_id;
  END IF;
  
  -- Use provided role or fallback to current/metadata role
  v_current_role := COALESCE(p_role, v_current_role, 'client');
  
  -- Update or insert the profile
  INSERT INTO public.profiles (
    user_id,
    role,
    first_name,
    last_name,
    company_name,
    phone,
    bio,
    location,
    services,
    turo_profile_url,
    rating,
    turo_reviews_count,
    updated_at
  ) VALUES (
    v_user_id,
    v_current_role,
    p_first_name,
    p_last_name,
    p_company_name,
    p_phone,
    p_bio,
    p_location,
    p_services,
    p_turo_profile_url,
    p_rating,
    p_turo_reviews_count,
    now()
  )
  ON CONFLICT (user_id) 
  DO UPDATE SET
    role = COALESCE(p_role, profiles.role),
    first_name = COALESCE(p_first_name, profiles.first_name),
    last_name = COALESCE(p_last_name, profiles.last_name),
    company_name = COALESCE(p_company_name, profiles.company_name),
    phone = COALESCE(p_phone, profiles.phone),
    bio = COALESCE(p_bio, profiles.bio),
    location = COALESCE(p_location, profiles.location),
    services = COALESCE(p_services, profiles.services),
    turo_profile_url = COALESCE(p_turo_profile_url, profiles.turo_profile_url),
    rating = COALESCE(p_rating, profiles.rating),
    turo_reviews_count = COALESCE(p_turo_reviews_count, profiles.turo_reviews_count),
    updated_at = now()
  RETURNING * INTO v_profile;
  
  -- Return the updated profile as JSON
  v_result := row_to_json(v_profile);
  
  RETURN v_result;
EXCEPTION
  WHEN OTHERS THEN
    RAISE EXCEPTION 'Failed to update profile: %', SQLERRM;
END;
$function$;