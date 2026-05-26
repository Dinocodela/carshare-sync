
-- 1) Audit log table
CREATE TABLE public.host_audit_log (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  created_at timestamptz NOT NULL DEFAULT now(),
  host_id uuid NOT NULL,
  car_id uuid,
  action text NOT NULL,
  entity_type text NOT NULL,
  entity_id uuid,
  changes jsonb
);

CREATE INDEX idx_host_audit_log_host_id ON public.host_audit_log (host_id, created_at DESC);
CREATE INDEX idx_host_audit_log_car_id ON public.host_audit_log (car_id, created_at DESC);
CREATE INDEX idx_host_audit_log_entity ON public.host_audit_log (entity_type, entity_id);

ALTER TABLE public.host_audit_log ENABLE ROW LEVEL SECURITY;

-- Read policies
CREATE POLICY "Hosts can view their own audit log"
  ON public.host_audit_log FOR SELECT
  USING (auth.uid() = host_id);

CREATE POLICY "Clients can view audit log for their cars"
  ON public.host_audit_log FOR SELECT
  USING (
    car_id IS NOT NULL AND auth.uid() IN (
      SELECT c.client_id FROM public.cars c WHERE c.id = host_audit_log.car_id
    )
  );

CREATE POLICY "Super admins can view all audit log entries"
  ON public.host_audit_log FOR SELECT
  USING (public.is_super(auth.uid()));

-- No INSERT/UPDATE/DELETE policies: writes happen exclusively via SECURITY DEFINER
-- triggers and RPCs below, which bypass RLS.

-- 2) Generic trigger function for earnings/expenses/claims
CREATE OR REPLACE FUNCTION public.log_host_entity_change()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_action text;
  v_host_id uuid;
  v_car_id uuid;
  v_entity_id uuid;
  v_changes jsonb;
BEGIN
  IF TG_OP = 'INSERT' THEN
    v_action := TG_ARGV[0] || '_created';
    v_host_id := NEW.host_id;
    v_car_id := NEW.car_id;
    v_entity_id := NEW.id;
    v_changes := jsonb_build_object('new', to_jsonb(NEW));
  ELSIF TG_OP = 'UPDATE' THEN
    v_action := TG_ARGV[0] || '_updated';
    v_host_id := NEW.host_id;
    v_car_id := NEW.car_id;
    v_entity_id := NEW.id;
    v_changes := jsonb_build_object('old', to_jsonb(OLD), 'new', to_jsonb(NEW));
  ELSIF TG_OP = 'DELETE' THEN
    v_action := TG_ARGV[0] || '_deleted';
    v_host_id := OLD.host_id;
    v_car_id := OLD.car_id;
    v_entity_id := OLD.id;
    v_changes := jsonb_build_object('old', to_jsonb(OLD));
  END IF;

  INSERT INTO public.host_audit_log (host_id, car_id, action, entity_type, entity_id, changes)
  VALUES (v_host_id, v_car_id, v_action, TG_ARGV[0], v_entity_id, v_changes);

  IF TG_OP = 'DELETE' THEN
    RETURN OLD;
  END IF;
  RETURN NEW;
END;
$$;

-- Attach triggers
CREATE TRIGGER trg_host_earnings_audit
  AFTER INSERT OR UPDATE OR DELETE ON public.host_earnings
  FOR EACH ROW EXECUTE FUNCTION public.log_host_entity_change('earning');

CREATE TRIGGER trg_host_expenses_audit
  AFTER INSERT OR UPDATE OR DELETE ON public.host_expenses
  FOR EACH ROW EXECUTE FUNCTION public.log_host_entity_change('expense');

CREATE TRIGGER trg_host_claims_audit
  AFTER INSERT OR UPDATE OR DELETE ON public.host_claims
  FOR EACH ROW EXECUTE FUNCTION public.log_host_entity_change('claim');

-- 3) Update accept/reject RPCs to also write audit entries
CREATE OR REPLACE FUNCTION public.accept_hosting_request(p_request_id uuid)
RETURNS json
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_request public.requests%ROWTYPE;
  v_car public.cars%ROWTYPE;
  v_result json;
BEGIN
  SELECT * INTO v_request
  FROM public.requests
  WHERE id = p_request_id AND host_id = auth.uid() AND status = 'pending'
  FOR UPDATE;

  IF NOT FOUND THEN
    RAISE EXCEPTION 'Request not found or not authorized';
  END IF;

  SELECT * INTO v_car FROM public.cars WHERE id = v_request.car_id;
  IF NOT FOUND THEN
    RAISE EXCEPTION 'Car not found';
  END IF;

  UPDATE public.requests SET status = 'accepted', updated_at = now() WHERE id = p_request_id;
  UPDATE public.cars SET status = 'hosted', host_id = auth.uid(), updated_at = now()
    WHERE id = v_request.car_id;

  INSERT INTO public.host_audit_log (host_id, car_id, action, entity_type, entity_id, changes)
  VALUES (
    auth.uid(),
    v_request.car_id,
    'request_accepted',
    'request',
    p_request_id,
    jsonb_build_object('request', to_jsonb(v_request))
  );

  v_result := json_build_object(
    'success', true,
    'request_id', p_request_id,
    'car_id', v_request.car_id,
    'status', 'accepted'
  );
  RETURN v_result;
EXCEPTION
  WHEN OTHERS THEN
    RAISE EXCEPTION 'Failed to accept hosting request: %', SQLERRM;
END;
$$;

CREATE OR REPLACE FUNCTION public.reject_hosting_request(p_request_id uuid)
RETURNS json
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_request public.requests%ROWTYPE;
  v_result json;
BEGIN
  SELECT * INTO v_request
  FROM public.requests
  WHERE id = p_request_id AND host_id = auth.uid() AND status = 'pending'
  FOR UPDATE;

  IF NOT FOUND THEN
    RAISE EXCEPTION 'Request not found or not authorized';
  END IF;

  UPDATE public.cars
    SET status = 'available', host_id = NULL, updated_at = now()
    WHERE id = v_request.car_id;

  UPDATE public.requests
    SET status = 'rejected', updated_at = now()
    WHERE id = p_request_id;

  INSERT INTO public.host_audit_log (host_id, car_id, action, entity_type, entity_id, changes)
  VALUES (
    auth.uid(),
    v_request.car_id,
    'request_rejected',
    'request',
    p_request_id,
    jsonb_build_object('request', to_jsonb(v_request))
  );

  v_result := json_build_object(
    'success', true,
    'request_id', p_request_id,
    'car_id', v_request.car_id,
    'status', 'rejected'
  );
  RETURN v_result;
EXCEPTION
  WHEN OTHERS THEN
    RAISE EXCEPTION 'Failed to reject hosting request: %', SQLERRM;
END;
$$;
