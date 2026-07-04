import { NextRequest, NextResponse } from 'next/server'
import { revalidatePath } from 'next/cache'
import {
  getPendingComment,
  deletePendingComment,
  publishComment,
  signSession,
  sessionCookieOptions,
  SESSION_COOKIE,
} from '@/lib/comments'
import { addConfirmedContact } from '@/lib/newsletter'

function errorPage(title: string, message: string): Response {
  return new Response(
    `<!doctype html><html lang="es"><head><meta charset="utf-8"><title>${title}</title></head>` +
      `<body style="font-family: sans-serif; text-align: center; padding: 4rem;">` +
      `<h1>${title}</h1><p>${message}</p></body></html>`,
    { status: 400, headers: { 'Content-Type': 'text/html; charset=utf-8' } },
  )
}

export async function GET(request: NextRequest) {
  const token = request.nextUrl.searchParams.get('token')

  if (!token) {
    return errorPage('Enlace inválido', 'Falta el token de confirmación.')
  }

  const pending = await getPendingComment(token)
  if (!pending) {
    return errorPage('Este link expiró', 'Comentá de nuevo desde el artículo.')
  }

  const published = await publishComment(pending)
  await deletePendingComment(token)

  if (!published) {
    // Parent comment was deleted before confirmation, or persistence failed.
    return errorPage('No pudimos publicar', 'El comentario ya no está disponible. Intentá de nuevo.')
  }

  await addConfirmedContact(pending.email)
  revalidatePath(`/post/${published.slug}`)

  const redirectUrl = new URL(`/post/${published.slug}#comment-${published.id}`, request.nextUrl.origin)
  const response = NextResponse.redirect(redirectUrl)

  const sessionValue = signSession(pending.email)
  if (sessionValue) {
    response.cookies.set(SESSION_COOKIE, sessionValue, sessionCookieOptions)
  }

  return response
}
