# Contador de visitas por post — Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Track and display a per-post view count, persisted in Upstash Redis (works on Vercel's
serverless/static deployment).

**Architecture:** A `src/lib/views.ts` module wraps `@upstash/redis` with `incrementViews`/
`getViews`. A Next.js route handler at `/api/views/[slug]` exposes POST (increment) and GET
(read-only). A client component `ViewCounter` calls POST once per session (deduped via
`sessionStorage`) and renders the count inline in the post header.

**Tech Stack:** `@upstash/redis` (new dependency), Next.js Route Handlers, React client component.

---

There is no test framework in this project. Verification is manual: run `npm run build` after
each code task, and (where env vars are available) manually exercise the API route.

### Task 1: Install dependency and add Redis client module

**Files:**
- Modify: `package.json` (add dependency)
- Create: `src/lib/views.ts`

- [ ] **Step 1: Install `@upstash/redis`**

Run:
```bash
npm install @upstash/redis
```
Expected: `package.json` and `package-lock.json` (or equivalent lockfile) updated, package appears
under `dependencies`.

- [ ] **Step 2: Write the Redis client + view functions**

```typescript
// src/lib/views.ts
import { Redis } from '@upstash/redis'

let redis: Redis | null = null

function getRedisClient(): Redis | null {
  const url = process.env.UPSTASH_REDIS_REST_URL
  const token = process.env.UPSTASH_REDIS_REST_TOKEN
  if (!url || !token) return null

  if (!redis) {
    redis = new Redis({ url, token })
  }
  return redis
}

export async function incrementViews(slug: string): Promise<number> {
  const client = getRedisClient()
  if (!client) return 0
  return client.incr(`views:${slug}`)
}

export async function getViews(slug: string): Promise<number> {
  const client = getRedisClient()
  if (!client) return 0
  const value = await client.get<number>(`views:${slug}`)
  return value ?? 0
}
```

- [ ] **Step 3: Verify TypeScript compiles**

Run:
```bash
npx tsc --noEmit
```
Expected: no errors referencing `src/lib/views.ts`.

- [ ] **Step 4: Commit**

```bash
git add package.json package-lock.json src/lib/views.ts
git commit -m "feat: add Redis-backed view tracking module"
```

(If the lockfile has a different name/path after `npm install`, e.g. no `package-lock.json` was
previously committed, check `git status` and add whichever lockfile changed.)

---

### Task 2: API route handler

**Files:**
- Create: `src/app/api/views/[slug]/route.ts`

- [ ] **Step 1: Write the route handler**

```typescript
// src/app/api/views/[slug]/route.ts
import { NextRequest, NextResponse } from 'next/server'
import { incrementViews, getViews } from '@/lib/views'

export async function POST(
  _request: NextRequest,
  { params }: { params: Promise<{ slug: string }> }
) {
  const { slug } = await params
  const views = await incrementViews(slug)
  return NextResponse.json({ views })
}

export async function GET(
  _request: NextRequest,
  { params }: { params: Promise<{ slug: string }> }
) {
  const { slug } = await params
  const views = await getViews(slug)
  return NextResponse.json({ views })
}
```

Note: this project uses Next.js 16 with the async `params` pattern (confirmed by existing usage in
`src/app/post/[slug]/page.tsx`), so `params` must be awaited.

- [ ] **Step 2: Verify TypeScript compiles**

Run:
```bash
npx tsc --noEmit
```
Expected: no errors referencing this file.

- [ ] **Step 3: Verify with a manual request (requires env vars)**

If `UPSTASH_REDIS_REST_URL` and `UPSTASH_REDIS_REST_TOKEN` are set in `.env.local`, start the dev
server and test:
```bash
npm run dev &
sleep 3
curl -X POST http://localhost:3000/api/views/test-slug
curl http://localhost:3000/api/views/test-slug
```
Expected: first call returns `{"views":1}` (or higher if run before), second call returns the same
number without incrementing further.

