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

  const html = `<!DOCTYPE html>
<html lang="es">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Confirmá tu suscripción</title>
</head>
<body style="margin:0;padding:0;background:#f7f0e4;font-family:Arial,Helvetica,sans-serif;">
  <div style="display:none;max-height:0;overflow:hidden;mso-hide:all;">Solo falta un click para que el mapa te llegue por correo.</div>
  <table width="100%" cellpadding="0" cellspacing="0" border="0" style="background:#f7f0e4;">
    <tr>
      <td align="center" style="padding:40px 20px;">
        <table width="100%" cellpadding="0" cellspacing="0" border="0" style="max-width:600px;background:#fffaf1;border-radius:20px;overflow:hidden;box-shadow:0 20px 70px rgba(64,46,31,0.11);">
          <tr>
            <td style="padding:40px 32px 8px;text-align:center;">
              <p style="margin:0 0 8px;font-family:Georgia,'Times New Roman',serif;font-size:13px;letter-spacing:0.11em;text-transform:uppercase;color:#8f6d46;font-weight:700;">La Biblioteca de Apolo</p>
              <h1 style="margin:0;font-family:Georgia,'Times New Roman',serif;font-size:26px;color:#23201d;font-weight:600;line-height:1.3;">Confirmá tu suscripción</h1>
            </td>
          </tr>
          <tr>
            <td style="padding:24px 32px;color:#62594f;font-size:16px;line-height:1.7;">
              <p style="margin:0 0 16px;">Te pedimos un último paso para confirmar que querés recibir el mapa cuando salga una nueva edición.</p>
              <p style="margin:0 0 24px;text-align:center;">
                <a href="${confirmUrl}" style="display:inline-block;padding:14px 28px;background:#ad4f45;color:#fffaf1;text-decoration:none;border-radius:999px;font-weight:600;font-size:15px;">Confirmar mi suscripción</a>
              </p>
              <p style="margin:0;font-size:13px;color:#62594f;">Si el botón no funciona, copiá y pegá este link en tu navegador:<br><a href="${confirmUrl}" style="color:#2d7084;text-decoration:underline;">${confirmUrl}</a></p>
              <p style="margin:16px 0 0;font-size:13px;color:#62594f;">Si no solicitaste esto, podés ignorar este correo. El link expira en 24 horas.</p>
            </td>
          </tr>
          <tr>
            <td style="padding:24px 32px;background:#f7f0e4;text-align:center;color:#8f6d46;font-size:12px;line-height:1.6;font-family:Georgia,'Times New Roman',serif;">
              <p style="margin:0;">La Biblioteca de Apolo</p>
            </td>
          </tr>
        </table>
      </td>
    </tr>
  </table>
</body>
</html>`

  const { error } = await client.emails.send({
    from: FROM_EMAIL,
    to: email,
    subject: 'Confirmá tu suscripción',
    html,
  })

  if (error) console.error('sendConfirmationEmail failed:', error)
  return !error
}

