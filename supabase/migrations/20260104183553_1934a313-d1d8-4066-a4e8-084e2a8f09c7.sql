-- Remove unused profit amount columns (now calculated on request)
ALTER TABLE public.host_earnings DROP COLUMN IF EXISTS client_profit_amount;
ALTER TABLE public.host_earnings DROP COLUMN IF EXISTS host_profit_amount;