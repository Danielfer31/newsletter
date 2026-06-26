# La Biblioteca de Apolo — Fase 1: Fundación + Home

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Build the foundation of La Biblioteca de Apolo — a working Next.js app with a live SVG map hero that transitions per category, and an infinite auto-scrolling story carousel showing posts from Markdown files.

**Architecture:** Next.js 14 App Router with Markdown files as the content layer (no database). The home page renders a full-screen SVG map that crossfades between category maps as the carousel scrolls. Posts are parsed from `.md` files in `/content/posts/` at build/request time using `gray-matter`.

**Tech Stack:** Next.js 14, TypeScript, Tailwind CSS, Framer Motion, gray-matter, react-markdown, remark-gfm

---

## File Map

```
/content/posts/
  2026-06-26-el-mundo-se-parte.md        ← sample post (geopolitica)
  2026-06-25-luffy-y-la-libertad.md      ← sample post (anime)
  2026-06-24-boca-es-boca.md             ← sample post (futbol)

/public/maps/
  geopolitica.svg
  anime.svg
  futbol.svg
  musica.svg
  rpg.svg
  cultura.svg
  opinion.svg

/src/types/
  post.ts                  ← Post and PostFrontmatter types

/src/lib/
  posts.ts                 ← getAllPosts(), getPostBySlug()
  maps.ts                  ← categoryMap config (colors, map paths)

/src/components/
  LiveMap.tsx              ← Full-screen SVG map, transitions on category prop
  PostCard.tsx             ← Individual card in carousel
  StoryCarousel.tsx        ← Infinite auto-scroll carousel using Framer Motion

/src/app/
  globals.css              ← Base styles, CSS variables, fonts
  layout.tsx               ← Root layout with dark background + texture
  page.tsx                 ← Home page: LiveMap + StoryCarousel
  post/[slug]/
    page.tsx               ← Post page stub (content in Fase 2)
```

---

## Task 1: Project Scaffold

**Files:**
- Create: `package.json`, `tsconfig.json`, `tailwind.config.ts`, `postcss.config.js`, `next.config.js`
- Create: `src/app/globals.css`
- Create: `src/app/layout.tsx`

- [ ] **Step 1: Initialize Next.js project**

Run in `C:\Users\USUARIO\Desktop\BOVEDA\Newssleter`:
```bash
npx create-next-app@latest . --typescript --tailwind --eslint --app --src-dir --import-alias "@/*" --no-git
```
Answer all prompts with defaults (Enter through them).

- [ ] **Step 2: Install additional dependencies**

```bash
npm install framer-motion gray-matter react-markdown remark-gfm
npm install -D @types/node
```

Expected output: no errors, `node_modules` created.

- [ ] **Step 3: Update `next.config.js`**

Replace contents of `next.config.js`:
```js
/** @type {import('next').NextConfig} */
const nextConfig = {}
module.exports = nextConfig
```

- [ ] **Step 4: Update `src/app/globals.css`**

Replace contents with:
```css
@tailwind base;
@tailwind components;
@tailwind utilities;

@import url('https://fonts.googleapis.com/css2?family=Playfair+Display:ital,wght@0,400;0,700;1,400&family=Inter:wght@300;400;500&display=swap');

:root {
  --bg-base: #0a0a0f;
  --gold: #c9a84c;
  --parchment: #f5e6c8;
  --ink: #1a1a2e;
  --font-serif: 'Playfair Display', Georgia, serif;
  --font-sans: 'Inter', system-ui, sans-serif;
}

* {
  box-sizing: border-box;
  margin: 0;
  padding: 0;
}

body {
  background-color: var(--bg-base);
  color: var(--parchment);
  font-family: var(--font-sans);
  overflow-x: hidden;
}

h1, h2, h3 {
  font-family: var(--font-serif);
}
```

- [ ] **Step 5: Update `src/app/layout.tsx`**

```tsx
import type { Metadata } from 'next'
import './globals.css'

export const metadata: Metadata = {
  title: 'La Biblioteca de Apolo',
  description: 'Política, geopolítica, anime, fútbol, música y todo lo demás.',
}

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="es">
      <body className="min-h-screen" style={{ backgroundColor: 'var(--bg-base)' }}>
        {children}
      </body>
    </html>
  )
}
```

- [ ] **Step 6: Verify app runs**

```bash
npm run dev
```

Open `http://localhost:3000` — should show default Next.js page with dark background. No errors in terminal.

- [ ] **Step 7: Commit**

```bash
git init
git add .
git commit -m "feat: scaffold Next.js app for La Biblioteca de Apolo"
```

---

## Task 2: Types and Content Layer

**Files:**
- Create: `src/types/post.ts`
- Create: `src/lib/posts.ts`
- Create: `content/posts/2026-06-26-el-mundo-se-parte.md`
- Create: `content/posts/2026-06-25-luffy-y-la-libertad.md`
- Create: `content/posts/2026-06-24-boca-es-boca.md`

- [ ] **Step 1: Create post types**

Create `src/types/post.ts`:
```ts
export type Category =
  | 'geopolitica'
  | 'anime'
  | 'futbol'
  | 'musica'
  | 'rpg'
  | 'cultura'
  | 'opinion'

export type Layout = 'pergamino' | 'cosmos' | 'carta' | 'tablero' | 'manga'

export type FontStyle = 'serif' | 'sans' | 'mono' | 'display'

export interface PostTheme {
  fondo: string
  acento: string
  fuente: FontStyle
}

export interface PostFrontmatter {
  titulo: string
  categoria: Category
  fecha: string
  imagen: string
  extracto: string
  cancion: string
  tema: PostTheme
  layout: Layout
}

export interface Post extends PostFrontmatter {
  slug: string
  contenido: string
}
```

- [ ] **Step 2: Create posts library**

