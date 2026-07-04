'use client'

import { FormEvent, useEffect, useId, useRef, useState } from 'react'
import type { PublicComment } from '@/lib/comments'

export interface CommentsProps {
  slug: string
  /** True when the reader already has a valid session cookie. */
  verified: boolean
  /** Whether the persistence layer is available. */
  available: boolean
  initialComments: PublicComment[]
}

const MAX_BODY_LENGTH = 2000

function formatDate(ts: number): string {
  return new Date(ts).toLocaleDateString('es', { day: 'numeric', month: 'long', year: 'numeric' })
}

interface CommentFormProps {
  slug: string
  verified: boolean
  parentId?: string
  onPublished: (comment: PublicComment) => void
  compact?: boolean
}

function CommentForm({ slug, verified, parentId, onPublished, compact }: CommentFormProps) {
  const [name, setName] = useState('')
  const [email, setEmail] = useState('')
  const [text, setText] = useState('')
  const [website, setWebsite] = useState('') // honeypot
  const [status, setStatus] = useState<'idle' | 'loading' | 'published' | 'pending' | 'error'>('idle')
  const fieldId = useId()

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault()
    if (!name.trim() || !text.trim() || status === 'loading') return
    if (text.length > MAX_BODY_LENGTH) {
      setStatus('error')
      return
    }

    setStatus('loading')
    try {
      const response = await fetch('/api/comments', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          slug,
          name,
          email: verified ? undefined : email,
          body: text,
          parentId,
          website,
        }),
      })

      if (!response.ok) throw new Error('comment failed')
      const data = (await response.json()) as { status: string; comment?: PublicComment }

      if (data.status === 'published' && data.comment) {
        onPublished(data.comment)
        setName('')
        setEmail('')
        setText('')
        setStatus('published')
      } else {
        setStatus('pending')
      }
    } catch {
      setStatus('error')
    }
  }

  return (
    <form className={compact ? 'mt-4 space-y-3' : 'space-y-3'} onSubmit={handleSubmit}>
      <div className="flex flex-col gap-3 sm:flex-row">
        <input
          type="text"
          required
          value={name}
          placeholder="Tu nombre"
          onChange={(event) => {
            setName(event.target.value)
            setStatus('idle')
          }}
          className="min-h-12 flex-1 rounded-full border border-line bg-paper px-5 text-sm text-ink outline-none transition-colors focus:border-blue"
        />
        {!verified ? (
          <input
            type="email"
            required
            value={email}
            placeholder="tu@email.com"
            onChange={(event) => {
              setEmail(event.target.value)
              setStatus('idle')
            }}
            className="min-h-12 flex-1 rounded-full border border-line bg-paper px-5 text-sm text-ink outline-none transition-colors focus:border-blue"
          />
        ) : null}
      </div>

      {/* Honeypot — hidden from humans, tempting for bots. */}
      <div aria-hidden="true" style={{ position: 'absolute', left: '-9999px' }}>
        <label htmlFor={`${fieldId}-website`}>No completar</label>
        <input
          id={`${fieldId}-website`}
          type="text"
          tabIndex={-1}
          autoComplete="off"
          value={website}
          onChange={(event) => setWebsite(event.target.value)}
        />
      </div>

      <textarea
        required
        rows={compact ? 3 : 4}
        maxLength={MAX_BODY_LENGTH}
        value={text}
        placeholder="Escribí tu comentario…"
        onChange={(event) => {
          setText(event.target.value)
          setStatus('idle')
        }}
        className="w-full rounded-2xl border border-line bg-paper px-5 py-3 text-sm text-ink outline-none transition-colors focus:border-blue"
      />

      <div className="flex flex-wrap items-center gap-3">
        <button
          type="submit"
          disabled={status === 'loading'}
          className="min-h-11 rounded-full border border-red bg-red px-6 text-sm font-semibold shadow-sm transition-colors hover:border-sepia hover:bg-sepia disabled:opacity-60"
          style={{ color: 'var(--paper-soft)' }}
        >
          {status === 'loading' ? 'Enviando…' : parentId ? 'Responder' : 'Comentar'}
        </button>

        {status === 'pending' ? (
          <p className="text-sm font-medium text-green" role="status">
            Revisá tu correo para confirmar tu comentario.
          </p>
        ) : null}
        {status === 'published' ? (
          <p className="text-sm font-medium text-green" role="status">
            Comentario publicado.
          </p>
        ) : null}
        {status === 'error' ? (
          <p className="text-sm font-medium text-red" role="status">
            Algo falló. Intentá de nuevo en un momento.
          </p>
        ) : null}
      </div>
    </form>
  )
}

