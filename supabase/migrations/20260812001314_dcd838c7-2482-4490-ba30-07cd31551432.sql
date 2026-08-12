-- ============ ENUMS ============
CREATE TYPE public.social_post_format AS ENUM ('image','carousel','reel');
CREATE TYPE public.social_post_status AS ENUM ('draft','needs_review','approved','scheduled','publishing','published','failed','canceled');
CREATE TYPE public.social_account_status AS ENUM ('disconnected','connected','expired','error');
CREATE TYPE public.social_automation_mode AS ENUM ('review_required','auto_publish_approved');
CREATE TYPE public.social_publish_status AS ENUM ('pending','succeeded','failed');
CREATE TYPE public.social_lead_source AS ENUM ('comment','dm','form');
CREATE TYPE public.social_lead_stage AS ENUM ('new','contacted','qualified','checkout_started','customer','not_interested','escalated');

-- ============ POSTS ============
CREATE TABLE public.social_posts (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  title text,
  caption text NOT NULL DEFAULT '',
  hashtags text[] NOT NULL DEFAULT '{}',
  format public.social_post_format NOT NULL DEFAULT 'image',
  cta_keyword text,
  destination_url text,
  first_comment text,
  ai_disclosure boolean NOT NULL DEFAULT false,
  is_sample boolean NOT NULL DEFAULT false,
  status public.social_post_status NOT NULL DEFAULT 'draft',
  scheduled_at timestamptz,
  timezone text NOT NULL DEFAULT 'America/Los_Angeles',
  approved_at timestamptz,
  approver_user_id uuid,
  owner_user_id uuid,
  created_by uuid,
  campaign text,
  internal_notes text,
  ig_media_id text,
  permalink text,
  published_at timestamptz,
  last_error text,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);
GRANT SELECT, INSERT, UPDATE, DELETE ON public.social_posts TO authenticated;
GRANT ALL ON public.social_posts TO service_role;
ALTER TABLE public.social_posts ENABLE ROW LEVEL SECURITY;
CREATE POLICY "super admins manage social posts" ON public.social_posts
  FOR ALL TO authenticated USING (public.is_super(auth.uid())) WITH CHECK (public.is_super(auth.uid()));

CREATE INDEX idx_social_posts_status ON public.social_posts(status);
CREATE INDEX idx_social_posts_scheduled_at ON public.social_posts(scheduled_at);

-- ============ APPROVALS ============
CREATE TABLE public.social_post_approvals (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  post_id uuid NOT NULL REFERENCES public.social_posts(id) ON DELETE CASCADE,
  approver_user_id uuid,
  approver_email text,
  checklist jsonb NOT NULL DEFAULT '{}'::jsonb,
  notes text,
  created_at timestamptz NOT NULL DEFAULT now(),
  approved_at timestamptz
);
GRANT SELECT, INSERT, UPDATE, DELETE ON public.social_post_approvals TO authenticated;
GRANT ALL ON public.social_post_approvals TO service_role;
ALTER TABLE public.social_post_approvals ENABLE ROW LEVEL SECURITY;
CREATE POLICY "super admins manage social approvals" ON public.social_post_approvals
  FOR ALL TO authenticated USING (public.is_super(auth.uid())) WITH CHECK (public.is_super(auth.uid()));
CREATE INDEX idx_social_post_approvals_post ON public.social_post_approvals(post_id);

-- ============ MEDIA ASSETS ============
CREATE TABLE public.social_media_assets (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  post_id uuid REFERENCES public.social_posts(id) ON DELETE CASCADE,
  storage_path text NOT NULL,
  kind text NOT NULL DEFAULT 'image',
  mime_type text,
  width integer,
  height integer,
  duration_seconds numeric,
  bytes bigint,
  alt_text text,
  position integer NOT NULL DEFAULT 0,
  created_by uuid,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);
GRANT SELECT, INSERT, UPDATE, DELETE ON public.social_media_assets TO authenticated;
GRANT ALL ON public.social_media_assets TO service_role;
ALTER TABLE public.social_media_assets ENABLE ROW LEVEL SECURITY;
CREATE POLICY "super admins manage social media assets" ON public.social_media_assets
  FOR ALL TO authenticated USING (public.is_super(auth.uid())) WITH CHECK (public.is_super(auth.uid()));
