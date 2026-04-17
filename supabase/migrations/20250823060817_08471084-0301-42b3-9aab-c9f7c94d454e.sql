-- Drop all overly permissive cross-referencing policies
DROP POLICY IF EXISTS "Clients can view their hosts' profiles" ON public.profiles;
DROP POLICY IF EXISTS "Hosts can view their clients' profiles" ON public.profiles;
DROP POLICY IF EXISTS "Request participants can view each other's profiles" ON public.profiles;

-- Keep only the essential self-access policy
-- "Users can view their own profile" remains active

-- Create secure contact function with phone masking for business necessity
CREATE OR REPLACE FUNCTION public.get_contact_info(p_target_user_id uuid, p_context text)
RETURNS TABLE (
  user_id uuid,
  first_name text,
  role text,
  masked_phone text,
  company_name text,
  rating numeric
) 
SECURITY DEFINER
SET search_path = public
LANGUAGE plpgsql AS $$
DECLARE
  has_active_relationship boolean := false;
  requesting_user_id uuid;
BEGIN
  requesting_user_id := auth.uid();
  
  -- Verify active business relationship exists
  CASE p_context
    WHEN 'active_hosting' THEN
      -- Only for cars currently being hosted
      SELECT EXISTS (
        SELECT 1 FROM cars c 
        WHERE c.client_id = requesting_user_id 
        AND c.host_id = p_target_user_id 
        AND c.status = 'hosted'
      ) INTO has_active_relationship;
      
    WHEN 'pending_request' THEN
      -- Only for active pending requests
      SELECT EXISTS (
        SELECT 1 FROM requests r 
        WHERE ((r.client_id = requesting_user_id AND r.host_id = p_target_user_id)
        OR (r.host_id = requesting_user_id AND r.client_id = p_target_user_id))
        AND r.status = 'pending'
      ) INTO has_active_relationship;
      
    ELSE
      has_active_relationship := false;
  END CASE;
  
  -- Only return data if active relationship exists
  IF NOT has_active_relationship THEN
    RAISE EXCEPTION 'No active business relationship exists for contact access';
  END IF;
  
  -- Return minimal contact info with masked phone
  RETURN QUERY
  SELECT 
    p.user_id,
    p.first_name,
    p.role,
    -- Mask phone number (show last 4 digits only)
    CASE 
      WHEN p_context = 'active_hosting' THEN 
        '***-***-' || RIGHT(p.phone, 4)
      ELSE 
        '***-***-****'  -- More restrictive masking for requests
    END as masked_phone,
    p.company_name,
    COALESCE(p.rating, 0.0) as rating
  FROM profiles p
  WHERE p.user_id = p_target_user_id;
END;
$$;

-- Create function to get full contact info only for emergency/support purposes
CREATE OR REPLACE FUNCTION public.get_emergency_contact(p_target_user_id uuid)
RETURNS TABLE (
  first_name text,
  phone text
) 
SECURITY DEFINER
SET search_path = public
LANGUAGE plpgsql AS $$
DECLARE
  requesting_user_id uuid;
BEGIN
  requesting_user_id := auth.uid();
  
  -- Only allow emergency contact for active hosting relationships
  IF NOT EXISTS (
    SELECT 1 FROM cars c 
    WHERE ((c.client_id = requesting_user_id AND c.host_id = p_target_user_id)
    OR (c.host_id = requesting_user_id AND c.client_id = p_target_user_id))
    AND c.status = 'hosted'
  ) THEN
    RAISE EXCEPTION 'Emergency contact only available for active hosting relationships';
  END IF;
  
  -- Return minimal emergency contact info
  RETURN QUERY
  SELECT 
    p.first_name,
    p.phone
  FROM profiles p
  WHERE p.user_id = p_target_user_id;
END;
$$;