Create `src/lib/posts.ts`:
```ts
import fs from 'fs'
import path from 'path'
import matter from 'gray-matter'
import { Post, PostFrontmatter } from '@/types/post'

const POSTS_DIR = path.join(process.cwd(), 'content', 'posts')

export function getAllPosts(): Post[] {
  if (!fs.existsSync(POSTS_DIR)) return []

  const files = fs.readdirSync(POSTS_DIR).filter(f => f.endsWith('.md'))

  const posts = files.map(filename => {
    const slug = filename.replace(/\.md$/, '')
    const filePath = path.join(POSTS_DIR, filename)
    const raw = fs.readFileSync(filePath, 'utf-8')
    const { data, content } = matter(raw)
    return {
      slug,
      contenido: content,
      ...(data as PostFrontmatter),
    } as Post
  })

  return posts.sort((a, b) => (a.fecha < b.fecha ? 1 : -1))
}

export function getPostBySlug(slug: string): Post | null {
  const filePath = path.join(POSTS_DIR, `${slug}.md`)
  if (!fs.existsSync(filePath)) return null

  const raw = fs.readFileSync(filePath, 'utf-8')
  const { data, content } = matter(raw)
  return {
    slug,
    contenido: content,
    ...(data as PostFrontmatter),
  } as Post
}
```

- [ ] **Step 3: Create sample post — geopolitica**

Create `content/posts/2026-06-26-el-mundo-se-parte.md`:
```markdown
---
titulo: "El mundo se parte en dos"
categoria: geopolitica
fecha: "2026-06-26"
imagen: /images/placeholder-geo.jpg
extracto: "Hay momentos en la historia en que el tablero se rompe y hay que jugar con nuevas reglas. Estamos en uno de esos momentos."
cancion: https://open.spotify.com/track/4cluDES4hQEUhmXj6TXkSo
tema:
  fondo: "#0d0d1a"
  acento: "#8B0000"
  fuente: serif
layout: tablero
---

Hay momentos en la historia donde el orden que creíamos permanente se quiebra. No de golpe, sino lentamente, como una falla tectónica que durante años acumula presión hasta que un día — un día cualquiera — la tierra tiembla.

Estamos viviendo uno de esos momentos.

El tablero geopolítico del siglo XXI está siendo reconfigurado en tiempo real. Las alianzas que definieron el mundo post-1989 se están disolviendo. Los bloques que parecían monolíticos muestran fracturas internas. Y en medio de todo esto, los de siempre intentan mantener el control de un mundo que ya no les pertenece del todo.
```

- [ ] **Step 4: Create sample post — anime**

Create `content/posts/2026-06-25-luffy-y-la-libertad.md`:
```markdown
---
titulo: "Luffy y la única libertad que importa"
categoria: anime
fecha: "2026-06-25"
imagen: /images/placeholder-anime.jpg
extracto: "One Piece no es una historia de piratas. Es una filosofía de vida disfrazada de aventura. Y Luffy lo sabe sin saber que lo sabe."
cancion: https://open.spotify.com/track/3YZScSUgm6jvFdqNVNRPYv
tema:
  fondo: "#0a1628"
  acento: "#1a6b8a"
  fuente: serif
layout: manga
---

Luffy nunca entendió de política. No le importa quién gobierna qué isla, no le interesan los títulos ni el poder formal. Lo que le importa es simple, brutal y hermoso: ser libre y que sus amigos sean felices.

Esa es toda su filosofía.

Y sin embargo, en esa simplicidad hay más profundidad que en mil tratados sobre la libertad. Porque Luffy no teoriza sobre ser libre — simplemente lo es. Actúa como si las cadenas no existieran, y de tanto actuar así, las cadenas terminan rompiéndose.
```

- [ ] **Step 5: Create sample post — futbol**

Create `content/posts/2026-06-24-boca-es-boca.md`:
```markdown
---
titulo: "Boca es Boca y el resto es el resto"
categoria: futbol
fecha: "2026-06-24"
imagen: /images/placeholder-futbol.jpg
extracto: "Hay clubes de fútbol y hay religiones paganas. Boca es las dos cosas al mismo tiempo, y en esa contradicción está toda su grandeza."
cancion: https://open.spotify.com/track/2374M7fBbDrEGbFed0LUQB
tema:
  fondo: "#001a00"
  acento: "#2d6a4f"
  fuente: sans
layout: tablero
---

No existe una explicación racional para lo que siente un boquense cuando suena "La Bombonera". No la hay. Podés intentar explicársela a alguien que nunca lo vivió y vas a fracasar siempre. Porque hay experiencias que solo se entienden desde adentro.

Boca Juniors no es solo un club de fútbol. Es una identidad, una forma de pararse frente al mundo, una manera de decir "yo soy de acá" que trasciende el barrio, la clase social, la edad.
```

- [ ] **Step 6: Verify posts load**

Create a temporary test — add this to `src/app/page.tsx` temporarily:
```tsx
import { getAllPosts } from '@/lib/posts'

export default function Home() {
  const posts = getAllPosts()
  return (
    <div style={{ color: 'white', padding: '2rem' }}>
      <h1>Posts loaded: {posts.length}</h1>
      {posts.map(p => <p key={p.slug}>{p.titulo} — {p.categoria}</p>)}
    </div>
  )
}
```

Run `npm run dev`, open `http://localhost:3000`. Should show 3 posts listed. No TypeScript errors.

- [ ] **Step 7: Commit**

```bash
git add .
git commit -m "feat: add post types, content layer, and sample posts"
```

---

## Task 3: Category Map Configuration

**Files:**
- Create: `src/lib/maps.ts`
- Create: `public/maps/geopolitica.svg`
- Create: `public/maps/anime.svg`
- Create: `public/maps/futbol.svg`
- Create: `public/maps/musica.svg`
- Create: `public/maps/rpg.svg`
- Create: `public/maps/cultura.svg`
- Create: `public/maps/opinion.svg`

- [ ] **Step 1: Create maps config**

