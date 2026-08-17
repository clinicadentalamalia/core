do $phase3$
declare
  visible_rows integer;
  changed_rows integer;
begin
  insert into auth.users (
    id, aud, role, email, raw_app_meta_data, raw_user_meta_data,
    created_at, updated_at, is_sso_user, is_anonymous
  ) values
    ('50000000-0000-4000-8000-000000000001', 'authenticated', 'authenticated', 'admin.phase3@example.test', '{}'::jsonb, '{}'::jsonb, now(), now(), false, false),
    ('50000000-0000-4000-8000-000000000002', 'authenticated', 'authenticated', 'target.phase3@example.test', '{}'::jsonb, '{}'::jsonb, now(), now(), false, false),
    ('50000000-0000-4000-8000-000000000003', 'authenticated', 'authenticated', 'reception.phase3@example.test', '{}'::jsonb, '{}'::jsonb, now(), now(), false, false);

  update public.profiles
  set display_name = case id
        when '50000000-0000-4000-8000-000000000001' then 'Administración Fase Tres'
        when '50000000-0000-4000-8000-000000000002' then 'Cuenta Objetivo Fase Tres'
        else 'Recepción Fase Tres'
      end,
      status = case
        when id = '50000000-0000-4000-8000-000000000002' then 'pending'
        else 'active'
      end
  where id in (
    '50000000-0000-4000-8000-000000000001',
    '50000000-0000-4000-8000-000000000002',
    '50000000-0000-4000-8000-000000000003'
  );

  insert into public.user_roles (user_id, role_code) values
    ('50000000-0000-4000-8000-000000000001', 'admin'),
    ('50000000-0000-4000-8000-000000000003', 'reception');

  execute 'set local role authenticated';
  perform set_config(
    'request.jwt.claim.sub',
    '50000000-0000-4000-8000-000000000001',
    true
  );
  perform set_config(
    'request.jwt.claims',
    '{"sub":"50000000-0000-4000-8000-000000000001","role":"authenticated"}',
    true
  );

  select count(*) into visible_rows
  from public.staff_accounts
  where user_id = '50000000-0000-4000-8000-000000000002'
    and email = 'target.phase3@example.test';
  if visible_rows <> 1 then
    raise exception 'Administración no puede leer el directorio de personal';
  end if;

  perform public.manage_staff_access(
    '50000000-0000-4000-8000-000000000002',
    'Cuenta Objetivo Activada',
    'active',
    array['reception']
  );

  select count(*) into visible_rows
  from public.profiles p
  join public.user_roles ur on ur.user_id = p.id
  where p.id = '50000000-0000-4000-8000-000000000002'
    and p.display_name = 'Cuenta Objetivo Activada'
    and p.status = 'active'
    and ur.role_code = 'reception'
    and ur.assigned_by = '50000000-0000-4000-8000-000000000001';
  if visible_rows <> 1 then
    raise exception 'La actualización administrativa no fue atómica';
  end if;

  begin
    perform public.manage_staff_access(
      '50000000-0000-4000-8000-000000000001',
      'Intento Propio',
      'inactive',
      '{}'::text[]
    );
    raise exception 'Administración pudo modificar su propia cuenta';
  exception
    when insufficient_privilege then null;
  end;

  perform set_config(
    'request.jwt.claim.sub',
    '50000000-0000-4000-8000-000000000003',
    true
  );
  perform set_config(
    'request.jwt.claims',
    '{"sub":"50000000-0000-4000-8000-000000000003","role":"authenticated"}',
    true
  );

  begin
    perform public.manage_staff_access(
      '50000000-0000-4000-8000-000000000002',
      'Intento No Autorizado',
      'inactive',
      '{}'::text[]
    );
    raise exception 'Recepción pudo ejecutar la administración de acceso';
  exception
    when insufficient_privilege then null;
  end;

  update public.profiles
  set status = 'inactive'
  where id = '50000000-0000-4000-8000-000000000002';
  get diagnostics changed_rows = row_count;
  if changed_rows <> 0 then
    raise exception 'Recepción pudo actualizar directamente otro perfil';
  end if;

  select count(*) into visible_rows
  from public.staff_accounts;
  if visible_rows <> 0 then
    raise exception 'Recepción pudo leer correos del directorio';
  end if;

  execute 'reset role';
  execute 'set local role anon';

  if public.app_healthcheck() <> 'ok' then
    raise exception 'El control de salud no respondió para anon';
  end if;

  begin
    perform 1 from public.staff_accounts;
    raise exception 'Anon pudo leer el directorio de personal';
  exception
    when insufficient_privilege then null;
  end;

  execute 'reset role';

  if has_table_privilege('anon', 'public.staff_accounts', 'select') then
    raise exception 'Anon conserva SELECT en staff_accounts';
  end if;

  if not has_function_privilege(
    'authenticated',
    'public.manage_staff_access(uuid,text,text,text[])',
    'execute'
  ) then
    raise exception 'Authenticated no puede invocar la operación controlada';
  end if;

  delete from public.user_roles
  where user_id in (
    '50000000-0000-4000-8000-000000000001',
    '50000000-0000-4000-8000-000000000002',
    '50000000-0000-4000-8000-000000000003'
  );
  delete from public.audit_events
  where entity_id in (
    '50000000-0000-4000-8000-000000000001',
    '50000000-0000-4000-8000-000000000002',
    '50000000-0000-4000-8000-000000000003'
  );
  delete from auth.users
  where id in (
    '50000000-0000-4000-8000-000000000001',
    '50000000-0000-4000-8000-000000000002',
    '50000000-0000-4000-8000-000000000003'
  );
end
$phase3$;

select 'phase_3_staff_operations_tests_passed' as result;
