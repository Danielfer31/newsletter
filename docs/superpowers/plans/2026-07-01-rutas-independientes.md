# Rutas Independientes Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Build independent public pages for each editorial route at `/rutas/<slug>`, with a distinct personality per route and shared La Biblioteca de Apolo editorial DNA.

**Architecture:** Use one Next.js App Router dynamic route, `src/app/rutas/[category]/page.tsx`, backed by canonical category metadata in `src/lib/categories.ts`. Keep `/categorias` as the atlas overview, but change route-entry links to point to `/rutas/<slug>`. Implement visual differences through typed `routeExperience.layout` variants instead of seven copied pages.

**Tech Stack:** Next.js 16.2.9 App Router, React 19.2.4, TypeScript, Tailwind CSS 4, local Markdown posts, local category images and SVG map assets.

## Global Constraints

- Read relevant Next.js docs in `node_modules/next/dist/docs/` before changing App Router behavior.
- Keep UI copy in Spanish.
- `/categorias` remains the general atlas page.
- `/rutas/geopolitica`, `/rutas/anime`, `/rutas/futbol`, `/rutas/musica`, `/rutas/opinion`, `/rutas/rpg`, and `/rutas/cultura` must exist.
- Invalid route slugs must render `notFound()`.
- Use `CATEGORY_META` as the canonical source for route copy, colors, images, map expressions, coordinates, and layout personality.
- Preserve the warm paper, serif editorial, cartographic identity.
- Do not add CMS, database, subscription backend, or new paid dependencies.
- Do not redesign post pages in this phase.
- Run `npm run lint` and `npm run build` before final handoff.
- Verify rendered pages in the in-app browser.

---

## File Structure

**Modify**
- `src/lib/categories.ts`: add route experience fields and typed layout variants.
- `src/components/editorial/CategoryRouteCarousel.tsx`: link route slides to `/rutas/<slug>`.
- `src/app/categorias/CategoriesClient.tsx`: link category cards and selected category CTA to `/rutas/<slug>` while preserving atlas selection behavior.
- `src/components/editorial/CategoryCard.tsx`: keep current `href` support; no API change expected.
- `src/app/globals.css`: add a few route-page utility classes only if Tailwind classes become too repetitive.

**Create**
- `src/app/rutas/[category]/page.tsx`: dynamic route page, static params, metadata, invalid slug handling.
- `src/app/rutas/[category]/RouteWorld.tsx`: presentational server component for the route worlds.
- `src/app/rutas/[category]/RouteWorldNav.tsx`: reusable navigation to other routes.

**Test/Verify**
- Existing commands: `npm run lint`, `npm run build`.
- Browser routes: `/rutas/geopolitica`, `/rutas/anime`, `/rutas/futbol`, `/rutas/musica`, `/rutas/opinion`, `/rutas/rpg`, `/rutas/cultura`, `/categorias`.

---

### Task 1: Extend Category Metadata With Route Experiences

**Files:**
- Modify: `src/lib/categories.ts`

**Interfaces:**
- Consumes: existing `Category`, `CategoryMeta`, `CATEGORY_META`, `CATEGORY_ORDER`.
- Produces:
  - `export type RouteLayout = 'dossier' | 'voyage' | 'tactics' | 'constellation' | 'margin' | 'campaign' | 'cabinet'`
  - `export interface RouteExperience`
  - `CategoryMeta.routeExperience: RouteExperience`
  - `export function getRouteHref(category: Category): string`

- [ ] **Step 1: Add route experience types**

In `src/lib/categories.ts`, add these types after `CategoryPalette`:

```ts
export type RouteLayout =
  | 'dossier'
  | 'voyage'
  | 'tactics'
  | 'constellation'
  | 'margin'
  | 'campaign'
  | 'cabinet'

export interface RouteExperience {
  headline: string
  deck: string
  mood: string
  motif: string
  layout: RouteLayout
  primaryModuleLabel: string
  secondaryModuleLabel: string
  emptyState: string
}
```

- [ ] **Step 2: Extend `CategoryMeta`**

In the `CategoryMeta` interface, add:

```ts
  routeExperience: RouteExperience
```

- [ ] **Step 3: Add `routeExperience` to every category**