Create `src/lib/maps.ts`:
```ts
import { Category } from '@/types/post'

export interface CategoryConfig {
  label: string
  mapSrc: string
  accentColor: string
  bgColor: string
  description: string
}

export const CATEGORY_CONFIG: Record<Category, CategoryConfig> = {
  geopolitica: {
    label: 'Geopolítica',
    mapSrc: '/maps/geopolitica.svg',
    accentColor: '#8B0000',
    bgColor: '#0d0d1a',
    description: 'El tablero global',
  },
  anime: {
    label: 'Anime',
    mapSrc: '/maps/anime.svg',
    accentColor: '#1a6b8a',
    bgColor: '#0a1628',
    description: 'Los 4 mares y más allá',
  },
  futbol: {
    label: 'Fútbol',
    mapSrc: '/maps/futbol.svg',
    accentColor: '#2d6a4f',
    bgColor: '#001a00',
    description: 'La cancha del mundo',
  },
  musica: {
    label: 'Música',
    mapSrc: '/maps/musica.svg',
    accentColor: '#6b2fa0',
    bgColor: '#0d0a1a',
    description: 'El mapa de las estrellas',
  },
  rpg: {
    label: 'RPG',
    mapSrc: '/maps/rpg.svg',
    accentColor: '#b5660a',
    bgColor: '#1a0d00',
    description: 'Tierras desconocidas',
  },
  cultura: {
    label: 'Cultura',
    mapSrc: '/maps/cultura.svg',
    accentColor: '#0a8b8b',
    bgColor: '#001a1a',
    description: 'El universo observable',
  },
  opinion: {
    label: 'Opinión',
    mapSrc: '/maps/opinion.svg',
    accentColor: '#c9a84c',
    bgColor: '#1a1400',
    description: 'Terra incógnita',
  },
}
```

- [ ] **Step 2: Create geopolitica SVG map**

Create `public/maps/geopolitica.svg`:
```svg
<svg viewBox="0 0 800 400" xmlns="http://www.w3.org/2000/svg">
  <defs>
    <filter id="paper">
      <feTurbulence type="fractalNoise" baseFrequency="0.65" numOctaves="3" stitchTiles="stitch"/>
      <feColorMatrix type="saturate" values="0"/>
      <feBlend in="SourceGraphic" mode="multiply"/>
    </filter>
  </defs>
  <rect width="800" height="400" fill="#0d0d1a"/>
  <!-- Grid lines like a classic map -->
  <g stroke="#8B0000" stroke-width="0.5" opacity="0.3">
    <line x1="0" y1="100" x2="800" y2="100"/>
    <line x1="0" y1="200" x2="800" y2="200"/>
    <line x1="0" y1="300" x2="800" y2="300"/>
    <line x1="200" y1="0" x2="200" y2="400"/>
    <line x1="400" y1="0" x2="400" y2="400"/>
    <line x1="600" y1="0" x2="600" y2="400"/>
  </g>
  <!-- Stylized continents -->
  <g fill="#8B0000" opacity="0.4" stroke="#c9a84c" stroke-width="0.8">
    <!-- North America -->
    <path d="M80 80 L160 60 L200 90 L220 130 L200 170 L160 180 L120 160 L80 140 Z"/>
    <!-- South America -->
    <path d="M160 200 L200 190 L220 230 L210 290 L180 320 L150 300 L140 260 L150 220 Z"/>
    <!-- Europe -->
    <path d="M330 70 L380 60 L400 80 L390 110 L360 120 L330 110 Z"/>
    <!-- Africa -->
    <path d="M340 140 L390 130 L410 160 L420 220 L400 280 L370 290 L340 260 L320 200 L330 160 Z"/>
    <!-- Asia -->
    <path d="M420 60 L560 50 L600 80 L610 120 L580 150 L540 160 L480 140 L440 120 L420 90 Z"/>
    <!-- Australia -->
    <path d="M560 240 L620 230 L640 260 L630 300 L590 310 L560 290 L550 260 Z"/>
  </g>
  <!-- Compass rose -->
  <g transform="translate(720, 340)" stroke="#c9a84c" stroke-width="1" fill="none" opacity="0.6">
    <circle r="20"/>
    <line x1="0" y1="-20" x2="0" y2="20"/>
    <line x1="-20" y1="0" x2="20" y2="0"/>
    <text x="-3" y="-24" fill="#c9a84c" font-size="8" font-family="serif">N</text>
  </g>
  <!-- Title -->
  <text x="400" y="380" text-anchor="middle" fill="#c9a84c" font-size="10" font-family="serif" opacity="0.5" letter-spacing="3">MAPA DEL MUNDO CONOCIDO</text>
</svg>
```

- [ ] **Step 3: Create anime SVG map (Grand Line)**

Create `public/maps/anime.svg`:
```svg
<svg viewBox="0 0 800 400" xmlns="http://www.w3.org/2000/svg">
  <rect width="800" height="400" fill="#0a1628"/>
  <!-- Ocean texture lines -->
  <g stroke="#1a6b8a" stroke-width="0.5" opacity="0.2">
    <path d="M0 50 Q200 40 400 50 Q600 60 800 50" fill="none"/>
    <path d="M0 100 Q200 90 400 100 Q600 110 800 100" fill="none"/>
    <path d="M0 150 Q200 140 400 150 Q600 160 800 150" fill="none"/>
    <path d="M0 250 Q200 240 400 250 Q600 260 800 250" fill="none"/>
    <path d="M0 300 Q200 290 400 300 Q600 310 800 300" fill="none"/>
    <path d="M0 350 Q200 340 400 350 Q600 360 800 350" fill="none"/>
  </g>
  <!-- Grand Line — horizontal dividing line -->
  <line x1="0" y1="200" x2="800" y2="200" stroke="#c9a84c" stroke-width="2" stroke-dasharray="10 5" opacity="0.8"/>
  <text x="10" y="195" fill="#c9a84c" font-size="9" font-family="serif" opacity="0.8">GRAND LINE</text>
  <!-- Islands -->
  <g fill="#1a6b8a" opacity="0.5" stroke="#c9a84c" stroke-width="0.8">
    <ellipse cx="150" cy="150" rx="30" ry="20"/>
    <ellipse cx="300" cy="80" rx="25" ry="15"/>
    <ellipse cx="400" cy="200" rx="20" ry="12"/>
    <ellipse cx="550" cy="130" rx="35" ry="22"/>
    <ellipse cx="680" cy="160" rx="28" ry="18"/>
    <ellipse cx="200" cy="280" rx="32" ry="20"/>
    <ellipse cx="450" cy="310" rx="26" ry="16"/>
    <ellipse cx="630" cy="280" rx="30" ry="19"/>
  </g>
  <!-- Red Line — vertical -->
  <line x1="400" y1="0" x2="400" y2="400" stroke="#8B0000" stroke-width="3" opacity="0.6"/>
  <text x="404" y="20" fill="#8B0000" font-size="9" font-family="serif" opacity="0.8">RED LINE</text>
  <!-- Compass -->
  <g transform="translate(720, 340)" stroke="#c9a84c" stroke-width="1" fill="none" opacity="0.6">
    <circle r="20"/>
    <line x1="0" y1="-20" x2="0" y2="20"/>
    <line x1="-20" y1="0" x2="20" y2="0"/>
    <text x="-3" y="-24" fill="#c9a84c" font-size="8" font-family="serif">N</text>
  </g>
  <text x="400" y="385" text-anchor="middle" fill="#c9a84c" font-size="10" font-family="serif" opacity="0.5" letter-spacing="3">LOS CUATRO MARES</text>
</svg>
```