CREATE INDEX idx_social_media_assets_post ON public.social_media_assets(post_id, position);

-- ============ ACCOUNTS ============
CREATE TABLE public.social_accounts (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  platform text NOT NULL DEFAULT 'instagram',
  ig_professional_account_id text,
  ig_username text,
  facebook_page_id text,
  status public.social_account_status NOT NULL DEFAULT 'disconnected',
  scopes text[] NOT NULL DEFAULT '{}',
  connected_by uuid,
  token_expires_at timestamptz,
  token_last_refreshed_at timestamptz,
  last_api_check_at timestamptz,
  last_error text,
  webhook_status text,
  expiry_warning_sent_at timestamptz,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);
GRANT SELECT, INSERT, UPDATE, DELETE ON public.social_accounts TO authenticated;
GRANT ALL ON public.social_accounts TO service_role;
ALTER TABLE public.social_accounts ENABLE ROW LEVEL SECURITY;
CREATE POLICY "super admins manage social accounts" ON public.social_accounts
  FOR ALL TO authenticated USING (public.is_super(auth.uid())) WITH CHECK (public.is_super(auth.uid()));

-- ============ TOKENS (service_role only; never readable by clients) ============
CREATE TABLE public.social_tokens (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  platform text NOT NULL DEFAULT 'instagram',
  token_type text NOT NULL DEFAULT 'long_lived',
  token_ciphertext text NOT NULL,
  token_iv text NOT NULL,
  token_tag text,
  key_version integer NOT NULL DEFAULT 1,
  scopes text[] NOT NULL DEFAULT '{}',
  expires_at timestamptz,
  created_by uuid,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);
GRANT ALL ON public.social_tokens TO service_role;
ALTER TABLE public.social_tokens ENABLE ROW LEVEL SECURITY;

-- ============ OAUTH STATES (service_role only) ============
CREATE TABLE public.social_oauth_states (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  nonce text NOT NULL UNIQUE,
  redirect_uri text,
  actor_user_id uuid,
  actor_email text,
  expires_at timestamptz NOT NULL,
  consumed_at timestamptz,
  created_at timestamptz NOT NULL DEFAULT now()
);
GRANT ALL ON public.social_oauth_states TO service_role;
ALTER TABLE public.social_oauth_states ENABLE ROW LEVEL SECURITY;

-- ============ AUTOMATION SETTINGS ============
CREATE TABLE public.social_automation_settings (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  mode public.social_automation_mode NOT NULL DEFAULT 'review_required',
  allowed_days text[] NOT NULL DEFAULT ARRAY['mon','tue','wed','thu','fri'],
  allowed_start_time time NOT NULL DEFAULT '09:00',
  allowed_end_time time NOT NULL DEFAULT '19:00',
  max_feed_posts_per_day integer NOT NULL DEFAULT 2,
  timezone text NOT NULL DEFAULT 'America/Los_Angeles',
  default_cta_keyword text,
  default_destination_url text,
  auto_reply_faq boolean NOT NULL DEFAULT false,
  auto_reply_cta_comments boolean NOT NULL DEFAULT false,
  escalation_categories text[] NOT NULL DEFAULT ARRAY['complaint','legal','press','safety'],
  updated_by uuid,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);
GRANT SELECT, INSERT, UPDATE, DELETE ON public.social_automation_settings TO authenticated;
GRANT ALL ON public.social_automation_settings TO service_role;
ALTER TABLE public.social_automation_settings ENABLE ROW LEVEL SECURITY;
CREATE POLICY "super admins manage social settings" ON public.social_automation_settings
  FOR ALL TO authenticated USING (public.is_super(auth.uid())) WITH CHECK (public.is_super(auth.uid()));

-- ============ PUBLISH ATTEMPTS ============
CREATE TABLE public.social_publish_attempts (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  post_id uuid NOT NULL REFERENCES public.social_posts(id) ON DELETE CASCADE,
  idempotency_key text NOT NULL UNIQUE,
  status public.social_publish_status NOT NULL DEFAULT 'pending',
  attempt_count integer NOT NULL DEFAULT 0,
  ig_container_id text,
  ig_media_id text,
  permalink text,
  error_message text,
  started_at timestamptz,
  last_polled_at timestamptz,
  finished_at timestamptz,
  triggered_by uuid,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);
