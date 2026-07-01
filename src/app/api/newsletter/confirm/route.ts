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
