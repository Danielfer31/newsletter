# Panel de Administración (Posts + Comentarios) Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Build a protected `/admin` panel that lets the site owner create/edit/delete posts (committing `.md` changes to GitHub) and moderate comments (edit/delete, with cascade delete of replies) stored in Redis.

**Architecture:** Auth.js (NextAuth v5) with a GitHub OAuth provider gates `/admin/*` and `/api/admin/*` via middleware, restricted to a single allowed username. Posts stay as `.md` files in `content/posts/`; the panel writes them via GitHub's REST API (Octokit) using the logged-in user's own OAuth access token, committing straight to `main` (Vercel auto-redeploys on push). Images upload to Vercel Blob Storage. Comments stay in Redis; the panel calls new `updateComment`/`deleteComment` functions directly — no redeploy needed for those.

**Tech Stack:** Next.js 16 (App Router), Auth.js v5 (`next-auth@beta`), `@octokit/rest`, `@vercel/blob`, `@upstash/redis` (existing), `gray-matter` (existing), Vitest (new — project has no test runner yet).

**Spec:** `docs/superpowers/specs/2026-07-02-panel-admin-design.md`

---

## File Structure

**New:**
- `vitest.config.ts` — test runner config
- `src/lib/auth.ts` — Auth.js config (GitHub provider, username allowlist, JWT callbacks)
- `src/middleware.ts` — protects `/admin/*` and `/api/admin/*`
- `src/app/api/auth/[...nextauth]/route.ts` — Auth.js route handler
- `src/lib/github.ts` — `commitPost`, `deletePost` (Octokit wrapper)
- `src/lib/github.test.ts` — unit tests (mocked Octokit)
- `src/lib/comments.test.ts` — unit tests for new `updateComment`/`deleteComment` (mocked Redis)
- `src/app/api/admin/comments/[slug]/route.ts` — `GET` (admin comment tree with ids)
- `src/app/api/admin/comments/[id]/route.ts` — `PATCH`, `DELETE`
- `src/app/api/admin/posts/route.ts` — `POST` (create)
- `src/app/api/admin/posts/[slug]/route.ts` — `PUT` (update), `DELETE`
- `src/app/api/admin/upload/route.ts` — `POST` (image upload to Blob)
- `src/components/admin/PostForm.tsx` — shared create/edit form
- `src/app/admin/login/page.tsx`
- `src/app/admin/page.tsx` — dashboard (post list + comment counts)
- `src/app/admin/posts/nuevo/page.tsx`
- `src/app/admin/posts/[slug]/editar/page.tsx`
- `src/app/admin/comments/[slug]/page.tsx`

**Modified:**
- `src/lib/comments.ts` — add `updateComment`, `deleteComment`
- `package.json` — add `next-auth`, `@octokit/rest`, `@vercel/blob`, `vitest`, `@vitejs/plugin-react` (devDep), `test` script

---

## Task 1: Vitest setup

**Files:**
- Create: `vitest.config.ts`
- Modify: `package.json`

- [ ] **Step 1: Install test deps**

Run: `npm install -D vitest @vitejs/plugin-react`

- [ ] **Step 2: Create vitest config**

```ts
// vitest.config.ts
import { defineConfig } from 'vitest/config'
import path from 'path'

export default defineConfig({
  test: {
    environment: 'node',
  },
  resolve: {
    alias: {
      '@': path.resolve(__dirname, './src'),
    },
  },
})
```

- [ ] **Step 3: Add test script**

In `package.json`, inside `"scripts"`, add:

```json
"test": "vitest run"
```

- [ ] **Step 4: Verify it runs with zero tests**

