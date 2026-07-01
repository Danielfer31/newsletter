# Sistema de comentarios — Giscus (Pendiente 4)

## Decisión

Comentarios vía [Giscus](https://giscus.app): embed que usa GitHub Discussions como backend. Sin backend propio, sin DB, sin moderación custom.

Alternativas descartadas:
- **Custom (Redis)**: requeriría moderación y anti-spam propios — mucho más trabajo para un blog personal.
- **Disqus**: inyecta ads/tracking de terceros, no encaja con sitio editorial cuidado.

## Prerrequisito: repo en GitHub

El repo local no tiene remote. Giscus exige repo **público** en GitHub con Discussions habilitado y la app Giscus instalada.

Pasos (parte del plan de implementación, no de este diseño):
1. Crear repo público en GitHub: `newsletter`.
2. Push del código actual.
3. Habilitar Discussions en Settings → General → Features.
4. Instalar la GitHub App de Giscus (https://github.com/apps/giscus) en el repo.
5. Crear categoría de Discussions llamada `Comments`.
6. Obtener `data-repo-id` y `data-category-id` desde https://giscus.app tras conectar el repo.

## Arquitectura

- Componente cliente `GiscusComments` (`'use client'`) en `src/components/editorial/GiscusComments.tsx`.
- Monta el script embed de Giscus (`https://giscus.app/client.js`) vía `<script>` con atributos data-* configurados como props/constantes.
- Sin lib, sin route handler, sin storage — Giscus es 100% client-side, GitHub aloja los datos.

## Configuración Giscus

| Opción | Valor |
|---|---|
| `data-repo` | `<usuario>/newsletter` |
| `data-repo-id` | obtenido de giscus.app (constante en el componente) |
| `data-category` | `Comments` |
| `data-category-id` | obtenido de giscus.app (constante en el componente) |
| `data-mapping` | `pathname` (1 discussion por slug de post) |
| `data-reactions-enabled` | `1` |
| `data-lang` | `es` |
| `data-theme` | `light` (tema estándar más cercano a la paleta paper/ink; sin CSS custom en esta iteración — YAGNI) |

## Integración en la página

En `src/app/post/[slug]/page.tsx`: montar `<GiscusComments />` después del `<nav>` de navegación anterior/siguiente (línea ~226) y antes de `<EditorialFooter />` (línea ~229). Envuelto en un contenedor `max-w-3xl mx-auto` consistente con el resto del artículo, con separador `border-t border-line` y un heading `Comentarios` en `ui-label`.

## Manejo de errores

Giscus ya maneja fallos de carga (ad-blockers, red) con su propio mensaje de error dentro del iframe. No se duplica esa lógica. No hay fallback adicional — si el script no carga, el usuario ve el mensaje nativo de Giscus.

## Moderación

Nativa de GitHub Discussions: el owner del repo edita/borra/lock discussions desde la pestaña Discussions de GitHub. Sin capa extra en el sitio.

## Testing

Sin tests automatizados posibles — Giscus depende de auth de GitHub del visitante y de un servicio externo. Verificación: post real en dev, comentario de prueba, confirmar que aparece la discussion correspondiente en GitHub.

## Fuera de alcance

- Tema visual custom para Giscus (CSS injection) — se evalúa después si el tema `light` desentona demasiado.
- Notificaciones por email de nuevos comentarios — GitHub ya notifica al owner por su config normal de Discussions.
