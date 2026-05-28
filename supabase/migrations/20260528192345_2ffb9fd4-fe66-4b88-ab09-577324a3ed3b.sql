
-- Phase 1: unified user roles
CREATE TYPE public.workspace_role AS ENUM ('client', 'host', 'investor');
CREATE TYPE public.workspace_role_status AS ENUM ('active', 'pending', 'suspended');

CREATE TABLE public.user_roles (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL,
  role public.workspace_role NOT NULL,
  status public.workspace_role_status NOT NULL DEFAULT 'active',
  activated_at timestamp with time zone DEFAULT now(),
  created_at timestamp with time zone NOT NULL DEFAULT now(),
  updated_at timestamp with time zone NOT NULL DEFAULT now(),
  UNIQUE (user_id, role)
);

GRANT SELECT, INSERT, UPDATE, DELETE ON public.user_roles TO authenticated;
GRANT ALL ON public.user_roles TO service_role;

ALTER TABLE public.user_roles ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view their own roles"
  ON public.user_roles FOR SELECT TO authenticated
  USING (auth.uid() = user_id);

CREATE POLICY "Super admins can view all roles"
  ON public.user_roles FOR SELECT TO authenticated
  USING (public.is_super(auth.uid()));

CREATE POLICY "Super admins can manage roles"
  ON public.user_roles FOR ALL TO authenticated
  USING (public.is_super(auth.uid()))
  WITH CHECK (public.is_super(auth.uid()));

CREATE TRIGGER user_roles_set_updated_at
  BEFORE UPDATE ON public.user_roles
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

-- Security-definer helper used by future RLS
CREATE OR REPLACE FUNCTION public.has_workspace_role(_user_id uuid, _role public.workspace_role)
RETURNS boolean
LANGUAGE sql STABLE SECURITY DEFINER SET search_path = public
AS $$
  SELECT EXISTS (
    SELECT 1 FROM public.user_roles
    WHERE user_id = _user_id AND role = _role AND status = 'active'
  );
$$;

-- Profile additions: active workspace + landing-page-seen tracker
ALTER TABLE public.profiles
  ADD COLUMN IF NOT EXISTS active_workspace public.workspace_role NOT NULL DEFAULT 'client',
  ADD COLUMN IF NOT EXISTS landing_seen jsonb NOT NULL DEFAULT '{}'::jsonb;

-- Backfill: grant all three roles to every existing user.
-- Host role inherits the existing account_status from profiles so pending hosts stay pending.
INSERT INTO public.user_roles (user_id, role, status)
SELECT p.user_id, 'client'::public.workspace_role, 'active'::public.workspace_role_status
FROM public.profiles p
ON CONFLICT (user_id, role) DO NOTHING;

INSERT INTO public.user_roles (user_id, role, status)
SELECT p.user_id, 'host'::public.workspace_role,
  CASE
    WHEN p.account_status = 'approved' THEN 'active'::public.workspace_role_status
    WHEN p.account_status = 'pending' THEN 'pending'::public.workspace_role_status
    WHEN p.account_status = 'suspended' THEN 'suspended'::public.workspace_role_status
    ELSE 'pending'::public.workspace_role_status
  END
FROM public.profiles p
ON CONFLICT (user_id, role) DO NOTHING;

INSERT INTO public.user_roles (user_id, role, status)
SELECT p.user_id, 'investor'::public.workspace_role, 'active'::public.workspace_role_status
FROM public.profiles p
ON CONFLICT (user_id, role) DO NOTHING;

-- Seed active_workspace based on the user's current legacy profile role
UPDATE public.profiles
SET active_workspace =
  CASE
    WHEN role = 'host' THEN 'host'::public.workspace_role
    WHEN role = 'investor' THEN 'investor'::public.workspace_role
    ELSE 'client'::public.workspace_role
  END
WHERE active_workspace IS NULL OR active_workspace = 'client'::public.workspace_role;

-- New signups: extend handle_new_user to also create role rows + set active_workspace
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS trigger
LANGUAGE plpgsql SECURITY DEFINER SET search_path = public
AS $function$
declare
  v_role       text;
  v_first      text;
  v_last       text;
  v_status     text;
  v_is_super   boolean := coalesce(NEW.is_super_admin, false);
  v_admin_name text;
  v_host_status public.workspace_role_status;
begin
  v_role := coalesce(NEW.raw_user_meta_data->>'role', 'client');
  v_admin_name := NEW.raw_user_meta_data->>'admin_name';

  v_first := coalesce(
    NEW.raw_user_meta_data->>'first_name',
    case
      when v_admin_name is not null and position(' ' in v_admin_name) > 0
      then split_part(v_admin_name, ' ', 1)
      when v_admin_name is not null then v_admin_name
      when NEW.raw_user_meta_data->>'name' is not null and position(' ' in NEW.raw_user_meta_data->>'name') > 0
      then split_part(NEW.raw_user_meta_data->>'name', ' ', 1)
      else NEW.raw_user_meta_data->>'name'
    end
  );

  v_last := coalesce(
    NEW.raw_user_meta_data->>'last_name',
    case
      when v_admin_name is not null and position(' ' in v_admin_name) > 0
      then substring(v_admin_name from position(' ' in v_admin_name) + 1)
      when NEW.raw_user_meta_data->>'name' is not null and position(' ' in NEW.raw_user_meta_data->>'name') > 0
      then substring(NEW.raw_user_meta_data->>'name' from position(' ' in NEW.raw_user_meta_data->>'name') + 1)
      else null
    end
  );

  v_status := case
    when v_is_super or coalesce((NEW.raw_user_meta_data->>'auto_approve')::boolean, false)
    then 'approved'
    else 'pending'
  end;

  insert into public.profiles (
    user_id, email, role, first_name, last_name, company_name, phone,
    account_status, requested_at, is_super_admin, active_workspace
  ) values (
    NEW.id, lower(NEW.email), v_role, v_first, v_last,
    NEW.raw_user_meta_data->>'company_name', NEW.raw_user_meta_data->>'phone',
    v_status, now(), v_is_super,
    case when v_role = 'host' then 'host'::public.workspace_role
         when v_role = 'investor' then 'investor'::public.workspace_role
         else 'client'::public.workspace_role end
  )
  on conflict (user_id) do update
  set email         = coalesce(excluded.email, public.profiles.email),
      role          = coalesce(excluded.role, public.profiles.role),
      first_name    = coalesce(excluded.first_name, public.profiles.first_name),
      last_name     = coalesce(excluded.last_name,  public.profiles.last_name),
      company_name  = coalesce(excluded.company_name, public.profiles.company_name),
      phone         = coalesce(excluded.phone, public.profiles.phone),
      is_super_admin = public.profiles.is_super_admin or excluded.is_super_admin;

  -- Auto-grant all three roles to every new signup
  v_host_status := case when v_status = 'approved' then 'active'::public.workspace_role_status
                        else 'pending'::public.workspace_role_status end;

  insert into public.user_roles (user_id, role, status) values
    (NEW.id, 'client'::public.workspace_role, 'active'::public.workspace_role_status),
    (NEW.id, 'host'::public.workspace_role, v_host_status),
    (NEW.id, 'investor'::public.workspace_role, 'active'::public.workspace_role_status)
  on conflict (user_id, role) do nothing;

  insert into public.account_request_history (user_id, action)
  values (NEW.id, 'requested')
  on conflict do nothing;

  return NEW;
end;
$function$;
