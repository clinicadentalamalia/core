-- Revierte exclusivamente la administración operativa agregada en fase 3.
-- El directorio se puede reconstruir desde auth.users al reaplicar la migración.
begin;

-- Rollback correspondiente a 20260817034643_phase_3_staff_operations.

drop function if exists public.app_healthcheck();
drop function if exists public.manage_staff_access(uuid, text, text, text[]);

drop trigger if exists profiles_access_audit on public.profiles;
drop trigger if exists on_auth_user_email_updated on auth.users;
drop function if exists app_private.sync_user_email();

revoke update (display_name, status) on public.profiles from authenticated;
revoke insert (user_id, role_code, assigned_by) on public.user_roles
  from authenticated;
revoke delete on public.user_roles from authenticated;

drop policy if exists user_roles_insert_admin on public.user_roles;
drop policy if exists user_roles_delete_admin on public.user_roles;

drop policy if exists profiles_update_admin on public.profiles;
create policy profiles_update_admin
on public.profiles for update to authenticated
using (app_private.has_any_role(array['admin']))
with check (app_private.has_any_role(array['admin']));

create or replace function app_private.handle_new_user()
returns trigger
language plpgsql
security definer
set search_path = ''
as $$
begin
  insert into public.profiles (id, status)
  values (new.id, 'pending')
  on conflict (id) do nothing;
  return new;
end;
$$;

revoke all on function app_private.handle_new_user()
  from public, anon, authenticated;

drop table if exists public.staff_accounts;

commit;
