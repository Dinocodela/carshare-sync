-- Drop the failed view
DROP VIEW IF EXISTS public.cars_public;

-- Drop existing overly permissive policies
DROP POLICY IF EXISTS "Car owners can view their cars" ON public.cars;
DROP POLICY IF EXISTS "Car hosts can view their cars" ON public.cars; 
DROP POLICY IF EXISTS "Users with car access can view shared cars" ON public.cars;

-- Create ultra-restrictive policy - ONLY car owners can see sensitive data directly
CREATE POLICY "Car owners can view their complete car data" 
ON public.cars 
FOR SELECT 
USING (auth.uid() = client_id);

-- Create secure function for safe car data access (without VIN/license plate)
CREATE OR REPLACE FUNCTION public.get_safe_car_info(p_user_id uuid DEFAULT NULL)
RETURNS TABLE (
  id uuid,
  client_id uuid,
  host_id uuid,
  make text,
  model text,
  year integer,
  color text,
  mileage integer,
  general_location text,
  description text,
  images text[],
  status text,
  created_at timestamp with time zone,
  updated_at timestamp with time zone,
  user_relationship text
) 
SECURITY DEFINER
SET search_path = public
LANGUAGE plpgsql AS $$
DECLARE
  requesting_user_id uuid;
BEGIN
  requesting_user_id := COALESCE(p_user_id, auth.uid());
  
  RETURN QUERY
  SELECT 
    c.id,
    c.client_id,
    c.host_id,
    c.make,
    c.model,
    c.year,
    c.color,
    c.mileage,
    -- Mask location to general area only
    CASE 
      WHEN c.location IS NOT NULL THEN 
        SPLIT_PART(c.location, ' ', 1) || ' Area'  -- Just first part + "Area"
      ELSE NULL 
    END as general_location,
    c.description,
    c.images,
    c.status,
    c.created_at,
    c.updated_at,
    -- Indicate user's relationship to the car
    CASE 
      WHEN c.client_id = requesting_user_id THEN 'owner'
      WHEN c.host_id = requesting_user_id THEN 'host'
      WHEN EXISTS (SELECT 1 FROM car_access ca WHERE ca.car_id = c.id AND ca.user_id = requesting_user_id) THEN 'shared_access'
      ELSE 'none'
    END as user_relationship
  FROM cars c
  WHERE 
    -- Car owners get their cars
    c.client_id = requesting_user_id OR
    -- Current hosts get cars they're hosting
    c.host_id = requesting_user_id OR
    -- Shared access users get limited access
    c.id IN (
      SELECT car_id FROM car_access 
      WHERE user_id = requesting_user_id
    );
END;
$$;

-- Create emergency vehicle identification function (heavily restricted)
CREATE OR REPLACE FUNCTION public.get_vehicle_identifiers_emergency(p_car_id uuid, p_purpose text)
RETURNS TABLE (
  masked_license_plate text,
  partial_vin text,
  full_location text
) 
SECURITY DEFINER
SET search_path = public
LANGUAGE plpgsql AS $$
DECLARE
  requesting_user_id uuid;
  has_access boolean := false;
BEGIN
  requesting_user_id := auth.uid();
  
  -- Verify legitimate access (owner or current active host only)
  SELECT EXISTS (
    SELECT 1 FROM cars c 
    WHERE c.id = p_car_id 
    AND (
      c.client_id = requesting_user_id OR 
      (c.host_id = requesting_user_id AND c.status = 'hosted')
    )
  ) INTO has_access;
  
  IF NOT has_access THEN
    RAISE EXCEPTION 'Vehicle identifier access denied: insufficient permissions';
  END IF;
  
  -- Validate emergency purposes only
  IF p_purpose NOT IN ('police_report', 'insurance_claim', 'emergency_contact', 'accident_report') THEN
    RAISE EXCEPTION 'Invalid purpose: only emergency situations allowed';
  END IF;
  
  -- Create audit log table if it doesn't exist
  CREATE TABLE IF NOT EXISTS audit_log (
    id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id uuid NOT NULL,
    action text NOT NULL,
    table_name text NOT NULL,
    record_id uuid,
    details jsonb,
    created_at timestamp with time zone DEFAULT now()
  );
  
  -- Log the sensitive access
  INSERT INTO audit_log (user_id, action, table_name, record_id, details, created_at)
  VALUES (requesting_user_id, 'emergency_vehicle_access', 'cars', p_car_id, 
          jsonb_build_object('purpose', p_purpose, 'timestamp', NOW()), NOW())
  ON CONFLICT DO NOTHING;
  
  -- Return heavily masked identifiers for emergency use only
  RETURN QUERY
  SELECT 
    -- License plate masking (show first 2 and last 1 characters)
    CASE 
      WHEN c.license_plate IS NOT NULL AND LENGTH(c.license_plate) > 3 THEN 
        LEFT(c.license_plate, 2) || '***' || RIGHT(c.license_plate, 1)
      WHEN c.license_plate IS NOT NULL THEN 
        '***' || RIGHT(c.license_plate, 1)
      ELSE 'HIDDEN'
    END as masked_license_plate,
    -- VIN masking (show last 6 characters only for emergencies)
    CASE 
      WHEN c.vin_number IS NOT NULL AND LENGTH(c.vin_number) > 6 THEN 
        'VIN***' || RIGHT(c.vin_number, 6)
      ELSE 'HIDDEN'
    END as partial_vin,
    -- Full location only for true emergencies
    CASE 
      WHEN p_purpose IN ('police_report', 'accident_report') THEN c.location
      ELSE SPLIT_PART(c.location, ' ', 1) || ' Area'
    END as full_location
  FROM cars c
  WHERE c.id = p_car_id;
END;
$$;