GRANT SELECT ON public.social_publish_attempts TO authenticated;
GRANT ALL ON public.social_publish_attempts TO service_role;
ALTER TABLE public.social_publish_attempts ENABLE ROW LEVEL SECURITY;
CREATE POLICY "super admins read publish attempts" ON public.social_publish_attempts
  FOR SELECT TO authenticated USING (public.is_super(auth.uid()));
-- Only one active (pending) attempt per post
CREATE UNIQUE INDEX idx_social_publish_one_active ON public.social_publish_attempts(post_id) WHERE status = 'pending';

-- ============ WEBHOOK EVENTS (service_role write, admin read) ============
CREATE TABLE public.social_webhook_events (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  platform text NOT NULL DEFAULT 'instagram',
  event_type text,
  event_id text,
  payload jsonb NOT NULL DEFAULT '{}'::jsonb,
  signature_valid boolean NOT NULL DEFAULT false,
  processed boolean NOT NULL DEFAULT false,
  processing_error text,
  received_at timestamptz NOT NULL DEFAULT now(),
  created_at timestamptz NOT NULL DEFAULT now()
);
GRANT SELECT ON public.social_webhook_events TO authenticated;
GRANT ALL ON public.social_webhook_events TO service_role;
ALTER TABLE public.social_webhook_events ENABLE ROW LEVEL SECURITY;
CREATE POLICY "super admins read webhook events" ON public.social_webhook_events
  FOR SELECT TO authenticated USING (public.is_super(auth.uid()));
CREATE UNIQUE INDEX idx_social_webhook_event_id ON public.social_webhook_events(platform, event_id) WHERE event_id IS NOT NULL;

-- ============ LEADS ============
CREATE TABLE public.social_leads (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  ig_scoped_user_id text,
  ig_username text,
  source public.social_lead_source NOT NULL DEFAULT 'comment',
  stage public.social_lead_stage NOT NULL DEFAULT 'new',
  cta_keyword text,
  order_id text,
  escalation_category text,
  conversation_summary text,
  assigned_to uuid,
  first_interaction_at timestamptz,
  last_interaction_at timestamptz,
  follow_up_due_at timestamptz,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);
GRANT SELECT, INSERT, UPDATE, DELETE ON public.social_leads TO authenticated;
GRANT ALL ON public.social_leads TO service_role;
ALTER TABLE public.social_leads ENABLE ROW LEVEL SECURITY;
CREATE POLICY "super admins manage social leads" ON public.social_leads
  FOR ALL TO authenticated USING (public.is_super(auth.uid())) WITH CHECK (public.is_super(auth.uid()));
CREATE UNIQUE INDEX idx_social_leads_scoped_user ON public.social_leads(ig_scoped_user_id) WHERE ig_scoped_user_id IS NOT NULL;

-- ============ INTERACTIONS ============
CREATE TABLE public.social_interactions (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  post_id uuid REFERENCES public.social_posts(id) ON DELETE SET NULL,
  lead_id uuid REFERENCES public.social_leads(id) ON DELETE CASCADE,
  channel text NOT NULL DEFAULT 'comment',
  direction text NOT NULL DEFAULT 'inbound',
  message text,
  created_at timestamptz NOT NULL DEFAULT now()
);
GRANT SELECT, INSERT, UPDATE, DELETE ON public.social_interactions TO authenticated;
GRANT ALL ON public.social_interactions TO service_role;
ALTER TABLE public.social_interactions ENABLE ROW LEVEL SECURITY;
CREATE POLICY "super admins manage social interactions" ON public.social_interactions
  FOR ALL TO authenticated USING (public.is_super(auth.uid())) WITH CHECK (public.is_super(auth.uid()));
CREATE INDEX idx_social_interactions_lead ON public.social_interactions(lead_id, created_at DESC);

-- ============ REPLY TEMPLATES ============
CREATE TABLE public.social_reply_templates (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  key text NOT NULL UNIQUE,
  name text NOT NULL,
  channel text NOT NULL DEFAULT 'comment',
  body text NOT NULL,
  active boolean NOT NULL DEFAULT true,
  created_by uuid,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);