- [ ] **Step 4: Create futbol SVG map (pitch)**

Create `public/maps/futbol.svg`:
```svg
<svg viewBox="0 0 800 400" xmlns="http://www.w3.org/2000/svg">
  <rect width="800" height="400" fill="#001a00"/>
  <!-- Pitch stripes -->
  <g opacity="0.15">
    <rect x="0" y="0" width="80" height="400" fill="#2d6a4f"/>
    <rect x="160" y="0" width="80" height="400" fill="#2d6a4f"/>
    <rect x="320" y="0" width="80" height="400" fill="#2d6a4f"/>
    <rect x="480" y="0" width="80" height="400" fill="#2d6a4f"/>
    <rect x="640" y="0" width="80" height="400" fill="#2d6a4f"/>
  </g>
  <!-- Pitch outline -->
  <rect x="60" y="30" width="680" height="340" fill="none" stroke="#2d6a4f" stroke-width="2" opacity="0.8"/>
  <!-- Center line -->
  <line x1="400" y1="30" x2="400" y2="370" stroke="#2d6a4f" stroke-width="1.5" opacity="0.8"/>
  <!-- Center circle -->
  <circle cx="400" cy="200" r="50" fill="none" stroke="#2d6a4f" stroke-width="1.5" opacity="0.8"/>
  <circle cx="400" cy="200" r="3" fill="#2d6a4f" opacity="0.8"/>
  <!-- Penalty areas -->
  <rect x="60" y="130" width="120" height="140" fill="none" stroke="#2d6a4f" stroke-width="1.5" opacity="0.8"/>
  <rect x="620" y="130" width="120" height="140" fill="none" stroke="#2d6a4f" stroke-width="1.5" opacity="0.8"/>
  <!-- Goal areas -->
  <rect x="60" y="165" width="50" height="70" fill="none" stroke="#2d6a4f" stroke-width="1.5" opacity="0.8"/>
  <rect x="690" y="165" width="50" height="70" fill="none" stroke="#2d6a4f" stroke-width="1.5" opacity="0.8"/>
  <!-- Goals -->
  <rect x="40" y="175" width="20" height="50" fill="none" stroke="#c9a84c" stroke-width="2" opacity="0.6"/>
  <rect x="740" y="175" width="20" height="50" fill="none" stroke="#c9a84c" stroke-width="2" opacity="0.6"/>
  <!-- Penalty spots -->
  <circle cx="160" cy="200" r="2" fill="#2d6a4f" opacity="0.8"/>
  <circle cx="640" cy="200" r="2" fill="#2d6a4f" opacity="0.8"/>
  <text x="400" y="390" text-anchor="middle" fill="#c9a84c" font-size="10" font-family="serif" opacity="0.5" letter-spacing="3">LA CANCHA DEL MUNDO</text>
</svg>
```

- [ ] **Step 5: Create musica SVG map (constellations)**

Create `public/maps/musica.svg`:
```svg
<svg viewBox="0 0 800 400" xmlns="http://www.w3.org/2000/svg">
  <rect width="800" height="400" fill="#0d0a1a"/>
  <!-- Stars field -->
  <g fill="#ffffff">
    <circle cx="50" cy="30" r="1" opacity="0.6"/>
    <circle cx="120" cy="80" r="1.5" opacity="0.8"/>
    <circle cx="200" cy="50" r="1" opacity="0.5"/>
    <circle cx="280" cy="120" r="2" opacity="0.9"/>
    <circle cx="350" cy="40" r="1" opacity="0.7"/>
    <circle cx="450" cy="90" r="1.5" opacity="0.6"/>
    <circle cx="520" cy="30" r="1" opacity="0.8"/>
    <circle cx="600" cy="70" r="2" opacity="0.7"/>
    <circle cx="680" cy="40" r="1" opacity="0.6"/>
    <circle cx="750" cy="100" r="1.5" opacity="0.9"/>
    <circle cx="80" cy="160" r="1.5" opacity="0.7"/>
    <circle cx="160" cy="200" r="2.5" opacity="0.9"/>
    <circle cx="240" cy="170" r="1" opacity="0.6"/>
    <circle cx="320" cy="220" r="2" opacity="0.8"/>
    <circle cx="400" cy="180" r="1.5" opacity="0.7"/>
    <circle cx="480" cy="210" r="1" opacity="0.6"/>
    <circle cx="560" cy="160" r="2" opacity="0.9"/>
    <circle cx="640" cy="200" r="1.5" opacity="0.7"/>
    <circle cx="720" cy="170" r="1" opacity="0.8"/>
    <circle cx="100" cy="280" r="2" opacity="0.8"/>
    <circle cx="180" cy="320" r="1" opacity="0.6"/>
    <circle cx="260" cy="290" r="1.5" opacity="0.7"/>
    <circle cx="380" cy="310" r="2" opacity="0.9"/>
    <circle cx="460" cy="270" r="1" opacity="0.6"/>
    <circle cx="540" cy="300" r="1.5" opacity="0.8"/>
    <circle cx="620" cy="280" r="2" opacity="0.7"/>
    <circle cx="700" cy="320" r="1" opacity="0.6"/>
  </g>
  <!-- Constellation lines -->
  <g stroke="#6b2fa0" stroke-width="0.8" opacity="0.5">
    <line x1="120" y1="80" x2="280" y2="120"/>
    <line x1="280" y1="120" x2="320" y2="220"/>
    <line x1="320" y1="220" x2="160" y2="200"/>
    <line x1="160" y1="200" x2="120" y2="80"/>
    <line x1="560" y1="160" x2="640" y2="200"/>
    <line x1="640" y1="200" x2="720" y2="170"/>
    <line x1="600" y1="70" x2="560" y2="160"/>
    <line x1="380" y1="310" x2="460" y2="270"/>
    <line x1="460" y1="270" x2="540" y2="300"/>
    <line x1="540" y1="300" x2="620" y2="280"/>
  </g>
  <!-- Staff lines (music) -->
  <g stroke="#6b2fa0" stroke-width="0.5" opacity="0.15">
    <line x1="0" y1="340" x2="800" y2="340"/>
    <line x1="0" y1="350" x2="800" y2="350"/>
    <line x1="0" y1="360" x2="800" y2="360"/>
    <line x1="0" y1="370" x2="800" y2="370"/>
    <line x1="0" y1="380" x2="800" y2="380"/>
  </g>
  <!-- Treble clef hint -->
  <text x="20" y="380" fill="#6b2fa0" font-size="50" font-family="serif" opacity="0.2">𝄞</text>
  <text x="400" y="395" text-anchor="middle" fill="#c9a84c" font-size="10" font-family="serif" opacity="0.5" letter-spacing="3">EL MAPA DE LAS ESTRELLAS</text>
</svg>
```

