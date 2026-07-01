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
