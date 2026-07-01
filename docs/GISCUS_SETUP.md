# Setup: comentarios (Giscus)

Los comentarios por post usan Giscus (GitHub Discussions embed). Sin configurarlo, el sitio
funciona igual pero no se muestra el bloque de comentarios (falla en silencio).

## Requisitos previos

- Repo público en GitHub: `Danielfer31/newsletter`.
- Discussions habilitado (ya hecho vía `gh api -X PATCH repos/Danielfer31/newsletter -f has_discussions=true`).

## Pasos

1. Instalar la GitHub App de Giscus en el repo: https://github.com/apps/giscus → Install → seleccionar
   `Danielfer31/newsletter`.
2. En GitHub, ir a la pestaña **Discussions** del repo → **Edit categories** → crear una categoría
   llamada `Comments` (tipo "Announcement" o "Open-ended discussion", cualquiera sirve porque Giscus
   crea sus propias discussions).
3. Ir a https://giscus.app, en la sección "Configuración", pegar `Danielfer31/newsletter` en el campo
   de repositorio. La página valida que la app esté instalada y Discussions habilitado.
4. En "Mapeo de página → discusión" elegir **término específico** (no pathname).
5. En "Categoría de discusión" elegir `Comments`.
6. Copiar del bloque de script generado los valores de `data-repo-id` y `data-category-id`.

## Producción (Vercel)

Agregar estas env vars en el dashboard de Vercel (Settings → Environment Variables):

```
NEXT_PUBLIC_GISCUS_REPO=Danielfer31/newsletter
NEXT_PUBLIC_GISCUS_REPO_ID=<valor de giscus.app>
NEXT_PUBLIC_GISCUS_CATEGORY=Comments
NEXT_PUBLIC_GISCUS_CATEGORY_ID=<valor de giscus.app>
```

Redesplegar para que tomen efecto.

## Desarrollo local

Agregar las mismas 4 variables a `.env.local` (no versionado en git):

```
NEXT_PUBLIC_GISCUS_REPO=Danielfer31/newsletter
NEXT_PUBLIC_GISCUS_REPO_ID=...
NEXT_PUBLIC_GISCUS_CATEGORY=Comments
NEXT_PUBLIC_GISCUS_CATEGORY_ID=...
```

Reiniciar `npm run dev`.

## Moderación

Nativa de GitHub: desde la pestaña Discussions del repo se pueden editar, borrar o bloquear
discussions individuales.
