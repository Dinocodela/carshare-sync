-- Create a security definer function to allow hosts to view client profiles
-- This function returns safe client information without exposing sensitive data
CREATE OR REPLACE FUNCTION public.get_clients_for_hosts()
RETURNS TABLE(
  user_id uuid,
  first_name text,
  last_name text,
  company_name text,
  email text,
  phone text,
  created_at timestamp with time zone,
  has_cars boolean,
  car_count bigint,
  hosted_car_count bigint
)
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  -- Verify the requesting user is a host
  IF NOT EXISTS (
    SELECT 1 FROM profiles 
    WHERE profiles.user_id = auth.uid() 
    AND profiles.role = 'host'
  ) THEN
    RAISE EXCEPTION 'Only hosts can view client information';
  END IF;
  
  -- Return client profiles with car statistics
  RETURN QUERY
  SELECT 
    p.user_id,
    p.first_name,
    p.last_name,
    p.company_name,
    p.email,
    p.phone,
    p.created_at,
    EXISTS(SELECT 1 FROM cars c WHERE c.client_id = p.user_id) as has_cars,
    COALESCE((SELECT COUNT(*) FROM cars c WHERE c.client_id = p.user_id), 0) as car_count,
    COALESCE((SELECT COUNT(*) FROM cars c WHERE c.client_id = p.user_id AND c.status = 'hosted'), 0) as hosted_car_count
  FROM profiles p
  WHERE p.role = 'client'
  ORDER BY p.created_at DESC;
END;
$$;

-- Grant execute permission to authenticated users
GRANT EXECUTE ON FUNCTION public.get_clients_for_hosts() TO authenticated;