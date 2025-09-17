-- Fix search_path security issue for handle_new_user function
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
declare
  v_role       text;
  v_first      text;
  v_last       text;
  v_status     text;
  v_is_super   boolean := coalesce(NEW.is_super_admin, false);
  v_admin_name text;
begin
  -- Keep role from metadata (default 'client'); DO NOT force to 'admin'
  v_role := coalesce(NEW.raw_user_meta_data->>'role', 'client');

  -- Handle admin_name from host registrations
  v_admin_name := NEW.raw_user_meta_data->>'admin_name';
  
  -- Extract first_name - priority: explicit first_name, then from admin_name, then from name
  v_first := coalesce(
    NEW.raw_user_meta_data->>'first_name',
    case
      when v_admin_name is not null and position(' ' in v_admin_name) > 0
      then split_part(v_admin_name, ' ', 1)
      when v_admin_name is not null
      then v_admin_name
      when NEW.raw_user_meta_data->>'name' is not null
       and position(' ' in NEW.raw_user_meta_data->>'name') > 0
      then split_part(NEW.raw_user_meta_data->>'name', ' ', 1)
      else NEW.raw_user_meta_data->>'name'
    end
  );

  -- Extract last_name - priority: explicit last_name, then from admin_name, then from name
  v_last := coalesce(
    NEW.raw_user_meta_data->>'last_name',
    case
      when v_admin_name is not null and position(' ' in v_admin_name) > 0
      then substring(v_admin_name from position(' ' in v_admin_name) + 1)
      when NEW.raw_user_meta_data->>'name' is not null
       and position(' ' in NEW.raw_user_meta_data->>'name') > 0
      then substring(
        NEW.raw_user_meta_data->>'name'
        from position(' ' in NEW.raw_user_meta_data->>'name') + 1
      )
      else null
    end
  );

  -- Auto-approve super admins OR when metadata has auto_approve=true
  v_status := case
    when v_is_super
      or coalesce((NEW.raw_user_meta_data->>'auto_approve')::boolean, false)
    then 'approved'
    else 'pending'
  end;

  insert into public.profiles (
    user_id,email, role, first_name, last_name, company_name, phone,
    account_status, requested_at, is_super_admin
  ) values (
    NEW.id,
    lower(NEW.email),
    v_role,
    v_first,
    v_last,
    NEW.raw_user_meta_data->>'company_name',
    NEW.raw_user_meta_data->>'phone',
    v_status,
    now(),
    v_is_super
  )
  on conflict (user_id) do update
  set email         = coalesce(excluded.email, public.profiles.email),
    role           = coalesce(excluded.role, public.profiles.role),
        first_name     = coalesce(excluded.first_name, public.profiles.first_name),
        last_name      = coalesce(excluded.last_name,  public.profiles.last_name),
        company_name   = coalesce(excluded.company_name, public.profiles.company_name),
        phone          = coalesce(excluded.phone, public.profiles.phone),
        -- Make super-admin "sticky" once true:
        is_super_admin = public.profiles.is_super_admin or excluded.is_super_admin;

  -- Initial history row
  insert into public.account_request_history (user_id, action)
  values (NEW.id, 'requested')
  on conflict do nothing;

  return NEW;
end;
$$;