Add these exact objects inside each category entry:

```ts
// geopolitica
routeExperience: {
  headline: 'Dossier de fronteras, pactos y líneas de fractura',
  deck: 'Una sala de mapas para leer el poder: cables, tratados, economías y territorios en tensión.',
  mood: 'Sala de mapas',
  motif: 'Fronteras, cables diplomáticos y coordenadas de crisis',
  layout: 'dossier',
  primaryModuleLabel: 'Expedientes recientes',
  secondaryModuleLabel: 'Lectura de tablero',
  emptyState: 'Esta mesa diplomática aún no tiene expedientes publicados.',
}
```

```ts
// anime
routeExperience: {
  headline: 'Un mar de islas, promesas y personajes en viaje',
  deck: 'Lecturas sobre series, autoría y épica popular trazadas como rutas marítimas.',
  mood: 'Cuaderno de aventura',
  motif: 'Islas, corrientes, paneles limpios y marcas de viaje',
  layout: 'voyage',
  primaryModuleLabel: 'Bitácora reciente',
  secondaryModuleLabel: 'Islas narrativas',
  emptyState: 'Esta ruta marítima aún espera su próxima bitácora.',
}
```

```ts
// futbol
routeExperience: {
  headline: 'La cancha como mapa: zonas, mitos y presión',
  deck: 'Táctica, cultura y pasión leídas desde una pizarra que también es crónica.',
  mood: 'Pizarra táctica',
  motif: 'Campo, flechas de presión, zonas y marcador editorial',
  layout: 'tactics',
  primaryModuleLabel: 'Jugadas recientes',
  secondaryModuleLabel: 'Mapa de partido',
  emptyState: 'La pizarra está lista, pero todavía no hay jugadas publicadas.',
}
```

```ts
// musica
routeExperience: {
  headline: 'Constelaciones sonoras para ordenar la memoria',
  deck: 'Discos, escenas y obsesiones auditivas conectadas por ondas, noches y rutas.',
  mood: 'Constelación sonora',
  motif: 'Ondas, vinilos, pentagramas cartográficos y escenas conectadas',
  layout: 'constellation',
  primaryModuleLabel: 'Lado A',
  secondaryModuleLabel: 'Escenas conectadas',
  emptyState: 'La aguja todavía no cae sobre ninguna entrada publicada.',
}
```

```ts
// opinion
routeExperience: {
  headline: 'Ensayos al margen para pensar sin molde',
  deck: 'Una brújula argumental hecha de dudas, subrayados y notas personales.',
  mood: 'Margen abierto',
  motif: 'Notas al margen, subrayados, brújula y terra incognita',
  layout: 'margin',
  primaryModuleLabel: 'Cuadernos recientes',
  secondaryModuleLabel: 'Preguntas guía',
  emptyState: 'El margen está abierto, pero aún no hay columnas publicadas.',
}
```

```ts
// rpg
routeExperience: {
  headline: 'Mapas de campaña, dados y mundos posibles',
  deck: 'Diarios de partida, reglas y territorios imaginarios para jugar pensando.',
  mood: 'Mesa de campaña',
  motif: 'Hexágonos, dados, rutas de mazmorra y terreno',
  layout: 'campaign',
  primaryModuleLabel: 'Diario de partida',
  secondaryModuleLabel: 'Mesa preparada',
  emptyState: 'La campaña está preparada, pero aún no empieza la sesión.',
}
```

```ts
// cultura
routeExperience: {
  headline: 'Un gabinete de objetos, rarezas y referencias pop',
  deck: 'Cine, libros, archivo y cultura popular ordenados como vitrinas conectadas.',
  mood: 'Gabinete pop',
  motif: 'Fichas, vitrinas, órbitas de referencias y objetos culturales',
  layout: 'cabinet',
  primaryModuleLabel: 'Piezas recientes',
  secondaryModuleLabel: 'Archivo orbital',
  emptyState: 'El gabinete está abierto, pero todavía no hay piezas publicadas.',
}
```

- [ ] **Step 4: Add route href helper**

At the bottom of `src/lib/categories.ts`, add:

```ts
export function getRouteHref(category: Category): string {
  return `/rutas/${category}`
}
```

