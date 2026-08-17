# Fase 2 — operación y habilitación

La fase 2 habilita autenticación de personal, perfiles, roles, pacientes
administrativos, agenda y auditoría básica. Supabase `core`
(`tswmkmfmycvhxdamacla`) continúa clasificado como **desarrollo**. No ingresar
datos reales ni retirar la protección de Vercel antes de una autorización
formal de producción.

## Estado aplicado

- Migraciones `20260816053346_phase_2_auth_rls` y
  `20260816053426_phase_2_fk_indexes`, más el endurecimiento
  `20260816060614_phase_2_immutable_record_ids`, aplicadas.
- Once tablas públicas con RLS y privilegios explícitos.
- Altas públicas no forman parte de la aplicación; toda cuenta nueva queda
  `pending` y sin rol.
- Pacientes y citas no admiten `DELETE` para `authenticated`.
- La agenda evita solapamientos por profesional y box.
- Cambios de estado y mutaciones administrativas generan trazabilidad mínima
  sin copiar datos clínicos al log.

## Crear el primer administrador

1. En Supabase Dashboard, usar **Authentication → Users → Invite user**. No
   habilitar un formulario público de registro. La plantilla de invitación
   debe apuntar a `/auth/confirm`; después de validar el token, la aplicación
   conduce al usuario a `/set-password`.
2. Cuando el usuario exista, ejecutar en SQL Editor reemplazando los valores:

```sql
update public.profiles
set display_name = 'Nombre autorizado', status = 'active'
where id = '<uuid-auth-user>';

insert into public.user_roles (user_id, role_code)
values ('<uuid-auth-user>', 'admin');
```

3. Para un profesional, asignar `dentist` o `facial_harmonization` y crear su
   vínculo operativo:

```sql
insert into public.professionals (profile_id, internal_code)
values ('<uuid-auth-user>', 'PROF-001');
```

La administración de roles permanece deliberadamente fuera del cliente web
en esta fase para impedir autoelevación de privilegios.

## Configuración antes de desplegar

- En Supabase Auth, desactivar **Allow new users to sign up** en el proyecto
  remoto y mantener el ingreso solo por invitación. El archivo local ya define
  `enable_signup = false`, contraseña mínima de 12 caracteres y complejidad.
- Mientras se use el correo predeterminado de Supabase, definir el **Site URL**
  remoto como `https://core-clinica-amalia.vercel.app/set-password` y permitir
  `https://core-clinica-amalia.vercel.app/**` en las Redirect URLs. La pantalla
  acepta el fragmento de sesión predeterminado y también el callback SSR que se
  usará al habilitar SMTP propio. Mantener localhost únicamente para desarrollo
  local.
- Al habilitar SMTP propio y copiar `supabase/templates/invite.html` al panel,
  volver a definir el **Site URL** como el origen sin `/set-password`; la
  plantilla personalizada dirigirá entonces a `/auth/confirm`.
- Definir en Vercel `NEXT_PUBLIC_SUPABASE_URL` y
  `NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY`. El código acepta temporalmente la
  antigua `NEXT_PUBLIC_SUPABASE_ANON_KEY` para no romper el despliegue actual.
- Mantener Vercel Authentication hasta completar MFA, recuperación de cuenta,
  separación desarrollo/producción y autorización para datos reales.
- Ejecutar `pnpm check` y `supabase/tests/phase_2_rls.sql` antes de promover.

## Verificación y rollback

El test RLS crea usuarios y registros sintéticos dentro de una sola operación,
comprueba accesos positivos y negativos y elimina sus datos al terminar. El
plan Free mantiene la advertencia `auth_leaked_password_protection`: la
comprobación contra contraseñas filtradas requiere Supabase Pro. La aplicación
exige 12 caracteres con mayúscula, minúscula, número y símbolo, pero el upgrade
sigue siendo requisito antes de autorizar datos reales o clasificar el entorno
como producción clínica.

Si una migración impide operar, desplegar primero la versión anterior, realizar
un respaldo y evaluar el rollback en
`supabase/rollback/20260816053346_phase_2_auth_rls.down.sql`. Ese script elimina
todo el modelo de fase 2 y nunca debe ejecutarse con información que deba
conservarse.
