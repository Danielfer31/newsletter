'use client'

import { useEffect, useState, use } from 'react'
import { PublicComment } from '@/lib/comments'

export default function AdminCommentsPage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = use(params)
  const [comments, setComments] = useState<PublicComment[]>([])

  useEffect(() => {
    fetch(`/api/admin/comments/${slug}`)
      .then((r) => r.json())
      .then((data) => setComments(data.comments ?? []))
  }, [slug])

  async function handleDelete(id: string) {
    await fetch(`/api/admin/comment/${id}`, { method: 'DELETE' })
    setComments((cs) =>
      cs
        .filter((c) => c.id !== id)
        .map((c) => ({ ...c, replies: c.replies.filter((r) => r.id !== id) })),
    )
  }

  async function handleEdit(id: string, currentBody: string) {
    const body = prompt('Editar comentario', currentBody)
    if (body === null) return
    await fetch(`/api/admin/comment/${id}`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ body }),
    })
    setComments((cs) =>
      cs.map((c) =>
        c.id === id
          ? { ...c, body }
          : { ...c, replies: c.replies.map((r) => (r.id === id ? { ...r, body } : r)) },
      ),
    )
  }

  function renderComment(comment: PublicComment) {
    return (
      <div key={comment.id} className="border p-2 mb-2">
        <p><strong>{comment.name}</strong>: {comment.body}</p>
        <button onClick={() => handleEdit(comment.id, comment.body)}>Editar</button>
        <button onClick={() => handleDelete(comment.id)}>Eliminar</button>
        {comment.replies.length > 0 && (
          <div className="ml-6 mt-2">{comment.replies.map(renderComment)}</div>
        )}
      </div>
    )
  }

  return (
    <div className="max-w-2xl mx-auto mt-8">
      <h1 className="text-xl mb-4">Comentarios: {slug}</h1>
      {comments.map(renderComment)}
    </div>
  )
}