- [ ] **Step 5: Verify TypeScript/lint**

Run:

```bash
npm run lint
```

Expected: PASS with no TypeScript or lint errors about missing `routeExperience`.

- [ ] **Step 6: Commit**

```bash
git add src/lib/categories.ts
git commit -m "feat: add route experience metadata"
```

---

### Task 2: Build Route World Components

**Files:**
- Create: `src/app/rutas/[category]/RouteWorldNav.tsx`
- Create: `src/app/rutas/[category]/RouteWorld.tsx`

**Interfaces:**
- Consumes:
  - `Category`
  - `Post`
  - `CATEGORY_META`
  - `CATEGORY_ORDER`
  - `getRouteHref(category: Category): string`
- Produces:
  - `RouteWorldNav({ activeCategory }: { activeCategory: Category })`
  - `RouteWorld({ category, posts }: { category: Category; posts: Post[] })`

- [ ] **Step 1: Create `RouteWorldNav.tsx`**

Create `src/app/rutas/[category]/RouteWorldNav.tsx`:

```tsx
import Link from 'next/link'
import { CATEGORY_META, CATEGORY_ORDER, getRouteHref } from '@/lib/categories'
import { Category } from '@/types/post'

export default function RouteWorldNav({ activeCategory }: { activeCategory: Category }) {
  return (
    <nav className="border-t border-line pt-6" aria-label="Otras rutas">
      <p className="ui-label mb-4">Otras rutas</p>
      <div className="grid gap-2 sm:grid-cols-2 lg:grid-cols-1">
        {CATEGORY_ORDER.filter((category) => category !== activeCategory).map((category) => {
          const meta = CATEGORY_META[category]

          return (
            <Link
              key={category}
              href={getRouteHref(category)}
              className="group flex items-center justify-between gap-4 border border-line bg-paper-soft px-4 py-3 text-sm font-semibold text-ink transition-colors hover:bg-paper"
            >
              <span className="flex items-center gap-3">
                <span className="h-2 w-2 rounded-full" style={{ backgroundColor: meta.accent }} aria-hidden="true" />
                {meta.label}
              </span>
              <span className="text-sepia transition-transform group-hover:translate-x-1" aria-hidden="true">
                →
              </span>
            </Link>
          )
        })}
      </div>
    </nav>
  )
}
```

- [ ] **Step 2: Create `RouteWorld.tsx` imports and helpers**

Create `src/app/rutas/[category]/RouteWorld.tsx` with:

```tsx
import Image from 'next/image'
import Link from 'next/link'
import { ArticleRow, SiteHeader } from '@/components/editorial'
import { CATEGORY_META } from '@/lib/categories'
import { Category, Post } from '@/types/post'
import RouteWorldNav from './RouteWorldNav'

type RouteWorldProps = {
  category: Category
  posts: Post[]
}

const NAV_ITEMS = [
  { label: 'Archivo', href: '/archivo' },
  { label: 'Categorías', href: '/categorias' },
  { label: 'Sobre el proyecto', href: '/sobre-el-proyecto' },
]

const layoutClass: Record<string, string> = {
  dossier: 'md:grid-cols-[minmax(0,1.05fr)_22rem]',
  voyage: 'md:grid-cols-[minmax(0,0.9fr)_26rem]',
  tactics: 'md:grid-cols-[minmax(0,1fr)_24rem]',
  constellation: 'md:grid-cols-[minmax(0,0.95fr)_24rem]',
  margin: 'md:grid-cols-[minmax(0,0.85fr)_25rem]',
  campaign: 'md:grid-cols-[minmax(0,1fr)_24rem]',
  cabinet: 'md:grid-cols-[minmax(0,0.95fr)_25rem]',
}
```

- [ ] **Step 3: Add `RouteWorld` component**

Append this component in the same file:

