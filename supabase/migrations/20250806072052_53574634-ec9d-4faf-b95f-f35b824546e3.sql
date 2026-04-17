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
$function$;

-- Create the trigger
CREATE TRIGGER validate_earning_dates_trigger
    BEFORE INSERT OR UPDATE ON public.host_earnings
    FOR EACH ROW EXECUTE FUNCTION public.validate_earning_dates();