export async function sendWelcomeEmail(email: string, siteUrl: string): Promise<boolean> {
  const client = getResendClient()
  if (!client) return false

  const html = `<!DOCTYPE html>
<html lang="es">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Bienvenido a La Biblioteca de Apolo</title>
</head>
<body style="margin:0;padding:0;background:#f7f0e4;font-family:Arial,Helvetica,sans-serif;">
  <div style="display:none;max-height:0;overflow:hidden;mso-hide:all;">Te damos la bienvenida a la biblioteca.</div>
  <table width="100%" cellpadding="0" cellspacing="0" border="0" style="background:#f7f0e4;">
    <tr>
      <td align="center" style="padding:40px 20px;">
        <table width="100%" cellpadding="0" cellspacing="0" border="0" style="max-width:600px;background:#fffaf1;border-radius:20px;overflow:hidden;box-shadow:0 20px 70px rgba(64,46,31,0.11);">
          <tr>
            <td style="padding:40px 32px 8px;text-align:center;">
              <p style="margin:0 0 8px;font-family:Georgia,'Times New Roman',serif;font-size:13px;letter-spacing:0.11em;text-transform:uppercase;color:#8f6d46;font-weight:700;">La Biblioteca de Apolo</p>
              <h1 style="margin:0;font-family:Georgia,'Times New Roman',serif;font-size:26px;color:#23201d;font-weight:600;line-height:1.3;">Te damos la bienvenida</h1>
            </td>
          </tr>
          <tr>
            <td style="padding:24px 32px;color:#62594f;font-size:16px;line-height:1.7;">
              <p style="margin:0 0 16px;">Quedaste suscrito. De ahora en adelante, cuando el mapa tenga una nueva ruta, te avisamos por acá.</p>
              <p style="margin:0 0 24px;">Mientras tanto, podés explorar las rutas que ya existen.</p>
              <p style="margin:0 0 24px;text-align:center;">
                <a href="${siteUrl}" style="display:inline-block;padding:14px 28px;background:#ad4f45;color:#fffaf1;text-decoration:none;border-radius:999px;font-weight:600;font-size:15px;">Ver el mapa</a>
              </p>
              <p style="margin:0;font-size:13px;color:#62594f;">¿Algo no funciona? Escribinos. Podés darte de baja en cualquier momento desde el link que incluimos en cada correo.</p>
            </td>
          </tr>
          <tr>
            <td style="padding:24px 32px;background:#f7f0e4;text-align:center;color:#8f6d46;font-size:12px;line-height:1.6;font-family:Georgia,'Times New Roman',serif;">
              <p style="margin:0;">La Biblioteca de Apolo</p>
            </td>
          </tr>
        </table>
      </td>
    </tr>
  </table>
</body>
</html>`

  const { error } = await client.emails.send({
    from: FROM_EMAIL,
    to: email,
    subject: 'Te damos la bienvenida a La Biblioteca de Apolo',
    html,
  })

  if (error) console.error('sendWelcomeEmail failed:', error)
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

  const html = `<!DOCTYPE html>
<html lang="es">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>${post.titulo}</title>
</head>
<body style="margin:0;padding:0;background:#f7f0e4;font-family:Arial,Helvetica,sans-serif;">
  <div style="display:none;max-height:0;overflow:hidden;mso-hide:all;">${post.extracto}</div>
  <table width="100%" cellpadding="0" cellspacing="0" border="0" style="background:#f7f0e4;">
    <tr>
      <td align="center" style="padding:40px 20px;">
        <table width="100%" cellpadding="0" cellspacing="0" border="0" style="max-width:600px;background:#fffaf1;border-radius:20px;overflow:hidden;box-shadow:0 20px 70px rgba(64,46,31,0.11);">
          <tr>
            <td style="padding:40px 32px 8px;text-align:center;">
              <p style="margin:0 0 8px;font-family:Georgia,'Times New Roman',serif;font-size:13px;letter-spacing:0.11em;text-transform:uppercase;color:#8f6d46;font-weight:700;">La Biblioteca de Apolo · Nueva edición</p>
              <h1 style="margin:0;font-family:Georgia,'Times New Roman',serif;font-size:26px;color:#23201d;font-weight:600;line-height:1.3;">${post.titulo}</h1>
            </td>
          </tr>
          <tr>
            <td style="padding:24px 32px;color:#62594f;font-size:16px;line-height:1.7;">
              <p style="margin:0 0 24px;">${post.extracto}</p>
              <p style="margin:0 0 24px;text-align:center;">
                <a href="${postUrl}" style="display:inline-block;padding:14px 28px;background:#ad4f45;color:#fffaf1;text-decoration:none;border-radius:999px;font-weight:600;font-size:15px;">Leer la ruta completa</a>
              </p>
              <p style="margin:0;font-size:13px;color:#62594f;">Si el botón no funciona, seguí por acá:<br><a href="${postUrl}" style="color:#2d7084;text-decoration:underline;">${postUrl}</a></p>
            </td>
          </tr>
          <tr>
            <td style="padding:24px 32px;background:#f7f0e4;text-align:center;color:#8f6d46;font-size:12px;line-height:1.6;font-family:Georgia,'Times New Roman',serif;">
              <p style="margin:0 0 4px;">La Biblioteca de Apolo</p>
              <p style="margin:0;color:#62594f;font-family:Arial,Helvetica,sans-serif;">Podés darte de baja en cualquier momento desde el link que incluimos en cada correo.</p>
            </td>
          </tr>
        </table>
      </td>
    </tr>
  </table>
</body>
</html>`

  const { data, error } = await client.broadcasts.create({
    audienceId,
    from: FROM_EMAIL,
    subject: post.titulo,
    html,
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
