import { Redis } from '@upstash/redis'
import { Resend } from 'resend'
import { randomUUID, createHmac, timingSafeEqual } from 'crypto'

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

const FROM_EMAIL = process.env.RESEND_FROM_EMAIL || 'La Biblioteca de Apolo <onboarding@resend.dev>'

const PENDING_TTL_SECONDS = 60 * 60 * 24 // 24h
const SESSION_MAX_AGE_SECONDS = 60 * 60 * 24 * 90 // 90d
export const SESSION_COOKIE = 'apolo_verified'
export const MAX_BODY_LENGTH = 2000

/** True when the persistence layer is available (Redis configured). */
export function isCommentsConfigured(): boolean {
  return getRedisClient() !== null
}

// ---------------------------------------------------------------------------
// Data model
// ---------------------------------------------------------------------------

export interface Comment {
  id: string
  slug: string
  parentId: string | null
  name: string
  /** Persisted but never exposed publicly. */
  email: string
  body: string
  createdAt: number
}

/** Shape stored under pending-comment:{token} — no id/createdAt yet. */
export interface PendingComment {
  slug: string
  parentId: string | null
  name: string
  email: string
  body: string
}

/** Public projection: email stripped, replies nested under top-level. */
export interface PublicComment {
  id: string
  slug: string
  parentId: string | null
  name: string
  body: string
  createdAt: number
  replies: PublicComment[]
}

function toPublic(comment: Comment, replies: PublicComment[] = []): PublicComment {
  return {
    id: comment.id,
    slug: comment.slug,
    parentId: comment.parentId,
    name: comment.name,
    body: comment.body,
    createdAt: comment.createdAt,
    replies,
  }
}

const commentKey = (id: string) => `comment:${id}`
const topLevelKey = (slug: string) => `comments:${slug}`
const repliesKey = (parentId: string) => `replies:${parentId}`
const pendingKey = (token: string) => `pending-comment:${token}`

// ---------------------------------------------------------------------------
// Pending comments (email-confirmation flow)
// ---------------------------------------------------------------------------

export async function createPendingComment(payload: PendingComment): Promise<string | null> {
  const client = getRedisClient()
  if (!client) return null

  const token = randomUUID()
  await client.set(pendingKey(token), payload, { ex: PENDING_TTL_SECONDS })
  return token
}

export async function getPendingComment(token: string): Promise<PendingComment | null> {
  const client = getRedisClient()
  if (!client) return null

  return client.get<PendingComment>(pendingKey(token))
}

export async function deletePendingComment(token: string): Promise<void> {
  const client = getRedisClient()
  if (!client) return

  await client.del(pendingKey(token))
}

// ---------------------------------------------------------------------------
// Publishing / reading
// ---------------------------------------------------------------------------

/**
 * Publish a comment. For replies, the parent must exist and itself be
 * top-level (single-level nesting) — otherwise returns null (silent 404).
 */
export async function publishComment(payload: PendingComment): Promise<Comment | null> {
  const client = getRedisClient()
  if (!client) return null

  if (payload.parentId) {
    const parent = await client.get<Comment>(commentKey(payload.parentId))
    // Parent missing/deleted, or parent is itself a reply → reject.
    if (!parent || parent.parentId) return null
  }

  const comment: Comment = {
    id: randomUUID(),
    slug: payload.slug,
    parentId: payload.parentId,
    name: payload.name,
    email: payload.email,
    body: payload.body,
    createdAt: Date.now(),
  }

  await client.set(commentKey(comment.id), comment)
  if (comment.parentId) {
    await client.zadd(repliesKey(comment.parentId), { score: comment.createdAt, member: comment.id })
  } else {
    await client.zadd(topLevelKey(comment.slug), { score: comment.createdAt, member: comment.id })
  }

  return comment
}

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

async function fetchComments(ids: string[]): Promise<Comment[]> {
  const client = getRedisClient()
  if (!client || ids.length === 0) return []

  const results = await Promise.all(ids.map((id) => client.get<Comment>(commentKey(id))))
  return results.filter((c): c is Comment => c !== null)
}

/** All top-level comments for a slug, chronological, with nested replies. */
export async function getComments(slug: string): Promise<PublicComment[]> {
  const client = getRedisClient()
  if (!client) return []

  const topIds = await client.zrange<string[]>(topLevelKey(slug), 0, -1)
  const topComments = await fetchComments(topIds)

  return Promise.all(
    topComments.map(async (comment) => {
      const replyIds = await client.zrange<string[]>(repliesKey(comment.id), 0, -1)
      const replies = await fetchComments(replyIds)
      return toPublic(
        comment,
        replies.map((r) => toPublic(r)),
      )
    }),
  )
}

// ---------------------------------------------------------------------------
// Session cookie (HMAC-signed, no user table)
// ---------------------------------------------------------------------------

function getSessionSecret(): string | null {
  return process.env.COMMENT_SESSION_SECRET || null
}

function sign(payload: string): string {
  const secret = getSessionSecret()
  if (!secret) return ''
  return createHmac('sha256', secret).update(payload).digest('hex')
}

/**
 * Cookie value: base64(email).iat.hmac(email + '.' + iat).
 * iat is embedded so the signature can be recomputed on verify.
 */
export function signSession(email: string): string | null {
  if (!getSessionSecret()) return null
  const iat = Date.now().toString()
  const b64 = Buffer.from(email).toString('base64url')
  const sig = sign(`${email}.${iat}`)
  return `${b64}.${iat}.${sig}`
}

/** Returns the verified email, or null if the cookie is absent/tampered. */
export function verifySession(value: string | undefined): string | null {
  if (!value || !getSessionSecret()) return null

  const parts = value.split('.')
  if (parts.length !== 3) return null
  const [b64, iat, sig] = parts

  let email: string
  try {
    email = Buffer.from(b64, 'base64url').toString('utf8')
  } catch {
    return null
  }

  const expected = sign(`${email}.${iat}`)
  const sigBuf = Buffer.from(sig)
  const expBuf = Buffer.from(expected)
  if (sigBuf.length !== expBuf.length) return null
  if (!timingSafeEqual(sigBuf, expBuf)) return null

  return email
}

export const sessionCookieOptions = {
  httpOnly: true,
  secure: process.env.NODE_ENV === 'production',
  sameSite: 'lax' as const,
  path: '/',
  maxAge: SESSION_MAX_AGE_SECONDS,
}

// ---------------------------------------------------------------------------
// Email
// ---------------------------------------------------------------------------

function escapeHtml(text: string): string {
  return text
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
}

export async function sendCommentConfirmationEmail(
  email: string,
  token: string,
  siteUrl: string,
  preview: string,
): Promise<boolean> {
  const client = getResendClient()
  if (!client) return false

  const confirmUrl = `${siteUrl}/api/comments/confirm?token=${token}`

  const { error } = await client.emails.send({
    from: FROM_EMAIL,
    to: email,
    subject: 'Confirmá tu comentario',
    html:
      `<p>Recibimos tu comentario:</p>` +
      `<blockquote style="border-left:3px solid #ccc;padding-left:12px;color:#555;">${escapeHtml(preview)}</blockquote>` +
      `<p>Hacé click para publicarlo (y quedar suscrito al newsletter):</p>` +
      `<p><a href="${confirmUrl}">${confirmUrl}</a></p>`,
  })

  if (error) console.error('sendCommentConfirmationEmail failed:', error)
  return !error
}
