# Suscripción newsletter — Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Connect `SubscribeBox` to a real double opt-in subscription flow (Redis pending tokens +
Resend confirmation email + Resend Audience), plus an admin-protected endpoint to manually send a
newsletter broadcast for a given post.

**Architecture:** A `src/lib/newsletter.ts` module wraps `@upstash/redis` (pending tokens) and
`resend` (send confirmation email, add confirmed contact, send broadcast). Three route handlers:
`POST /api/newsletter/subscribe` (create pending token + send confirmation email),
`GET /api/newsletter/confirm` (validate token, add to Resend Audience), and
`POST /api/newsletter/send` (admin-protected, sends a broadcast for a post slug). `SubscribeBox.tsx`
gets a real `fetch` call replacing the local-only `setIsSubmitted`.

**Tech Stack:** `resend` (new dependency), `@upstash/redis` (already installed), Next.js Route
Handlers.

---

There is no test framework in this project. Verification is manual: run `npx tsc --noEmit` and
`npm run build` after each code task, and (where env vars are available) manually exercise the API
routes with `curl`.

### Task 1: Install dependency and add the newsletter lib module

**Files:**
- Modify: `package.json` (add dependency)
- Create: `src/lib/newsletter.ts`

- [ ] **Step 1: Install `resend`**

Run:
```bash
npm install resend
```
Expected: `package.json` and the lockfile updated, `resend` appears under `dependencies`.

- [ ] **Step 2: Write the newsletter lib module**

```typescript
// src/lib/newsletter.ts
import { Redis } from '@upstash/redis'
import { Resend } from 'resend'
import { randomUUID } from 'crypto'

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

let resend: Resend | null = null

function getResendClient(): Resend | null {
  const apiKey = process.env.RESEND_API_KEY
  if (!apiKey) return null

  if (!resend) {
    resend = new Resend(apiKey)
  }
  return resend
}

const PENDING_TTL_SECONDS = 60 * 60 * 24 // 24h

export async function createPendingSubscription(email: string): Promise<string | null> {
  const client = getRedisClient()
  if (!client) return null

  const token = randomUUID()
  await client.set(`pending:${token}`, email, { ex: PENDING_TTL_SECONDS })
  return token
}

export async function getPendingEmail(token: string): Promise<string | null> {
  const client = getRedisClient()
  if (!client) return null

  return client.get<string>(`pending:${token}`)
}

export async function deletePendingSubscription(token: string): Promise<void> {
  const client = getRedisClient()
  if (!client) return

  await client.del(`pending:${token}`)
}

export async function sendConfirmationEmail(email: string, token: string, siteUrl: string): Promise<boolean> {
  const client = getResendClient()
  if (!client) return false

  const confirmUrl = `${siteUrl}/api/newsletter/confirm?token=${token}`

  const { error } = await client.emails.send({
    from: 'La Biblioteca de Apolo <onboarding@resend.dev>',
    to: email,
    subject: 'Confirmá tu suscripción',
    html: `<p>Hacé click para confirmar tu suscripción:</p><p><a href="${confirmUrl}">${confirmUrl}</a></p>`,
  })

  return !error
}

export async function addConfirmedContact(email: string): Promise<boolean> {
  const client = getResendClient()
  const audienceId = process.env.RESEND_AUDIENCE_ID
  if (!client || !audienceId) return false

  const { error } = await client.contacts.create({ email, audienceId })

  // A duplicate-contact error is treated as success (idempotent confirm).
  if (error && !error.message?.toLowerCase().includes('already exists')) {
    return false
  }
  return true
}

export interface BroadcastPost {
  titulo: string
  extracto: string
  slug: string
}

export async function sendBroadcast(post: BroadcastPost, siteUrl: string): Promise<string | null> {
  const client = getResendClient()
  const audienceId = process.env.RESEND_AUDIENCE_ID
  if (!client || !audienceId) return null

  const postUrl = `${siteUrl}/post/${post.slug}`

  const { data, error } = await client.broadcasts.create({
    audienceId,
    from: 'La Biblioteca de Apolo <onboarding@resend.dev>',
    subject: post.titulo,
    html: `<h1>${post.titulo}</h1><p>${post.extracto}</p><p><a href="${postUrl}">${postUrl}</a></p>`,
  })

  if (error || !data) return null

  const { error: sendError } = await client.broadcasts.send(data.id)
  if (sendError) return null

  return data.id
}
```

