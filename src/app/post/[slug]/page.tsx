import { getPostBySlug, getAllPosts } from '@/lib/posts'
import { notFound } from 'next/navigation'

export async function generateStaticParams() {
  const posts = getAllPosts()
  return posts.map(post => ({ slug: post.slug }))
}

export default async function PostPage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params
  const post = getPostBySlug(slug)
  if (!post) notFound()

  return (
    <div style={{ backgroundColor: post.tema?.fondo || '#0a0a0f', minHeight: '100vh', padding: '4rem 2rem' }}>
      <h1 style={{ color: 'var(--parchment)', fontFamily: 'var(--font-serif)', fontSize: '2.5rem' }}>
        {post.titulo}
      </h1>
      <p style={{ color: 'var(--gold)', marginTop: '1rem' }}>{post.categoria}</p>
      <div style={{ color: 'var(--parchment)', marginTop: '2rem', lineHeight: '1.8' }}>
        {post.contenido}
      </div>
    </div>
  )
}
