# Guía de contenido — La Biblioteca de Apolo

## Crear un post nuevo

```bash
npm run new-post
```

El script pregunta cada campo del frontmatter, valida los que tienen valores fijos (categoría,
layout, fuente), genera un slug automático (`<fecha>-<titulo-slugificado>`), y crea el archivo en
`content/posts/<slug>.md` con un cuerpo placeholder listo para editar.

## Editar un post existente

No hay script para esto — edita el `.md` directamente en `content/posts/` con cualquier editor.
El frontmatter es YAML; el cuerpo es markdown normal (soporta GFM vía `remark-gfm`).

## Valores válidos de frontmatter

**`categoria`**: `geopolitica` | `anime` | `futbol` | `musica` | `rpg` | `cultura` | `opinion`

**`layout`**: `pergamino` | `cosmos` | `carta` | `tablero` | `manga`

**`tema.fuente`**: `serif` | `sans` | `mono` | `display`

**`tema.fondo`** / **`tema.acento`**: colores hex de 6 dígitos, ej. `#f4efe4`

## Ejemplo de frontmatter completo

```yaml
---
titulo: "Boca es Boca y el resto es el resto"
categoria: futbol
fecha: "2026-06-24"
imagen: /images/placeholder-futbol.jpg
extracto: "Hay clubes de fútbol y hay religiones paganas. Boca es las dos cosas al mismo tiempo, y en esa contradicción está toda su grandeza."
cancion: https://open.spotify.com/track/2374M7fBbDrEGbFed0LUQB
tema:
  fondo: "#f4efe4"
  acento: "#596f45"
  fuente: sans
layout: tablero
ruta:
  - "2026-06-26-el-mundo-se-parte"
notasMargen:
  - title: "El Templo de Brandsen"
    body: "La Bombonera no solo alberga partidos; vibra físicamente debido a su estructura de hormigón armado, un latido que los rivales sienten como hostil."
---
```

## Imágenes

El script no sube ni gestiona imágenes. Coloca el archivo manualmente en `public/images/` y
referencia la ruta (`/images/nombre.jpg`) en el campo `imagen`.
