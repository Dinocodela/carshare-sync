
DO $$
DECLARE
  v_old uuid := '1bee30cc-abe2-484a-9a8a-f9199977a3ce'; -- waltersrawlife (host)
  v_new uuid := '4aeced9e-f510-459c-9a1f-3be0612ec0bd'; -- cuevawalter (survivor)
BEGIN
  UPDATE public.cars                  SET host_id   = v_new WHERE host_id   = v_old;
  UPDATE public.host_earnings         SET host_id   = v_new WHERE host_id   = v_old;
  UPDATE public.host_expenses         SET host_id   = v_new WHERE host_id   = v_old;
  UPDATE public.host_claims           SET host_id   = v_new WHERE host_id   = v_old;
  UPDATE public.maintenance_schedules SET host_id   = v_new WHERE host_id   = v_old;
  UPDATE public.host_audit_log        SET host_id   = v_new WHERE host_id   = v_old;
  UPDATE public.requests              SET host_id   = v_new WHERE host_id   = v_old;
END $$;
