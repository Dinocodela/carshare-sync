-- Create secure view for cars without sensitive identifiers
CREATE OR REPLACE VIEW public.cars_public AS
SELECT 
  id,
  client_id,
  host_id,
  make,
  model,
  year,
  color,
  mileage,
  -- Mask location to general area only
  CASE 
    WHEN location IS NOT NULL THEN 
      SPLIT_PART(location, ',', 1) || ', CA'  -- General area only
    ELSE NULL 
  END as general_location,
  description,
  images,
  status,
  created_at,
  updated_at
FROM cars;

-- Drop policies that expose sensitive data
DROP POLICY IF EXISTS "Car owners can view their cars" ON public.cars;
DROP POLICY IF EXISTS "Car hosts can view their cars" ON public.cars; 
DROP POLICY IF EXISTS "Users with car access can view shared cars" ON public.cars;

-- Create extremely restrictive policy - only car owners get sensitive data
CREATE POLICY "Car owners can view their complete car data" 
ON public.cars 
FOR SELECT 
USING (auth.uid() = client_id);

-- Create public view policy for hosts and shared users
CREATE POLICY "Users can view public car information" 
ON public.cars_public 
FOR SELECT 
USING (
  -- Car owners get access
  (auth.uid() = client_id) OR
  -- Current hosts get access  
  (auth.uid() = host_id) OR
  -- Shared access users get limited access
  (id IN (
    SELECT car_id FROM car_access 
    WHERE user_id = auth.uid()
  ))
);

-- Create secure function for hosts to get minimal vehicle identifiers when absolutely necessary
CREATE OR REPLACE FUNCTION public.get_vehicle_identifiers_for_host(p_car_id uuid, p_purpose text)
RETURNS TABLE (
  car_id uuid,
  masked_license_plate text,
  partial_vin text,
  emergency_contact_allowed boolean
) 
SECURITY DEFINER
SET search_path = public
LANGUAGE plpgsql AS $$
DECLARE
  requesting_user_id uuid;
  is_current_host boolean := false;
BEGIN
  requesting_user_id := auth.uid();
  
  -- Verify user is the current host of this specific car
  SELECT EXISTS (
    SELECT 1 FROM cars c 
    WHERE c.id = p_car_id 
    AND c.host_id = requesting_user_id 
    AND c.status = 'hosted'
  ) INTO is_current_host;
  
  -- Only allow access for legitimate purposes and current hosts
  IF NOT is_current_host THEN
    RAISE EXCEPTION 'Vehicle identifier access denied: not current host';
  END IF;
  
  -- Validate purpose for access
  IF p_purpose NOT IN ('emergency', 'maintenance', 'incident_report') THEN
    RAISE EXCEPTION 'Invalid purpose for vehicle identifier access';
  END IF;
  
  -- Log the access attempt for audit trail
  INSERT INTO audit_log (user_id, action, table_name, record_id, details, created_at)
  VALUES (requesting_user_id, 'vehicle_identifier_access', 'cars', p_car_id, 
          jsonb_build_object('purpose', p_purpose), NOW())
  ON CONFLICT DO NOTHING;
  
  -- Return minimal masked identifiers
  RETURN QUERY
  SELECT 
    c.id as car_id,
    -- Mask license plate (show first 2 and last 1 characters only)
    CASE 
      WHEN c.license_plate IS NOT NULL THEN 
        LEFT(c.license_plate, 2) || '***' || RIGHT(c.license_plate, 1)
      ELSE '***'
    END as masked_license_plate,
    -- Mask VIN (show last 6 characters only)
    CASE 
      WHEN c.vin_number IS NOT NULL THEN 
        '***' || RIGHT(c.vin_number, 6)
      ELSE '***'
    END as partial_vin,
    -- Only allow emergency contact for legitimate emergencies
    (p_purpose = 'emergency') as emergency_contact_allowed
  FROM cars c
  WHERE c.id = p_car_id;
END;
$$;

-- Create audit log table for sensitive data access tracking
CREATE TABLE IF NOT EXISTS public.audit_log (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL,
  action text NOT NULL,
  table_name text NOT NULL,
  record_id uuid,
  details jsonb,
  created_at timestamp with time zone DEFAULT now()
);

-- Enable RLS on audit log
ALTER TABLE public.audit_log ENABLE ROW LEVEL SECURITY;

-- Only allow users to see their own audit entries
CREATE POLICY "Users can view their own audit entries" 
ON public.audit_log 
FOR SELECT 
USING (auth.uid() = user_id);

-- Create policy for system to insert audit entries
CREATE POLICY "System can insert audit entries" 
ON public.audit_log 
FOR INSERT 
WITH CHECK (true);