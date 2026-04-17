-- Update earning_period_start and earning_period_end columns to timestamp with time zone
-- This allows storing both date and time information for more precise rental periods

ALTER TABLE public.host_earnings 
ALTER COLUMN earning_period_start TYPE timestamp with time zone 
USING earning_period_start::timestamp with time zone;

ALTER TABLE public.host_earnings 
ALTER COLUMN earning_period_end TYPE timestamp with time zone 
USING earning_period_end::timestamp with time zone;

-- Update the existing validation function to work with timestamps
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
$function$

-- Update the conflict checking function to work with timestamps
CREATE OR REPLACE FUNCTION public.check_earning_date_conflicts(p_car_id uuid, p_start_date timestamp with time zone, p_end_date timestamp with time zone, p_exclude_id uuid DEFAULT NULL::uuid)
 RETURNS boolean
 LANGUAGE plpgsql
 SECURITY DEFINER
 SET search_path TO 'public'
AS $function$
BEGIN
  -- Check if there are any overlapping periods for the same car
  RETURN EXISTS (
    SELECT 1 
    FROM public.host_earnings 
    WHERE car_id = p_car_id
      AND (p_exclude_id IS NULL OR id != p_exclude_id)
      AND (
        -- New period starts during existing period
        (p_start_date >= earning_period_start AND p_start_date <= earning_period_end)
        OR
        -- New period ends during existing period  
        (p_end_date >= earning_period_start AND p_end_date <= earning_period_end)
        OR
        -- New period completely encompasses existing period
        (p_start_date <= earning_period_start AND p_end_date >= earning_period_end)
      )
  );
END;
$function$

-- Update the validation trigger to work with timestamps
CREATE OR REPLACE FUNCTION public.validate_earning_dates()
 RETURNS trigger
 LANGUAGE plpgsql
 SECURITY DEFINER
 SET search_path TO 'public'
AS $function$
BEGIN
  -- Validate that start timestamp is before end timestamp
  IF NEW.earning_period_start > NEW.earning_period_end THEN
    RAISE EXCEPTION 'Earning period start time must be before end time';
  END IF;

  -- Check for date conflicts with existing earnings
  IF public.check_earning_date_conflicts(
    NEW.car_id, 
    NEW.earning_period_start, 
    NEW.earning_period_end,
    CASE WHEN TG_OP = 'UPDATE' THEN NEW.id ELSE NULL END
  ) THEN
    RAISE EXCEPTION 'Cannot create overlapping rental periods for the same car. Conflict detected between % and %', 
      NEW.earning_period_start, NEW.earning_period_end;
  END IF;

  RETURN NEW;
END;
$function$