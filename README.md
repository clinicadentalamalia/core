# Clínica Amalia — primera entrega ficticia

Aplicación privada en Next.js para diseño y pruebas de la futura operación odontológica y de armonización facial. Esta entrega utiliza **exclusivamente datos ficticios en memoria** y no persiste pacientes ni información clínica en Supabase.

## Seguridad y alcance

- No ingresar datos personales, fotografías, documentos o antecedentes reales.
- No usar `SUPABASE_SERVICE_ROLE_KEY` en el navegador.
- No crear tablas clínicas antes de aprobar [`docs/MODELO_DATOS_Y_RLS_PROPUESTO.md`](docs/MODELO_DATOS_Y_RLS_PROPUESTO.md).
- No promover previews a producción clínica.
- El proyecto Supabase enlazado se considera desarrollo ficticio hasta que exista separación y autorización formal de producción.

## Tecnologías

- Next.js 16 con App Router, React 19 y TypeScript estricto.
- Tailwind CSS 4 y tokens visuales globales.
- Supabase SSR preparado para navegador y servidor.
- React Hook Form y Zod para validación.
- Pruebas de contrato con Node.js y pruebas de componentes con Vitest, jsdom y Testing Library.
- Inter y Cormorant Garamond alojadas como dependencias locales para builds reproducibles.

## Ejecución local

```bash
pnpm install
pnpm dev
```

Abrir `http://localhost:3000`. La ruta `/login` es visual; el enlace “Entrar a la demostración” lleva al dashboard sin autenticar ni guardar una sesión.

## Verificación

```bash
pnpm check
```

`pnpm check` ejecuta lint, typecheck, todas las pruebas y el build. El mismo gate se
ejecuta en GitHub Actions para cada pull request y cada push a `main`. `pnpm build`
también exige `typecheck` antes de compilar; luego evita únicamente la comprobación
interna duplicada de Next.js para funcionar en entornos con subprocesos restringidos.

Para revisar dependencias conocidas como vulnerables:

```bash
pnpm audit --audit-level high
```

## Variables

Copiar `.env.example` a `.env.local` solo cuando se habilite Auth de desarrollo. Mantener valores distintos por ambiente y nunca confirmar `.env.local` en Git.

## Rutas incluidas

- `/login`: acceso visual preparado.
- `/dashboard`: indicadores, agenda diaria, calendario y acciones rápidas ficticias.
- `/pacientes`: búsqueda y formulario validado sin persistencia.
- `/agenda`: vista diaria y estados visuales.
- `/tratamientos`, `/recordatorios`, `/finanzas`, `/inventario`, `/reportes`, `/ajustes`: estados iniciales navegables.

## Siguiente incremento seguro

Aprobar el modelo de datos y la matriz RLS. Después se puede crear una primera migración revisable para perfiles, roles, pacientes administrativos, agenda y auditoría básica, seguida de pruebas negativas por rol.