- [ ] **Step 3: Verify TypeScript compiles**

Run:
```bash
npx tsc --noEmit
```
Expected: no errors referencing `src/lib/newsletter.ts`.

- [ ] **Step 4: Commit**

```bash
git add package.json package-lock.json src/lib/newsletter.ts
git commit -m "feat: add newsletter lib module (Redis pending tokens + Resend)"
```

(If the lockfile has a different name/path, check `git status` and add whichever lockfile changed.)

---

### Task 2: Subscribe route handler

**Files:**
- Create: `src/app/api/newsletter/subscribe/route.ts`

- [ ] **Step 1: Write the route handler**

```typescript
// src/app/api/newsletter/subscribe/route.ts
import { NextRequest, NextResponse } from 'next/server'
import { createPendingSubscription, sendConfirmationEmail } from '@/lib/newsletter'

const EMAIL_REGEX = /^[^\s@]+@[^\s@]+\.[^\s@]+$/

export async function POST(request: NextRequest) {
  const body = await request.json().catch(() => null)
  const email = typeof body?.email === 'string' ? body.email.trim() : ''

  if (!email || !EMAIL_REGEX.test(email)) {
    return NextResponse.json({ error: 'Email inválido' }, { status: 400 })
  }

  const token = await createPendingSubscription(email)
  if (token) {
    const siteUrl = request.nextUrl.origin
    await sendConfirmationEmail(email, token, siteUrl)
  }

  // Always return a generic success message: avoids leaking whether Redis/Resend
  // are configured or whether the email is already subscribed.
  return NextResponse.json({ ok: true })
}
```

- [ ] **Step 2: Verify TypeScript compiles**

Run:
```bash
npx tsc --noEmit
```
Expected: no errors referencing this file.

- [ ] **Step 3: Verify with a manual request (requires env vars)**

If `UPSTASH_REDIS_REST_URL`, `UPSTASH_REDIS_REST_TOKEN`, and `RESEND_API_KEY` are set in
`.env.local`, start the dev server and test:
```bash
npm run dev &
sleep 3
curl -X POST http://localhost:3000/api/newsletter/subscribe -H "Content-Type: application/json" -d '{"email":"invalid"}'
curl -X POST http://localhost:3000/api/newsletter/subscribe -H "Content-Type: application/json" -d '{"email":"tu-email-real@ejemplo.com"}'
```
Expected: first call returns `400` with `{"error":"Email inválido"}`; second call returns
`{"ok":true}` and a confirmation email arrives.

If env vars are NOT set, skip step 3 and note it in the task report — the handler still returns
`{"ok":true}` gracefully since `createPendingSubscription` returns `null` instead of throwing.

- [ ] **Step 4: Commit**

```bash
git add "src/app/api/newsletter/subscribe/route.ts"
git commit -m "feat: add newsletter subscribe API route"
```

---

### Task 3: Confirm route handler

**Files:**
- Create: `src/app/api/newsletter/confirm/route.ts`

- [ ] **Step 1: Write the route handler**

