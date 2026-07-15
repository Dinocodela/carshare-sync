
CREATE OR REPLACE FUNCTION public.prevent_cars_ownership_reassignment()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  uid uuid := auth.uid();
  is_privileged boolean := false;
BEGIN
  -- Service role / no JWT context bypasses (server-side edge functions, admin flows)
  IF uid IS NULL THEN
    RETURN NEW;
  END IF;

  -- Super admins are allowed to reassign ownership
  BEGIN
    SELECT public.is_super(uid) INTO is_privileged;
  EXCEPTION WHEN undefined_function THEN
    is_privileged := false;
  END;

  IF is_privileged THEN
    RETURN NEW;
  END IF;

  IF NEW.host_id IS DISTINCT FROM OLD.host_id THEN
    RAISE EXCEPTION 'host_id cannot be reassigned by this user'
      USING ERRCODE = '42501';
  END IF;

  IF NEW.client_id IS DISTINCT FROM OLD.client_id THEN
    RAISE EXCEPTION 'client_id cannot be reassigned by this user'
      USING ERRCODE = '42501';
  END IF;

  RETURN NEW;
END;
$$;

DROP TRIGGER IF EXISTS trg_prevent_cars_ownership_reassignment ON public.cars;
CREATE TRIGGER trg_prevent_cars_ownership_reassignment
BEFORE UPDATE ON public.cars
FOR EACH ROW
EXECUTE FUNCTION public.prevent_cars_ownership_reassignment();
