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