- [ ] **Step 6: Create RPG SVG map (fantasy)**

Create `public/maps/rpg.svg`:
```svg
<svg viewBox="0 0 800 400" xmlns="http://www.w3.org/2000/svg">
  <rect width="800" height="400" fill="#1a0d00"/>
  <!-- Parchment texture overlay -->
  <rect width="800" height="400" fill="#b5660a" opacity="0.05"/>
  <!-- Mountain ranges -->
  <g fill="none" stroke="#b5660a" stroke-width="1.5" opacity="0.5">
    <path d="M100 200 L130 150 L160 200"/>
    <path d="M140 200 L170 140 L200 200"/>
    <path d="M550 180 L580 120 L610 180"/>
    <path d="M590 180 L620 130 L650 180"/>
    <path d="M630 180 L660 150 L690 180"/>
  </g>
  <!-- Forest symbols -->
  <g fill="#2d6a4f" opacity="0.4">
    <text x="290" y="150" font-size="20">🌲</text>
    <text x="320" y="170" font-size="16">🌲</text>
    <text x="310" y="190" font-size="18">🌲</text>
  </g>
  <!-- Regions -->
  <g fill="none" stroke="#b5660a" stroke-width="0.8" stroke-dasharray="5 3" opacity="0.4">
    <path d="M60 60 L250 50 L260 180 L60 190 Z"/>
    <path d="M260 50 L500 60 L490 200 L260 180 Z"/>
    <path d="M500 60 L740 70 L730 200 L490 200 Z"/>
  </g>
  <!-- Region labels -->
  <text x="150" y="130" text-anchor="middle" fill="#c9a84c" font-size="11" font-family="serif" opacity="0.6">Reino del Norte</text>
  <text x="375" y="130" text-anchor="middle" fill="#c9a84c" font-size="11" font-family="serif" opacity="0.6">Las Tierras Libres</text>
  <text x="610" y="130" text-anchor="middle" fill="#c9a84c" font-size="11" font-family="serif" opacity="0.6">Imperio del Este</text>
  <!-- Roads -->
  <g stroke="#c9a84c" stroke-width="1" stroke-dasharray="4 2" opacity="0.3">
    <path d="M60 200 Q400 220 740 200" fill="none"/>
  </g>
  <!-- Dungeon markers -->
  <g fill="#8B0000" opacity="0.6">
    <text x="195" y="230" font-size="14">⚔</text>
    <text x="395" y="250" font-size="14">🏰</text>
    <text x="595" y="240" font-size="14">⚔</text>
  </g>
  <!-- Compass -->
  <g transform="translate(720, 340)" stroke="#c9a84c" stroke-width="1" fill="none" opacity="0.6">
    <circle r="20"/>
    <line x1="0" y1="-20" x2="0" y2="20"/>
    <line x1="-20" y1="0" x2="20" y2="0"/>
    <text x="-3" y="-24" fill="#c9a84c" font-size="8" font-family="serif">N</text>
  </g>
  <text x="400" y="390" text-anchor="middle" fill="#c9a84c" font-size="10" font-family="serif" opacity="0.5" letter-spacing="3">TIERRAS FANTÁSTICAS</text>
</svg>
```

- [ ] **Step 7: Create cultura SVG map (universe)**

