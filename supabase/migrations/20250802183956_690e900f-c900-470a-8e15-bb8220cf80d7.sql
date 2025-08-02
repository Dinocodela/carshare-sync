-- Create function to check for date conflicts in host_earnings
CREATE OR REPLACE FUNCTION public.check_earning_date_conflicts(
  p_car_id UUID,
  p_start_date DATE,
  p_end_date DATE,
  p_exclude_id UUID DEFAULT NULL
)
RETURNS BOOLEAN AS $$
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
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Create trigger function to validate date conflicts before insert/update
CREATE OR REPLACE FUNCTION public.validate_earning_dates()
RETURNS TRIGGER AS $$
BEGIN
  -- Validate that start date is before end date
  IF NEW.earning_period_start > NEW.earning_period_end THEN
    RAISE EXCEPTION 'Earning period start date must be before end date';
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
$$ LANGUAGE plpgsql;

-- Create triggers for insert and update operations
CREATE TRIGGER validate_earning_dates_insert
  BEFORE INSERT ON public.host_earnings
  FOR EACH ROW
  EXECUTE FUNCTION public.validate_earning_dates();

CREATE TRIGGER validate_earning_dates_update
  BEFORE UPDATE ON public.host_earnings
  FOR EACH ROW
  EXECUTE FUNCTION public.validate_earning_dates();

-- Create function to get conflicting earnings for a car and date range
CREATE OR REPLACE FUNCTION public.get_conflicting_earnings(
  p_car_id UUID,
  p_start_date DATE,
  p_end_date DATE
)
RETURNS TABLE(
  id UUID,
  trip_id TEXT,
  earning_period_start DATE,
  earning_period_end DATE,
  guest_name TEXT,
  amount NUMERIC
) AS $$
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
      -- Overlapping date ranges
      (p_start_date >= he.earning_period_start AND p_start_date <= he.earning_period_end)
      OR
      (p_end_date >= he.earning_period_start AND p_end_date <= he.earning_period_end)
      OR
      (p_start_date <= he.earning_period_start AND p_end_date >= he.earning_period_end)
    )
  ORDER BY he.earning_period_start;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;