```tsx
export default function RouteWorld({ category, posts }: RouteWorldProps) {
  const meta = CATEGORY_META[category]
  const experience = meta.routeExperience
  const featuredPosts = posts.slice(0, 3)
  const hasPosts = featuredPosts.length > 0

  return (
    <main className="paper-page min-h-screen">
      <SiteHeader activeHref="/categorias" navItems={NAV_ITEMS} />

      <section
        className="relative overflow-hidden border-b border-line"
        style={{ backgroundColor: meta.colors.paper }}
        aria-labelledby="route-title"
      >
        <div className="pointer-events-none absolute inset-0 opacity-[0.08]" style={{ backgroundImage: `url(/maps/${category}.svg)`, backgroundPosition: 'center', backgroundRepeat: 'no-repeat', backgroundSize: '72rem' }} aria-hidden="true" />
        <div className="pointer-events-none absolute inset-0 bg-[linear-gradient(90deg,rgba(255,250,241,0.92),rgba(255,250,241,0.62),rgba(255,250,241,0.18))]" aria-hidden="true" />

        <div className={`editorial-shell relative grid min-h-[34rem] gap-10 py-12 md:items-center md:py-16 ${layoutClass[experience.layout]}`}>
          <div className="relative z-10 max-w-3xl">
            <Link href="/categorias" className="ui-label inline-flex items-center gap-2 text-sepia transition-colors hover:text-ink">
              ← Atlas de rutas
            </Link>
            <p className="ui-label mt-8" style={{ color: meta.accent }}>
              {experience.mood}
            </p>
            <h1 id="route-title" className="serif-title mt-4 text-5xl font-medium leading-none text-ink md:text-7xl">
              {meta.label}
            </h1>
            <p className="mt-6 max-w-2xl font-serif text-2xl leading-9 text-ink">
              {experience.headline}
            </p>
            <p className="mt-5 max-w-2xl text-lg leading-8 text-ink-soft">
              {experience.deck}
            </p>
          </div>

          <RouteArtifact category={category} />
        </div>
      </section>

      <section className="editorial-shell grid gap-10 py-10 lg:grid-cols-[minmax(0,1fr)_20rem] lg:py-14">
        <div>
          <div className="mb-6 flex flex-wrap items-end justify-between gap-4 border-b border-line pb-5">
            <div>
              <p className="ui-label" style={{ color: meta.accent }}>
                {experience.primaryModuleLabel}
              </p>
              <h2 className="serif-title mt-2 text-4xl font-medium text-ink">Entradas de la ruta</h2>
            </div>
            <Link href={`/archivo?categoria=${category}`} className="text-sm font-semibold text-sepia transition-colors hover:text-ink">
              Ver archivo →
            </Link>
          </div>

          {hasPosts ? (
            <div className="divide-y divide-line">
              {featuredPosts.map((post) => (
                <ArticleRow key={post.slug} post={post} />
              ))}
            </div>
          ) : (
            <div className="border border-line bg-paper-soft p-8">
              <p className="serif-title text-3xl text-ink">{experience.emptyState}</p>
              <p className="mt-4 max-w-xl text-sm leading-6 text-ink-soft">
                Mientras aparece la primera entrada, puedes volver al atlas general o explorar una ruta vecina.
              </p>
            </div>
          )}
        </div>

        <aside className="space-y-8">
          <section className="border border-line bg-paper-soft p-6">
            <p className="ui-label" style={{ color: meta.accent }}>
              {experience.secondaryModuleLabel}
            </p>
            <h2 className="serif-title mt-3 text-2xl leading-tight text-ink">{experience.motif}</h2>
            <p className="mt-4 text-sm leading-6 text-ink-soft">{meta.mapExpression}</p>
            <p className="ui-label mt-6 normal-case tracking-normal" style={{ color: meta.accent }}>
              {meta.coordinates.label}
            </p>
          </section>

          <RouteWorldNav activeCategory={category} />
        </aside>
      </section>
    </main>
  )
}
```

- [ ] **Step 4: Add route artifact component**

Append this component below `RouteWorld` in `RouteWorld.tsx`:

