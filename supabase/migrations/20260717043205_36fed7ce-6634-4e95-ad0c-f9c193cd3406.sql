ALTER TABLE public.host_earnings ADD COLUMN IF NOT EXISTS notes text;
ALTER TABLE public.host_expenses ADD COLUMN IF NOT EXISTS notes text;