Run: `npm test`
Expected: `No test files found` (exit code may be 1 — that's fine, no tests exist yet). Confirms vitest itself loads and resolves `@/` alias.

- [ ] **Step 5: Commit**

```bash
git add vitest.config.ts package.json package-lock.json
git commit -m "chore: add vitest test runner"
```

---

## Task 2: `updateComment` in `src/lib/comments.ts`

**Files:**
- Modify: `src/lib/comments.ts`
- Test: `src/lib/comments.test.ts`

- [ ] **Step 1: Write the failing test**

```ts
// src/lib/comments.test.ts
import { describe, it, expect, vi, beforeEach } from 'vitest'

const mockRedis = {
  get: vi.fn(),
  set: vi.fn(),
  del: vi.fn(),
  zadd: vi.fn(),
  zrange: vi.fn(),
  zrem: vi.fn(),
}

vi.mock('@upstash/redis', () => ({
  Redis: vi.fn(() => mockRedis),
}))

process.env.UPSTASH_REDIS_REST_URL = 'https://fake.upstash.io'
process.env.UPSTASH_REDIS_REST_TOKEN = 'fake-token'

const { updateComment } = await import('./comments')

describe('updateComment', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  it('patches name and body, keeps other fields, and persists', async () => {
    const existing = {
      id: 'c1',
      slug: 'post-1',
      parentId: null,
      name: 'Old Name',
      email: 'a@b.com',
      body: 'old body',
      createdAt: 1000,
    }
    mockRedis.get.mockResolvedValueOnce(existing)

    const result = await updateComment('c1', { name: 'New Name' })

    expect(result).toEqual({ ...existing, name: 'New Name' })
    expect(mockRedis.set).toHaveBeenCalledWith('comment:c1', { ...existing, name: 'New Name' })
  })

  it('returns null when the comment does not exist', async () => {
    mockRedis.get.mockResolvedValueOnce(null)

    const result = await updateComment('missing', { body: 'x' })

    expect(result).toBeNull()
    expect(mockRedis.set).not.toHaveBeenCalled()
  })
})
```

- [ ] **Step 2: Run test to verify it fails**

Run: `npm test -- comments.test.ts`
Expected: FAIL — `updateComment is not exported` / not a function.

- [ ] **Step 3: Implement `updateComment`**

Add to `src/lib/comments.ts`, after `publishComment`:

```ts
export async function updateComment(
  id: string,
  patch: { name?: string; body?: string },
): Promise<Comment | null> {
  const client = getRedisClient()
  if (!client) return null

  const existing = await client.get<Comment>(commentKey(id))
  if (!existing) return null

  const updated: Comment = {
    ...existing,
    ...(patch.name !== undefined ? { name: patch.name } : {}),
    ...(patch.body !== undefined ? { body: patch.body } : {}),
  }

  await client.set(commentKey(id), updated)
  return updated
}
```

- [ ] **Step 4: Run test to verify it passes**

Run: `npm test -- comments.test.ts`
Expected: PASS (2 tests)

- [ ] **Step 5: Commit**

```bash
git add src/lib/comments.ts src/lib/comments.test.ts
git commit -m "feat: add updateComment to comments lib"
```

---

## Task 3: `deleteComment` (with reply cascade)

**Files:**
- Modify: `src/lib/comments.ts`
- Test: `src/lib/comments.test.ts`

- [ ] **Step 1: Write the failing tests**

Add to `src/lib/comments.test.ts`, inside a new `describe` block:

```ts
describe('deleteComment', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  it('deletes a top-level comment and cascades to its replies', async () => {
    const topLevel = {
      id: 'c1',
      slug: 'post-1',
      parentId: null,
      name: 'A',
      email: 'a@b.com',
      body: 'top',
      createdAt: 1000,
    }
    mockRedis.get.mockResolvedValueOnce(topLevel) // fetch the comment being deleted
    mockRedis.zrange.mockResolvedValueOnce(['r1', 'r2']) // reply ids

    const { deleteComment } = await import('./comments')
    await deleteComment('c1')

    expect(mockRedis.del).toHaveBeenCalledWith('comment:r1')
    expect(mockRedis.del).toHaveBeenCalledWith('comment:r2')
    expect(mockRedis.del).toHaveBeenCalledWith('replies:c1')
    expect(mockRedis.del).toHaveBeenCalledWith('comment:c1')
    expect(mockRedis.zrem).toHaveBeenCalledWith('comments:post-1', 'c1')
  })

  it('deletes a reply without touching siblings', async () => {
    const reply = {
      id: 'r1',
      slug: 'post-1',
      parentId: 'c1',
      name: 'B',
      email: 'b@c.com',
      body: 'reply',
      createdAt: 1500,
    }
    mockRedis.get.mockResolvedValueOnce(reply)

    const { deleteComment } = await import('./comments')
    await deleteComment('r1')

    expect(mockRedis.del).toHaveBeenCalledWith('comment:r1')
    expect(mockRedis.zrem).toHaveBeenCalledWith('replies:c1', 'r1')
    expect(mockRedis.zrem).not.toHaveBeenCalledWith('comments:post-1', 'r1')
  })

  it('no-ops when the comment does not exist', async () => {
    mockRedis.get.mockResolvedValueOnce(null)

    const { deleteComment } = await import('./comments')
    await deleteComment('missing')

    expect(mockRedis.del).not.toHaveBeenCalled()
  })
})
```

- [ ] **Step 2: Run test to verify it fails**

Run: `npm test -- comments.test.ts`
Expected: FAIL — `deleteComment is not exported`.

- [ ] **Step 3: Implement `deleteComment`**

Add to `src/lib/comments.ts`, after `updateComment`:

```ts
export async function deleteComment(id: string): Promise<void> {
  const client = getRedisClient()
  if (!client) return

  const comment = await client.get<Comment>(commentKey(id))
  if (!comment) return

  if (comment.parentId === null) {
    const replyIds = await client.zrange<string[]>(repliesKey(id), 0, -1)
    await Promise.all(replyIds.map((replyId) => client.del(commentKey(replyId))))
    await client.del(repliesKey(id))
    await client.zrem(topLevelKey(comment.slug), id)
  } else {
    await client.zrem(repliesKey(comment.parentId), id)
  }

  await client.del(commentKey(id))
}
```

- [ ] **Step 4: Run test to verify it passes**

Run: `npm test -- comments.test.ts`
Expected: PASS (5 tests total)

- [ ] **Step 5: Commit**

```bash
git add src/lib/comments.ts src/lib/comments.test.ts
git commit -m "feat: add deleteComment with reply cascade"
```

---

## Task 4: Auth.js setup (GitHub OAuth, username allowlist)

**Files:**
- Create: `src/lib/auth.ts`
- Create: `src/app/api/auth/[...nextauth]/route.ts`
- Modify: `package.json`

- [ ] **Step 1: Install Auth.js**

Run: `npm install next-auth@beta`

- [ ] **Step 2: Create a GitHub OAuth App**

Manual step (no code): go to GitHub → Settings → Developer settings → OAuth Apps → New OAuth App.
- Homepage URL: your site's production URL.
- Authorization callback URL: `https://<your-domain>/api/auth/callback/github` (and a second app, or just use `http://localhost:3000/api/auth/callback/github` for local dev).
- Note the Client ID and generate a Client Secret.

- [ ] **Step 3: Add env vars**

Add to `.env.local` (and to Vercel project env vars for production):

```
AUTH_GITHUB_ID=<client id from step 2>
AUTH_GITHUB_SECRET=<client secret from step 2>
AUTH_SECRET=<run: npx auth secret>
ADMIN_GITHUB_USERNAME=<your github username>
GITHUB_REPO_OWNER=<repo owner, e.g. Danielfer31>
GITHUB_REPO_NAME=<repo name, e.g. Newssleter>
GITHUB_REPO_BRANCH=main
```

- [ ] **Step 4: Write `src/lib/auth.ts`**

```ts
import NextAuth from 'next-auth'
import GitHub from 'next-auth/providers/github'

export const { handlers, auth, signIn, signOut } = NextAuth({
  providers: [
    GitHub({
      authorization: { params: { scope: 'read:user repo' } },
    }),
  ],
  callbacks: {
    async signIn({ profile }) {
      return profile?.login === process.env.ADMIN_GITHUB_USERNAME
    },
    async jwt({ token, account, profile }) {
      if (account && profile) {
        token.username = (profile as { login?: string }).login
        token.accessToken = account.access_token
      }
      return token
    },
    async session({ session, token }) {
      return {
        ...session,
        accessToken: token.accessToken as string,
        user: { ...session.user, username: token.username as string },
      }
    },
  },
  pages: {
    signIn: '/admin/login',
  },
})
```

- [ ] **Step 5: Write the route handler**

```ts
// src/app/api/auth/[...nextauth]/route.ts
import { handlers } from '@/lib/auth'

export const { GET, POST } = handlers
```

- [ ] **Step 6: Manual verification**

Run: `npm run dev`, visit `http://localhost:3000/api/auth/signin`, click GitHub, log in with the
`ADMIN_GITHUB_USERNAME` account. Expected: redirected back successfully. Then repeat with a
different GitHub account (or log out and use an incognito window) — expected: sign-in rejected.

- [ ] **Step 7: Commit**

```bash
git add src/lib/auth.ts "src/app/api/auth/[...nextauth]/route.ts" package.json package-lock.json
git commit -m "feat: add Auth.js GitHub OAuth with username allowlist"
```

---

## Task 5: Middleware protecting `/admin` and `/api/admin`

**Files:**
- Create: `src/middleware.ts`

- [ ] **Step 1: Write the middleware**

```ts
// src/middleware.ts
import { NextResponse } from 'next/server'
import { auth } from '@/lib/auth'

export default auth((req) => {
  const isLoginPage = req.nextUrl.pathname === '/admin/login'
  if (isLoginPage) return

  if (!req.auth) {
    return NextResponse.redirect(new URL('/admin/login', req.nextUrl))
  }
})

export const config = {
  matcher: ['/admin/:path*', '/api/admin/:path*'],
}
```

- [ ] **Step 2: Manual verification**

Run: `npm run dev`, visit `http://localhost:3000/admin` while logged out.
Expected: redirected to `/admin/login`. Log in, visit `/admin` again.
Expected: page loads (will 404 until Task 10 adds the page — that's fine, confirms no redirect loop).

- [ ] **Step 3: Commit**

```bash
git add src/middleware.ts
git commit -m "feat: protect /admin routes with auth middleware"
```

---

## Task 6: `src/lib/github.ts` — commit/delete posts via Octokit

**Files:**
- Create: `src/lib/github.ts`
- Test: `src/lib/github.test.ts`
- Modify: `package.json`

- [ ] **Step 1: Install Octokit**

Run: `npm install @octokit/rest`

- [ ] **Step 2: Write the failing tests**

```ts
// src/lib/github.test.ts
import { describe, it, expect, vi, beforeEach } from 'vitest'

const mockGetContent = vi.fn()
const mockCreateOrUpdate = vi.fn()
const mockDeleteFile = vi.fn()

vi.mock('@octokit/rest', () => ({
  Octokit: vi.fn(() => ({
    repos: {
      getContent: mockGetContent,
      createOrUpdateFileContents: mockCreateOrUpdate,
      deleteFile: mockDeleteFile,
    },
  })),
}))

process.env.GITHUB_REPO_OWNER = 'test-owner'
process.env.GITHUB_REPO_NAME = 'test-repo'
process.env.GITHUB_REPO_BRANCH = 'main'

const { commitPost, deletePost } = await import('./github')

describe('commitPost', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  it('creates a new file when it does not exist yet', async () => {
    mockGetContent.mockRejectedValueOnce({ status: 404 })

    await commitPost('my-slug', '---\ntitulo: x\n---\nbody', 'fake-token')

    expect(mockCreateOrUpdate).toHaveBeenCalledWith(
      expect.objectContaining({
        owner: 'test-owner',
        repo: 'test-repo',
        path: 'content/posts/my-slug.md',
        branch: 'main',
        message: 'docs: create post my-slug',
      }),
    )
    const call = mockCreateOrUpdate.mock.calls[0][0]
    expect(call.sha).toBeUndefined()
    expect(Buffer.from(call.content, 'base64').toString('utf-8')).toBe('---\ntitulo: x\n---\nbody')
  })

  it('updates an existing file using its current sha', async () => {
    mockGetContent.mockResolvedValueOnce({ data: { type: 'file', sha: 'abc123' } })

    await commitPost('my-slug', 'new content', 'fake-token')

    expect(mockCreateOrUpdate).toHaveBeenCalledWith(
      expect.objectContaining({ sha: 'abc123', message: 'docs: update post my-slug' }),
    )
  })
})

describe('deletePost', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  it('deletes the file using its current sha', async () => {
    mockGetContent.mockResolvedValueOnce({ data: { type: 'file', sha: 'abc123' } })

    await deletePost('my-slug', 'fake-token')

    expect(mockDeleteFile).toHaveBeenCalledWith(
      expect.objectContaining({
        path: 'content/posts/my-slug.md',
        sha: 'abc123',
        message: 'docs: delete post my-slug',
      }),
    )
  })

  it('throws when the file does not exist', async () => {
    mockGetContent.mockRejectedValueOnce({ status: 404 })

    await expect(deletePost('missing-slug', 'fake-token')).rejects.toThrow()
  })
})
```

- [ ] **Step 3: Run test to verify it fails**

Run: `npm test -- github.test.ts`
Expected: FAIL — `./github` module not found.

- [ ] **Step 4: Implement `src/lib/github.ts`**

```ts
import { Octokit } from '@octokit/rest'

const OWNER = process.env.GITHUB_REPO_OWNER!
const REPO = process.env.GITHUB_REPO_NAME!
const BRANCH = process.env.GITHUB_REPO_BRANCH || 'main'

function postPath(slug: string): string {
  return `content/posts/${slug}.md`
}

async function getFileSha(octokit: Octokit, path: string): Promise<string | null> {
  try {
    const { data } = await octokit.repos.getContent({ owner: OWNER, repo: REPO, path, ref: BRANCH })
    if (Array.isArray(data) || data.type !== 'file') return null
    return data.sha
  } catch (err) {
    if ((err as { status?: number }).status === 404) return null
    throw err
  }
}

export async function commitPost(slug: string, markdown: string, accessToken: string): Promise<void> {
  const octokit = new Octokit({ auth: accessToken })
  const path = postPath(slug)
  const sha = await getFileSha(octokit, path)

  await octokit.repos.createOrUpdateFileContents({
    owner: OWNER,
    repo: REPO,
    path,
    message: sha ? `docs: update post ${slug}` : `docs: create post ${slug}`,
    content: Buffer.from(markdown, 'utf-8').toString('base64'),
    branch: BRANCH,
    ...(sha ? { sha } : {}),
  })
}

export async function deletePost(slug: string, accessToken: string): Promise<void> {
  const octokit = new Octokit({ auth: accessToken })
  const path = postPath(slug)
  const sha = await getFileSha(octokit, path)
  if (!sha) throw new Error(`Post ${slug} no existe en el repo`)

  await octokit.repos.deleteFile({
    owner: OWNER,
    repo: REPO,
    path,
    message: `docs: delete post ${slug}`,
    sha,
    branch: BRANCH,
  })
}
```

- [ ] **Step 5: Run test to verify it passes**

Run: `npm test -- github.test.ts`
Expected: PASS (4 tests)

- [ ] **Step 6: Commit**

```bash
git add src/lib/github.ts src/lib/github.test.ts package.json package-lock.json
git commit -m "feat: add GitHub commit/delete wrapper for post persistence"
```

---

## Task 7: Admin comments API routes

**Files:**
- Create: `src/app/api/admin/comments/[slug]/route.ts`
- Create: `src/app/api/admin/comments/[id]/route.ts`

- [ ] **Step 1: Write the GET route (comment tree by slug)**

```ts
// src/app/api/admin/comments/[slug]/route.ts
import { NextRequest, NextResponse } from 'next/server'
import { auth } from '@/lib/auth'
import { getComments } from '@/lib/comments'

export async function GET(request: NextRequest, { params }: { params: Promise<{ slug: string }> }) {
  const session = await auth()
  if (!session) return NextResponse.json({ error: 'No autorizado' }, { status: 401 })

  const { slug } = await params
  const comments = await getComments(slug)
  return NextResponse.json({ comments })
}
```

- [ ] **Step 2: Write the PATCH/DELETE route (by comment id)**

```ts
// src/app/api/admin/comments/[id]/route.ts
import { NextRequest, NextResponse } from 'next/server'
import { revalidatePath } from 'next/cache'
import { auth } from '@/lib/auth'
import { updateComment, deleteComment } from '@/lib/comments'

export async function PATCH(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const session = await auth()
  if (!session) return NextResponse.json({ error: 'No autorizado' }, { status: 401 })

  const { id } = await params
  const body = await request.json().catch(() => null)
  if (!body || typeof body !== 'object') {
    return NextResponse.json({ error: 'Payload inválido' }, { status: 400 })
  }

  const name = typeof body.name === 'string' ? body.name : undefined
  const text = typeof body.body === 'string' ? body.body : undefined
  const updated = await updateComment(id, { name, body: text })

  if (!updated) return NextResponse.json({ error: 'No encontrado' }, { status: 404 })

  revalidatePath(`/post/${updated.slug}`)
  const { email, ...publicComment } = updated
  void email
  return NextResponse.json({ comment: publicComment })
}

export async function DELETE(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const session = await auth()
  if (!session) return NextResponse.json({ error: 'No autorizado' }, { status: 401 })

  const { id } = await params
  await deleteComment(id)
  return NextResponse.json({ status: 'deleted' })
}
```

- [ ] **Step 3: Manual verification**

Run: `npm run dev`, log in to `/admin`. With `curl` (send the session cookie from the browser, or
test via the UI built in Task 9), confirm:
- `GET /api/admin/comments/<slug>` returns the tree with `id` fields.
- `PATCH /api/admin/comments/<id>` with `{"body": "edited"}` updates it — refresh the public post
  page and see the change.
- `DELETE /api/admin/comments/<id>` on a top-level comment also removes its replies.

- [ ] **Step 4: Commit**

```bash
git add "src/app/api/admin/comments"
git commit -m "feat: add admin comment moderation API routes"
```

---

## Task 8: Admin posts API routes

**Files:**
- Create: `src/app/api/admin/posts/route.ts`
- Create: `src/app/api/admin/posts/[slug]/route.ts`

- [ ] **Step 1: Write the POST route (create)**

```ts
// src/app/api/admin/posts/route.ts
import { NextRequest, NextResponse } from 'next/server'
import matter from 'gray-matter'
import { auth } from '@/lib/auth'
import { getPostBySlug } from '@/lib/posts'
import { commitPost } from '@/lib/github'
import { PostFrontmatter } from '@/types/post'

export async function POST(request: NextRequest) {
  const session = await auth()
  if (!session?.accessToken) return NextResponse.json({ error: 'No autorizado' }, { status: 401 })

  const body = await request.json().catch(() => null)
  if (!body || typeof body.slug !== 'string' || typeof body.contenido !== 'string') {
    return NextResponse.json({ error: 'Payload inválido' }, { status: 400 })
  }

  const { slug, contenido, ...frontmatter } = body as { slug: string; contenido: string } & PostFrontmatter

  if (getPostBySlug(slug)) {
    return NextResponse.json({ error: 'Ya existe un post con ese slug' }, { status: 409 })
  }

  const markdown = matter.stringify(contenido, frontmatter)

  try {
    await commitPost(slug, markdown, session.accessToken)
  } catch (err) {
    console.error('commitPost failed:', err)
    return NextResponse.json({ error: 'No se pudo guardar en GitHub' }, { status: 502 })
  }

  return NextResponse.json({ status: 'created', slug })
}
```

- [ ] **Step 2: Write the PUT/DELETE route (edit/delete by slug)**

```ts
// src/app/api/admin/posts/[slug]/route.ts
import { NextRequest, NextResponse } from 'next/server'
import matter from 'gray-matter'
import { auth } from '@/lib/auth'
import { commitPost, deletePost } from '@/lib/github'
import { PostFrontmatter } from '@/types/post'

export async function PUT(request: NextRequest, { params }: { params: Promise<{ slug: string }> }) {
  const session = await auth()
  if (!session?.accessToken) return NextResponse.json({ error: 'No autorizado' }, { status: 401 })

  const { slug } = await params
  const body = await request.json().catch(() => null)
  if (!body || typeof body.contenido !== 'string') {
    return NextResponse.json({ error: 'Payload inválido' }, { status: 400 })
  }

  const { contenido, ...frontmatter } = body as { contenido: string } & PostFrontmatter
  const markdown = matter.stringify(contenido, frontmatter)

  try {
    await commitPost(slug, markdown, session.accessToken)
  } catch (err) {
    console.error('commitPost failed:', err)
    return NextResponse.json({ error: 'No se pudo guardar en GitHub' }, { status: 502 })
  }

  return NextResponse.json({ status: 'updated', slug })
}

export async function DELETE(request: NextRequest, { params }: { params: Promise<{ slug: string }> }) {
  const session = await auth()
  if (!session?.accessToken) return NextResponse.json({ error: 'No autorizado' }, { status: 401 })

  const { slug } = await params

  try {
    await deletePost(slug, session.accessToken)
  } catch (err) {
    console.error('deletePost failed:', err)
    return NextResponse.json({ error: 'No se pudo borrar en GitHub' }, { status: 502 })
  }

  return NextResponse.json({ status: 'deleted', slug })
}
```

- [ ] **Step 3: Manual verification**

Run: `npm run dev`, log in. Use the UI from Task 10-11 (or `curl` with the session cookie) to:
- Create a post with a brand-new slug → confirm a new commit appears on GitHub, wait for Vercel
  redeploy, confirm the post shows on the live site.
- Edit that post's `extracto` → confirm a new commit updates the same file.
- Delete it → confirm the file is removed from the repo.

- [ ] **Step 4: Commit**

```bash
git add "src/app/api/admin/posts"
git commit -m "feat: add admin post create/update/delete API routes"
```

---

## Task 9: Image upload route (Vercel Blob)

**Files:**
- Create: `src/app/api/admin/upload/route.ts`
- Modify: `package.json`

- [ ] **Step 1: Install `@vercel/blob`**

Run: `npm install @vercel/blob`

- [ ] **Step 2: Provision a Blob store**

Manual step: in the Vercel dashboard, project → Storage → Create → Blob. This auto-adds
`BLOB_READ_WRITE_TOKEN` to the project's env vars. Pull it locally with `vercel env pull .env.local`
(or copy it manually into `.env.local` for local dev).

- [ ] **Step 3: Write the upload route**

```ts
// src/app/api/admin/upload/route.ts
import { NextRequest, NextResponse } from 'next/server'
import { put } from '@vercel/blob'
import { auth } from '@/lib/auth'

export async function POST(request: NextRequest) {
  const session = await auth()
  if (!session) return NextResponse.json({ error: 'No autorizado' }, { status: 401 })

  const formData = await request.formData()
  const file = formData.get('file')
  if (!(file instanceof File)) {
    return NextResponse.json({ error: 'Falta el archivo' }, { status: 400 })
  }

  const blob = await put(file.name, file, { access: 'public', addRandomSuffix: true })
  return NextResponse.json({ url: blob.url })
}
```

- [ ] **Step 4: Manual verification**

Run: `npm run dev`, log in, `curl -F "file=@./public/images/placeholder-futbol.jpg" -b "<session cookie>" http://localhost:3000/api/admin/upload`.
Expected: JSON with a `url` pointing at `*.public.blob.vercel-storage.com`, and the image loads at that URL in a browser.

- [ ] **Step 5: Commit**

```bash
git add "src/app/api/admin/upload" package.json package-lock.json
git commit -m "feat: add image upload route via Vercel Blob"
```

---

## Task 10: `PostForm` shared component

**Files:**
- Create: `src/components/admin/PostForm.tsx`

- [ ] **Step 1: Write the component**

```tsx
// src/components/admin/PostForm.tsx
'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { Post, Category, Layout, FontStyle, MarginNote } from '@/types/post'

const CATEGORIES: Category[] = ['geopolitica', 'anime', 'futbol', 'musica', 'rpg', 'cultura', 'opinion']
const LAYOUTS: Layout[] = ['pergamino', 'cosmos', 'carta', 'tablero', 'manga']
const FONTS: FontStyle[] = ['serif', 'sans', 'mono', 'display']

type FormState = {
  slug: string
  titulo: string
  categoria: Category
  fecha: string
  imagen: string
  extracto: string
  cancion: string
  tema: { fondo: string; acento: string; fuente: FontStyle }
  layout: Layout
  ruta: string[]
  notasMargen: MarginNote[]
  contenido: string
}

function toFormState(post?: Post): FormState {
  const today = new Date().toISOString().slice(0, 10)
  return {
    slug: post?.slug ?? '',
    titulo: post?.titulo ?? '',
    categoria: post?.categoria ?? 'opinion',
    fecha: post?.fecha ?? today,
    imagen: post?.imagen ?? '',
    extracto: post?.extracto ?? '',
    cancion: post?.cancion ?? '',
    tema: post?.tema ?? { fondo: '#f4efe4', acento: '#596f45', fuente: 'sans' },
    layout: post?.layout ?? 'pergamino',
    ruta: post?.ruta ?? [],
    notasMargen: post?.notasMargen ?? [],
    contenido: post?.contenido ?? '',
  }
}

function slugify(titulo: string, fecha: string): string {
  const base = titulo
    .toLowerCase()
    .normalize('NFD')
    .replace(/[̀-ͯ]/g, '')
    .replace(/[^a-z0-9\s-]/g, '')
    .trim()
    .replace(/\s+/g, '-')
  return `${fecha}-${base}`
}

export function PostForm({ post }: { post?: Post }) {
  const router = useRouter()
  const isEditing = !!post
  const [form, setForm] = useState<FormState>(() => toFormState(post))
  const [error, setError] = useState<string | null>(null)
  const [saving, setSaving] = useState(false)

  async function handleImageUpload(file: File) {
    const body = new FormData()
    body.append('file', file)
    const res = await fetch('/api/admin/upload', { method: 'POST', body })
    if (!res.ok) {
      setError('No se pudo subir la imagen')
      return
    }
    const { url } = await res.json()
    setForm((f) => ({ ...f, imagen: url }))
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    setSaving(true)
    setError(null)

    const slug = isEditing ? form.slug : slugify(form.titulo, form.fecha)
    const { slug: _slug, ...frontmatterAndBody } = form
    void _slug

    const res = await fetch(isEditing ? `/api/admin/posts/${slug}` : '/api/admin/posts', {
      method: isEditing ? 'PUT' : 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(isEditing ? frontmatterAndBody : { ...frontmatterAndBody, slug }),
    })

    setSaving(false)

    if (!res.ok) {
      const data = await res.json().catch(() => ({}))
      setError(data.error ?? 'Error al guardar')
      return
    }

    router.push('/admin')
  }

  function updateNota(index: number, patch: Partial<MarginNote>) {
    setForm((f) => ({
      ...f,
      notasMargen: f.notasMargen.map((n, i) => (i === index ? { ...n, ...patch } : n)),
    }))
  }

  function updateRuta(index: number, value: string) {
    setForm((f) => ({ ...f, ruta: f.ruta.map((r, i) => (i === index ? value : r)) }))
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-4 max-w-2xl">
      {error && <p className="text-red-600">{error}</p>}

      <label className="block">
        Título
        <input
          className="block w-full border p-2"
          value={form.titulo}
          onChange={(e) => setForm((f) => ({ ...f, titulo: e.target.value }))}
          required
        />
      </label>

      <label className="block">
        Categoría
        <select
          className="block w-full border p-2"
          value={form.categoria}
          onChange={(e) => setForm((f) => ({ ...f, categoria: e.target.value as Category }))}
        >
          {CATEGORIES.map((c) => (
            <option key={c} value={c}>{c}</option>
          ))}
        </select>
      </label>

      <label className="block">
        Fecha
        <input
          type="date"
          className="block w-full border p-2"
          value={form.fecha}
          onChange={(e) => setForm((f) => ({ ...f, fecha: e.target.value }))}
          disabled={isEditing}
        />
      </label>

      <label className="block">
        Imagen
        <input
          type="file"
          accept="image/*"
          onChange={(e) => e.target.files?.[0] && handleImageUpload(e.target.files[0])}
        />
        {form.imagen && <img src={form.imagen} alt="preview" className="mt-2 h-32 object-cover" />}
      </label>

      <label className="block">
        Extracto
        <textarea
          className="block w-full border p-2"
          value={form.extracto}
          onChange={(e) => setForm((f) => ({ ...f, extracto: e.target.value }))}
          required
        />
      </label>

      <label className="block">
        Canción (URL, opcional)
        <input
          className="block w-full border p-2"
          value={form.cancion}
          onChange={(e) => setForm((f) => ({ ...f, cancion: e.target.value }))}
        />
      </label>

      <fieldset className="border p-2">
        <legend>Tema</legend>
        <label className="block">
          Fondo
          <input
            type="color"
            value={form.tema.fondo}
            onChange={(e) => setForm((f) => ({ ...f, tema: { ...f.tema, fondo: e.target.value } }))}
          />
        </label>
        <label className="block">
          Acento
          <input
            type="color"
            value={form.tema.acento}
            onChange={(e) => setForm((f) => ({ ...f, tema: { ...f.tema, acento: e.target.value } }))}
          />
        </label>
        <label className="block">
          Fuente
          <select
            value={form.tema.fuente}
            onChange={(e) => setForm((f) => ({ ...f, tema: { ...f.tema, fuente: e.target.value as FontStyle } }))}
          >
            {FONTS.map((fnt) => (
              <option key={fnt} value={fnt}>{fnt}</option>
            ))}
          </select>
        </label>
      </fieldset>

      <label className="block">
        Layout
        <select
          className="block w-full border p-2"
          value={form.layout}
          onChange={(e) => setForm((f) => ({ ...f, layout: e.target.value as Layout }))}
        >
          {LAYOUTS.map((l) => (
            <option key={l} value={l}>{l}</option>
          ))}
        </select>
      </label>

      <fieldset className="border p-2">
        <legend>Ruta (slugs relacionados)</legend>
        {form.ruta.map((r, i) => (
          <div key={i} className="flex gap-2">
            <input className="flex-1 border p-1" value={r} onChange={(e) => updateRuta(i, e.target.value)} />
            <button type="button" onClick={() => setForm((f) => ({ ...f, ruta: f.ruta.filter((_, idx) => idx !== i) }))}>
              Quitar
            </button>
          </div>
        ))}
        <button type="button" onClick={() => setForm((f) => ({ ...f, ruta: [...f.ruta, ''] }))}>
          + Agregar slug
        </button>
      </fieldset>

      <fieldset className="border p-2">
        <legend>Notas de margen</legend>
        {form.notasMargen.map((n, i) => (
          <div key={i} className="border p-2 mb-2">
            <input
              className="block w-full border p-1"
              placeholder="Título"
              value={n.title}
              onChange={(e) => updateNota(i, { title: e.target.value })}
            />
            <textarea
              className="block w-full border p-1"
              placeholder="Cuerpo"
              value={n.body}
              onChange={(e) => updateNota(i, { body: e.target.value })}
            />
            <button
              type="button"
              onClick={() => setForm((f) => ({ ...f, notasMargen: f.notasMargen.filter((_, idx) => idx !== i) }))}
            >
              Quitar nota
            </button>
          </div>
        ))}
        <button
          type="button"
          onClick={() => setForm((f) => ({ ...f, notasMargen: [...f.notasMargen, { title: '', body: '' }] }))}
        >
          + Agregar nota
        </button>
      </fieldset>

      <label className="block">
        Contenido (markdown)
        <textarea
          className="block w-full border p-2 h-64 font-mono"
          value={form.contenido}
          onChange={(e) => setForm((f) => ({ ...f, contenido: e.target.value }))}
          required
        />
      </label>

      <button type="submit" disabled={saving} className="border px-4 py-2">
        {saving ? 'Guardando…' : isEditing ? 'Guardar cambios' : 'Crear post'}
      </button>
    </form>
  )
}
```

- [ ] **Step 2: Commit**

```bash
git add src/components/admin/PostForm.tsx
git commit -m "feat: add shared PostForm component for create/edit"
```

---

## Task 11: Admin pages (login, dashboard, nuevo, editar, comments)

**Files:**
- Create: `src/app/admin/login/page.tsx`
- Create: `src/app/admin/page.tsx`
- Create: `src/app/admin/posts/nuevo/page.tsx`
- Create: `src/app/admin/posts/[slug]/editar/page.tsx`
- Create: `src/app/admin/comments/[slug]/page.tsx`

- [ ] **Step 1: Login page**

```tsx
// src/app/admin/login/page.tsx
import { signIn } from '@/lib/auth'

export default function LoginPage() {
  return (
    <div className="max-w-sm mx-auto mt-24 text-center">
      <h1 className="text-xl mb-4">Panel de administración</h1>
      <form
        action={async () => {
          'use server'
          await signIn('github', { redirectTo: '/admin' })
        }}
      >
        <button type="submit" className="border px-4 py-2">
          Login con GitHub
        </button>
      </form>
    </div>
  )
}
```

- [ ] **Step 2: Dashboard page**

```tsx
// src/app/admin/page.tsx
import Link from 'next/link'
import { getAllPosts } from '@/lib/posts'
import { getComments } from '@/lib/comments'

export default async function AdminDashboard() {
  const posts = getAllPosts()
  const counts = await Promise.all(
    posts.map(async (post) => {
      const comments = await getComments(post.slug)
      const total = comments.reduce((sum, c) => sum + 1 + c.replies.length, 0)
      return [post.slug, total] as const
    }),
  )
  const countBySlug = Object.fromEntries(counts)

  return (
    <div className="max-w-3xl mx-auto mt-8">
      <div className="flex justify-between items-center mb-4">
        <h1 className="text-xl">Posts</h1>
        <Link href="/admin/posts/nuevo" className="border px-3 py-1">+ Nuevo post</Link>
      </div>
      <table className="w-full text-left">
        <thead>
          <tr>
            <th>Título</th>
            <th>Categoría</th>
            <th>Fecha</th>
            <th>Comentarios</th>
            <th></th>
          </tr>
        </thead>
        <tbody>
          {posts.map((post) => (
            <tr key={post.slug} className="border-t">
              <td>{post.titulo}</td>
              <td>{post.categoria}</td>
              <td>{post.fecha}</td>
              <td>
                <Link href={`/admin/comments/${post.slug}`}>{countBySlug[post.slug] ?? 0}</Link>
              </td>
              <td>
                <Link href={`/admin/posts/${post.slug}/editar`}>Editar</Link>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  )
}
```

- [ ] **Step 3: New post page**

```tsx
// src/app/admin/posts/nuevo/page.tsx
import { PostForm } from '@/components/admin/PostForm'

export default function NewPostPage() {
  return (
    <div className="max-w-3xl mx-auto mt-8">
      <h1 className="text-xl mb-4">Nuevo post</h1>
      <PostForm />
    </div>
  )
}
```

- [ ] **Step 4: Edit post page**

```tsx
// src/app/admin/posts/[slug]/editar/page.tsx
import { notFound } from 'next/navigation'
import { getPostBySlug } from '@/lib/posts'
import { PostForm } from '@/components/admin/PostForm'

export default async function EditPostPage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params
  const post = getPostBySlug(slug)
  if (!post) notFound()

  return (
    <div className="max-w-3xl mx-auto mt-8">
      <h1 className="text-xl mb-4">Editar: {post.titulo}</h1>
      <PostForm post={post} />
    </div>
  )
}
```

- [ ] **Step 5: Comments moderation page**

```tsx
// src/app/admin/comments/[slug]/page.tsx
'use client'

import { useEffect, useState, use } from 'react'
import { PublicComment } from '@/lib/comments'

export default function AdminCommentsPage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = use(params)
  const [comments, setComments] = useState<PublicComment[]>([])

  useEffect(() => {
    fetch(`/api/admin/comments/${slug}`)
      .then((r) => r.json())
      .then((data) => setComments(data.comments ?? []))
  }, [slug])

  async function handleDelete(id: string) {
    await fetch(`/api/admin/comments/${id}`, { method: 'DELETE' })
    setComments((cs) =>
      cs
        .filter((c) => c.id !== id)
        .map((c) => ({ ...c, replies: c.replies.filter((r) => r.id !== id) })),
    )
  }

  async function handleEdit(id: string, currentBody: string) {
    const body = prompt('Editar comentario', currentBody)
    if (body === null) return
    await fetch(`/api/admin/comments/${id}`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ body }),
    })
    setComments((cs) =>
      cs.map((c) =>
        c.id === id
          ? { ...c, body }
          : { ...c, replies: c.replies.map((r) => (r.id === id ? { ...r, body } : r)) },
      ),
    )
  }

  function renderComment(comment: PublicComment) {
    return (
      <div key={comment.id} className="border p-2 mb-2">
        <p><strong>{comment.name}</strong>: {comment.body}</p>
        <button onClick={() => handleEdit(comment.id, comment.body)}>Editar</button>
        <button onClick={() => handleDelete(comment.id)}>Eliminar</button>
        {comment.replies.length > 0 && (
          <div className="ml-6 mt-2">{comment.replies.map(renderComment)}</div>
        )}
      </div>
    )
  }

  return (
    <div className="max-w-2xl mx-auto mt-8">
      <h1 className="text-xl mb-4">Comentarios: {slug}</h1>
      {comments.map(renderComment)}
    </div>
  )
}
```

- [ ] **Step 6: Manual end-to-end verification**

Run: `npm run dev`. Log in at `/admin/login`. From `/admin`:
- Create a post via `/admin/posts/nuevo`, confirm redirect to `/admin` and the new row appears
  after the GitHub commit lands (may need a page refresh once Vercel redeploy finishes in
  production; locally, `getAllPosts()` re-reads the filesystem on each request but the commit
  only changes the *remote* repo — to see the change locally you'd need to `git pull`, this is
  expected and documented in the spec's edge cases).
- Edit an existing post, change `extracto`, save, confirm a new commit was created.
- Delete a post, confirm removed from GitHub and from the dashboard list.
- Click a comment count, edit a comment's body, confirm the change API returns 200; delete a
  top-level comment with replies, confirm replies disappear from the list too.

- [ ] **Step 7: Commit**

```bash
git add src/app/admin
git commit -m "feat: add admin pages for posts CRUD and comment moderation"
```

---

## Self-Review Notes

- **Spec coverage:** Auth (Task 4-5), posts CRUD + GitHub commits (Task 6, 8, 10, 11), image
  upload (Task 9), comment moderation with cascade delete (Task 2-3, 7, 11) — all spec sections
  have a corresponding task.
- **Type consistency:** `updateComment`/`deleteComment` signatures match between `comments.ts`
  (Task 2-3) and their callers in the API routes (Task 7). `commitPost`/`deletePost` signatures
  match between `github.ts` (Task 6) and the posts API routes (Task 8).
- **Known limitation carried from spec:** editing a post's `fecha`/slug is disabled in the form
  (Task 10, `disabled={isEditing}`) since changing the slug would require renaming the file —
  matches the spec's documented limitation.