```tsx
function RouteArtifact({ category }: { category: Category }) {
  const meta = CATEGORY_META[category]
  const experience = meta.routeExperience

  return (
    <div
      className="relative z-10 min-h-[22rem] overflow-hidden border border-line bg-paper-soft shadow-sm"
      style={{
        borderColor: meta.accent,
        borderRadius: experience.layout === 'dossier' || experience.layout === 'margin' ? '0.25rem' : '1.5rem',
      }}
      aria-hidden="true"
    >
      <Image
        src={meta.imageSrc}
        alt=""
        fill
        priority
        sizes="(min-width: 768px) 420px, 100vw"
        className="object-cover opacity-80 mix-blend-multiply"
      />
      <div className="absolute inset-0 bg-[linear-gradient(180deg,rgba(255,250,241,0.12),rgba(255,250,241,0.62))]" />
      <svg className="absolute inset-0 h-full w-full" viewBox="0 0 420 420" fill="none">
        {experience.layout === 'tactics' ? (
          <g stroke={meta.accent} strokeWidth="1.3" opacity="0.72">
            <rect x="42" y="58" width="336" height="256" rx="2" />
            <path d="M210 58v256M42 186h336M96 112c54 36 98 36 150 0M156 260c46-38 92-38 138 0" strokeDasharray="7 8" />
            <circle cx="210" cy="186" r="42" />
          </g>
        ) : experience.layout === 'constellation' ? (
          <g stroke={meta.accent} strokeWidth="1.2" opacity="0.72">
            <path d="M72 116c58-36 112 24 166-14 42-30 72-8 112 18M68 226c70-22 112 36 172 2 46-26 70-12 114 22" strokeDasharray="4 10" />
            {[88, 156, 236, 318, 112, 286].map((x, index) => (
              <circle key={x} cx={x} cy={index < 4 ? 118 + index * 10 : 238} r="5" fill={meta.accent} />
            ))}
          </g>
        ) : experience.layout === 'campaign' ? (
          <g stroke={meta.accent} strokeWidth="1.1" opacity="0.72">
            {Array.from({ length: 5 }).map((_, row) =>
              Array.from({ length: 5 }).map((__, col) => (
                <path key={`${row}-${col}`} d={`M${74 + col * 58} ${82 + row * 44}l25 14v28l-25 14-25-14v-28z`} />
              )),
            )}
            <path d="M92 96c72 62 118 70 214 38M118 278c48-34 100-24 158 10" strokeDasharray="5 9" />
          </g>
        ) : (
          <g stroke={meta.accent} strokeWidth="1.1" opacity="0.7">
            <circle cx="292" cy="120" r="64" />
            <circle cx="292" cy="120" r="98" opacity="0.42" />
            <path d="M52 272C118 212 156 308 224 224S332 122 372 158" strokeDasharray="6 10" />
            <path d="M58 86h132M74 116h86M68 324h172" opacity="0.44" />
          </g>
        )}
      </svg>
      <div className="absolute bottom-5 left-5 right-5 flex items-end justify-between gap-4">
        <p className="ui-label max-w-[12rem] normal-case tracking-normal text-ink">{experience.motif}</p>
        <span className="h-10 w-10 border border-current" style={{ color: meta.accent, backgroundColor: meta.colors.accentSoft }} />
      </div>
    </div>
  )
}
```

- [ ] **Step 5: Verify component compile**

Run:

```bash
npm run lint
```

Expected: PASS or only pre-existing lint failures unrelated to new files. If new files fail because `layoutClass` is typed too loosely, change it to:

```ts
import { RouteLayout } from '@/lib/categories'
const layoutClass: Record<RouteLayout, string> = { ... }
```

- [ ] **Step 6: Commit**

```bash
git add src/app/rutas/[category]/RouteWorld.tsx src/app/rutas/[category]/RouteWorldNav.tsx
git commit -m "feat: add route world components"
```

---

### Task 3: Add Dynamic `/rutas/[category]` Pages

**Files:**
- Create: `src/app/rutas/[category]/page.tsx`

**Interfaces:**
- Consumes:
  - `CATEGORY_META`
  - `CATEGORY_ORDER`
  - `isCategory(value: string): value is Category`
  - `getPostsByCategory(category: Category): Post[]`
  - `RouteWorld({ category, posts })`
- Produces:
  - `generateStaticParams(): { category: Category }[]`
  - `generateMetadata(props): Promise<Metadata>`
  - default route page component.

- [ ] **Step 1: Create page file**

Create `src/app/rutas/[category]/page.tsx`:

