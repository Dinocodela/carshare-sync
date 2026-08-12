CREATE OR REPLACE FUNCTION public.enforce_profile_insert_defaults()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  -- Trusted backend roles (service_role, admin edge functions) bypass this.
  IF auth.uid() IS NULL OR public.is_super(auth.uid()) THEN
    RETURN NEW;
  END IF;

  NEW.is_subscribed := false;
  NEW.rc_entitlements := NULL;
  NEW.rc_expiration_at := NULL;
  NEW.rc_will_renew := NULL;
  NEW.custom_client_profit_percentage := NULL;
  NEW.is_super_admin := false;
  NEW.account_status := 'pending';

  RETURN NEW;
END;
$$;

DROP TRIGGER IF EXISTS enforce_profile_insert_defaults_trg ON public.profiles;
CREATE TRIGGER enforce_profile_insert_defaults_trg
BEFORE INSERT ON public.profiles
FOR EACH ROW EXECUTE FUNCTION public.enforce_profile_insert_defaults();

REVOKE EXECUTE ON FUNCTION public.enforce_profile_insert_defaults() FROM PUBLIC, anon, authenticated;