GRANT SELECT, INSERT, UPDATE, DELETE ON public.social_reply_templates TO authenticated;
GRANT ALL ON public.social_reply_templates TO service_role;
ALTER TABLE public.social_reply_templates ENABLE ROW LEVEL SECURITY;
CREATE POLICY "super admins manage reply templates" ON public.social_reply_templates
  FOR ALL TO authenticated USING (public.is_super(auth.uid())) WITH CHECK (public.is_super(auth.uid()));

-- ============ AUDIT LOG (append-only via trigger / service_role) ============
CREATE TABLE public.social_audit_log (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  entity_type text NOT NULL,
  entity_id uuid,
  action text NOT NULL,
  actor_user_id uuid,
  actor_email text,
  before_state jsonb,
  after_state jsonb,
  metadata jsonb,
  created_at timestamptz NOT NULL DEFAULT now()
);
GRANT SELECT ON public.social_audit_log TO authenticated;
GRANT ALL ON public.social_audit_log TO service_role;
ALTER TABLE public.social_audit_log ENABLE ROW LEVEL SECURITY;
CREATE POLICY "super admins read social audit log" ON public.social_audit_log
  FOR SELECT TO authenticated USING (public.is_super(auth.uid()));
CREATE INDEX idx_social_audit_entity ON public.social_audit_log(entity_type, entity_id, created_at DESC);

-- ============ DELETION REQUESTS (service_role write, admin read) ============
CREATE TABLE public.social_deletion_requests (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  platform text NOT NULL DEFAULT 'instagram',
  kind text NOT NULL DEFAULT 'data_deletion',
  ig_scoped_user_id text,
  confirmation_code text,
  signed_request_valid boolean NOT NULL DEFAULT false,
  status text NOT NULL DEFAULT 'pending',
  deleted_lead_count integer NOT NULL DEFAULT 0,
  deleted_interaction_count integer NOT NULL DEFAULT 0,
  error_message text,
  completed_at timestamptz,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);
GRANT SELECT ON public.social_deletion_requests TO authenticated;
GRANT ALL ON public.social_deletion_requests TO service_role;
ALTER TABLE public.social_deletion_requests ENABLE ROW LEVEL SECURITY;
CREATE POLICY "super admins read deletion requests" ON public.social_deletion_requests
  FOR SELECT TO authenticated USING (public.is_super(auth.uid()));

-- ============ UPDATED_AT TRIGGERS (reuse existing function) ============
CREATE TRIGGER trg_social_posts_updated_at BEFORE UPDATE ON public.social_posts FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();
CREATE TRIGGER trg_social_media_assets_updated_at BEFORE UPDATE ON public.social_media_assets FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();
CREATE TRIGGER trg_social_accounts_updated_at BEFORE UPDATE ON public.social_accounts FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();
CREATE TRIGGER trg_social_tokens_updated_at BEFORE UPDATE ON public.social_tokens FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();
CREATE TRIGGER trg_social_settings_updated_at BEFORE UPDATE ON public.social_automation_settings FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();
CREATE TRIGGER trg_social_publish_attempts_updated_at BEFORE UPDATE ON public.social_publish_attempts FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();
CREATE TRIGGER trg_social_leads_updated_at BEFORE UPDATE ON public.social_leads FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();
CREATE TRIGGER trg_social_reply_templates_updated_at BEFORE UPDATE ON public.social_reply_templates FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();
CREATE TRIGGER trg_social_deletion_requests_updated_at BEFORE UPDATE ON public.social_deletion_requests FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

-- ============ AUDIT TRIGGER ============
CREATE OR REPLACE FUNCTION public.social_log_change()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO 'public'
AS $$
DECLARE
  v_actor uuid := auth.uid();
  v_email text;
