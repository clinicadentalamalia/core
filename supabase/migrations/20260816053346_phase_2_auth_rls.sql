create extension if not exists btree_gist with schema extensions;

create schema if not exists app_private;
revoke all on schema app_private from public, anon;
grant usage on schema app_private to authenticated;

create table public.profiles (
  id uuid primary key references auth.users(id) on delete cascade,
  display_name text,
  status text not null default 'pending'
    constraint profiles_status_check check (status in ('pending', 'active', 'inactive')),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  constraint profiles_display_name_length_check
    check (display_name is null or char_length(btrim(display_name)) between 2 and 100)
);

create table public.roles (
  code text primary key,
  name text not null,
  scope text not null,
  is_active boolean not null default true,
  created_at timestamptz not null default now(),
  constraint roles_code_format_check check (code ~ '^[a-z][a-z0-9_]{1,31}$'),
  constraint roles_name_length_check check (char_length(btrim(name)) between 2 and 80),
  constraint roles_scope_length_check check (char_length(btrim(scope)) between 2 and 160)
);

create table public.user_roles (
  user_id uuid not null references public.profiles(id) on delete cascade,
  role_code text not null references public.roles(code) on delete restrict,
  assigned_by uuid references public.profiles(id) on delete set null,
  assigned_at timestamptz not null default now(),
  expires_at timestamptz,
  primary key (user_id, role_code),
  constraint user_roles_expiry_check check (expires_at is null or expires_at > assigned_at)
);

create table public.specialties (
  code text primary key,
  name text not null,
  area text not null,
  is_active boolean not null default true,
  created_at timestamptz not null default now(),
  constraint specialties_code_format_check check (code ~ '^[a-z][a-z0-9_]{1,31}$'),
  constraint specialties_name_length_check check (char_length(btrim(name)) between 2 and 80),
  constraint specialties_area_check check (area in ('dentistry', 'facial_harmonization'))
);

create table public.professionals (
  id uuid primary key default gen_random_uuid(),
  profile_id uuid not null unique references public.profiles(id) on delete restrict,
  internal_code text not null unique,
  status text not null default 'active'
    constraint professionals_status_check check (status in ('active', 'inactive')),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  constraint professionals_internal_code_check
    check (internal_code ~ '^[A-Z0-9][A-Z0-9_-]{2,31}$')
);

create table public.professional_specialties (
  professional_id uuid not null references public.professionals(id) on delete cascade,
  specialty_code text not null references public.specialties(code) on delete restrict,
  primary key (professional_id, specialty_code)
);

create table public.boxes (
  id bigint generated always as identity primary key,
  name text not null unique,
  location text,
  status text not null default 'active'
    constraint boxes_status_check check (status in ('active', 'inactive')),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  constraint boxes_name_length_check check (char_length(btrim(name)) between 2 and 60),
  constraint boxes_location_length_check
    check (location is null or char_length(btrim(location)) between 2 and 120)
);

create table public.patients (
  id uuid primary key default gen_random_uuid(),
  full_name text not null,
  identifier text not null,
  identifier_normalized text generated always as (
    upper(regexp_replace(identifier, '[^[:alnum:]]', '', 'g'))
  ) stored,
  phone text,
  email text,
  status text not null default 'active'
    constraint patients_status_check check (status in ('active', 'inactive', 'follow_up', 'archived')),
  created_by uuid not null default auth.uid() references public.profiles(id) on delete restrict,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  constraint patients_full_name_length_check
    check (char_length(btrim(full_name)) between 3 and 100),
  constraint patients_identifier_length_check
    check (char_length(identifier_normalized) between 5 and 32),
  constraint patients_phone_length_check
    check (phone is null or char_length(btrim(phone)) between 8 and 24),
  constraint patients_email_length_check
    check (email is null or char_length(btrim(email)) between 3 and 254),
  constraint patients_identifier_unique unique (identifier_normalized)
);

