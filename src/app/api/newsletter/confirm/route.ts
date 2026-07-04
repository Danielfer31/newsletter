import { NextRequest, NextResponse } from 'next/server'
import { getPendingEmail, deletePendingSubscription, addConfirmedContact, sendWelcomeEmail } from '@/lib/newsletter'
import { signSession, sessionCookieOptions, SESSION_COOKIE } from '@/lib/comments'

function htmlPage(title: string, message: string, isSuccess = false): NextResponse {
  const accentColor = isSuccess ? '#617a4f' : '#ad4f45'
  const html = `<!DOCTYPE html>
<html lang="es">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>${title}</title>
</head>
<body style="margin:0;padding:0;background:#f7f0e4;font-family:Arial,Helvetica,sans-serif;min-height:100vh;display:flex;align-items:center;justify-content:center;">
  <table width="100%" cellpadding="0" cellspacing="0" border="0" style="background:#f7f0e4;">
    <tr>
      <td align="center" style="padding:40px 20px;">
        <table width="100%" cellpadding="0" cellspacing="0" border="0" style="max-width:480px;background:#fffaf1;border-radius:20px;overflow:hidden;box-shadow:0 20px 70px rgba(64,46,31,0.11);">
          <tr>
            <td style="padding:48px 32px 8px;text-align:center;">
              <p style="margin:0 0 12px;font-family:Georgia,'Times New Roman',serif;font-size:13px;letter-spacing:0.11em;text-transform:uppercase;color:#8f6d46;font-weight:700;">La Biblioteca de Apolo</p>
              <h1 style="margin:0;font-family:Georgia,'Times New Roman',serif;font-size:28px;color:${accentColor};font-weight:600;line-height:1.3;">${title}</h1>
            </td>
          </tr>
          <tr>
            <td style="padding:20px 32px 48px;text-align:center;color:#62594f;font-size:16px;line-height:1.7;">
              <p style="margin:0;">${message}</p>
            </td>
          </tr>
        </table>
      </td>
    </tr>
  </table>
</body>
</html>`

  return new NextResponse(html, { headers: { 'Content-Type': 'text/html; charset=utf-8' } })
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

  // Enviar email de bienvenida en background (no bloquea la respuesta)
  sendWelcomeEmail(email, request.nextUrl.origin).catch((err) => {
    console.error('Welcome email failed:', err)
  })

  const response = htmlPage(
    'Listo',
    'Quedaste suscrito a la próxima edición. Ya podés comentar sin volver a confirmar tu email.',
    true,
  )

  // El email ya quedó verificado por doble opt-in — reutilizamos la misma
  // sesión de comentarios para que no tenga que reconfirmar al comentar.
  const sessionValue = signSession(email)
  if (sessionValue) {
    response.cookies.set(SESSION_COOKIE, sessionValue, sessionCookieOptions)
  }

  return response
}