Create `public/maps/cultura.svg`:
```svg
<svg viewBox="0 0 800 400" xmlns="http://www.w3.org/2000/svg">
  <rect width="800" height="400" fill="#001a1a"/>
  <!-- Nebula effect -->
  <radialGradient id="nebula1" cx="30%" cy="40%">
    <stop offset="0%" stop-color="#0a8b8b" stop-opacity="0.3"/>
    <stop offset="100%" stop-color="#001a1a" stop-opacity="0"/>
  </radialGradient>
  <radialGradient id="nebula2" cx="70%" cy="60%">
    <stop offset="0%" stop-color="#6b2fa0" stop-opacity="0.2"/>
    <stop offset="100%" stop-color="#001a1a" stop-opacity="0"/>
  </radialGradient>
  <rect width="800" height="400" fill="url(#nebula1)"/>
  <rect width="800" height="400" fill="url(#nebula2)"/>
  <!-- Stars -->
  <g fill="#ffffff">
    <circle cx="50" cy="50" r="1.5" opacity="0.9"/>
    <circle cx="150" cy="100" r="1" opacity="0.7"/>
    <circle cx="250" cy="60" r="2" opacity="0.8"/>
    <circle cx="350" cy="90" r="1" opacity="0.6"/>
    <circle cx="450" cy="40" r="1.5" opacity="0.9"/>
    <circle cx="550" cy="80" r="1" opacity="0.7"/>
    <circle cx="650" cy="50" r="2" opacity="0.8"/>
    <circle cx="750" cy="90" r="1" opacity="0.6"/>
    <circle cx="100" cy="200" r="1.5" opacity="0.7"/>
    <circle cx="200" cy="250" r="1" opacity="0.9"/>
    <circle cx="300" cy="200" r="2" opacity="0.6"/>
    <circle cx="400" cy="240" r="1" opacity="0.8"/>
    <circle cx="500" cy="200" r="1.5" opacity="0.7"/>
    <circle cx="600" cy="230" r="1" opacity="0.9"/>
    <circle cx="700" cy="200" r="2" opacity="0.6"/>
    <circle cx="80" cy="320" r="1" opacity="0.8"/>
    <circle cx="180" cy="350" r="1.5" opacity="0.7"/>
    <circle cx="320" cy="330" r="1" opacity="0.6"/>
    <circle cx="480" cy="350" r="2" opacity="0.9"/>
    <circle cx="620" cy="320" r="1" opacity="0.7"/>
    <circle cx="740" cy="350" r="1.5" opacity="0.8"/>
  </g>
  <!-- Orbit rings -->
  <g fill="none" stroke="#0a8b8b" stroke-width="0.8" opacity="0.3">
    <ellipse cx="400" cy="200" rx="300" ry="100"/>
    <ellipse cx="400" cy="200" rx="200" ry="70"/>
    <ellipse cx="400" cy="200" rx="100" ry="40"/>
  </g>
  <!-- Central "sun" -->
  <circle cx="400" cy="200" r="15" fill="#c9a84c" opacity="0.5"/>
  <circle cx="400" cy="200" r="8" fill="#c9a84c" opacity="0.8"/>
  <text x="400" y="390" text-anchor="middle" fill="#c9a84c" font-size="10" font-family="serif" opacity="0.5" letter-spacing="3">EL UNIVERSO OBSERVABLE</text>
</svg>
```

- [ ] **Step 8: Create opinion SVG map (terra incognita)**

Create `public/maps/opinion.svg`:
```svg
<svg viewBox="0 0 800 400" xmlns="http://www.w3.org/2000/svg">
  <rect width="800" height="400" fill="#1a1400"/>
  <!-- Partial map that fades to unknown -->
  <g fill="#c9a84c" opacity="0.08">
    <rect width="800" height="400"/>
  </g>
  <!-- Known region (partial) -->
  <g fill="#c9a84c" opacity="0.2" stroke="#c9a84c" stroke-width="0.8">
    <path d="M60 60 L200 50 L220 150 L180 200 L100 190 L60 140 Z"/>
    <path d="M200 50 L350 70 L370 160 L300 180 L220 150 Z"/>
  </g>
  <!-- Terra incognita text scattered -->
  <text x="450" y="150" fill="#c9a84c" font-size="13" font-family="serif" opacity="0.2" transform="rotate(-10, 450, 150)">TERRA INCOGNITA</text>
  <text x="550" y="250" fill="#c9a84c" font-size="10" font-family="serif" opacity="0.15" transform="rotate(5, 550, 250)">HIC SVNT DRACONES</text>
  <text x="300" y="300" fill="#c9a84c" font-size="11" font-family="serif" opacity="0.15" transform="rotate(-5, 300, 300)">TERRA INCOGNITA</text>
  <!-- Dotted boundary -->
  <path d="M350 70 Q500 60 600 100 Q700 140 720 200 Q740 260 700 300 Q650 350 500 360 Q350 370 280 340 Q200 310 180 270" fill="none" stroke="#c9a84c" stroke-width="1" stroke-dasharray="6 4" opacity="0.3"/>
  <!-- Dragon hint -->
  <text x="580" y="200" fill="#8B0000" font-size="30" opacity="0.15">🐉</text>
  <!-- Compass -->
  <g transform="translate(720, 340)" stroke="#c9a84c" stroke-width="1" fill="none" opacity="0.6">
    <circle r="20"/>
    <line x1="0" y1="-20" x2="0" y2="20"/>
    <line x1="-20" y1="0" x2="20" y2="0"/>
    <text x="-3" y="-24" fill="#c9a84c" font-size="8" font-family="serif">N</text>
  </g>
  <text x="400" y="390" text-anchor="middle" fill="#c9a84c" font-size="10" font-family="serif" opacity="0.5" letter-spacing="3">TERRA INCÓGNITA</text>
</svg>
```

- [ ] **Step 9: Commit**

```bash
git add .
git commit -m "feat: add SVG maps and category config for all 7 categories"
```

---

## Task 4: LiveMap Component

**Files:**
- Create: `src/components/LiveMap.tsx`

- [ ] **Step 1: Create LiveMap component**