```tsx
import { Metadata } from 'next'
import { notFound } from 'next/navigation'
import { CATEGORY_META, CATEGORY_ORDER, isCategory } from '@/lib/categories'
import { getPostsByCategory } from '@/lib/posts'
import { Category } from '@/types/post'
import RouteWorld from './RouteWorld'

type RoutePageProps = {
  params: Promise<{
    category: string
  }>
}

export function generateStaticParams(): { category: Category }[] {
  return CATEGORY_ORDER.map((category) => ({ category }))
}

export async function generateMetadata({ params }: RoutePageProps): Promise<Metadata> {
  const { category: rawCategory } = await params

  if (!isCategory(rawCategory)) {
    return {
      title: 'Ruta no encontrada — La Biblioteca de Apolo',
    }
  }

  const meta = CATEGORY_META[rawCategory]

  return {
    title: `${meta.label} — La Biblioteca de Apolo`,
    description: meta.routeExperience.deck,
  }
}

export default async function RoutePage({ params }: RoutePageProps) {
  const { category: rawCategory } = await params

  if (!isCategory(rawCategory)) {
    notFound()
  }

  const posts = getPostsByCategory(rawCategory)

  return <RouteWorld category={rawCategory} posts={posts} />
}
```

- [ ] **Step 2: Verify route typegen/build**

Run:

```bash
npm run build
```

Expected: PASS. The build output should include static generation for the seven `/rutas/<slug>` paths.

- [ ] **Step 3: Manually inspect invalid route behavior**

With the dev server running, open:

```text
http://localhost:3000/rutas/no-existe
```

Expected: Next.js not-found UI, not a crash.

- [ ] **Step 4: Commit**

```bash
git add src/app/rutas/[category]/page.tsx
git commit -m "feat: add independent category routes"
```

---

### Task 4: Update Atlas And Carousel Links

**Files:**
- Modify: `src/components/editorial/CategoryRouteCarousel.tsx`
- Modify: `src/app/categorias/CategoriesClient.tsx`

**Interfaces:**
- Consumes: `getRouteHref(category: Category): string`.
- Produces: route entry links that point to `/rutas/<slug>`.

- [ ] **Step 1: Update carousel imports**

In `src/components/editorial/CategoryRouteCarousel.tsx`, change:

```ts
import { CATEGORY_META, CATEGORY_ORDER, CategoryMeta } from '@/lib/categories'
```

to:

```ts
import { CATEGORY_META, CATEGORY_ORDER, CategoryMeta, getRouteHref } from '@/lib/categories'
```

- [ ] **Step 2: Update carousel slide href**

In `RouteSlide`, change:

```tsx
href={`/categorias?categoria=${category}`}
```

to:

```tsx
href={getRouteHref(category)}
```

- [ ] **Step 3: Update categories page imports**

In `src/app/categorias/CategoriesClient.tsx`, change:

```ts
import { CATEGORY_META, CATEGORY_ORDER } from '@/lib/categories'
```

to:

```ts
import { CATEGORY_META, CATEGORY_ORDER, getRouteHref } from '@/lib/categories'
```

- [ ] **Step 4: Add a selected-route CTA**

Inside the active category article in `CategoriesClient`, immediately after the long description paragraph:

```tsx
<Link
  href={getRouteHref(activeCategory)}
  className="mt-7 inline-flex items-center gap-2 rounded-full border px-5 py-3 text-sm font-semibold text-ink transition-colors hover:bg-ink hover:text-paper-soft"
  style={{ borderColor: activeMeta.accent }}
>
  Entrar a la ruta {activeMeta.label}
  <span aria-hidden="true">→</span>
</Link>
```

- [ ] **Step 5: Update category grid cards**

In the `Todas las rutas` grid, change:

```tsx
<CategoryCard
  key={category}
  category={category}
  active={activeCategory === category}
  onSelect={selectCategory}
/>
```

to:

```tsx
<CategoryCard
  key={category}
  category={category}
  href={getRouteHref(category)}
  active={activeCategory === category}
/>
```

- [ ] **Step 6: Preserve selector behavior**

Do not change the left-side selector buttons in `CategoriesClient`; those should still update the atlas panel and URL query for browsing inside `/categorias`.

- [ ] **Step 7: Verify lint**

Run:

```bash
npm run lint
```