```typescript
// src/app/api/newsletter/confirm/route.ts
import { NextRequest } from 'next/server'
import { getPendingEmail, deletePendingSubscription, addConfirmedContact } from '@/lib/newsletter'

function htmlPage(title: string, message: string): Response {
  return new Response(
    `<!doctype html><html lang="es"><head><meta charset="utf-8"><title>${title}</title></head>` +
      `<body style="font-family: sans-serif; text-align: center; padding: 4rem;">` +
      `<h1>${title}</h1><p>${message}</p></body></html>`,
    { headers: { 'Content-Type': 'text/html; charset=utf-8' } }
  )
}

export async function GET(request: NextRequest) {
  const token = request.nextUrl.searchParams.get('token')

  if (!token) {
    return htmlPage('Enlace inválido', 'Falta el token de confirmación.')
  }

  const email = await getPendingEmail(token)
  if (!email) {
    return htmlPage('Enlace inválido o expirado', 'Pedí una nueva suscripción desde el sitio.')
  }

  const added = await addConfirmedContact(email)
  await deletePendingSubscription(token)

  if (!added) {
    return htmlPage('Algo falló', 'No pudimos confirmar tu suscripción. Intentá de nuevo más tarde.')
  }

  return htmlPage('Listo', 'Quedaste suscrito a la próxima edición.')
}
```

- [ ] **Step 2: Verify TypeScript compiles**

Run:
```bash
npx tsc --noEmit
```
Expected: no errors referencing this file.

- [ ] **Step 3: Verify with a manual request (requires env vars + a real pending token)**

After running Task 2's manual subscribe call, copy the confirmation link from the received email
(or from `redis-cli get pending:<token>` if testing without email delivery), then:
```bash
curl -i http://localhost:3000/api/newsletter/confirm?token=<token>
```
Expected: `200` with HTML body "Listo. Quedaste suscrito...". Verify the contact now appears in
the Resend Audience dashboard.

If env vars are NOT set, skip step 3 and note it in the task report.

- [ ] **Step 4: Commit**

```bash
git add "src/app/api/newsletter/confirm/route.ts"
git commit -m "feat: add newsletter confirm API route"
```

---

### Task 4: Send route handler (admin-protected)

**Files:**
- Create: `src/app/api/newsletter/send/route.ts`

- [ ] **Step 1: Write the route handler**

```typescript
// src/app/api/newsletter/send/route.ts
import { NextRequest, NextResponse } from 'next/server'
import { getPostBySlug } from '@/lib/posts'
import { sendBroadcast } from '@/lib/newsletter'

export async function POST(request: NextRequest) {
  const adminToken = request.headers.get('x-admin-token')
  if (!adminToken || adminToken !== process.env.ADMIN_TOKEN) {
    return NextResponse.json({ error: 'No autorizado' }, { status: 401 })
  }

  const body = await request.json().catch(() => null)
  const slug = typeof body?.slug === 'string' ? body.slug : ''
  if (!slug) {
    return NextResponse.json({ error: 'Falta slug' }, { status: 400 })
  }

  const post = getPostBySlug(slug)
  if (!post) {
    return NextResponse.json({ error: 'Post no encontrado' }, { status: 404 })
  }

  const broadcastId = await sendBroadcast(
    { titulo: post.titulo, extracto: post.extracto, slug: post.slug },
    request.nextUrl.origin
  )

  if (!broadcastId) {
    return NextResponse.json({ error: 'Falló el envío del broadcast' }, { status: 500 })
  }

  return NextResponse.json({ ok: true, broadcastId })
}
```

- [ ] **Step 2: Verify TypeScript compiles**

Run:
```bash
npx tsc --noEmit
```
Expected: no errors referencing this file.

- [ ] **Step 3: Verify with a manual request (requires env vars)**

```bash
curl -X POST http://localhost:3000/api/newsletter/send -H "Content-Type: application/json" -d '{"slug":"algun-post-existente"}'
curl -X POST http://localhost:3000/api/newsletter/send -H "x-admin-token: token-incorrecto" -H "Content-Type: application/json" -d '{"slug":"algun-post-existente"}'
curl -X POST http://localhost:3000/api/newsletter/send -H "x-admin-token: $ADMIN_TOKEN" -H "Content-Type: application/json" -d '{"slug":"slug-que-no-existe"}'
curl -X POST http://localhost:3000/api/newsletter/send -H "x-admin-token: $ADMIN_TOKEN" -H "Content-Type: application/json" -d '{"slug":"algun-post-existente"}'
```
Expected: 1st call (no header) → `401`. 2nd call (wrong token) → `401`. 3rd call (bad slug, correct
token) → `404`. 4th call (correct token + real slug) → `200` with `{"ok":true,"broadcastId":"..."}`,
and the broadcast is visible/sent in the Resend dashboard.