Create `src/components/LiveMap.tsx`:
```tsx
'use client'

import { useEffect, useState } from 'react'
import { AnimatePresence, motion } from 'framer-motion'
import { Category } from '@/types/post'
import { CATEGORY_CONFIG } from '@/lib/maps'

interface LiveMapProps {
  activeCategory: Category | null
}

export default function LiveMap({ activeCategory }: LiveMapProps) {
  const [currentCategory, setCurrentCategory] = useState<Category>('geopolitica')

  useEffect(() => {
    if (activeCategory) setCurrentCategory(activeCategory)
  }, [activeCategory])

  const config = CATEGORY_CONFIG[currentCategory]

  return (
    <div className="relative w-full h-screen overflow-hidden">
      {/* Background color transition */}
      <motion.div
        key={`bg-${currentCategory}`}
        className="absolute inset-0"
        style={{ backgroundColor: config.bgColor }}
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 0.8 }}
      />

      {/* Map SVG transition */}
      <AnimatePresence mode="crossfade">
        <motion.div
          key={currentCategory}
          className="absolute inset-0 flex items-center justify-center"
          initial={{ opacity: 0, scale: 1.02 }}
          animate={{ opacity: 1, scale: 1 }}
          exit={{ opacity: 0, scale: 0.98 }}
          transition={{ duration: 0.8, ease: 'easeInOut' }}
        >
          <img
            src={config.mapSrc}
            alt={`Mapa: ${config.label}`}
            className="w-full h-full object-cover opacity-60"
          />
        </motion.div>
      </AnimatePresence>

      {/* Category label overlay */}
      <div className="absolute bottom-0 left-0 right-0 h-1/2 bg-gradient-to-t from-black/80 to-transparent pointer-events-none" />

      {/* Site title */}
      <div className="absolute top-8 left-1/2 -translate-x-1/2 text-center z-10">
        <h1
          className="text-4xl md:text-5xl tracking-widest uppercase"
          style={{ color: 'var(--gold)', fontFamily: 'var(--font-serif)' }}
        >
          La Biblioteca de Apolo
        </h1>
        <motion.p
          key={`label-${currentCategory}`}
          className="text-sm tracking-[0.3em] uppercase mt-2 opacity-60"
          style={{ color: config.accentColor }}
          initial={{ opacity: 0, y: 5 }}
          animate={{ opacity: 0.8, y: 0 }}
          transition={{ duration: 0.5, delay: 0.3 }}
        >
          {config.description}
        </motion.p>
      </div>

      {/* Scroll indicator */}
      <div className="absolute bottom-8 left-1/2 -translate-x-1/2 z-10 flex flex-col items-center gap-2 opacity-50">
        <span className="text-xs tracking-widest uppercase" style={{ color: 'var(--gold)' }}>
          Explorar
        </span>
        <motion.div
          animate={{ y: [0, 6, 0] }}
          transition={{ repeat: Infinity, duration: 1.5 }}
          className="w-px h-8"
          style={{ backgroundColor: 'var(--gold)' }}
        />
      </div>
    </div>
  )
}
```

- [ ] **Step 2: Commit**

```bash
git add src/components/LiveMap.tsx
git commit -m "feat: add LiveMap component with category-based SVG transitions"
```

---

## Task 5: PostCard Component

**Files:**
- Create: `src/components/PostCard.tsx`

- [ ] **Step 1: Create PostCard component**

Create `src/components/PostCard.tsx`:
```tsx
import Link from 'next/link'
import { Post } from '@/types/post'
import { CATEGORY_CONFIG } from '@/lib/maps'

interface PostCardProps {
  post: Post
  onHover?: (category: import('@/types/post').Category) => void
}

export default function PostCard({ post, onHover }: PostCardProps) {
  const config = CATEGORY_CONFIG[post.categoria]

  return (
    <Link href={`/post/${post.slug}`} className="block flex-shrink-0">
      <div
        className="relative w-64 md:w-80 h-96 rounded overflow-hidden cursor-pointer group"
        style={{ backgroundColor: post.tema?.fondo || config.bgColor }}
        onMouseEnter={() => onHover?.(post.categoria)}
      >
        {/* Cover image */}
        <div className="absolute inset-0">
          <img
            src={post.imagen}
            alt={post.titulo}
            className="w-full h-full object-cover opacity-40 group-hover:opacity-50 transition-opacity duration-300"
            onError={(e) => {
              (e.target as HTMLImageElement).style.display = 'none'
            }}
          />
        </div>

        {/* Gradient overlay */}
        <div
          className="absolute inset-0"
          style={{
            background: `linear-gradient(to top, ${post.tema?.fondo || config.bgColor} 40%, transparent 100%)`,
          }}
        />

        {/* Category badge */}
        <div className="absolute top-4 left-4 z-10">
          <span
            className="text-xs tracking-widest uppercase px-2 py-1 rounded"
            style={{
              backgroundColor: `${config.accentColor}22`,
              color: config.accentColor,
              border: `1px solid ${config.accentColor}44`,
            }}
          >
            {config.label}
          </span>
        </div>

        {/* Content */}
        <div className="absolute bottom-0 left-0 right-0 p-5 z-10">
          <h3
            className="text-lg font-bold leading-tight mb-2"
            style={{ color: 'var(--parchment)', fontFamily: 'var(--font-serif)' }}
          >
            {post.titulo}
          </h3>
          <p className="text-xs leading-relaxed opacity-70 line-clamp-3" style={{ color: 'var(--parchment)' }}>
            {post.extracto}
          </p>
          <div className="mt-4 flex items-center justify-between">
            <span
              className="text-xs tracking-widest uppercase opacity-60"
              style={{ color: config.accentColor }}
            >
              Leer →
            </span>
            <span className="text-xs opacity-40" style={{ color: 'var(--parchment)' }}>
              {new Date(post.fecha).toLocaleDateString('es-AR', { day: 'numeric', month: 'short' })}
            </span>
          </div>
        </div>

        {/* Hover accent line */}
        <div
          className="absolute bottom-0 left-0 right-0 h-0.5 transform scale-x-0 group-hover:scale-x-100 transition-transform duration-300"
          style={{ backgroundColor: config.accentColor }}
        />
      </div>
    </Link>
  )
}
```

- [ ] **Step 2: Commit**

```bash
git add src/components/PostCard.tsx
git commit -m "feat: add PostCard component with category theming"
```

---

## Task 6: StoryCarousel Component

**Files:**
- Create: `src/components/StoryCarousel.tsx`

- [ ] **Step 1: Create StoryCarousel component**

