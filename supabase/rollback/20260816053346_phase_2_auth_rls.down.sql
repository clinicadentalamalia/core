-- SOLO EMERGENCIA: elimina por completo el modelo operativo de fase 2.
-- No ejecutar si existen datos que deban conservarse. Respaldar y desplegar
-- primero una versión de la aplicación que no dependa de estas tablas.
begin;

drop trigger if exists on_auth_user_created on auth.users;

drop table if exists public.audit_events;
drop table if exists public.appointment_status_history;
drop table if exists public.appointments;
drop table if exists public.patients;
drop table if exists public.professional_specialties;
drop table if exists public.professionals;
drop table if exists public.boxes;
drop table if exists public.specialties;
drop table if exists public.user_roles;
drop table if exists public.roles;
drop table if exists public.profiles;
drop schema if exists app_private cascade;

commit;
