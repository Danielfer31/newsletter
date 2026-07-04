import { NextRequest, NextResponse } from 'next/server'
import { revalidatePath } from 'next/cache'
import {
  isCommentsConfigured,
  createPendingComment,
  publishComment,
  sendCommentConfirmationEmail,
  verifySession,
  getComments,
  SESSION_COOKIE,
  MAX_BODY_LENGTH,
  PendingComment,
} from '@/lib/comments'
import { addConfirmedContact } from '@/lib/newsletter'

const EMAIL_REGEX = /^[^\s@]+@[^\s@]+\.[^\s@]+$/

export async function GET(request: NextRequest) {
  const slug = request.nextUrl.searchParams.get('slug')?.trim()
  if (!slug) {
    return NextResponse.json({ error: 'Falta slug' }, { status: 400 })
  }
  const comments = await getComments(slug)
  return NextResponse.json({ comments })
}

export async function POST(request: NextRequest) {
  if (!isCommentsConfigured()) {
    return NextResponse.json({ error: 'Comentarios no disponibles' }, { status: 503 })
  }

  const body = await request.json().catch(() => null)
  if (!body || typeof body !== 'object') {
    return NextResponse.json({ error: 'Payload inválido' }, { status: 400 })
  }

  // Honeypot: any content in `website` means a bot. Respond 200 with a
  // pending-looking payload so the bot can't learn it was rejected.
  if (typeof body.website === 'string' && body.website.trim() !== '') {
    return NextResponse.json({ status: 'pending' })
  }

  const slug = typeof body.slug === 'string' ? body.slug.trim() : ''
  const name = typeof body.name === 'string' ? body.name.trim() : ''
  const commentBody = typeof body.body === 'string' ? body.body.trim() : ''
  const parentId = typeof body.parentId === 'string' && body.parentId ? body.parentId : null
  const submittedEmail = typeof body.email === 'string' ? body.email.trim() : ''

  if (!slug || !name) {
    return NextResponse.json({ error: 'Faltan datos' }, { status: 400 })
  }
  if (!commentBody || commentBody.length > MAX_BODY_LENGTH) {
    return NextResponse.json({ error: 'Comentario inválido' }, { status: 400 })
  }

  // A valid session cookie whose email matches (or omitted email) → publish direct.
  const cookieEmail = verifySession(request.cookies.get(SESSION_COOKIE)?.value)
  const sessionValid = cookieEmail !== null && (!submittedEmail || submittedEmail === cookieEmail)

  if (sessionValid && cookieEmail) {
    const published = await publishComment({
      slug,
      parentId,
      name,
      email: cookieEmail,
      body: commentBody,
    })

    // Reply to a missing/deleted parent → silent 404.
    if (!published) {
      return NextResponse.json({ error: 'No encontrado' }, { status: 404 })
    }

    await addConfirmedContact(cookieEmail)
    revalidatePath(`/post/${slug}`)

    const { email, ...publicComment } = published
    void email // never expose the email in the public response
    return NextResponse.json({ status: 'published', comment: publicComment })
  }

  // No valid session → require a valid email and send confirmation.
  if (!submittedEmail || !EMAIL_REGEX.test(submittedEmail)) {
    return NextResponse.json({ error: 'Email inválido' }, { status: 400 })
  }

  const payload: PendingComment = {
    slug,
    parentId,
    name,
    email: submittedEmail,
    body: commentBody,
  }

  const token = await createPendingComment(payload)
  if (token) {
    await sendCommentConfirmationEmail(submittedEmail, token, request.nextUrl.origin, commentBody)
  }

  return NextResponse.json({ status: 'pending' })
}
