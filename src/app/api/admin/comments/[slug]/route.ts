import { NextRequest, NextResponse } from 'next/server'
import { auth } from '@/lib/auth'
import { getComments } from '@/lib/comments'

export async function GET(request: NextRequest, { params }: { params: Promise<{ slug: string }> }) {
  const session = await auth()
  if (!session) return NextResponse.json({ error: 'No autorizado' }, { status: 401 })

  const { slug } = await params
  const comments = await getComments(slug)
  return NextResponse.json({ comments })
}