If env vars are NOT set (common for this task when Upstash hasn't been provisioned yet), skip this
step and note it in the task report — `incrementViews`/`getViews` return `0` gracefully instead of
throwing, so `npm run build` still succeeds without them.

- [ ] **Step 4: Commit**

```bash
git add "src/app/api/views/[slug]/route.ts"
git commit -m "feat: add view count API route"
```

---

### Task 3: ViewCounter client component

**Files:**
- Create: `src/components/ViewCounter.tsx`

- [ ] **Step 1: Write the component**

```tsx
'use client'

import { useEffect, useState } from 'react'

export function ViewCounter({ slug }: { slug: string }) {
  const [views, setViews] = useState<number | null>(null)

  useEffect(() => {
    const storageKey = `viewed:${slug}`
    const alreadyViewed = sessionStorage.getItem(storageKey)

    const method = alreadyViewed ? 'GET' : 'POST'

    fetch(`/api/views/${slug}`, { method })
      .then(res => {
        if (!res.ok) throw new Error(`View counter request failed: ${res.status}`)
        return res.json()
      })
      .then((data: { views: number }) => {
        setViews(data.views)
        if (!alreadyViewed) {
          sessionStorage.setItem(storageKey, '1')
        }
      })
      .catch(err => {
        console.error('ViewCounter error:', err)
      })
  }, [slug])

  if (views === null || views === 0) return null

  return (
    <span className="ui-label text-ink-soft">
      {views} {views === 1 ? 'lectura' : 'lecturas'}
    </span>
  )
}
```

The `views === 0` guard hides the counter when Redis isn't configured (module returns `0`) or the
post genuinely has no recorded views yet, avoiding a misleading "0 lecturas" on every fresh post.

- [ ] **Step 2: Verify TypeScript compiles**

Run:
```bash
npx tsc --noEmit
```
Expected: no errors referencing this file.

- [ ] **Step 3: Commit**

```bash
git add src/components/ViewCounter.tsx
git commit -m "feat: add ViewCounter client component"
```

---

### Task 4: Integrate into post detail page

**Files:**
- Modify: `src/app/post/[slug]/page.tsx:1-10` (imports), `src/app/post/[slug]/page.tsx:104-119`
  (header metadata row)

- [ ] **Step 1: Add the import**

In `src/app/post/[slug]/page.tsx`, add near the other component imports (after the
`SiteHeader, RoutePanel, EditorialFooter` import line):

```typescript
import { ViewCounter } from '@/components/ViewCounter'
```

- [ ] **Step 2: Render it in the metadata row**

Find this existing block (around line 104-119):

```tsx
          <div className="flex flex-wrap items-center gap-3 mb-5">
            <Link
              href={`/categorias?categoria=${post.categoria}`}
              className="ui-label transition-colors hover:opacity-80 flex items-center gap-2"
              style={{ color: accentColor }}
            >
              <span className="h-2 w-2 rounded-full" style={{ backgroundColor: accentColor }} />
              {meta?.label || post.categoria}
            </Link>
            <span className="h-px w-8 bg-line" />
            <time className="ui-label text-ink-soft" dateTime={post.fecha}>
              {formatPostDate(post.fecha)}
            </time>
            <span className="h-px w-8 bg-line" />
            <span className="ui-label text-ink-soft">{readingMinutes} min de lectura</span>
          </div>
```

Replace it with (adds a separator + `ViewCounter` after the reading time):

```tsx
          <div className="flex flex-wrap items-center gap-3 mb-5">
            <Link
              href={`/categorias?categoria=${post.categoria}`}
              className="ui-label transition-colors hover:opacity-80 flex items-center gap-2"
              style={{ color: accentColor }}
            >
              <span className="h-2 w-2 rounded-full" style={{ backgroundColor: accentColor }} />
              {meta?.label || post.categoria}
            </Link>
            <span className="h-px w-8 bg-line" />
            <time className="ui-label text-ink-soft" dateTime={post.fecha}>
              {formatPostDate(post.fecha)}
            </time>
            <span className="h-px w-8 bg-line" />
            <span className="ui-label text-ink-soft">{readingMinutes} min de lectura</span>
            <ViewCounter slug={post.slug} />
          </div>
```

- [ ] **Step 3: Verify the build succeeds**

Run:
```bash
npm run build
```
Expected: build succeeds with no errors. `ViewCounter` is a client component correctly imported
into a server component, which Next.js supports natively (no "use client" boundary errors).

- [ ] **Step 4: Commit**

```bash
git add "src/app/post/[slug]/page.tsx"
git commit -m "feat: display view counter on post detail page"
```

---

### Task 5: Setup documentation

**Files:**
- Create: `docs/VIEW_COUNTER_SETUP.md`

- [ ] **Step 1: Write the setup doc**

```markdown
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
```

- [ ] **Step 2: Commit**

```bash
git add docs/VIEW_COUNTER_SETUP.md
git commit -m "docs: add view counter setup instructions"
```

---

## Spec coverage check

- Upstash Redis storage, `views:<slug>` key, INCR → Task 1
- `incrementViews`/`getViews` module → Task 1
- API route POST/GET → Task 2
- Client component with sessionStorage dedup → Task 3
- Fail-silent on missing config → Task 1 (`getRedisClient` returns null) + Task 3 (`.catch`,
  `views === 0` hides display)
- Integration into post detail page → Task 4
- Setup documentation for Upstash → Task 5
- Manual testing steps (with and without env vars) → Task 2 Step 3, Task 4 Step 3
