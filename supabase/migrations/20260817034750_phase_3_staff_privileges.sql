begin;

-- Historial remoto: 20260817034750_phase_3_staff_privileges.

-- Supabase applies broad default table grants in the public schema. Keep RLS as
-- defense in depth, but remove every privilege that this directory does not
-- need so accidental future policies cannot widen its mutation surface.
revoke all on table public.staff_accounts
  from public, anon, authenticated;
grant select on table public.staff_accounts to authenticated;

commit;
