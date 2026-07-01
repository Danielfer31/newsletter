import type { Metadata } from 'next'
import { notFound } from 'next/navigation'
import { CATEGORY_META, CATEGORY_ORDER, isCategory } from '@/lib/categories'
import { getPostsByCategory } from '@/lib/posts'
import type { Category } from '@/types/post'
import RouteWorld from './RouteWorld'

type RoutePageProps = {
  params: Promise<{
    category: string
  }>
}

export function generateStaticParams(): { category: Category }[] {
  return CATEGORY_ORDER.map((category) => ({ category }))
}

export async function generateMetadata({
  params,
}: RoutePageProps): Promise<Metadata> {
  const { category: rawCategory } = await params

  if (!isCategory(rawCategory)) {
    return {
      title: 'Ruta no encontrada — La Biblioteca de Apolo',
    }
  }

  const meta = CATEGORY_META[rawCategory]

  return {
    title: `${meta.label} — La Biblioteca de Apolo`,
    description: meta.routeExperience.deck,
  }
}

export default async function RoutePage({ params }: RoutePageProps) {
  const { category: rawCategory } = await params

  if (!isCategory(rawCategory)) {
    notFound()
  }

  const posts = getPostsByCategory(rawCategory)

  return <RouteWorld category={rawCategory} posts={posts} />
}