function CommentItem({
  comment,
  slug,
  verified,
  onReplyPublished,
}: {
  comment: PublicComment
  slug: string
  verified: boolean
  onReplyPublished: (parentId: string, reply: PublicComment) => void
}) {
  const [replying, setReplying] = useState(false)

  return (
    <li id={`comment-${comment.id}`} className="border-t border-line pt-5">
      <div className="flex items-baseline justify-between gap-3">
        <p className="font-serif text-sm font-semibold text-ink">{comment.name}</p>
        <time className="ui-label text-ink-soft" dateTime={new Date(comment.createdAt).toISOString()}>
          {formatDate(comment.createdAt)}
        </time>
      </div>
      <p className="mt-2 whitespace-pre-wrap text-sm leading-6 text-ink-soft">{comment.body}</p>

      <button
        type="button"
        onClick={() => setReplying((v) => !v)}
        className="ui-label mt-2 text-sepia transition-colors hover:text-ink"
      >
        {replying ? 'Cancelar' : 'Responder'}
      </button>

      {replying ? (
        <CommentForm
          slug={slug}
          verified={verified}
          parentId={comment.id}
          compact
          onPublished={(reply) => {
            onReplyPublished(comment.id, reply)
            setReplying(false)
          }}
        />
      ) : null}

      {comment.replies.length > 0 ? (
        <ul className="mt-4 space-y-4 border-l border-line pl-5">
          {comment.replies.map((reply) => (
            <li key={reply.id} id={`comment-${reply.id}`}>
              <div className="flex items-baseline justify-between gap-3">
                <p className="font-serif text-sm font-semibold text-ink">{reply.name}</p>
                <time className="ui-label text-ink-soft" dateTime={new Date(reply.createdAt).toISOString()}>
                  {formatDate(reply.createdAt)}
                </time>
              </div>
              <p className="mt-2 whitespace-pre-wrap text-sm leading-6 text-ink-soft">{reply.body}</p>
            </li>
          ))}
        </ul>
      ) : null}
    </li>
  )
}

export default function Comments({ slug, verified, available, initialComments }: CommentsProps) {
  const [comments, setComments] = useState<PublicComment[]>(initialComments)
  const refreshing = useRef(false)

  function handleTopPublished(comment: PublicComment) {
    setComments((prev) => [...prev, comment])
  }

  function handleReplyPublished(parentId: string, reply: PublicComment) {
    setComments((prev) =>
      prev.map((c) => (c.id === parentId ? { ...c, replies: [...c.replies, reply] } : c)),
    )
  }

  useEffect(() => {
    if (!available) return

    const MIN_INTERVAL_MS = 4000
    let lastFetch = 0

    async function refresh() {
      if (refreshing.current) return
      if (Date.now() - lastFetch < MIN_INTERVAL_MS) return
      lastFetch = Date.now()
      refreshing.current = true
      try {
        const response = await fetch(`/api/comments?slug=${encodeURIComponent(slug)}`)
        if (response.ok) {
          const data = (await response.json()) as { comments: PublicComment[] }
          setComments(data.comments)
        }
      } catch {
        // Best-effort refresh — keep whatever was already rendered.
      } finally {
        refreshing.current = false
      }
    }

    // Reader typically confirms via email in another tab, then comes back here.
    function handleVisibility() {
      if (document.visibilityState === 'visible') refresh()
    }

    window.addEventListener('focus', refresh)
    document.addEventListener('visibilitychange', handleVisibility)
    return () => {
      window.removeEventListener('focus', refresh)
      document.removeEventListener('visibilitychange', handleVisibility)
    }
  }, [slug, available])

  return (
    <section className="mx-auto mt-16 max-w-3xl border-t border-line pt-10">
      <p className="ui-label text-sepia mb-6">Comentarios</p>

      {!available ? (
        <p className="text-sm text-ink-soft">Comentarios no disponibles por el momento.</p>
      ) : (
        <>
          <div className="soft-panel p-6">
            <CommentForm slug={slug} verified={verified} onPublished={handleTopPublished} />
          </div>

          {comments.length > 0 ? (
            <ul className="mt-10 space-y-6">
              {comments.map((comment) => (
                <CommentItem
                  key={comment.id}
                  comment={comment}
                  slug={slug}
                  verified={verified}
                  onReplyPublished={handleReplyPublished}
                />
              ))}
            </ul>
          ) : (
            <p className="mt-8 text-sm text-ink-soft">Sé el primero en comentar.</p>
          )}
        </>
      )}
    </section>
  )
}
