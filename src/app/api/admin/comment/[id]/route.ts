import { NextRequest, NextResponse } from 'next/server'
import { revalidatePath } from 'next/cache'
import { auth } from '@/lib/auth'
import { updateComment, deleteComment, MAX_BODY_LENGTH } from '@/lib/comments'

export async function PATCH(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const session = await auth()
  if (!session) return NextResponse.json({ error: 'No autorizado' }, { status: 401 })

  const { id } = await params
  const body = await request.json().catch(() => null)
  if (!body || typeof body !== 'object') {
    return NextResponse.json({ error: 'Payload inválido' }, { status: 400 })
  }

  const name = typeof body.name === 'string' ? body.name.trim() : undefined
  const text = typeof body.body === 'string' ? body.body.trim() : undefined

  // Validation mirrors the public POST route (src/app/api/comments/route.ts):
  // reject empty-after-trim or over-length edits so an admin edit can't blank
  // out or bloat a comment. A field left undefined (not sent) is left unchanged.
  if (name !== undefined && name === '') {
    return NextResponse.json({ error: 'Nombre inválido' }, { status: 400 })
  }
  if (text !== undefined && (text === '' || text.length > MAX_BODY_LENGTH)) {
    return NextResponse.json({ error: 'Comentario inválido' }, { status: 400 })
  }

  const updated = await updateComment(id, { name, body: text })

  if (!updated) return NextResponse.json({ error: 'No encontrado' }, { status: 404 })

  revalidatePath(`/post/${updated.slug}`)
  const { email, ...publicComment } = updated
  void email
  return NextResponse.json({ comment: publicComment })
}

export async function DELETE(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const session = await auth()
  if (!session) return NextResponse.json({ error: 'No autorizado' }, { status: 401 })

  const { id } = await params
  await deleteComment(id)
  return NextResponse.json({ status: 'deleted' })
}
