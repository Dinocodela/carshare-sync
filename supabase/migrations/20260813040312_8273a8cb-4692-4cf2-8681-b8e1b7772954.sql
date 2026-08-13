CREATE TABLE public.wrap_drop_jobs (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  status text NOT NULL DEFAULT 'queued',
  template_key text NOT NULL,
  theme text,
  brief jsonb,
  design_id uuid REFERENCES public.wrap_designs(id) ON DELETE SET NULL,
  post_id uuid,
  video_job_id text,
  asset_paths jsonb NOT NULL DEFAULT '{}'::jsonb,
  error text,
  attempts integer NOT NULL DEFAULT 0,
  triggered_by uuid,
  scheduled_post_at timestamptz,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

GRANT SELECT ON public.wrap_drop_jobs TO authenticated;
GRANT ALL ON public.wrap_drop_jobs TO service_role;

ALTER TABLE public.wrap_drop_jobs ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Super admins can view wrap drop jobs"
ON public.wrap_drop_jobs FOR SELECT TO authenticated
USING (public.is_super(auth.uid()));

CREATE TRIGGER update_wrap_drop_jobs_updated_at
BEFORE UPDATE ON public.wrap_drop_jobs
FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

CREATE INDEX idx_wrap_drop_jobs_status_created ON public.wrap_drop_jobs (status, created_at);