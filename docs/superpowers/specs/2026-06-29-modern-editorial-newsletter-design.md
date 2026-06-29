# La Biblioteca de Apolo — Modern Editorial Newsletter Design

**Date:** 2026-06-29  
**Status:** Approved direction  
**Reference image:** `/public/references/biblioteca-apolo-modern-editorial-reference.png`

---

## Overview

La Biblioteca de Apolo debe sentirse como una newsletter cultural moderna con alma cartográfica. La referencia aprobada abandona el fondo negro cinematográfico y la estética brillante de IA. El sitio debe parecer humano, editorial, cálido, elegante y usable.

La idea central se mantiene: **el mapa es el alma del proyecto**. Pero ahora el mapa funciona como sistema gráfico sutil, no como fondo dramático. Debe aparecer en líneas finas, marcas de coordenadas, rutas, brújulas y texturas leves de papel.

---

## Public Impression

Cuando alguien entra al sitio debe sentir:

- Esto es una newsletter personal, no un blog genérico.
- Tiene una identidad editorial clara.
- Hay una voz cultural amplia: política, cultura, anime, fútbol, música y opinión.
- El mapa no es decoración; es la metáfora de navegación del contenido.
- La experiencia es elegante y cálida, no oscura ni artificial.

Frase guía:

> Una revista/newsletter cultural independiente construida como un mapa de obsesiones.

---

## Visual Direction

### Personality

- Moderna.
- Editorial.
- Cálida.
- Cartográfica.
- Literaria.
- Sobria.
- Personal.

### Avoid

- Fondos negros dominantes.
- Neones o brillos dramáticos.
- Glassmorphism.
- Gradientes morados/azules tipo IA.
- Tarjetas glossy.
- Look SaaS corporativo.
- Plantilla genérica de blog.
- Exceso de sombras.
- Estética demasiado perfecta o sintética.

---

## Palette

Use a warm paper base with ink-like contrast.

```css
:root {
  --paper: #f4efe4;
  --paper-soft: #fbf7ee;
  --paper-deep: #e7dcc8;
  --ink: #1f1f1c;
  --ink-soft: #4f4a42;
  --sepia: #8a6f4d;
  --gold: #b4944f;
  --red: #9f3d35;
  --blue: #28677d;
  --green: #596f45;
  --violet: #6b5876;
  --line: rgba(31, 31, 28, 0.16);
}
```

Rules:

- `--paper` is the dominant background.
- `--ink` is the main text color.
- Category colors are accents only.
- Dark sections may exist, but never dominate the page.

---

## Typography

### Titles

Use the existing serif direction for main identity and article titles. Titles should feel like a cultural magazine, not a startup landing page.

Recommended usage:

- Site title: large serif.
- Article titles: serif, strong but not oversized.
- Pull quotes: serif italic.

### UI And Metadata

Use clean sans-serif for:

- Navigation.
- Buttons.
- Labels.
- Dates.
- Category chips.
- Form fields.

Rules:

- Natural letter spacing.
- No futuristic tracking-heavy labels except very small editorial metadata.
- Avoid giant hero text that overwhelms the newsletter structure.

---

## Home Page Structure

The home page is a newsletter front page with a map identity.

```text
Header
Hero editorial map
Featured article + subscription block
Category rail
Latest entries
```

### Header

Left:

- `La Biblioteca de Apolo`

Right:

- `Archivo`
- `Categorías`
- `Sobre el proyecto`
- `Suscribirse`

Style:

- Thin bottom border.
- Transparent over paper.
- No heavy dark nav.
- Subscribe button is restrained: border, ink/gold, no loud fill.

### Hero

Content:

- `EDICIÓN #01`
- `La Biblioteca de Apolo`
- `Un mapa semanal de política, cultura, anime, fútbol y música`
- `Leer última entrada`

Visual treatment:

- Warm paper background.
- Low-opacity cartographic map linework.
- Fine coordinate lines.
- Small compass or route marks.
- Text remains fully readable.

