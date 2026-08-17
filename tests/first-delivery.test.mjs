import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";
import test from "node:test";

const read = (path) => readFile(new URL(`../${path}`, import.meta.url), "utf8");

test("el entorno advierte que no se deben ingresar datos reales", async () => {
  const source = await read("src/lib/demo-data.ts");
  assert.match(source, /No ingresar datos reales/);
  assert.doesNotMatch(source, /@(gmail|hotmail|outlook)\./i);
  assert.doesNotMatch(source, /RUT ficticio|\d{1,2}\.\d{3}\.\d{3}-[\dk]/i);
  assert.ok((source.match(/@example\.test/g) ?? []).length >= 4);
});

test("la sesión se refresca en el proxy y las rutas privadas validan claims", async () => {
  const proxy = await read("src/lib/supabase/proxy.ts");
  const layout = await read("src/app/(private)/layout.tsx");
  assert.match(proxy, /auth\.getClaims\(\)/);
  assert.match(proxy, /Cache-Control/);
  assert.match(layout, /auth\.getClaims\(\)/);
  assert.match(layout, /redirect\("\/login\?reason=unauthorized"\)/);
});

test("la migración activa RLS y no concede borrado de pacientes", async () => {
  const migration = await read(
    "supabase/migrations/20260816053346_phase_2_auth_rls.sql",
  );
  assert.ok((migration.match(/enable row level security/g) ?? []).length >= 11);
  assert.match(migration, /patients_select_authorized/);
  assert.match(migration, /appointments_select_authorized/);
  assert.match(migration, /grant insert, update on public\.patients/);
  assert.doesNotMatch(migration, /grant delete on public\.patients/);
});

test("la navegación contiene los nueve módulos acordados", async () => {
  const source = await read("src/components/app-shell.tsx");
  for (const route of ["dashboard", "pacientes", "agenda", "tratamientos", "recordatorios", "finanzas", "inventario", "reportes", "ajustes"]) {
    assert.match(source, new RegExp(`/${route}`));
  }
});

test("la interfaz define adaptaciones para tablet y teléfono", async () => {
  const css = await read("src/app/globals.css");
  assert.match(css, /@media \(max-width: 780px\)/);
  assert.match(css, /@media \(max-width: 560px\)/);
  assert.match(css, /\.patient-cards \{ display: grid/);
});

test("los permisos simulados separan finanzas y ajustes", async () => {
  const source = await read("src/lib/demo-data.ts");
  const reception = source.match(/Recepción: \[(.*?)\]/s)?.[1] ?? "";
  const dentist = source.match(/Odontólogo: \[(.*?)\]/s)?.[1] ?? "";
  assert.doesNotMatch(reception, /Ajustes/);
  assert.doesNotMatch(dentist, /Finanzas/);
});

test("la fase 3 protege la administración de personal y expone salud mínima", async () => {
  const migration = await read(
    "supabase/migrations/20260817034643_phase_3_staff_operations.sql",
  );
  const privileges = await read(
    "supabase/migrations/20260817034750_phase_3_staff_privileges.sql",
  );
  const healthRoute = await read("src/app/api/health/route.ts");

  assert.match(migration, /alter table public\.staff_accounts enable row level security/);
  assert.match(migration, /security invoker/);
  assert.match(migration, /p_user_id = \(select auth\.uid\(\)\)/);
  assert.match(migration, /grant execute on function public\.app_healthcheck\(\) to anon, authenticated/);
  assert.match(migration, /manage_staff_access\([\s\S]*?security invoker/i);
  assert.match(privileges, /revoke all on table public\.staff_accounts/);
  assert.match(privileges, /grant select on table public\.staff_accounts to authenticated/);
  assert.match(healthRoute, /Cache-Control/);
  assert.doesNotMatch(healthRoute, /error\.message/);
});
