-- Add unique constraint on trip_id for host_earnings table
ALTER TABLE public.host_earnings
ADD CONSTRAINT host_earnings_trip_id_unique UNIQUE (trip_id);

-- Add unique constraint on trip_id for host_expenses table
ALTER TABLE public.host_expenses
ADD CONSTRAINT host_expenses_trip_id_unique UNIQUE (trip_id);