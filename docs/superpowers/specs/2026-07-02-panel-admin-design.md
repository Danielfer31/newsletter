# Panel de administración — posts y comentarios

## Contexto

El sitio hoy no tiene ningún panel de edición: los posts se crean a mano como `.md` en
`content/posts/` (con ayuda de `scripts/new-post.mjs`, ver
`docs/superpowers/specs/2026-07-01-editor-de-posts-cli-design.md`), y los comentarios
(`src/lib/comments.ts`, Redis/Upstash) no tienen ninguna vía de edición o borrado — solo
`publishComment` (crear) y `getComments` (leer).

**Esta spec reemplaza la decisión "sin admin web" de la spec del editor CLI.** El usuario pidió
explícitamente un panel web único para gestionar posts (crear/editar/eliminar) y moderar
comentarios (editar/eliminar). El script CLI (`npm run new-post`) sigue existiendo como vía
alternativa rápida desde terminal; no se elimina.

Restricción clave de infraestructura: el sitio corre en Vercel (serverless). El filesystem es
de solo lectura en runtime — no se puede escribir `content/posts/*.md` ni `public/images/*`
directamente desde una API route en producción. Cualquier escritura de posts/imágenes tiene que
pasar por un sistema externo (git commit vía API, o un blob store).

## Objetivo

Panel web en `/admin`, protegido, de un solo editor (el dueño del sitio), que permite:

1. Crear, editar y eliminar posts (todos los campos de frontmatter, incluyendo los anidados).
2. Subir imágenes para el campo `imagen`.
3. Ver, editar y eliminar comentarios por post (con borrado en cascada de replies).

Fuera de alcance: gestión de suscriptores del newsletter, multi-usuario/roles, aprobación
editorial (draft/publish workflow), analytics.

## Arquitectura

- **Auth:** Auth.js (NextAuth v5) con GitHub OAuth provider, scope `read:user repo`. El login
  es válido solo si el `username` de GitHub devuelto coincide con
  `process.env.ADMIN_GITHUB_USERNAME`. Cualquier otro usuario que complete el OAuth queda
  rechazado (sesión no se crea).
- **Sesión:** JWT firmado (estrategia `session: { strategy: 'jwt' }` de Auth.js), incluye
  `username` y el `access_token` de GitHub devuelto por el OAuth (para hacer commits en nombre
  del usuario — no se necesita un GitHub PAT separado).
- **Middleware:** `src/middleware.ts` protege `/admin/*` y `/api/admin/*`. Sin sesión válida →
  redirect a `/admin/login`.
- **Posts:** siguen siendo `.md` en `content/posts/`, sin cambios en `src/lib/posts.ts` (lectura
  intacta). El panel escribe/edita/borra vía GitHub REST API (Octokit), haciendo commit directo
  a `main`. El push dispara el redeploy automático de Vercel (~1-2 min hasta ver el cambio
  publicado).
- **Imágenes:** subida vía Vercel Blob Storage (`@vercel/blob`). El campo `imagen` guarda la URL
  del blob para archivos nuevos subidos desde el panel; los posts existentes con paths locales
  (`/images/...`) siguen funcionando sin cambios — no se migran.
- **Comentarios:** sin cambios de infraestructura (siguen en Redis/Upstash). El panel opera
  directo sobre `src/lib/comments.ts`, con dos funciones nuevas (`updateComment`,
  `deleteComment`). Escritura instantánea, sin redeploy.

### Nuevas dependencias

`next-auth` (Auth.js v5), `@octokit/rest`, `@vercel/blob`.

### Variables de entorno nuevas

- `AUTH_GITHUB_ID` / `AUTH_GITHUB_SECRET` — OAuth App de GitHub.
- `AUTH_SECRET` — secret de firma de Auth.js.
- `ADMIN_GITHUB_USERNAME` — único username autorizado a entrar.
- `BLOB_READ_WRITE_TOKEN` — provisto por Vercel al crear el Blob store.

## Componentes

### Páginas (`src/app/admin/`)

- `/admin/login` — botón "Login con GitHub".
- `/admin` — dashboard: tabla de posts (título, categoría, fecha) con acciones editar/eliminar,
  y por cada post un contador de comentarios con link a `/admin/comments/[slug]`.
- `/admin/posts/nuevo` — formulario de creación.
- `/admin/posts/[slug]/editar` — mismo formulario, precargado con `getPostBySlug(slug)`.
- `/admin/comments/[slug]` — árbol de comentarios del post (top-level + replies anidadas),
  con botones editar/eliminar por comentario.

### Formulario de post (compartido crear/editar)

Cobertura completa de `PostFrontmatter` (`src/types/post.ts`):

| Campo | Control |
|---|---|
| `titulo` | input texto |
| `categoria` | select (7 valores de `Category`) |
| `fecha` | date picker, default hoy en creación |
| `imagen` | input file → sube a Blob al seleccionar, preview |
| `extracto` | textarea |
| `cancion` | input texto (URL), opcional |
| `tema.fondo` / `tema.acento` | color picker (input type=color + hex manual) |
| `tema.fuente` | select (`FontStyle`) |
| `layout` | select (5 valores de `Layout`) |
| `ruta` | editor de lista: agregar/quitar slugs (texto libre, sin validar contra posts existentes — igual que el script CLI) |
| `notasMargen` | editor de lista: agregar/quitar filas `{title, body}` |
| `contenido` (body) | textarea markdown (sin preview en v1) |

