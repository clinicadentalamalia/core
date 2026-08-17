begin;

-- Historial remoto: 20260817034643_phase_3_staff_operations.

create table public.staff_accounts (
  user_id uuid primary key references public.profiles(id) on delete cascade,
  email text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  constraint staff_accounts_email_length_check
    check (email is null or char_length(btrim(email)) between 3 and 254)
);

create unique index staff_accounts_email_unique_idx
  on public.staff_accounts (lower(email))
  where email is not null;

alter table public.staff_accounts enable row level security;

create policy staff_accounts_select_admin
on public.staff_accounts for select to authenticated
using ((select app_private.has_any_role(array['admin'])));

grant select on public.staff_accounts to authenticated;

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

  insert into public.staff_accounts (user_id, email)
  values (new.id, lower(new.email))
  on conflict (user_id) do update
  set email = excluded.email,
      updated_at = now();

  return new;
end;
$$;

create or replace function app_private.sync_user_email()
returns trigger
language plpgsql
security definer
set search_path = ''
as $$
begin
  insert into public.staff_accounts (user_id, email)
  values (new.id, lower(new.email))
  on conflict (user_id) do update
  set email = excluded.email,
      updated_at = now();
  return new;
end;
$$;

revoke all on function app_private.handle_new_user()
  from public, anon, authenticated;
revoke all on function app_private.sync_user_email()
  from public, anon, authenticated;

create trigger on_auth_user_email_updated
  after update of email on auth.users
  for each row
  when (old.email is distinct from new.email)
  execute function app_private.sync_user_email();

insert into public.staff_accounts (user_id, email)
select id, lower(email)
from auth.users
on conflict (user_id) do update
set email = excluded.email,
    updated_at = now();

drop policy profiles_update_admin on public.profiles;

create policy profiles_update_admin
on public.profiles for update to authenticated
using (
  id <> (select auth.uid())
  and (select app_private.has_any_role(array['admin']))
)
with check (
  id <> (select auth.uid())
  and (select app_private.has_any_role(array['admin']))
);

create policy user_roles_insert_admin
on public.user_roles for insert to authenticated
with check (
  user_id <> (select auth.uid())
  and assigned_by = (select auth.uid())
  and (select app_private.has_any_role(array['admin']))
  and exists (
    select 1
    from public.roles r
    where r.code = role_code
      and r.is_active
  )
);

create policy user_roles_delete_admin
on public.user_roles for delete to authenticated
using (
  user_id <> (select auth.uid())
  and (select app_private.has_any_role(array['admin']))
);

grant update (display_name, status) on public.profiles to authenticated;
grant insert (user_id, role_code, assigned_by) on public.user_roles
  to authenticated;
grant delete on public.user_roles to authenticated;

create trigger profiles_access_audit
  after update of display_name, status on public.profiles
  for each row execute function app_private.record_entity_audit();

create or replace function public.manage_staff_access(
  p_user_id uuid,
  p_display_name text,
  p_status text,
  p_role_codes text[]
)
returns void
language plpgsql
security invoker
set search_path = ''
as $$
declare
  normalized_roles text[];
  changed_rows integer;
begin
  if not (select app_private.has_any_role(array['admin'])) then
    raise exception 'Acceso denegado.' using errcode = '42501';
  end if;

  if p_user_id = (select auth.uid()) then
    raise exception 'La cuenta administradora actual está protegida.'
      using errcode = '42501';
  end if;

  if p_status not in ('pending', 'active', 'inactive') then
    raise exception 'Estado de perfil inválido.' using errcode = '22023';
  end if;

  if p_display_name is null
     or char_length(btrim(p_display_name)) not between 2 and 100 then
    raise exception 'Nombre de personal inválido.' using errcode = '22023';
  end if;

  select coalesce(
    array_agg(distinct btrim(role_code) order by btrim(role_code)),
    '{}'::text[]
  )
  into normalized_roles
  from unnest(coalesce(p_role_codes, '{}'::text[])) as role_code
  where btrim(role_code) <> '';

  if p_status = 'active' and cardinality(normalized_roles) = 0 then
    raise exception 'Un perfil activo requiere al menos un rol.'
      using errcode = '22023';
  end if;

  if exists (
    select 1
    from unnest(normalized_roles) as requested_role
    left join public.roles r on r.code = requested_role
    where r.code is null or not r.is_active
  ) then
    raise exception 'La solicitud contiene un rol inválido o inactivo.'
      using errcode = '22023';
  end if;

  update public.profiles
  set display_name = btrim(p_display_name),
      status = p_status
  where id = p_user_id;

  get diagnostics changed_rows = row_count;
  if changed_rows <> 1 then
    raise exception 'No se encontró un perfil administrable.'
      using errcode = '42501';
  end if;

  delete from public.user_roles
  where user_id = p_user_id;

  insert into public.user_roles (user_id, role_code, assigned_by)
  select p_user_id, role_code, (select auth.uid())
  from unnest(normalized_roles) as role_code;
end;
$$;

revoke all on function public.manage_staff_access(uuid, text, text, text[])
  from public, anon, authenticated;
grant execute on function public.manage_staff_access(uuid, text, text, text[])
  to authenticated;

create or replace function public.app_healthcheck()
returns text
language sql
stable
security invoker
set search_path = ''
as $$
  select 'ok'::text;
$$;

revoke all on function public.app_healthcheck()
  from public, anon, authenticated;
grant execute on function public.app_healthcheck() to anon, authenticated;

commit;
