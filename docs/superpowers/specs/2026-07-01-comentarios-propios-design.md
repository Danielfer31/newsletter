# Sistema de comentarios propio (reemplaza Giscus)

## Contexto y motivación

Giscus requiere login de GitHub para comentar. El público objetivo de este
newsletter no tiene cuenta de GitHub — eso es una barrera de entrada que
impide comentarios. Se reemplaza por un sistema propio construido sobre la
infraestructura ya existente de newsletter (Redis + Resend, patrón de doble
opt-in) documentada en `src/lib/newsletter.ts`.

Decisión de producto: **comentar = suscribirse**. Al verificar su email para
publicar un comentario, el usuario queda suscrito al newsletter también. Esto
convierte cada comentario potencial en una oportunidad de crecer la lista de
suscriptores, sin pedirle al usuario una cuenta externa.

## Arquitectura

- `src/lib/comments.ts` — nuevo módulo, mismo patrón que `newsletter.ts`
  (cliente Redis lazy-init, cliente Resend lazy-init, funciones puras).
- `POST /api/comments` — recibe envío de comentario nuevo o reply.
- `GET /api/comments/confirm` — verifica token de email, publica el
  comentario pendiente, setea cookie de sesión.
- `Comments.tsx` — client component, reemplaza `GiscusComments` en la página
  de detalle de post.
- Sesión de "verificado" vía cookie firmada (HMAC), no requiere tabla de
  usuarios ni JWT de terceros.

## Modelo de datos (Redis)

```
comments:{slug}         sorted set, IDs de comentarios top-level, score=createdAt
replies:{parentId}      sorted set, IDs de replies, score=createdAt
comment:{id}            JSON string: {id, slug, parentId, name, email, body, createdAt}
pending-comment:{token} JSON string (mismo shape sin id/createdAt), TTL 24h
```

El campo `email` se persiste en `comment:{id}` pero **nunca se expone** en la
respuesta pública de la API ni en el render — solo `name` es visible.

Replies son de 1 nivel de profundidad (no hay replies de replies). Un
comentario con `parentId` se agrega a `replies:{parentId}`, nunca a
`comments:{slug}`.

## Flujo de datos

1. Usuario envía comentario: `{ name, email?, body, parentId? }`.
2. Servidor lee cookie `apolo_verified`.
   - **Cookie válida y su email coincide con el enviado** (o no se envió
     email porque el form lo omitió al detectar cookie): publica directo.
     Escribe `comment:{id}`, agrega a `comments:{slug}` o
     `replies:{parentId}`. Llama `addConfirmedContact(email)` (ya existe en
     `newsletter.ts`, idempotente) para asegurar que quede suscrito.
     Responde `{ status: 'published', comment }`.
   - **Sin cookie válida**: guarda payload completo en
     `pending-comment:{token}` (24h TTL), envía email de confirmación con
     preview del comentario (nuevo template, mismo mecanismo de
     `sendConfirmationEmail`). Responde `{ status: 'pending' }`.
3. `GET /api/comments/confirm?token=`: lee `pending-comment:{token}`. Si
   existe: genera ID, publica (mismo paso que arriba), llama
   `addConfirmedContact(email)`, borra la key pendiente, setea cookie
   `apolo_verified` (httpOnly, 90 días, firmada con `COMMENT_SESSION_SECRET`),
   redirige a `/post/{slug}#comment-{id}`. Si token inválido/expirado:
   redirige a página de error simple.

### Cookie de sesión

- Nombre: `apolo_verified`.
- Valor: `base64(email).hmacSha256(email + iat, COMMENT_SESSION_SECRET)`.
- Atributos: `httpOnly`, `secure` (prod), `sameSite=lax`, `maxAge=90d`.
- Verificación: recomputa HMAC, compara con constant-time compare. Si no
  matchea o email del payload no coincide con el email enviado en el form →
  tratar como no autenticado.

## Componentes UI

`Comments.tsx` (client component), montado en la página de detalle de post
en lugar de `GiscusComments`:

- Lista de comentarios: top-level ordenados cronológicamente, cada uno con
  sus replies (si tiene) anidadas debajo, también cronológicas.
- Form de comentario nuevo arriba de la lista: campo `name`, campo `email`
  (oculto si el usuario ya tiene cookie válida — se detecta vía prop server
  pasada desde la page al leer cookies()), `textarea` para `body`, botón
  "Comentar".
- Cada comentario top-level tiene botón "Responder" que abre un mini-form
  inline (mismos campos) con `parentId` preseteado al ID de ese comentario.
- Campo honeypot oculto (`website`, escondido vía CSS) — si viene con
  contenido, el servidor rechaza silenciosamente (responde 200 sin publicar,
  para no delatar el honeypot a bots).
- Tras envío sin cookie: mensaje "Revisá tu correo para confirmar tu
  comentario" (mismo patrón visual que `SubscribeBox`).
- Tras envío con cookie: comentario aparece optimista en la lista.

## Manejo de errores y edge cases

- Redis o Resend sin configurar (dev sin env vars): API responde 503, UI
  muestra "Comentarios no disponibles por el momento".
- Cookie presente pero inválida (firma no matchea, o expiró): tratar como
  sesión inexistente, se le pide email de nuevo.
- Reply con `parentId` de un comentario inexistente o borrado: 404 silencioso
  desde la API, el intento se ignora.
- `body` vacío o mayor a 2000 caracteres: 400, validación server-side (y
  cliente para feedback inmediato).
- Token de confirmación expirado o inválido en `/api/comments/confirm`:
  redirige a página de error simple con mensaje "Este link expiró, comentá
  de nuevo".
- Honeypot activado: no se persiste nada, no se envía email, respuesta 200
  idéntica a un envío exitoso (evita que el bot aprenda a evadirlo).

## Fuera de alcance (explícito)

- No hay panel de administración para borrar comentarios. Moderación manual,
  si hace falta, se hace directo desde la consola de Upstash Redis borrando
  la key `comment:{id}` y removiéndola del sorted set correspondiente. Se
  documenta este procedimiento en `docs/` si se vuelve necesario, pero no se
  construye UI para esto en este alcance.
- No hay edición ni borrado de comentarios por parte del autor.
- No hay likes/reacciones a comentarios.
- No se migra el historial de comentarios de Giscus (no había comentarios
  reales aún, según los observations del proyecto — 0 comentarios en la
  captura que motivó este cambio).

## Testing

Verificación manual (skill `verify`) tras implementar:

1. Comentar sin cookie previa → recibe email, confirma link → comentario
   aparece publicado, cookie seteada, queda suscrito al newsletter (revisar
   audiencia de Resend).
2. Comentar de nuevo con la misma cookie → publica directo, sin nuevo email.
3. Responder a un comentario existente → aparece anidado debajo del padre.
4. Enviar comentario con honeypot lleno → no aparece nada, no llega email.
5. Confirmar con token expirado/inválido → página de error, no crashea.
6. Cookie con firma corrupta (editada a mano) → tratada como no autenticada.

## Reemplazo de Giscus

Este spec reemplaza el diseño anterior en
`docs/superpowers/specs/2026-07-01-comentarios-giscus-design.md`. Al
implementar: remover `GiscusComments` del import y mount en la página de post
detail, remover la dependencia/script de Giscus, actualizar
`docs/GISCUS_SETUP.md` (borrar o marcar como obsoleto) y actualizar
`PENDIENTES.md` para reflejar el cambio de mecanismo de comentarios.