If env vars are NOT set, skip step 3 and note it in the task report.

- [ ] **Step 4: Commit**

```bash
git add "src/app/api/newsletter/send/route.ts"
git commit -m "feat: add admin-protected newsletter send API route"
```

---

### Task 5: Wire SubscribeBox to the real API

**Files:**
- Modify: `src/components/editorial/SubscribeBox.tsx`

- [ ] **Step 1: Replace the local-only submit with a real fetch call and add loading/error state**

Replace the full file content with:

```tsx
'use client'

import { FormEvent, useId, useState } from 'react'

export interface SubscribeBoxProps {
  title?: string
  description?: string
  placeholder?: string
  buttonLabel?: string
  layout?: 'stacked' | 'inline'
}

export default function SubscribeBox({
  title = 'Recibir la próxima edición',
  description = 'Un correo sobrio cuando el mapa tenga una nueva ruta.',
  placeholder = 'tu@email.com',
  buttonLabel = 'Suscribirme',
  layout = 'stacked',
}: SubscribeBoxProps) {
  const [email, setEmail] = useState('')
  const [status, setStatus] = useState<'idle' | 'loading' | 'success' | 'error'>('idle')
  const emailId = useId()
  const isInline = layout === 'inline'

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault()
    if (!email.trim() || status === 'loading') return

    setStatus('loading')

    try {
      const response = await fetch('/api/newsletter/subscribe', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email }),
      })

      if (!response.ok) throw new Error('subscribe failed')
      setStatus('success')
    } catch {
      setStatus('error')
    }
  }

  return (
    <section
      className={[
        'soft-panel p-6',
        isInline ? 'grid gap-6 md:grid-cols-[0.9fr_1.1fr] md:items-end md:p-8' : '',
      ].join(' ')}
      aria-labelledby={`${emailId}-title`}
    >
      <div>
        <p className="ui-label mb-3">Newsletter</p>
        <h2
          id={`${emailId}-title`}
          className={[
            'serif-title leading-tight text-ink',
            isInline ? 'text-2xl md:text-3xl' : 'text-3xl',
          ].join(' ')}
        >
          {title}
        </h2>
        <p className="mt-3 max-w-xl text-sm leading-6 text-ink-soft">{description}</p>
      </div>

      <form className={['space-y-3', isInline ? 'md:space-y-4' : 'mt-6'].join(' ')} onSubmit={handleSubmit}>
        <label htmlFor={emailId} className="sr-only">
          Correo electrónico
        </label>
        <div className="flex flex-col gap-3 sm:flex-row">
          <input
            id={emailId}
            name="email"
            type="email"
            required
            value={email}
            placeholder={placeholder}
            onChange={(event) => {
              setEmail(event.target.value)
              setStatus('idle')
            }}
            className="min-h-12 flex-1 rounded-full border border-line bg-paper px-5 text-sm text-ink outline-none transition-colors focus:border-blue"
            aria-describedby={status !== 'idle' ? `${emailId}-status` : undefined}
          />
          <button
            type="submit"
            disabled={status === 'loading'}
            className="min-h-12 rounded-full border border-red bg-red px-6 text-sm font-semibold text-[var(--paper-soft)] shadow-sm transition-colors hover:border-sepia hover:bg-sepia disabled:opacity-60"
            style={{ color: 'var(--paper-soft)' }}
          >
            {status === 'loading' ? 'Enviando...' : buttonLabel}
          </button>
        </div>

        {status === 'success' ? (
          <p id={`${emailId}-status`} className="text-sm font-medium text-green" role="status">
            Listo. Revisá tu correo para confirmar la suscripción.
          </p>
        ) : null}
        {status === 'error' ? (
          <p id={`${emailId}-status`} className="text-sm font-medium text-red" role="status">
            Algo falló. Intentá de nuevo en un momento.
          </p>
        ) : null}
      </form>
    </section>
  )
}
```

