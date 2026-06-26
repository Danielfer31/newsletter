# La Biblioteca de Apolo — Design Spec

**Date:** 2026-06-26  
**Status:** Approved  

---

## Overview

Personal newsletter and opinion space. Public, free, no subscriptions. Identity built entirely through posts — no bio page. Named after Apollo, god of the sun, music, poetry, and knowledge.

**Core aesthetic references:** cosmos/stars, One Piece, football, geopolitics, playing cards, Argentine rock, trickster archetype, tabletop RPGs.

---

## Stack

| Layer | Technology | Cost |
|-------|-----------|------|
| Framework | Next.js 14 (App Router) | Free |
| Content | Markdown files in repo | Free |
| Map animations | SVG + CSS + Framer Motion | Free |
| Admin panel | Custom `/admin` route | Free |
| Deploy | Vercel | Free |
| Music | Spotify embed iframe | Free |
| Version control | GitHub | Free |

**Total: $0/month.**

---

## Pages

```
/                    → Home: live map + infinite story carousel
/post/[slug]         → Individual post (unique design per entry)
/admin               → Password-protected admin panel
/admin/nuevo         → New post editor
/admin/editar/[slug] → Edit existing post
```

---

## Home Page

### Visual Identity
- Dark base background with parchment/aged paper texture
- Mixed typography: classic serif for titles, clean sans-serif for body
- Base palette: deep black, aged gold, ink blue/sepia accents
- Each category has its own accent color

### Live Map (Hero)
Full-screen SVG map occupying the hero area. On load: classic world map with antique texture. Map transitions smoothly when the carousel scrolls through a different category. Transition: CSS/SVG animation, ~800ms crossfade.

**Map per category:**

| Category | Map | Accent Color |
|----------|-----|-------------|
| Geopolitics / Politics | World map, parchment style | Blood red `#8B0000` |
| Anime / One Piece | Grand Line, 4 seas | Ocean blue `#1a6b8a` |
| Football | Aerial pitch view | Grass green `#2d6a4f` |
| Music / Rock | Star constellations | Violet `#6b2fa0` |
| RPG / Tabletop | Fantasy dungeon map | Amber `#b5660a` |
| Pop culture | Universe / stellar map | Cyan `#0a8b8b` |
| Free opinion | Terra incognita | Gold `#c9a84c` |

### Infinite Story Carousel
Below the map. Auto-scrolling loop, also draggable. Each card shows:
- Cover image
- Title
- 2–3 line excerpt
- Category badge with accent color
- "Leer" (read) button

Cards loop infinitely. Scroll speed: slow and ambient. When hovering a card, map transitions to that category's map.

---

## Post Page (`/post/[slug]`)

Each post is a Markdown file with frontmatter that defines its full visual identity.

### Frontmatter Schema
```yaml
---
titulo: "El mundo se parte en dos"
categoria: geopolitica          # geopolitica | anime | futbol | musica | rpg | cultura | opinion
fecha: 2026-06-26
imagen: /posts/portada.jpg
extracto: "Dos frases que aparecen en el carrusel."
cancion: https://open.spotify.com/track/...
tema:
  fondo: "#0a0a1a"
  acento: "#e63946"
  fuente: serif                 # serif | sans | mono | display
layout: pergamino               # pergamino | cosmos | carta | tablero | manga
---
```

### Layout Templates
Five layout templates, each with distinct visual personality:

| Layout | Personality | Best for |
|--------|-------------|---------|
| `pergamino` | Aged paper, single column, ink style | Opinion, politics, RPG lore |
| `cosmos` | Dark bg, stars, floating text blocks | Culture, music, free opinion |
| `carta` | Playing card borders, centered composition | Short punchy pieces |
| `tablero` | Grid/tactical board aesthetic | Football, geopolitics |
| `manga` | High contrast panels, bold type | Anime, pop culture |

### Post Features
- Spotify embed fixed in bottom-right corner while reading
- Editorial typography: pull quotes, inline images, drop caps
- Previous / next post navigation at the bottom
- No comments section

---

## Admin Panel (`/admin`)

### Authentication
Simple password check — environment variable `ADMIN_PASSWORD`. Single user only (the author). No user management needed.

### Features
- List of all posts with edit / delete actions
- New post form with fields:
  - Title, category, date
  - Cover image upload
  - Spotify track URL
  - Theme colors (color pickers)
  - Layout selector (visual preview thumbnails)
  - Markdown body editor with live preview
- On save: writes `.md` file to `/content/posts/`, commits to GitHub via API, Vercel auto-deploys

---

## Content Structure (Repo)

```
/content
  /posts
    2026-06-26-el-mundo-se-parte.md
    2026-06-20-luffy-y-la-libertad.md
    ...
/public
  /maps          → SVG map files per category
  /posts         → Cover images
/src
  /app
    /page.tsx              → Home
    /post/[slug]/page.tsx  → Post
    /admin/...             → Admin routes
  /components
    /LiveMap.tsx
    /StoryCarousel.tsx
    /PostLayout/
      Pergamino.tsx
      Cosmos.tsx
      Carta.tsx
      Tablero.tsx
      Manga.tsx
    /SpotifyEmbed.tsx
  /lib
    /posts.ts              → Read/parse markdown files
```

---

## Key Design Principles

1. **The map is the soul** — it changes, it breathes, it reflects the content
2. **Every post is a world** — not a template, but a designed experience
3. **Identity through voice** — no bio, no about page. The author reveals themselves through the work
4. **$0 infrastructure** — no databases, no paid services, no subscriptions
5. **Trickster energy** — unexpected, personal, refuses to be just one thing
