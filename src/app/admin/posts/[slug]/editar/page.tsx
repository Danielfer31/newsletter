import { notFound } from 'next/navigation'
import { getPostBySlug } from '@/lib/posts'
import { PostForm } from '@/components/admin/PostForm'

export default async function EditPostPage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params
  const post = getPostBySlug(slug)
  if (!post) notFound()

  return (
    <div className="max-w-3xl mx-auto mt-8">
      <h1 className="text-xl mb-4">Editar: {post.titulo}</h1>
      <PostForm post={post} />
    </div>
  )
}
