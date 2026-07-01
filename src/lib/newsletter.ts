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

const FROM_EMAIL = process.env.RESEND_FROM_EMAIL || 'La Biblioteca de Apolo <onboarding@resend.dev>'

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
    from: FROM_EMAIL,
    to: email,
    subject: 'Confirmá tu suscripción',
    html: `<p>Hacé click para confirmar tu suscripción:</p><p><a href="${confirmUrl}">${confirmUrl}</a></p>`,
  })

  if (error) console.error('sendConfirmationEmail failed:', error)
  return !error
}

export async function addConfirmedContact(email: string): Promise<boolean> {
  const client = getResendClient()
  const audienceId = process.env.RESEND_AUDIENCE_ID
  if (!client || !audienceId) return false

  const { error } = await client.contacts.create({ email, audienceId })

  // A duplicate-contact error is treated as success (idempotent confirm).
  if (error && !error.message?.toLowerCase().includes('already exists')) {
    console.error('addConfirmedContact failed:', error)
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
    from: FROM_EMAIL,
    subject: post.titulo,
    html: `<h1>${post.titulo}</h1><p>${post.extracto}</p><p><a href="${postUrl}">${postUrl}</a></p>`,
  })

  if (error || !data) {
    console.error('sendBroadcast failed:', error)
    return null
  }

  const { error: sendError } = await client.broadcasts.send(data.id)
  if (sendError) {
    console.error('sendBroadcast failed:', sendError)
    return null
  }

  return data.id
}