create table public.appointments (
  id uuid primary key default gen_random_uuid(),
  patient_id uuid not null references public.patients(id) on delete restrict,
  professional_id uuid not null references public.professionals(id) on delete restrict,
  box_id bigint not null references public.boxes(id) on delete restrict,
  starts_at timestamptz not null,
  ends_at timestamptz not null,
  service_name text not null,
  service_area text not null
    constraint appointments_service_area_check
      check (service_area in ('dentistry', 'facial_harmonization')),
  status text not null default 'reserved'
    constraint appointments_status_check
      check (status in (
        'reserved', 'pending_confirmation', 'confirmed', 'waiting',
        'in_progress', 'completed', 'cancelled', 'no_show'
      )),
  notes text,
  created_by uuid not null default auth.uid() references public.profiles(id) on delete restrict,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  constraint appointments_time_order_check check (ends_at > starts_at),
  constraint appointments_service_name_length_check
    check (char_length(btrim(service_name)) between 2 and 120),
  constraint appointments_notes_length_check
    check (notes is null or char_length(notes) <= 500),
  constraint appointments_professional_time_excl
    exclude using gist (
      professional_id with =,
      tstzrange(starts_at, ends_at, '[)') with &&
    ) where (status not in ('cancelled', 'no_show')),
  constraint appointments_box_time_excl
    exclude using gist (
      box_id with =,
      tstzrange(starts_at, ends_at, '[)') with &&
    ) where (status not in ('cancelled', 'no_show'))
);

create table public.appointment_status_history (
  id bigint generated always as identity primary key,
  appointment_id uuid not null references public.appointments(id) on delete restrict,
  old_status text,
  new_status text not null,
  changed_by uuid references public.profiles(id) on delete set null,
  reason text,
  changed_at timestamptz not null default now(),
  constraint appointment_history_old_status_check
    check (old_status is null or old_status in (
      'reserved', 'pending_confirmation', 'confirmed', 'waiting',
      'in_progress', 'completed', 'cancelled', 'no_show'
    )),
  constraint appointment_history_new_status_check
    check (new_status in (
      'reserved', 'pending_confirmation', 'confirmed', 'waiting',
      'in_progress', 'completed', 'cancelled', 'no_show'
    )),
  constraint appointment_history_reason_length_check
    check (reason is null or char_length(reason) <= 300)
);

create table public.audit_events (
  id bigint generated always as identity primary key,
  actor_id uuid references public.profiles(id) on delete set null,
  action text not null,
  entity_type text not null,
  entity_id uuid,
  result text not null default 'success',
  metadata jsonb not null default '{}'::jsonb,
  occurred_at timestamptz not null default now(),
  constraint audit_events_action_length_check check (char_length(action) between 2 and 80),
  constraint audit_events_entity_type_length_check check (char_length(entity_type) between 2 and 80),
  constraint audit_events_result_check check (result in ('success', 'denied', 'error')),
  constraint audit_events_metadata_object_check check (jsonb_typeof(metadata) = 'object')
);

create index user_roles_role_code_idx on public.user_roles (role_code);
create index user_roles_active_user_idx
  on public.user_roles (user_id, role_code)
  where expires_at is null;
create index professional_specialties_specialty_code_idx
  on public.professional_specialties (specialty_code);
create index patients_created_by_idx on public.patients (created_by);
create index patients_status_created_at_idx on public.patients (status, created_at desc);
create index appointments_patient_id_starts_at_idx
  on public.appointments (patient_id, starts_at desc);
create index appointments_professional_id_starts_at_idx
  on public.appointments (professional_id, starts_at);
create index appointments_box_id_starts_at_idx
  on public.appointments (box_id, starts_at);
create index appointments_status_starts_at_idx
  on public.appointments (status, starts_at);
create index appointment_status_history_appointment_id_changed_at_idx
  on public.appointment_status_history (appointment_id, changed_at desc);
create index appointment_status_history_changed_by_idx
  on public.appointment_status_history (changed_by);
create index audit_events_actor_id_occurred_at_idx
  on public.audit_events (actor_id, occurred_at desc);
create index audit_events_entity_idx
  on public.audit_events (entity_type, entity_id, occurred_at desc);

insert into public.roles (code, name, scope) values
  ('admin', 'Administración', 'Acceso administrativo a la operación inicial'),
  ('reception', 'Recepción', 'Pacientes administrativos y agenda'),
  ('dentist', 'Odontología', 'Pacientes y citas asignadas'),
  ('facial_harmonization', 'Armonización', 'Pacientes y citas asignadas'),
  ('auditor', 'Auditoría', 'Lectura autorizada y trazabilidad')
on conflict (code) do update
set name = excluded.name, scope = excluded.scope, is_active = true;

insert into public.specialties (code, name, area) values
  ('general_dentistry', 'Odontología general', 'dentistry'),
  ('facial_harmonization', 'Armonización facial', 'facial_harmonization')
on conflict (code) do update
set name = excluded.name, area = excluded.area, is_active = true;

insert into public.boxes (name, location) values
  ('Box 1', 'Área odontológica'),
  ('Box 2', 'Área de armonización')
on conflict (name) do update
set location = excluded.location, status = 'active';