The hero should be spacious but not like a marketing landing page. It is a front page, not a sales page.

### Featured + Subscribe

Two-column desktop section:

- Left: featured article.
- Right: subscription module.

Featured article includes:

- Category.
- Title.
- Date.
- Short excerpt.
- Subtle article frame or rule.

Subscription module includes:

- Title: `Recibir la próxima edición`
- Short line of copy.
- Email input.
- Button: `Suscribirme`

Style:

- Thin borders.
- Minimal shadow or no shadow.
- Warm paper panel variation.
- Sharp or 4px-radius corners.

### Categories

Horizontal rail:

- `Geopolítica`
- `Anime`
- `Fútbol`
- `Música`
- `Opinión`
- `RPG`
- `Cultura`

Style:

- Chips as editorial tags, not pill-heavy SaaS badges.
- Muted category accent line or small dot.

### Latest Entries

Three or more compact article previews.

Each preview:

- Category.
- Title.
- Date.
- One or two excerpt lines.

Style:

- Magazine/archive feeling.
- Fine dividers.
- No image dependency required for every card.

---

## Map System

The map remains the core identity, but should be expressed differently from the previous dark version.

Use:

- Thin SVG strokes.
- Low opacity.
- Contour and route lines.
- Compass details.
- Coordinate grid.
- Small category-specific symbols.
- Paper-like texture.

Avoid:

- Full-screen black map.
- Overpowering map contrast.
- Glowing map animations.
- Heavy fantasy UI.

Category expressions:

| Category | Map Expression | Accent |
|---|---|---|
| Geopolítica | world routes, borders, fault lines | muted red |
| Anime | sea routes, islands, adventure marks | ocean blue |
| Fútbol | pitch geometry, tactical arrows | olive/grass green |
| Música | constellation staff lines, routes between stars | violet/gold |
| RPG | dungeon/path lines, terrain marks | sepia/gold |
| Cultura | orbital/idea map, archive marks | blue/cyan muted |
| Opinión | terra incognita, marginalia | gold/ink |

---

## Post Pages

Post pages should inherit the warm editorial system while allowing each post to have a world of its own.

Shared base:

- Paper or themed paper background.
- Serif title.
- Category/date metadata.
- Comfortable reading width.
- Fine cartographic or editorial details.
- Previous/next navigation as archive links.

Layout templates should be toned down from theatrical worlds into editorial variations:

| Layout | Modern Direction |
|---|---|
| `pergamino` | essay page, paper texture, margin notes |
| `cosmos` | light paper with star-map linework, not black space |
| `carta` | playing-card inspired frame, restrained |
| `tablero` | tactical grid and map annotations |
| `manga` | clean panel rhythm, strong typography, limited black |

---

## Admin Pages

Admin should be functional and visually related, but quieter.

Use:

- Same paper background.
- Dense editorial forms.
- Clear labels.
- Preview panel that resembles the public post style.

Avoid:

- Decorative hero sections.
- Marketing copy.
- Heavy visual effects.

---

## Implementation Notes

- Replace dark global background with the warm paper system.
- Convert `LiveMap` from dark full-screen cinematic hero into a refined editorial hero with subtle map linework.
- Keep the newsletter sections visible on the first page: feature, subscribe, categories, latest entries.
- Use Server Components for data-loading sections and Client Components only for interaction.
- Keep map assets as SVG so category expressions can remain light, crisp and editable.

---

## Acceptance Criteria

- The home clearly reads as a newsletter website.
- The visual tone matches the reference image saved at `/public/references/biblioteca-apolo-modern-editorial-reference.png`.
- The page does not use dominant black backgrounds.
- The map identity is visible but subtle.
- The site feels modern, elegant and human-made.
- The composition preserves: header, hero, featured article, subscribe block, categories and latest entries.
- Cards and panels use fine editorial borders instead of glossy shadows.
