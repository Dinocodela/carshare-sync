-- Update the existing validation functions to work with timestamps

-- Drop the trigger first if it exists
DROP TRIGGER IF EXISTS validate_earning_dates_trigger ON public.host_earnings;

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
$function$;