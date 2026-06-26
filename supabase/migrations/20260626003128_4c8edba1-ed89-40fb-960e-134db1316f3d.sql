ALTER TABLE public.profiles ADD COLUMN IF NOT EXISTS custom_client_profit_percentage numeric;

COMMENT ON COLUMN public.profiles.custom_client_profit_percentage IS 'Optional per-client override of the client profit split percentage (e.g. 80 means client keeps 80%, host takes 20%). When null, the standard hierarchy applies.';