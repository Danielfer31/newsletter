# Setup: contador de visitas

El contador de visitas por post usa Upstash Redis. Sin configurarlo, el sitio funciona igual pero
no se muestra el contador (falla en silencio).

## Producción (Vercel)

1. En el dashboard de Vercel, ir a Storage → Marketplace → buscar "Upstash Redis" → crear.
2. Conectar la integración al proyecto. Esto inyecta automáticamente `UPSTASH_REDIS_REST_URL` y
   `UPSTASH_REDIS_REST_TOKEN` en las env vars del proyecto.
3. Redesplegar para que las nuevas env vars tomen efecto.

## Desarrollo local

1. Crear cuenta gratis en https://upstash.com si no se tiene.
2. Crear una base de datos Redis desde el dashboard de Upstash.
3. Copiar `UPSTASH_REDIS_REST_URL` y `UPSTASH_REDIS_REST_TOKEN` a un archivo `.env.local` en la
   raíz del proyecto (no versionado en git):

```
UPSTASH_REDIS_REST_URL=https://...
UPSTASH_REDIS_REST_TOKEN=...
```

4. Reiniciar `npm run dev`.