Slug: autogenerado igual que el script CLI (`<fecha>-<titulo-slugificado>`) en creación;
inmutable en edición (cambiar el slug requeriría mover el archivo — fuera de alcance, se
documenta como limitación conocida).

### API routes (`src/app/api/admin/`)

- `POST /api/admin/posts` — valida body, chequea que el slug no exista
  (`getPostBySlug` → null), serializa con `matter.stringify`, commit vía
  `src/lib/github.ts#commitPost`.
- `PUT /api/admin/posts/[slug]` — mismo serializado, commit de update (mismo path, nuevo
  contenido).
- `DELETE /api/admin/posts/[slug]` — `src/lib/github.ts#deletePost` (borra el archivo vía
  commit). No toca comentarios asociados (quedan huérfanos en Redis — aceptado, ver Edge
  cases).
- `POST /api/admin/upload` — recibe `FormData` con el archivo, `put()` de `@vercel/blob`,
  devuelve `{ url }`.
- `GET /api/admin/comments/[slug]` — variante admin de `getComments` que además incluye
  `id` de cada comentario (la versión pública ya lo incluye — se reusa tal cual).
- `PATCH /api/admin/comments/[id]` — body `{ name?, body? }`, llama
  `updateComment(id, patch)`.
- `DELETE /api/admin/comments/[id]` — llama `deleteComment(id)` (cascada si es top-level).

Todas las rutas `/api/admin/*` verifican sesión server-side (misma verificación que el
middleware, redundante a propósito por si se llaman directo).

### `src/lib/github.ts` (nuevo)

```ts
export async function commitPost(slug: string, markdown: string, accessToken: string): Promise<void>
export async function deletePost(slug: string, accessToken: string): Promise<void>
```

Usa `@octokit/rest` con el `access_token` de la sesión (no un PAT fijo). Repo/owner/branch
vía env vars (`GITHUB_REPO_OWNER`, `GITHUB_REPO_NAME`, default branch `main`). Cada llamada:
1. Lee el SHA actual del archivo (si existe) vía `repos.getContent`.
2. Hace `repos.createOrUpdateFileContents` (create) o con el SHA (update), o
   `repos.deleteFile` (delete) — todos requieren el SHA del blob actual para evitar
   conflictos de concurrencia.

### `src/lib/comments.ts` (extensión)

```ts
export async function updateComment(id: string, patch: { name?: string; body?: string }): Promise<Comment | null>
export async function deleteComment(id: string): Promise<void>
```

`deleteComment`: lee el comment, si `parentId === null` (top-level) borra también todas sus
replies (`repliesKey(id)` → cada id → `commentKey` + del zset), luego borra el comment mismo y
lo remueve de `topLevelKey(slug)`. Si es una reply, solo se borra a sí mismo y se remueve de
`repliesKey(parentId)`.

## Edge cases

- **Commit a GitHub falla** (rate limit, token vencido/revocado, conflicto de SHA) → API
  devuelve error, el formulario retiene los datos ingresados (no se pierde la edición), toast
  de error con el mensaje.
- **Slug duplicado** al crear → rechazado antes de intentar el commit, mensaje claro.
- **Sesión vencida** → middleware redirige a `/admin/login`; si expira a mitad de un POST, la
  API responde 401 y el cliente redirige.
- **Eliminar post con comentarios asociados** → los comentarios quedan huérfanos en Redis (la
  key sigue con `slug` del post borrado). Aceptado como limitación; no hay borrado en cascada
  cross-sistema (post↔comments) en v1.
- **Eliminar comment top-level con replies** → cascada completa (ver arriba).
- **Upload a Blob falla** → error visible en el form, el resto de los campos no se pierde.
- **GitHub OAuth de un usuario no autorizado** → Auth.js callback rechaza la sesión (no hay
  `authorized` true), redirect a login con mensaje de acceso denegado.

## Testing

- Unit: `updateComment` / `deleteComment` (mock del cliente Redis) — casos: edit simple, delete
  top-level sin replies, delete top-level con replies (cascada), delete de una reply.
- Unit: `commitPost` / `deletePost` (mock de Octokit) — verifica que arma el path/contenido
  correcto y maneja el caso de archivo inexistente (create) vs existente (update, con SHA).
- Manual (antes de apuntar a `main` real): probar el flujo completo de commit contra una rama de
  prueba / repo de prueba, confirmar que el redeploy de Vercel toma el cambio y `getAllPosts()`
  lo refleja.
- Manual: login con un usuario GitHub que NO es `ADMIN_GITHUB_USERNAME`, confirmar rechazo.

## Fuera de alcance (v1)

- Draft/publish workflow, programación de publicación.
- Multi-usuario / roles / permisos granulares.
- Preview de markdown en el editor de contenido.
- Migración de imágenes existentes a Blob Storage.
- Borrado en cascada post→comentarios.
- Gestión de suscriptores del newsletter desde el panel.