- [ ] **Step 2: Verify TypeScript compiles**

Run:
```bash
npx tsc --noEmit
```
Expected: no errors referencing this file.

- [ ] **Step 3: Verify the build succeeds**

Run:
```bash
npm run build
```
Expected: build succeeds with no errors.

- [ ] **Step 4: Commit**

```bash
git add src/components/editorial/SubscribeBox.tsx
git commit -m "feat: wire SubscribeBox to real subscribe API"
```

---

### Task 6: Setup documentation

**Files:**
- Create: `docs/NEWSLETTER_SETUP.md`

- [ ] **Step 1: Write the setup doc**

```markdown
# Setup: suscripción newsletter

La suscripción usa Upstash Redis (tokens pendientes de confirmación) y Resend (email de
confirmación, Audience de suscriptores confirmados, envío de broadcasts). Sin configurar, el form
sigue funcionando pero no llega ningún email ni se guarda nada (falla en silencio).

## Variables de entorno nuevas

- `RESEND_API_KEY` — API key de tu cuenta Resend (https://resend.com/api-keys).
- `RESEND_AUDIENCE_ID` — id de la Audience donde se guardan los suscriptores confirmados
  (Resend dashboard → Audiences → crear una → copiar el id).
- `ADMIN_TOKEN` — string secreto elegido por vos, para proteger el endpoint de envío manual.

Reutiliza `UPSTASH_REDIS_REST_URL` / `UPSTASH_REDIS_REST_TOKEN` ya configuradas para el contador de
visitas (ver `docs/VIEW_COUNTER_SETUP.md`).

## Producción (Vercel)

1. Crear cuenta en https://resend.com si no se tiene.
2. Generar una API key y crear una Audience.
3. En el dashboard de Vercel, agregar `RESEND_API_KEY`, `RESEND_AUDIENCE_ID`, y `ADMIN_TOKEN` como
   env vars del proyecto.
4. Redesplegar para que las nuevas env vars tomen efecto.

## Desarrollo local

Agregar a `.env.local` (no versionado en git):

```
RESEND_API_KEY=re_...
RESEND_AUDIENCE_ID=...
ADMIN_TOKEN=elegí-un-string-secreto
```

Reiniciar `npm run dev`.

## Cómo mandar una edición

Una vez que tengas suscriptores confirmados en la Audience:

```bash
curl -X POST https://tu-sitio.com/api/newsletter/send \
  -H "x-admin-token: <tu ADMIN_TOKEN>" \
  -H "Content-Type: application/json" \
  -d '{"slug":"nombre-del-post"}'
```

Esto arma un email con título, extracto y link del post, y lo manda a toda la Audience confirmada
via Resend Broadcasts.
```

- [ ] **Step 2: Commit**

```bash
git add docs/NEWSLETTER_SETUP.md
git commit -m "docs: add newsletter subscription setup instructions"
```

---

## Spec coverage check

- Registro vía Resend (Audiences API) → Task 1 (`addConfirmedContact`)
- Envío manual disparado por endpoint admin → Task 4
- Doble opt-in (pending token + confirmación por email) → Task 1 (`createPendingSubscription`,
  `sendConfirmationEmail`), Task 3 (confirm handler)
- Auth admin por header `x-admin-token` → Task 4
- Módulos nuevos (`newsletter.ts`, 3 route handlers, `SubscribeBox` real) → Tasks 1-5
- Env vars nuevas documentadas → Task 6
- Manejo de errores (email inválido, token inválido/expirado, duplicado silencioso, 401/404/500) →
  Tasks 2, 3, 4
- Testing manual vía curl → Tasks 2-4, Step 3 de cada uno
- Fuera de alcance (envío automático, UI admin propia, unsubscribe custom) → no task creada,
  consistente con el spec
