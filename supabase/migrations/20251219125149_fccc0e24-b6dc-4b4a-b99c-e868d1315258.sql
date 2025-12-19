-- Add the new column
ALTER TABLE public.host_earnings 
ADD COLUMN earning_period_date_int bigint;

-- Populate existing rows with Unix timestamp (seconds since epoch)
UPDATE public.host_earnings 
SET earning_period_date_int = EXTRACT(EPOCH FROM earning_period_start)::bigint;

-- Create function to auto-populate the column
CREATE OR REPLACE FUNCTION public.set_earning_period_date_int()
RETURNS TRIGGER AS $$
BEGIN
  NEW.earning_period_date_int := EXTRACT(EPOCH FROM NEW.earning_period_start)::bigint;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER SET search_path = public;

-- Create trigger to run on INSERT and UPDATE
CREATE TRIGGER set_earning_period_date_int_trigger
BEFORE INSERT OR UPDATE OF earning_period_start ON public.host_earnings
FOR EACH ROW
EXECUTE FUNCTION public.set_earning_period_date_int();