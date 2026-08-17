# Fase 3 — personal y operación segura

Este incremento habilita administración de cuentas internas, un control de
salud y registros operativos mínimos. El proyecto Supabase `core`
(`tswmkmfmycvhxdamacla`) continúa clasificado como **desarrollo/demostración**.
No ingresar información de pacientes reales.

## Alcance incluido

- Directorio de personal visible únicamente para el rol `admin`.
- Activación, suspensión y asignación atómica de roles desde `/ajustes`.
- Protección de la cuenta administradora actual: no puede suspenderse ni
  cambiar sus propios roles desde la aplicación.
- Sincronización privada del correo de Auth hacia el directorio administrativo.
- Auditoría de cambios de perfil y roles sin copiar contraseñas ni datos
  clínicos.
- `GET /api/health`, sin caché, para comprobar aplicación y base de datos.
- Logs estructurados con evento, resultado, duración y correlación de Vercel;
  no incluyen correo, nombre, identificador de usuario ni contenido clínico.

## Decisiones de alcance

- **MFA y código QR:** excluidos por decisión de producto en esta fase.
- **SMTP propio:** diferido. Se mantiene el correo predeterminado de Supabase y
  la invitación manual mientras sea suficiente para el equipo reducido.
- **Invitación automática:** diferida porque requiere una credencial de servidor
  con privilegios elevados. No se expone una `service_role` al navegador.
- **Producción separada:** no se crea otro proyecto ni un recurso con costo sin
  aprobación explícita. El entorno actual no queda autorizado para operación
  clínica real.

## Alta y cambio de personal

1. En Supabase Dashboard abrir **Authentication → Users → Invite user**.
2. Invitar únicamente el correo institucional autorizado.
3. El usuario define su contraseña mediante el enlace recibido.
4. Un administrador entra a `/ajustes`, completa el nombre, asigna al menos un
   rol y cambia el estado a `Activa`.
5. Para retirar acceso, cambiar el estado a `Suspendida` y quitar sus roles.

No compartir contraseñas por correo, chat o documentos. La aplicación nunca
muestra ni almacena una contraseña legible.

## Verificación antes de desplegar

```bash
pnpm check
```

Después de aplicar las migraciones
`20260817034643_phase_3_staff_operations.sql` y
`20260817034750_phase_3_staff_privileges.sql`, ejecutar
`supabase/tests/phase_3_staff_operations.sql` en el entorno de desarrollo. El
test crea identidades sintéticas, valida permisos de administración, recepción
y anónimo, y elimina sus registros al finalizar.

Comprobaciones manuales:

1. El administrador abre `/ajustes` y visualiza el directorio.
2. Recepción recibe una página no encontrada al intentar abrir `/ajustes`.
3. El administrador puede modificar otra cuenta, pero no la propia.
4. `/api/health` responde `200` con estado `ok`.
5. Los Runtime Logs de Vercel no contienen correos, nombres ni datos clínicos.

## Respaldo, despliegue y rollback

Antes de aplicar la migración remota, registrar el despliegue vigente y crear o
confirmar un respaldo recuperable de la base según el plan contratado. No usar
el rollback para sustituir un respaldo.

Orden de despliegue:

1. Ejecutar los gates locales y de CI.
2. Confirmar el respaldo y aplicar la migración.
3. Ejecutar la prueba SQL y revisar los asesores de seguridad.
4. Desplegar la aplicación y realizar las comprobaciones manuales.

Si la migración impide operar, detener cambios administrativos, volver a la
versión anterior de la aplicación y evaluar
`supabase/rollback/20260817034643_phase_3_staff_operations.down.sql`. El script
elimina el directorio sincronizado y la operación de roles, por lo que solo
debe ejecutarse después de revisar su impacto y confirmar el respaldo.
