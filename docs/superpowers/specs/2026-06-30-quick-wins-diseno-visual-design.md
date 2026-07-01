# Quick Wins de Diseño Visual — La Biblioteca de Apolo

> **Origen:** `informe-analisis-diseno-visual.md` (análisis de junio 2026, score 59/100)
> **Alcance:** Los 8 "quick wins" del reporte, verificados contra el código actual.
> **Fecha:** 2026-06-30

## Contexto

El reporte de análisis visual describía componentes (`FeaturedArticle.tsx`, `CategoryRail.tsx`) que ya no existen como archivos separados — su lógica vive inline en `src/app/page.tsx`. Los 8 problemas identificados siguen presentes en el código real; este spec los ubica con precisión antes de planificar la implementación.

## Alcance de esta ronda

Solo los 8 quick wins. No incluye: rediseño del StoryCarousel/PostCard hacia estética editorial (problema #5 del top 5), sistema de Input, menú hamburguesa, Design Tokens completos, Storybook, ni dark mode — esos quedan para rondas posteriores.

## Los 8 cambios

### 1. Componente `<Button>`
**Nuevo archivo:** `src/components/editorial/Button.tsx`

Variantes: `primary` (fondo ink, texto paper-soft — hero CTA, SubscribeBox), `secondary` (borde ink, texto ink — MapHero CTA), `ghost` (borde inferior, sin fondo — "Explorar el archivo"), `subtle` (fondo paper-soft, borde line — links de categoría).

Reemplaza los CTAs manuales en:
- `src/app/page.tsx:80-92` (hero: primary + ghost)
- `src/app/page.tsx:158-174` (CategoryRail links: subtle)
- `src/components/editorial/SubscribeBox.tsx:56-62` (primary)
- `src/components/editorial/MapHero.tsx:32-38` (secondary)
- `src/components/editorial/SiteHeader.tsx:60-65` (pill "Suscribirse" — variante `subtle` con borde gold, o se deja fuera si es visualmente distinta a propósito — decidir en implementación)

Elimina los `style={{ color: 'var(--paper-soft)' }}` inline duplicados en page.tsx:83 y SubscribeBox.tsx:59.

### 2. `next/image` en PostCard
**Archivo:** `src/components/PostCard.tsx:24-31`

Reemplazar `<img>` nativa por `<Image>` de `next/image`, con `fill` (contenedor ya es `absolute inset-0`), `sizes="(max-width: 768px) 256px, 320px"`, y quitar el `onError` que oculta la imagen con manipulación directa del DOM (antipatrón en React) — usar `onError` con `useState` si se necesita fallback, o dejar que Next.js maneje el error nativamente.

### 3. Escala tipográfica base
**Archivo:** `src/app/globals.css`

Agregar tokens en `:root` (después de línea 17):
```css
--text-hero: 4.5rem;
--text-display: 3rem;
--text-headline: 2.25rem;
--text-title: 1.5rem;
--text-lead: 1.25rem;
--text-body: 1.125rem;
--text-ui: 1rem;
--text-small: 0.875rem;
--text-xs: 0.75rem;
```
No se migran todos los usos existentes en esta ronda (eso es tarea #13 de "mejoras medias" en el reporte, fuera de alcance). Solo se definen los tokens y se corrige el caso puntual de `.ui-label` (ítem 6 abajo).

### 4. Espaciado del bloque de categorías
**Archivo:** `src/app/page.tsx:143`

`<section className="editorial-shell py-3" ...>` → `py-8`.

### 5. Quitar `text-align: justify`
**Archivo:** `src/app/globals.css:171-186`

`.editorial-prose p` pasa de `text-align: justify` a `text-align: left` en la regla base. Como consecuencia, el media query de línea 176-179 que forzaba `text-align: left` en mobile queda redundante y se elimina (dejando solo el ajuste de `.post-prose` font-size que sigue siendo necesario).

### 6. Contraste del label en StoryCarousel + tamaño mínimo de `.ui-label`
**Archivos:** `src/components/StoryCarousel.tsx:77-84`, `src/app/globals.css:147-155`

StoryCarousel: `opacity-40` → `opacity-70`, `tracking-[0.4em]` → `tracking-[0.25em]`.

`.ui-label` en globals.css: `font-size: 0.68rem` → `0.75rem` (usa `--text-xs` del nuevo token), tracking se mantiene en `0.14em` ya que a 12px es legible.

### 7. `prefers-reduced-motion` en StoryCarousel
**Archivo:** `src/components/StoryCarousel.tsx:18-40`

Dentro del `useEffect`, comprobar `window.matchMedia('(prefers-reduced-motion: reduce)').matches` antes de arrancar el loop de `requestAnimationFrame`. Si el usuario prefiere movimiento reducido, no animar (el carrusel queda estático, navegable por scroll horizontal nativo ya que el contenedor es `flex` con `overflow` del padre).

### 8. CTA "Leer" estandarizado
**Archivos:** `src/app/page.tsx:132-134` (FeaturedArticle), `src/components/PostCard.tsx:68-73`

Ambos puntos pasan a usar el mismo patrón visual: texto `text-sm font-semibold text-sepia` con flecha `→` en `aria-hidden`, transición a `text-ink` en hover. Se quita el `underline decoration-gold` del FeaturedArticle (línea 132) para igualar con PostCard. `ArticleRow.tsx` no lleva CTA de "Leer" explícito porque toda la fila es un link — se deja así, es un patrón distinto y válido (fuera de alcance cambiarlo).

## Fuera de alcance (explícito)

- Rediseño estético del StoryCarousel/PostCard (problema #5, crítico pero requiere su propio ciclo de diseño)
- Controles de navegación/pausa del carrusel más allá de `prefers-reduced-motion`
- Migración completa de todos los tamaños tipográficos arbitrarios a los nuevos tokens
- `<Input>` component, menú hamburguesa, Design Tokens completos, Storybook, dark mode

## Testing

- Build (`npm run build`) debe pasar sin errores de tipos tras introducir `Button` y `next/image`.
- Verificación visual manual en el navegador: hero, CategoryRail, SubscribeBox, MapHero, SiteHeader, StoryCarousel — en 375px, 768px, 1440px.
- Verificar `prefers-reduced-motion` con DevTools (emular la media query) — el carrusel no debe animarse.
- Verificar contraste del label del carrusel visualmente contra `--paper`.
