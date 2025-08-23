-- Create a secure function to get host contact information for clients
CREATE OR REPLACE FUNCTION get_host_contact_for_client(p_car_id UUID, p_client_id UUID)
RETURNS TABLE (
  car_id UUID,
  make TEXT,
  model TEXT,
  year INTEGER,
  status TEXT,
  host_id UUID,
  host_first_name TEXT,
  host_last_name TEXT,
  host_phone TEXT,
  host_company_name TEXT,
  host_location TEXT,
  host_rating NUMERIC,
  host_turo_reviews_count INTEGER,
  host_turo_profile_url TEXT
)
SECURITY DEFINER
LANGUAGE plpgsql
AS $$
BEGIN
  -- Return host contact information only if the user owns the car
  RETURN QUERY
  SELECT 
    c.id as car_id,
    c.make,
    c.model,
    c.year,
    c.status,
    p.user_id as host_id,
    p.first_name as host_first_name,
    p.last_name as host_last_name,
    p.phone as host_phone,
    p.company_name as host_company_name,
    p.location as host_location,
    p.rating as host_rating,
    p.turo_reviews_count as host_turo_reviews_count,
    p.turo_profile_url as host_turo_profile_url
  FROM cars c
  JOIN profiles p ON p.user_id = c.host_id
  WHERE c.id = p_car_id 
    AND c.client_id = p_client_id
    AND c.host_id IS NOT NULL;
END;
$$;