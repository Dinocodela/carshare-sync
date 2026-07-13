CREATE TABLE public.rate_limit_events (
  id uuid NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  bucket text NOT NULL,
  identifier text NOT NULL,
  created_at timestamptz NOT NULL DEFAULT now()
);

CREATE INDEX idx_rate_limit_events_lookup ON public.rate_limit_events (bucket, identifier, created_at);

GRANT ALL ON public.rate_limit_events TO service_role;

ALTER TABLE public.rate_limit_events ENABLE ROW LEVEL SECURITY;
-- No policies: table is only accessed by the SECURITY DEFINER function below and service_role.

CREATE OR REPLACE FUNCTION public.check_and_record_rate_limit(
  p_bucket text,
  p_identifier text,
  p_max integer,
  p_window_seconds integer
)
RETURNS boolean
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_count integer;
BEGIN
  -- Opportunistically purge old rows for this bucket to keep the table small.
  DELETE FROM public.rate_limit_events
  WHERE bucket = p_bucket
    AND created_at < now() - make_interval(secs => p_window_seconds * 10);

  SELECT count(*) INTO v_count
  FROM public.rate_limit_events
  WHERE bucket = p_bucket
    AND identifier = p_identifier
    AND created_at > now() - make_interval(secs => p_window_seconds);

  IF v_count >= p_max THEN
    RETURN false;
  END IF;

  INSERT INTO public.rate_limit_events (bucket, identifier)
  VALUES (p_bucket, p_identifier);

  RETURN true;
END;
$$;

REVOKE ALL ON FUNCTION public.check_and_record_rate_limit(text, text, integer, integer) FROM public, anon, authenticated;
GRANT EXECUTE ON FUNCTION public.check_and_record_rate_limit(text, text, integer, integer) TO service_role;