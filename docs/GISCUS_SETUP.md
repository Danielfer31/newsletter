# Setup: comentarios (sistema propio)

> **Giscus quedó obsoleto.** Se reemplazó por un sistema de comentarios propio
> construido sobre la infraestructura de newsletter (Redis + Resend). Ya no se
> usa GitHub Discussions ni se requiere login de GitHub para comentar.

Los comentarios por post usan `src/lib/comments.ts` + las rutas `POST /api/comments`
y `GET /api/comments/confirm`. Sin las variables de entorno configuradas, el bloque
de comentarios muestra "Comentarios no disponibles por el momento" (falla en silencio).

## Modelo de producto

Comentar = suscribirse. Al confirmar el email para publicar un comentario, el
usuario queda suscrito al newsletter (doble opt-in, mismo patrón que la suscripción).

## Variables de entorno

Reutiliza las del newsletter y agrega el secreto de sesión:

```
UPSTASH_REDIS_REST_URL=...
UPSTASH_REDIS_REST_TOKEN=...
RESEND_API_KEY=...
RESEND_FROM_EMAIL=...        # opcional; default onboarding@resend.dev
RESEND_AUDIENCE_ID=...        # para dar de alta al suscriptor al confirmar
COMMENT_SESSION_SECRET=...    # secreto HMAC para firmar la cookie apolo_verified (90d)
```

Generar el secreto:

```bash
node -e "console.log(require('crypto').randomBytes(32).toString('hex'))"
```

## Flujo

1. El lector envía un comentario. Sin cookie válida → recibe un email de
   confirmación (token 24h). Con cookie válida → se publica directo.
2. Al hacer click en el link de confirmación (`/api/comments/confirm?token=`),
   el comentario se publica, se setea la cookie `apolo_verified` y el email se
   agrega a la audiencia de Resend.
3. Respuestas: un solo nivel de anidación.

## Moderación

No hay panel de administración. Para borrar un comentario, desde la consola de
Upstash Redis: eliminar la key `comment:{id}` y removerla del sorted set
`comments:{slug}` (top-level) o `replies:{parentId}` (respuesta).
