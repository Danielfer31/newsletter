import { NextRequest, NextResponse } from 'next/server'
import { incrementViews, getViews } from '@/lib/views'

export async function POST(
  _request: NextRequest,
  { params }: { params: Promise<{ slug: string }> }
) {
  const { slug } = await params
  const views = await incrementViews(slug)
  return NextResponse.json({ views })
}

export async function GET(
  _request: NextRequest,
  { params }: { params: Promise<{ slug: string }> }
) {
  const { slug } = await params
  const views = await getViews(slug)
  return NextResponse.json({ views })
}
