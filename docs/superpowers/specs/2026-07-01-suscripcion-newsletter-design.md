# Suscripción newsletter — diseño

## Contexto

`SubscribeBox.tsx` existe como UI pura: el submit solo hace `setIsSubmitted(true)` local, sin backend. Este diseño conecta el form a un flujo real de suscripción con doble opt-in vía Resend, más un endpoint admin para disparar el envío manual de cada edición.

Sigue el patrón ya establecido con el contador de visitas: route handler en `src/app/api/`, módulo lib con fail-silent si faltan env vars, storage en Upstash Redis (ya provisionado).

## Decisiones

- **Registro**: servicio de email marketing externo — **Resend** (Audiences API).
- **Envío de cada edición**: manual, disparado por el usuario vía endpoint admin protegido (no automático al publicar).
- **Confirmación**: doble opt-in — el suscriptor debe confirmar por email antes de quedar agregado a la Audience de Resend.
- **Auth del endpoint admin**: header secreto `x-admin-token` comparado contra env var `ADMIN_TOKEN`.

## Flujo de suscripción

1. Usuario llena `SubscribeBox` → `POST /api/newsletter/subscribe` con `{ email }`.
2. Handler valida email (formato básico). Si inválido → `400`.
3. Genera token random (`crypto.randomUUID()`), guarda en Redis: `pending:<token>` → `email`, TTL 24h (`EX 86400`).
4. Envía email de confirmación vía Resend (`resend.emails.send`) con link `https://<site>/api/newsletter/confirm?token=<token>`.
5. Si Redis o Resend no están configurados (env vars faltantes) → responde `200` genérico igual (fail-silent, no rompe UX), solo loggea server-side.
6. Responde `200` con mensaje de éxito genérico siempre (evita enumeración de emails ya suscritos).

## Flujo de confirmación

1. `GET /api/newsletter/confirm?token=<token>`.
2. Busca `pending:<token>` en Redis. Si no existe/expiró → página HTML simple de error ("enlace inválido o expirado").
3. Si existe: llama Resend Contacts API para agregar el email a la Audience (`RESEND_AUDIENCE_ID`). Si Resend devuelve error de contacto duplicado, se trata como éxito (idempotente).
4. Borra `pending:<token>` de Redis.
5. Responde página HTML simple de éxito ("Listo, quedaste suscrito").

## Flujo de envío manual

1. Usuario ejecuta: `curl -X POST https://<site>/api/newsletter/send -H "x-admin-token: $ADMIN_TOKEN" -H "Content-Type: application/json" -d '{"slug":"nombre-del-post"}'`.
2. Handler valida header `x-admin-token` contra `process.env.ADMIN_TOKEN`. Si no matchea → `401`.
3. Busca el post por slug vía `getPostBySlug` (ya existe en `src/lib/posts.ts`). Si no existe → `404`.
4. Arma HTML simple del email (título, excerpt/resumen, link al post) y llama Resend Broadcasts API contra `RESEND_AUDIENCE_ID`.
5. Responde `200` con resultado del envío (id del broadcast) o `500` con detalle de error si Resend falla (endpoint admin, no público — ok exponer detalle técnico).

## Módulos nuevos

- **`src/lib/newsletter.ts`**: cliente Redis (mismo `getRedisClient` pattern que `views.ts`, o reexportado) + cliente Resend lazy-init. Funciones: `createPendingSubscription(email)`, `getPendingEmail(token)`, `deletePendingSubscription(token)`, `addConfirmedContact(email)`, `sendBroadcast(post)`. Todas fail-silent (retornan `null`/`false`) si faltan env vars.
- **`src/app/api/newsletter/subscribe/route.ts`** — `POST`.
- **`src/app/api/newsletter/confirm/route.ts`** — `GET`, responde HTML directo (no JSON).
- **`src/app/api/newsletter/send/route.ts`** — `POST`, protegido.
- **`SubscribeBox.tsx`** — agregar `fetch('/api/newsletter/subscribe', ...)` real en `handleSubmit`, estados de loading y error además del éxito ya existente.

## Env vars nuevas

- `RESEND_API_KEY`
- `RESEND_AUDIENCE_ID`
- `ADMIN_TOKEN`

Reutiliza `UPSTASH_REDIS_REST_URL` / `UPSTASH_REDIS_REST_TOKEN` ya existentes.

## Manejo de errores

| Caso | Respuesta |
|---|---|
| Email inválido en subscribe | `400` |
| Redis/Resend caído en subscribe | `200` genérico (fail-silent), log server |
| Token inválido/expirado en confirm | Página HTML de error, no crash |
| Email ya confirmado (duplicado) | Tratado como éxito silencioso |
| `ADMIN_TOKEN` ausente o no matchea en send | `401` |
| Slug inexistente en send | `404` |
| Resend falla en send | `500` con detalle |

## Testing

Sin suite automatizada (proyecto no tiene tests hoy, mismo criterio que contador de visitas). Verificación manual:

1. `subscribe` con email real → confirmar llega email de Resend.
2. Click en link de confirm → verificar página de éxito y contacto aparece en Resend Audience dashboard.
3. `send` con slug real vía curl + header correcto → verificar broadcast llega a la audience.
4. `send` sin header o con token incorrecto → verificar `401`.

## Fuera de alcance

- Envío automático al publicar posts.
- UI de administración para gestionar suscriptores (se maneja desde el dashboard de Resend).
- Unsubscribe custom (Resend Broadcasts incluye unsubscribe automático por email).
