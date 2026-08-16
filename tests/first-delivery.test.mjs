import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";
import test from "node:test";

const read = (path) => readFile(new URL(`../${path}`, import.meta.url), "utf8");

test("los datos están rotulados como ficticios y usan dominios de prueba", async () => {
  const source = await read("src/lib/demo-data.ts");
  assert.match(source, /Todos los nombres y datos son ficticios/);
  assert.doesNotMatch(source, /@(gmail|hotmail|outlook)\./i);
  assert.doesNotMatch(source, /RUT ficticio|\d{1,2}\.\d{3}\.\d{3}-[\dk]/i);
  assert.ok((source.match(/@example\.test/g) ?? []).length >= 4);
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
