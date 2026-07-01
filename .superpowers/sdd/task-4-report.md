# Task 4 Report: Update Atlas And Carousel Links

## Resultado
- Actualicé el carrusel editorial para que las tarjetas de ruta apunten a `/rutas/<slug>` usando `getRouteHref(category)`.
- En `/categorias`, añadí la CTA de entrada a la ruta activa justo después de la descripción larga.
- La grilla "Todas las rutas" ahora enlaza a las rutas independientes y conserva intacto el selector lateral para navegar dentro del atlas.

## Archivos tocados
- `src/components/editorial/CategoryRouteCarousel.tsx`
- `src/app/categorias/CategoriesClient.tsx`

## Verificación
- `npm run lint`
- Resultado: PASS con 3 advertencias existentes en archivos fuera del alcance de esta tarea.

## Concerns
- No hay bloqueos funcionales.
- Persisten advertencias de `@next/next/no-img-element` en archivos no relacionados con este cambio.