BEGIN
  IF v_actor IS NOT NULL THEN
    SELECT email INTO v_email FROM public.profiles WHERE user_id = v_actor;
  END IF;

  INSERT INTO public.social_audit_log (entity_type, entity_id, action, actor_user_id, actor_email, before_state, after_state)
  VALUES (
    TG_ARGV[0],
    CASE WHEN TG_OP = 'DELETE' THEN OLD.id ELSE NEW.id END,
    lower(TG_OP),
    v_actor,
    v_email,
    CASE WHEN TG_OP IN ('UPDATE','DELETE') THEN to_jsonb(OLD) ELSE NULL END,
    CASE WHEN TG_OP IN ('INSERT','UPDATE') THEN to_jsonb(NEW) ELSE NULL END
  );

  IF TG_OP = 'DELETE' THEN RETURN OLD; END IF;
  RETURN NEW;
END;
$$;

CREATE TRIGGER trg_social_posts_audit AFTER INSERT OR UPDATE OR DELETE ON public.social_posts
  FOR EACH ROW EXECUTE FUNCTION public.social_log_change('post');
CREATE TRIGGER trg_social_leads_audit AFTER INSERT OR UPDATE OR DELETE ON public.social_leads
  FOR EACH ROW EXECUTE FUNCTION public.social_log_change('lead');
CREATE TRIGGER trg_social_accounts_audit AFTER INSERT OR UPDATE OR DELETE ON public.social_accounts
  FOR EACH ROW EXECUTE FUNCTION public.social_log_change('account');
CREATE TRIGGER trg_social_settings_audit AFTER INSERT OR UPDATE OR DELETE ON public.social_automation_settings
  FOR EACH ROW EXECUTE FUNCTION public.social_log_change('automation_settings');

-- ============ SCHEDULING GUARDRAIL ============
CREATE OR REPLACE FUNCTION public.social_can_schedule_at(p_when timestamptz, p_exclude_post_id uuid DEFAULT NULL)
RETURNS jsonb
LANGUAGE plpgsql
STABLE
SECURITY DEFINER
SET search_path TO 'public'
AS $$
DECLARE
  s public.social_automation_settings%ROWTYPE;
  v_local timestamptz;
  v_day text;
  v_time time;
  v_count integer;
BEGIN
  SELECT * INTO s FROM public.social_automation_settings ORDER BY created_at LIMIT 1;
  IF NOT FOUND THEN
    RETURN jsonb_build_object('ok', true, 'reason', null);
  END IF;

  v_day := lower(to_char(p_when AT TIME ZONE s.timezone, 'dy'));
  v_time := (p_when AT TIME ZONE s.timezone)::time;

  IF NOT (v_day = ANY(s.allowed_days)) THEN
    RETURN jsonb_build_object('ok', false, 'reason', 'day_not_allowed');
  END IF;

  IF v_time < s.allowed_start_time OR v_time > s.allowed_end_time THEN
    RETURN jsonb_build_object('ok', false, 'reason', 'outside_time_window');
  END IF;

  SELECT count(*) INTO v_count
  FROM public.social_posts p
  WHERE p.scheduled_at IS NOT NULL
    AND p.status IN ('scheduled','publishing','published')
    AND (p_exclude_post_id IS NULL OR p.id <> p_exclude_post_id)
    AND (p.scheduled_at AT TIME ZONE s.timezone)::date = (p_when AT TIME ZONE s.timezone)::date;

  IF v_count >= s.max_feed_posts_per_day THEN
    RETURN jsonb_build_object('ok', false, 'reason', 'daily_cap_reached');
  END IF;

  RETURN jsonb_build_object('ok', true, 'reason', null);
END;
$$;

REVOKE ALL ON FUNCTION public.social_can_schedule_at(timestamptz, uuid) FROM PUBLIC, anon;
GRANT EXECUTE ON FUNCTION public.social_can_schedule_at(timestamptz, uuid) TO authenticated, service_role;

-- ============ SEEDS ============
INSERT INTO public.social_automation_settings (mode, timezone) VALUES ('review_required', 'America/Los_Angeles');

INSERT INTO public.social_reply_templates (key, name, channel, body) VALUES
  ('cta_dm', 'CTA keyword auto-reply (DM)', 'dm', 'Thanks for your interest! Here''s the link to get started: {{destination_url}}'),
  ('cta_comment', 'CTA keyword auto-reply (comment)', 'comment', 'Just sent you a DM with the details!'),
  ('faq_default', 'General FAQ auto-reply', 'dm', 'Thanks for reaching out! Our team will follow up shortly. In the meantime you can find answers at https://teslys.app/faq');