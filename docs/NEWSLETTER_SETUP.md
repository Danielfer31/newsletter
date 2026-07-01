# Setup: suscripción newsletter

La suscripción usa Upstash Redis (tokens pendientes de confirmación) y Resend (email de
confirmación, Audience de suscriptores confirmados, envío de broadcasts). Sin configurar, el form
sigue funcionando pero no llega ningún email ni se guarda nada (falla en silencio).

## Variables de entorno nuevas

- `RESEND_API_KEY` — API key de tu cuenta Resend (https://resend.com/api-keys).
- `RESEND_AUDIENCE_ID` — id de la Audience donde se guardan los suscriptores confirmados
  (Resend dashboard → Audiences → crear una → copiar el id).
- `ADMIN_TOKEN` — string secreto elegido por vos, para proteger el endpoint de envío manual.
- `RESEND_FROM_EMAIL` — (opcional) dirección de email personalizada del remitente. Si se omite,
  usa el default (`La Biblioteca de Apolo <onboarding@resend.dev>`). Requiere un dominio
  verificado en Resend.

Reutiliza `UPSTASH_REDIS_REST_URL` / `UPSTASH_REDIS_REST_TOKEN` ya configuradas para el contador de
visitas (ver `docs/VIEW_COUNTER_SETUP.md`).

## Producción (Vercel)

1. Crear cuenta en https://resend.com si no se tiene.
2. Generar una API key y crear una Audience.
3. En el dashboard de Vercel, agregar `RESEND_API_KEY`, `RESEND_AUDIENCE_ID`, y `ADMIN_TOKEN` como
   env vars del proyecto.
4. Redesplegar para que las nuevas env vars tomen efecto.

## Desarrollo local

Agregar a `.env.local` (no versionado en git):

```
RESEND_API_KEY=re_...
RESEND_AUDIENCE_ID=...
ADMIN_TOKEN=elegí-un-string-secreto
```

Reiniciar `npm run dev`.

## Cómo mandar una edición

Una vez que tengas suscriptores confirmados en la Audience:

```bash
curl -X POST https://tu-sitio.com/api/newsletter/send \
  -H "x-admin-token: <tu ADMIN_TOKEN>" \
  -H "Content-Type: application/json" \
  -d '{"slug":"nombre-del-post"}'
```

Esto arma un email con título, extracto y link del post, y lo manda a toda la Audience confirmada
via Resend Broadcasts.