create or replace function app_private.has_any_role(required_roles text[])
returns boolean
language sql
stable
security definer
set search_path = ''
as $$
  select
    (select auth.uid()) is not null
    and exists (
      select 1
      from public.profiles p
      join public.user_roles ur on ur.user_id = p.id
      join public.roles r on r.code = ur.role_code
      where p.id = (select auth.uid())
        and p.status = 'active'
        and r.is_active
        and ur.role_code = any(required_roles)
        and (ur.expires_at is null or ur.expires_at > now())
    );
$$;

create or replace function app_private.current_professional_id()
returns uuid
language sql
stable
security definer
set search_path = ''
as $$
  select p.id
  from public.professionals p
  join public.profiles profile on profile.id = p.profile_id
  where p.profile_id = (select auth.uid())
    and p.status = 'active'
    and profile.status = 'active'
  limit 1;
$$;

create or replace function app_private.can_access_patient(target_patient_id uuid)
returns boolean
language sql
stable
security definer
set search_path = ''
as $$
  select
    (select auth.uid()) is not null
    and (
      app_private.has_any_role(array['admin', 'reception', 'auditor'])
      or exists (
        select 1
        from public.appointments a
        join public.professionals p on p.id = a.professional_id
        where a.patient_id = target_patient_id
          and p.profile_id = (select auth.uid())
          and p.status = 'active'
      )
    );
$$;

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

create or replace function app_private.set_record_metadata()
returns trigger
language plpgsql
security definer
set search_path = ''
as $$
begin
  if tg_op = 'INSERT' then
    new.created_by := coalesce((select auth.uid()), new.created_by);
    new.created_at := now();
    new.updated_at := now();
  else
    new.created_by := old.created_by;
    new.created_at := old.created_at;
    new.updated_at := now();
  end if;
  return new;
end;
$$;

create or replace function app_private.touch_updated_at()
returns trigger
language plpgsql
set search_path = ''
as $$
begin
  new.updated_at := now();
  return new;
end;
$$;

create or replace function app_private.record_appointment_status()
returns trigger
language plpgsql
security definer
set search_path = ''
as $$
begin
  if tg_op = 'INSERT' or old.status is distinct from new.status then
    insert into public.appointment_status_history (
      appointment_id, old_status, new_status, changed_by
    )
    values (
      new.id,
      case when tg_op = 'INSERT' then null else old.status end,
      new.status,
      (select auth.uid())
    );
  end if;
  return new;
end;
$$;

create or replace function app_private.record_entity_audit()
returns trigger
language plpgsql
security definer
set search_path = ''
as $$
declare
  target_id uuid;
begin
  target_id := case when tg_op = 'DELETE' then old.id else new.id end;
  insert into public.audit_events (
    actor_id, action, entity_type, entity_id, metadata
  )
  values (
    (select auth.uid()),
    lower(tg_op),
    tg_table_name,
    target_id,
    jsonb_build_object('source', 'database_trigger')
  );
  return case when tg_op = 'DELETE' then old else new end;
end;
$$;

create or replace function app_private.record_role_audit()
returns trigger
language plpgsql
security definer
set search_path = ''
as $$
begin
  insert into public.audit_events (
    actor_id, action, entity_type, entity_id, metadata
  )
  values (
    (select auth.uid()),
    case when tg_op = 'INSERT' then 'role_assigned' else 'role_revoked' end,
    'user_roles',
    case when tg_op = 'INSERT' then new.user_id else old.user_id end,
    jsonb_build_object(
      'role_code',
      case when tg_op = 'INSERT' then new.role_code else old.role_code end,
      'source',
      'database_trigger'
    )
  );
  return case when tg_op = 'INSERT' then new else old end;
end;
$$;

revoke all on all functions in schema app_private from public, anon, authenticated;
grant execute on function app_private.has_any_role(text[]) to authenticated;
grant execute on function app_private.current_professional_id() to authenticated;
grant execute on function app_private.can_access_patient(uuid) to authenticated;

create trigger on_auth_user_created
  after insert on auth.users
  for each row execute function app_private.handle_new_user();

insert into public.profiles (id, status)
select id, 'pending'
from auth.users
on conflict (id) do nothing;

create trigger profiles_touch_updated_at
  before update on public.profiles
  for each row execute function app_private.touch_updated_at();

create trigger professionals_touch_updated_at
  before update on public.professionals
  for each row execute function app_private.touch_updated_at();

create trigger boxes_touch_updated_at
  before update on public.boxes
  for each row execute function app_private.touch_updated_at();

create trigger patients_set_record_metadata
  before insert or update on public.patients
  for each row execute function app_private.set_record_metadata();

