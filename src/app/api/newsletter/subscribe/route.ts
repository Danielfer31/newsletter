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
