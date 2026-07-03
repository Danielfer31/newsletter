import Link from 'next/link'
import { getAllPosts } from '@/lib/posts'
import { getComments } from '@/lib/comments'

export default async function AdminDashboard() {
  const posts = getAllPosts()
  const counts = await Promise.all(
    posts.map(async (post) => {
      const comments = await getComments(post.slug)
      const total = comments.reduce((sum, c) => sum + 1 + c.replies.length, 0)
      return [post.slug, total] as const
    }),
  )
  const countBySlug = Object.fromEntries(counts)

  return (
    <div className="max-w-3xl mx-auto mt-8">
      <div className="flex justify-between items-center mb-4">
        <h1 className="text-xl">Posts</h1>
        <Link href="/admin/posts/nuevo" className="border px-3 py-1">+ Nuevo post</Link>
      </div>
      <table className="w-full text-left">
        <thead>
          <tr>
            <th>Título</th>
            <th>Categoría</th>
            <th>Fecha</th>
            <th>Comentarios</th>
            <th></th>
          </tr>
        </thead>
        <tbody>
          {posts.map((post) => (
            <tr key={post.slug} className="border-t">
              <td>{post.titulo}</td>
              <td>{post.categoria}</td>
              <td>{post.fecha}</td>
              <td>
                <Link href={`/admin/comments/${post.slug}`}>{countBySlug[post.slug] ?? 0}</Link>
              </td>
              <td>
                <Link href={`/admin/posts/${post.slug}/editar`}>Editar</Link>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  )
}
