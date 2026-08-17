# Clínica Amalia — fase 2

Aplicación privada en Next.js para la operación inicial de Clínica Amalia. La
fase 2 incorpora Supabase Auth, perfiles y roles, pacientes administrativos,
agenda y auditoría básica con Row Level Security.

El proyecto conectado sigue siendo un **entorno de desarrollo**. No ingresar
datos personales, antecedentes clínicos, fotografías ni documentos reales.

## Controles implementados

- Sesión Supabase SSR renovada en `proxy.ts` y validada con `getClaims()` en el
  servidor.
- Usuarios nuevos en estado `pending`; los roles nunca se toman de
  `user_metadata`.
- RLS en las once tablas públicas y privilegios explícitos para
  `authenticated`; `anon` no accede a datos operativos.
- Recepción y administración pueden crear/actualizar pacientes y citas.
- Profesionales solo leen pacientes y citas que tengan asignados.
- Sin borrado de pacientes, citas, historial ni auditoría desde el cliente.
- Exclusión de solapamientos de agenda por profesional y box.
- Historial de estados y auditoría mínima sin duplicar contenido clínico.
- Gate local y CI con lint, TypeScript, pruebas y build.

## Ejecución local

Requiere Node 24 y pnpm 11.

```bash
pnpm install
Copy-Item .env.example .env.local
pnpm dev
```

Variables requeridas:

```dotenv
NEXT_PUBLIC_SUPABASE_URL=
NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY=
```

El código admite temporalmente `NEXT_PUBLIC_SUPABASE_ANON_KEY` como respaldo
para ambientes que aún no han migrado al nuevo nombre.

## Verificación

```bash
pnpm check
```

Las políticas se prueban con `supabase/tests/phase_2_rls.sql`. La prueba usa
identidades y registros sintéticos, valida casos permitidos y denegados y
limpia todo al finalizar.

## Habilitación de usuarios

No existe registro público. El primer administrador debe invitarse desde
Supabase Dashboard y activarse siguiendo
[`docs/FASE_2_OPERACION.md`](docs/FASE_2_OPERACION.md).

Antes de cualquier despliegue de esta fase también se debe:

1. Desactivar el signup público en la configuración remota de Supabase Auth.
2. Confirmar las variables de Supabase en Vercel.
3. Mantener Vercel Authentication.
4. Completar MFA, recuperación de cuenta y separación desarrollo/producción
   antes de autorizar datos reales.

## Alcance excluido

Historial clínico, odontograma, armonización clínica, consentimientos,
fotografías, finanzas e inventario no están implementados. Requieren decisiones
de retención, seguridad y operación independientes.
