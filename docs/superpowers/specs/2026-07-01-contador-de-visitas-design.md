# Contador de visitas por post

## Contexto

El sitio se despliega en Vercel. Las páginas de post (`src/app/post/[slug]/page.tsx`) se generan
estáticamente vía `generateStaticParams()` — no hay filesystem persistente en runtime serverless,
así que no se puede usar un archivo local para guardar contadores. Se necesita almacenamiento
externo.

## Objetivo

Contar y mostrar cuántas veces se ha visitado cada post individual.

## Diseño

### Storage: Upstash Redis

Se usa la integración **Upstash Redis** de Vercel (Storage → Marketplace → Upstash Redis en el
dashboard — el usuario debe crearla manualmente, no es algo que se pueda automatizar desde código).
Provee un plan gratis (500K comandos/mes) suficiente para un blog personal. La integración expone
dos variables de entorno al conectarse a un proyecto: `UPSTASH_REDIS_REST_URL` y
`UPSTASH_REDIS_REST_TOKEN`.

Se usa el paquete `@upstash/redis` (cliente REST oficial, sin necesidad de conexión TCP
persistente — funciona bien en entornos serverless/edge).

Cada post tiene una key `views:<slug>` en Redis, cuyo valor es un contador entero incrementado con
`INCR`.

### `src/lib/views.ts`

Módulo con dos funciones:

- `incrementViews(slug: string): Promise<number>` — ejecuta `redis.incr(\`views:${slug}\`)`,
  devuelve el nuevo total.
- `getViews(slug: string): Promise<number>` — ejecuta `redis.get(\`views:${slug}\`)`, devuelve
  el valor actual (0 si no existe).

El cliente Redis se instancia una sola vez a partir de las env vars.

### `src/app/api/views/[slug]/route.ts`

Route handler de Next.js con dos métodos:

- `POST` — llama a `incrementViews(slug)`, devuelve `{ views: number }`. Se llama una vez por
  visita real de un post, desde el cliente (evita contar prerendering/build).
- `GET` — llama a `getViews(slug)`, devuelve `{ views: number }`. Usado para mostrar el contador
  en contextos donde no se quiere incrementar (ej. si en el futuro se muestra en un listado).

### `src/components/ViewCounter.tsx` (client component)

Recibe `slug` como prop. En un `useEffect` al montar:

1. Chequea `sessionStorage` con key `viewed:<slug>` — si ya existe, no vuelve a incrementar (evita
   inflar el contador con re-renders, navegación back/forward, o StrictMode double-invoke en dev).
2. Si no existe, hace `POST /api/views/<slug>`, guarda `viewed:<slug>` en `sessionStorage`, y
   actualiza el estado local con el número devuelto.
3. Si ya existe en `sessionStorage`, hace `GET /api/views/<slug>` para mostrar el número actual
   sin incrementar.

Muestra el número con un texto simple, ej. "142 lecturas" — estilo visual a definir siguiendo la
paleta existente del sitio (se decide en implementación, siguiendo componentes ya usados en
`post/[slug]/page.tsx` como referencia de estilo, no requiere nueva decisión de diseño visual).

### Integración en la página de post

`src/app/post/[slug]/page.tsx` (server component) renderiza `<ViewCounter slug={post.slug} />`
cerca de la fecha/metadata del post.

### Manejo de errores

Si Upstash no está configurado (env vars ausentes) o falla la llamada, `ViewCounter` no debe
romper la página: captura el error, no muestra el contador (fail silently), loguea el error en
consola del servidor/cliente para debug.

## Fuera de alcance

- Contador agregado (total del sitio) — solo por post
- Analytics más ricos (visitantes únicos, geolocalización, referrers)
- Mostrar contador en `PostCard` / listados (solo en la página de detalle del post por ahora)
- Rate limiting o protección anti-bot del endpoint de incremento

## Setup requerido (fuera del código, responsabilidad del usuario)

1. Crear integración Upstash Redis desde el dashboard de Vercel (Storage → Marketplace).
2. Conectar la integración al proyecto — esto inyecta `UPSTASH_REDIS_REST_URL` y
   `UPSTASH_REDIS_REST_TOKEN` automáticamente en las env vars de Vercel.
3. Para desarrollo local: copiar esas mismas dos vars a `.env.local` (crear cuenta gratis en
   upstash.com si se quiere probar sin desplegar).

## Testing

- Con env vars configuradas: visitar un post, confirmar que `sessionStorage` guarda la key y que
  el contador incrementa en Redis (verificable con `redis.get` desde un script de prueba o el
  dashboard de Upstash).
- Recargar la misma página: confirmar que NO incrementa de nuevo (usa GET, no POST).
- Sin env vars configuradas: confirmar que la página no rompe, el componente falla en silencio.