Expected: PASS. If `selectCategory` becomes unused after the grid update, it is still used by selector buttons and must remain.

- [ ] **Step 8: Commit**

```bash
git add src/components/editorial/CategoryRouteCarousel.tsx src/app/categorias/CategoriesClient.tsx
git commit -m "feat: link atlas cards to independent routes"
```

---

### Task 5: Route Visual QA And Polish

**Files:**
- Modify if needed: `src/app/rutas/[category]/RouteWorld.tsx`
- Modify if needed: `src/app/globals.css`

**Interfaces:**
- Consumes: completed `/rutas/<slug>` pages.
- Produces: verified desktop/mobile route experience.

- [ ] **Step 1: Start or confirm dev server**

Run:

```bash
npm run dev
```

Expected: Next.js reports `Local: http://localhost:3000`.

- [ ] **Step 2: Verify required pages in browser**

Open each URL in the in-app browser:

```text
http://localhost:3000/rutas/geopolitica
http://localhost:3000/rutas/anime
http://localhost:3000/rutas/futbol
http://localhost:3000/rutas/musica
http://localhost:3000/rutas/opinion
http://localhost:3000/rutas/rpg
http://localhost:3000/rutas/cultura
http://localhost:3000/categorias
```

Expected for each `/rutas/<slug>`:
- Header visible.
- Route title visible.
- Distinct artifact/motif visible.
- No framework overlay.
- No blank page.
- Entries render if present.
- Empty state renders if no posts.
- Other-routes navigation works.

- [ ] **Step 3: Check browser console**

Using the Browser plugin, read warning/error logs for at least `/rutas/anime` and `/rutas/geopolitica`.

Expected: no relevant app errors. If image warnings appear because an asset is missing, either fix the asset path in `CATEGORY_META` or add a text-only fallback in `RouteArtifact`.

- [ ] **Step 4: Mobile viewport check**

Set viewport to a mobile width around `390px` and inspect:

```text
http://localhost:3000/rutas/anime
http://localhost:3000/rutas/futbol
```

Expected:
- Header wraps without overlap.
- Hero text does not collide with artifact.
- Route artifact remains visible but not dominant.
- CTA/link text fits inside controls.
- Other-routes navigation stacks cleanly.

- [ ] **Step 5: Apply polish only for concrete issues**

If text overlaps or artifacts crowd the hero, first adjust Tailwind classes in `RouteWorld.tsx`. Only add CSS to `src/app/globals.css` if the same rule is repeated three or more times.

Acceptable targeted adjustments:

```tsx
// Reduce mobile hero scale
<h1 className="serif-title mt-4 text-5xl font-medium leading-none text-ink md:text-7xl">
```

to:

```tsx
<h1 className="serif-title mt-4 text-4xl font-medium leading-none text-ink sm:text-5xl md:text-7xl">
```

```tsx
// Reduce artifact minimum height on mobile
className="relative z-10 min-h-[22rem] ..."
```

to:

```tsx
className="relative z-10 min-h-[18rem] md:min-h-[22rem] ..."
```

- [ ] **Step 6: Final checks**

Run:

```bash
npm run lint
npm run build
```

Expected: both PASS.

- [ ] **Step 7: Commit polish**

If polish changes were made:

```bash
git add src/app/rutas/[category]/RouteWorld.tsx src/app/globals.css
git commit -m "fix: polish independent route pages"
```

If no polish changes were needed, skip the commit.

---

## Self-Review

**Spec coverage:**  
This plan creates all seven `/rutas/<slug>` pages, keeps `/categorias`, moves entry links toward route pages, gives each route a typed personality, handles invalid slugs with `notFound()`, preserves warm editorial/cartographic DNA, and includes browser verification.

**Placeholder scan:**  
No TBD/TODO placeholders remain. Every task has exact files, code snippets, commands, and expected outcomes.

**Type consistency:**  
`RouteLayout`, `RouteExperience`, `routeExperience`, `getRouteHref`, `RouteWorld`, and `RouteWorldNav` are defined before later tasks consume them. The dynamic route uses Next.js 16 async `params` style, matching the local App Router docs.

**Scope check:**  
The plan does not redesign post pages, add content, create a CMS, or add new assets. It focuses only on independent route pages and link migration.