create trigger appointments_set_record_metadata
  before insert or update on public.appointments
  for each row execute function app_private.set_record_metadata();

create trigger appointments_record_status
  after insert or update of status on public.appointments
  for each row execute function app_private.record_appointment_status();

create trigger patients_audit
  after insert or update on public.patients
  for each row execute function app_private.record_entity_audit();

create trigger appointments_audit
  after insert or update on public.appointments
  for each row execute function app_private.record_entity_audit();

create trigger user_roles_audit
  after insert or delete on public.user_roles
  for each row execute function app_private.record_role_audit();

alter table public.profiles enable row level security;
alter table public.roles enable row level security;
alter table public.user_roles enable row level security;
alter table public.specialties enable row level security;
alter table public.professionals enable row level security;
alter table public.professional_specialties enable row level security;
alter table public.boxes enable row level security;
alter table public.patients enable row level security;
alter table public.appointments enable row level security;
alter table public.appointment_status_history enable row level security;
alter table public.audit_events enable row level security;

create policy profiles_select_authorized
on public.profiles for select to authenticated
using (
  id = (select auth.uid())
  or app_private.has_any_role(array['admin'])
  or (
    status = 'active'
    and app_private.has_any_role(array[
      'reception', 'dentist', 'facial_harmonization', 'auditor'
    ])
  )
);

create policy profiles_update_admin
on public.profiles for update to authenticated
using (app_private.has_any_role(array['admin']))
with check (app_private.has_any_role(array['admin']));

create policy roles_select_authenticated
on public.roles for select to authenticated
using ((select auth.uid()) is not null);

create policy user_roles_select_authorized
on public.user_roles for select to authenticated
using (
  user_id = (select auth.uid())
  or app_private.has_any_role(array['admin', 'auditor'])
);

create policy specialties_select_staff
on public.specialties for select to authenticated
using (
  app_private.has_any_role(array[
    'admin', 'reception', 'dentist', 'facial_harmonization', 'auditor'
  ])
);

create policy professionals_select_staff
on public.professionals for select to authenticated
using (
  app_private.has_any_role(array[
    'admin', 'reception', 'dentist', 'facial_harmonization', 'auditor'
  ])
);

create policy professional_specialties_select_staff
on public.professional_specialties for select to authenticated
using (
  app_private.has_any_role(array[
    'admin', 'reception', 'dentist', 'facial_harmonization', 'auditor'
  ])
);

create policy boxes_select_staff
on public.boxes for select to authenticated
using (
  app_private.has_any_role(array[
    'admin', 'reception', 'dentist', 'facial_harmonization', 'auditor'
  ])
);

create policy patients_select_authorized
on public.patients for select to authenticated
using (app_private.can_access_patient(id));

create policy patients_insert_administration
on public.patients for insert to authenticated
with check (
  app_private.has_any_role(array['admin', 'reception'])
  and created_by = (select auth.uid())
);

create policy patients_update_administration
on public.patients for update to authenticated
using (app_private.has_any_role(array['admin', 'reception']))
with check (app_private.has_any_role(array['admin', 'reception']));

create policy appointments_select_authorized
on public.appointments for select to authenticated
using (
  app_private.has_any_role(array['admin', 'reception', 'auditor'])
  or professional_id = app_private.current_professional_id()
);

create policy appointments_insert_administration
on public.appointments for insert to authenticated
with check (
  app_private.has_any_role(array['admin', 'reception'])
  and created_by = (select auth.uid())
);

create policy appointments_update_administration
on public.appointments for update to authenticated
using (app_private.has_any_role(array['admin', 'reception']))
with check (app_private.has_any_role(array['admin', 'reception']));

create policy appointment_history_select_authorized
on public.appointment_status_history for select to authenticated
using (
  app_private.has_any_role(array['admin', 'reception', 'auditor'])
  or exists (
    select 1
    from public.appointments a
    where a.id = appointment_id
      and a.professional_id = app_private.current_professional_id()
  )
);

create policy audit_events_select_authorized
on public.audit_events for select to authenticated
using (app_private.has_any_role(array['admin', 'auditor']));

revoke all on all tables in schema public from anon, authenticated;
revoke all on all sequences in schema public from anon, authenticated;

grant select on
  public.profiles,
  public.roles,
  public.user_roles,
  public.specialties,
  public.professionals,
  public.professional_specialties,
  public.boxes,
  public.patients,
  public.appointments,
  public.appointment_status_history,
  public.audit_events
to authenticated;

grant insert, update on public.patients, public.appointments to authenticated;
