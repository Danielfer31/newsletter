import { getAllPosts } from '@/lib/posts'
import { isCategory } from '@/lib/categories'
import { Category } from '@/types/post'
import CategoriesClient, { CategoryPostSummary } from './CategoriesClient'

type CategoriasPageProps = {
  searchParams?: Promise<{
    categoria?: string | string[]
  }>
}

export default async function CategoriasPage({ searchParams }: CategoriasPageProps) {
  const posts = getAllPosts()
  const params = await searchParams
  const requestedCategory = Array.isArray(params?.categoria) ? params?.categoria[0] : params?.categoria
  const initialCategory: Category | undefined =
    requestedCategory && isCategory(requestedCategory) ? requestedCategory : undefined

  const postCounts = posts.reduce<Record<Category, number>>(
    (counts, post) => {
      counts[post.categoria] += 1
      return counts
    },
    {
      geopolitica: 0,
      anime: 0,
      futbol: 0,
      musica: 0,
      opinion: 0,
      rpg: 0,
      cultura: 0,
    },
  )

  const postSummaries: CategoryPostSummary[] = posts.slice(0, 18).map((post) => ({
    slug: post.slug,
    title: post.titulo,
    category: post.categoria,
  }))

  return <CategoriesClient initialCategory={initialCategory} postCounts={postCounts} recentPosts={postSummaries} />
}
