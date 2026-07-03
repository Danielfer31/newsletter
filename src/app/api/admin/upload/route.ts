import { NextRequest, NextResponse } from 'next/server'
import { put } from '@vercel/blob'
import { auth } from '@/lib/auth'

export async function POST(request: NextRequest) {
  const session = await auth()
  if (!session) return NextResponse.json({ error: 'No autorizado' }, { status: 401 })

  const formData = await request.formData()
  const file = formData.get('file')
  if (!(file instanceof File)) {
    return NextResponse.json({ error: 'Falta el archivo' }, { status: 400 })
  }
  if (!file.type.startsWith('image/')) {
    return NextResponse.json({ error: 'El archivo debe ser una imagen' }, { status: 400 })
  }

  const blob = await put(file.name, file, { access: 'public', addRandomSuffix: true })
  return NextResponse.json({ url: blob.url })
}
