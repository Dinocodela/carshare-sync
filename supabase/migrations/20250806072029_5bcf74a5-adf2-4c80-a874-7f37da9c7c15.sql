-- Update the get_conflicting_earnings function to work with timestamps
CREATE OR REPLACE FUNCTION public.get_conflicting_earnings(p_car_id uuid, p_start_date timestamp with time zone, p_end_date timestamp with time zone)
 RETURNS TABLE(id uuid, trip_id text, earning_period_start timestamp with time zone, earning_period_end timestamp with time zone, guest_name text, amount numeric)
 LANGUAGE plpgsql
 SECURITY DEFINER
 SET search_path TO 'public'
AS $function$
BEGIN
  RETURN QUERY
  SELECT 
    he.id,
    he.trip_id,
    he.earning_period_start,
    he.earning_period_end,
    he.guest_name,
    he.amount
  FROM public.host_earnings he
  WHERE he.car_id = p_car_id
    AND (
      -- Overlapping timestamp ranges
      (p_start_date >= he.earning_period_start AND p_start_date <= he.earning_period_end)
      OR
      (p_end_date >= he.earning_period_start AND p_end_date <= he.earning_period_end)
      OR
      (p_start_date <= he.earning_period_start AND p_end_date >= he.earning_period_end)
    )
  ORDER BY he.earning_period_start;
END;
$function$;