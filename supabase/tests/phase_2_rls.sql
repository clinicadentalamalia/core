do $phase2$
declare
  visible_rows integer;
  changed_rows integer;
  box_identifier bigint;
begin
  insert into auth.users (
    id, aud, role, email, raw_app_meta_data, raw_user_meta_data,
    created_at, updated_at, is_sso_user, is_anonymous
  ) values
    ('10000000-0000-0000-0000-000000000001', 'authenticated', 'authenticated', 'reception.phase2@example.test', '{}'::jsonb, '{}'::jsonb, now(), now(), false, false),
    ('10000000-0000-0000-0000-000000000002', 'authenticated', 'authenticated', 'dentist.phase2@example.test', '{}'::jsonb, '{}'::jsonb, now(), now(), false, false),
    ('10000000-0000-0000-0000-000000000003', 'authenticated', 'authenticated', 'other.phase2@example.test', '{}'::jsonb, '{}'::jsonb, now(), now(), false, false);

  update public.profiles
  set status = 'active',
      display_name = case id
        when '10000000-0000-0000-0000-000000000001' then 'Recepción Prueba'
        when '10000000-0000-0000-0000-000000000002' then 'Profesional Asignado'
        else 'Profesional No Asignado'
      end
  where id in (
    '10000000-0000-0000-0000-000000000001',
    '10000000-0000-0000-0000-000000000002',
    '10000000-0000-0000-0000-000000000003'
  );

  insert into public.user_roles (user_id, role_code) values
    ('10000000-0000-0000-0000-000000000001', 'reception'),
    ('10000000-0000-0000-0000-000000000002', 'dentist'),
    ('10000000-0000-0000-0000-000000000003', 'dentist');

  insert into public.professionals (id, profile_id, internal_code) values
    ('20000000-0000-0000-0000-000000000002', '10000000-0000-0000-0000-000000000002', 'TEST-DENTIST-2'),
    ('20000000-0000-0000-0000-000000000003', '10000000-0000-0000-0000-000000000003', 'TEST-DENTIST-3');

  select id into box_identifier from public.boxes where name = 'Box 1';

  execute 'set local role authenticated';
  perform set_config('request.jwt.claim.sub', '10000000-0000-0000-0000-000000000001', true);
  perform set_config(
    'request.jwt.claims',
    '{"sub":"10000000-0000-0000-0000-000000000001","role":"authenticated"}',
    true
  );

  insert into public.patients (
    id, full_name, identifier, phone, email
  ) values (
    '30000000-0000-0000-0000-000000000001',
    'Paciente Sintético Fase Dos',
    'ID-PHASE2-001',
    '+56 9 0000 0001',
    'patient.phase2@example.test'
  );

  select count(*) into visible_rows
  from public.patients
  where id = '30000000-0000-0000-0000-000000000001';
  if visible_rows <> 1 then
    raise exception 'Recepción no puede leer el paciente que creó';
  end if;

  update public.patients
  set id = '30000000-0000-0000-0000-000000000099'
  where id = '30000000-0000-0000-0000-000000000001';

  select count(*) into visible_rows
  from public.patients
  where id = '30000000-0000-0000-0000-000000000001';
  if visible_rows <> 1 then
    raise exception 'El identificador interno de paciente no quedó inmutable';
  end if;

  insert into public.appointments (
    id, patient_id, professional_id, box_id, starts_at, ends_at,
    service_name, service_area, status
  ) values (
    '40000000-0000-0000-0000-000000000001',
    '30000000-0000-0000-0000-000000000001',
    '20000000-0000-0000-0000-000000000002',
    box_identifier,
    '2030-01-10 13:00:00+00',
    '2030-01-10 14:00:00+00',
    'Evaluación sintética',
    'dentistry',
    'confirmed'
  );

  perform set_config('request.jwt.claim.sub', '10000000-0000-0000-0000-000000000003', true);
  perform set_config(
    'request.jwt.claims',
    '{"sub":"10000000-0000-0000-0000-000000000003","role":"authenticated"}',
    true
  );

  select count(*) into visible_rows
  from public.patients
  where id = '30000000-0000-0000-0000-000000000001';
  if visible_rows <> 0 then
    raise exception 'Un profesional no asignado pudo leer un paciente';
  end if;

  begin
    insert into public.patients (full_name, identifier)
    values ('Inserción No Autorizada', 'DENIED-PHASE2');
    raise exception 'Un profesional pudo crear un paciente';
  exception
    when insufficient_privilege then null;
  end;

  update public.appointments
  set status = 'completed'
  where id = '40000000-0000-0000-0000-000000000001';
  get diagnostics changed_rows = row_count;
  if changed_rows <> 0 then
    raise exception 'Un profesional no asignado pudo modificar una cita';
  end if;

  perform set_config('request.jwt.claim.sub', '10000000-0000-0000-0000-000000000002', true);
  perform set_config(
    'request.jwt.claims',
    '{"sub":"10000000-0000-0000-0000-000000000002","role":"authenticated"}',
    true
  );

  select count(*) into visible_rows
  from public.patients
  where id = '30000000-0000-0000-0000-000000000001';
  if visible_rows <> 1 then
    raise exception 'El profesional asignado no pudo leer su paciente';
  end if;

  select count(*) into visible_rows
  from public.appointments
  where id = '40000000-0000-0000-0000-000000000001';
  if visible_rows <> 1 then
    raise exception 'El profesional asignado no pudo leer su cita';
  end if;

  execute 'reset role';
  execute 'set local role anon';

  begin
    perform 1 from public.patients;
    raise exception 'Anon pudo leer pacientes';
  exception
    when insufficient_privilege then null;
  end;

  begin
    insert into public.patients (full_name, identifier)
    values ('Intento Anónimo', 'ANON-PHASE2');
    raise exception 'Anon pudo crear pacientes';
  exception
    when insufficient_privilege then null;
  end;

  execute 'reset role';

  if has_table_privilege('anon', 'public.patients', 'select') then
    raise exception 'Anon conserva SELECT en patients';
  end if;

  if not has_table_privilege('authenticated', 'public.patients', 'select,insert,update') then
    raise exception 'Authenticated no tiene privilegios mínimos esperados';
  end if;

  if has_table_privilege('authenticated', 'public.patients', 'delete') then
    raise exception 'Authenticated conserva DELETE en patients';
  end if;

  select count(*) into visible_rows
  from public.appointment_status_history
  where appointment_id = '40000000-0000-0000-0000-000000000001';
  if visible_rows <> 1 then
    raise exception 'No se registró el historial inicial de la cita';
  end if;

  select count(*) into visible_rows
  from public.audit_events
  where entity_id in (
    '30000000-0000-0000-0000-000000000001',
    '40000000-0000-0000-0000-000000000001'
  );
  if visible_rows <> 2 then
    raise exception 'No se registró la auditoría mínima';
  end if;

  delete from public.appointment_status_history
  where appointment_id = '40000000-0000-0000-0000-000000000001';
  delete from public.appointments
  where id = '40000000-0000-0000-0000-000000000001';
  delete from public.patients
  where id = '30000000-0000-0000-0000-000000000001';
  delete from public.professionals
  where id in (
    '20000000-0000-0000-0000-000000000002',
    '20000000-0000-0000-0000-000000000003'
  );
  delete from public.user_roles
  where user_id in (
    '10000000-0000-0000-0000-000000000001',
    '10000000-0000-0000-0000-000000000002',
    '10000000-0000-0000-0000-000000000003'
  );
  delete from public.audit_events
  where entity_id in (
    '10000000-0000-0000-0000-000000000001',
    '10000000-0000-0000-0000-000000000002',
    '10000000-0000-0000-0000-000000000003',
    '30000000-0000-0000-0000-000000000001',
    '40000000-0000-0000-0000-000000000001'
  );
  delete from auth.users
  where id in (
    '10000000-0000-0000-0000-000000000001',
    '10000000-0000-0000-0000-000000000002',
    '10000000-0000-0000-0000-000000000003'
  );
end
$phase2$;

select 'phase_2_rls_tests_passed' as result;
