import { NextRequest, NextResponse } from 'next/server'
import matter from 'gray-matter'
import { auth } from '@/lib/auth'
import { getPostBySlug } from '@/lib/posts'
import { commitPost } from '@/lib/github'
import { PostFrontmatter } from '@/types/post'

export async function POST(request: NextRequest) {
  const session = await auth()
  if (!session?.accessToken) return NextResponse.json({ error: 'No autorizado' }, { status: 401 })

  const body = await request.json().catch(() => null)
  if (!body || typeof body.slug !== 'string' || typeof body.contenido !== 'string') {
    return NextResponse.json({ error: 'Payload inválido' }, { status: 400 })
  }

  const { slug, contenido, ...frontmatter } = body as { slug: string; contenido: string } & PostFrontmatter

  if (getPostBySlug(slug)) {
    return NextResponse.json({ error: 'Ya existe un post con ese slug' }, { status: 409 })
  }

  const markdown = matter.stringify(contenido, frontmatter)

  try {
    await commitPost(slug, markdown, session.accessToken)
  } catch (err) {
    console.error('commitPost failed:', err)
    return NextResponse.json({ error: 'No se pudo guardar en GitHub' }, { status: 502 })
  }

  return NextResponse.json({ status: 'created', slug })
}