Create `src/components/StoryCarousel.tsx`:
```tsx
'use client'

import { useRef, useEffect, useState } from 'react'
import { motion, useAnimation } from 'framer-motion'
import { Post, Category } from '@/types/post'
import PostCard from './PostCard'

interface StoryCarouselProps {
  posts: Post[]
  onCategoryChange?: (category: Category) => void
}

export default function StoryCarousel({ posts, onCategoryChange }: StoryCarouselProps) {
  const containerRef = useRef<HTMLDivElement>(null)
  const [isHovered, setIsHovered] = useState(false)
  const positionRef = useRef(0)
  const animFrameRef = useRef<number>()

  // Auto-scroll loop
  useEffect(() => {
    const container = containerRef.current
    if (!container) return

    const speed = 0.5 // px per frame

    const animate = () => {
      if (!isHovered && container) {
        positionRef.current += speed
        // Reset when we've scrolled half the content (for infinite loop)
        const halfWidth = container.scrollWidth / 2
        if (positionRef.current >= halfWidth) {
          positionRef.current = 0
        }
        container.style.transform = `translateX(-${positionRef.current}px)`
      }
      animFrameRef.current = requestAnimationFrame(animate)
    }

    animFrameRef.current = requestAnimationFrame(animate)
    return () => {
      if (animFrameRef.current) cancelAnimationFrame(animFrameRef.current)
    }
  }, [isHovered])

  // Duplicate posts for infinite loop
  const loopedPosts = [...posts, ...posts, ...posts]

  return (
    <div className="relative py-12 overflow-hidden" style={{ backgroundColor: 'var(--bg-base)' }}>
      {/* Left gradient fade */}
      <div
        className="absolute left-0 top-0 bottom-0 w-20 z-10 pointer-events-none"
        style={{ background: 'linear-gradient(to right, var(--bg-base), transparent)' }}
      />

      {/* Carousel track */}
      <div
        className="flex gap-6 px-6 cursor-grab active:cursor-grabbing"
        ref={containerRef}
        style={{ width: 'max-content' }}
        onMouseEnter={() => setIsHovered(true)}
        onMouseLeave={() => setIsHovered(false)}
      >
        {loopedPosts.map((post, index) => (
          <PostCard
            key={`${post.slug}-${index}`}
            post={post}
            onHover={onCategoryChange}
          />
        ))}
      </div>

      {/* Right gradient fade */}
      <div
        className="absolute right-0 top-0 bottom-0 w-20 z-10 pointer-events-none"
        style={{ background: 'linear-gradient(to left, var(--bg-base), transparent)' }}
      />

      {/* Section label -->*/}
      <div className="absolute top-4 left-1/2 -translate-x-1/2 z-10">
        <p
          className="text-xs tracking-[0.4em] uppercase opacity-40"
          style={{ color: 'var(--gold)' }}
        >
          Últimas entradas
        </p>
      </div>
    </div>
  )
}
```

- [ ] **Step 2: Commit**

```bash
git add src/components/StoryCarousel.tsx
git commit -m "feat: add infinite auto-scroll StoryCarousel component"
```

---

## Task 7: Home Page Assembly

**Files:**
- Modify: `src/app/page.tsx`
- Create: `src/app/post/[slug]/page.tsx`

- [ ] **Step 1: Build home page**

Replace `src/app/page.tsx`:
```tsx
import { getAllPosts } from '@/lib/posts'
import HomeClient from './HomeClient'

export default function Home() {
  const posts = getAllPosts()
  return <HomeClient posts={posts} />
}
```

- [ ] **Step 2: Create HomeClient component**

Create `src/app/HomeClient.tsx`:
```tsx
'use client'

import { useState } from 'react'
import { Category } from '@/types/post'
import { Post } from '@/types/post'
import LiveMap from '@/components/LiveMap'
import StoryCarousel from '@/components/StoryCarousel'

export default function HomeClient({ posts }: { posts: Post[] }) {
  const [activeCategory, setActiveCategory] = useState<Category | null>(null)

  return (
    <main>
      <LiveMap activeCategory={activeCategory} />
      <StoryCarousel posts={posts} onCategoryChange={setActiveCategory} />
    </main>
  )
}
```

- [ ] **Step 3: Create post page stub**

Create `src/app/post/[slug]/page.tsx`:
```tsx
import { getPostBySlug, getAllPosts } from '@/lib/posts'
import { notFound } from 'next/navigation'

export async function generateStaticParams() {
  const posts = getAllPosts()
  return posts.map(post => ({ slug: post.slug }))
}

export default function PostPage({ params }: { params: { slug: string } }) {
  const post = getPostBySlug(params.slug)
  if (!post) notFound()

  return (
    <div style={{ backgroundColor: post.tema?.fondo || '#0a0a0f', minHeight: '100vh', padding: '4rem 2rem' }}>
      <h1 style={{ color: 'var(--parchment)', fontFamily: 'var(--font-serif)', fontSize: '2.5rem' }}>
        {post.titulo}
      </h1>
      <p style={{ color: 'var(--gold)', marginTop: '1rem' }}>{post.categoria}</p>
      <div style={{ color: 'var(--parchment)', marginTop: '2rem', lineHeight: '1.8' }}>
        {post.contenido}
      </div>
    </div>
  )
}
```

- [ ] **Step 4: Verify full home page renders**

```bash
npm run dev
```

Open `http://localhost:3000`. Should see:
- Full-screen SVG map (geopolitica by default)
- Title "La Biblioteca de Apolo" centered
- Scroll indicator below title
- Carousel of 3 posts auto-scrolling below
- Hovering a card transitions the map to that category's map

- [ ] **Step 5: Build check**

```bash
npm run build
```

Expected: no TypeScript errors, build succeeds. Fix any type errors before proceeding.

- [ ] **Step 6: Final commit**

```bash
git add .
git commit -m "feat: assemble home page with LiveMap + StoryCarousel integration"
```

---

## Phase Complete — What's Working

After this phase:
- ✅ Next.js app running locally
- ✅ 3 sample posts loaded from Markdown
- ✅ 7 SVG maps (one per category)
- ✅ Full-screen map hero that transitions per category
- ✅ Infinite auto-scroll story carousel
- ✅ Post page stub (basic, no layout templates yet)
- ✅ $0 infrastructure

## Next Phases

- **Fase 2:** Post individual — 5 layout templates (pergamino, cosmos, carta, tablero, manga) + Spotify embed fixed player
- **Fase 3:** Admin panel — password auth + markdown editor + save posts
- **Fase 4:** Deploy to Vercel + custom domain + SEO
