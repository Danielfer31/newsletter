import Link from 'next/link'
import { CATEGORY_META } from '@/lib/categories'
import { estimateReadingMinutes, formatPostDate } from '@/lib/format'
import { Post } from '@/types/post'

export interface ArticleRowProps {
  post: Post
  href?: string
  showExcerpt?: boolean
}

export default function ArticleRow({ post, href = `/post/${post.slug}`, showExcerpt = true }: ArticleRowProps) {
  const category = CATEGORY_META[post.categoria]
  const minutes = estimateReadingMinutes(post.contenido)

  return (
    <article className="py-2">
      <Link
        href={href}
        className="article-row-link group grid gap-4 rounded-3xl border border-transparent px-4 py-5 transition-all hover:border-line hover:bg-paper-soft hover:shadow-sm md:grid-cols-[11rem_1fr_auto] md:items-start md:px-5"
      >
        <span className="article-row-folio" aria-hidden="true" />

        <div className="space-y-2 text-xs text-ink-soft">
          <time dateTime={post.fecha} className="block font-medium">
            {formatPostDate(post.fecha)}
          </time>
          <span className="inline-flex items-center gap-2 font-semibold" style={{ color: category.accent }}>
            <span className="h-1.5 w-1.5 rounded-full bg-current" aria-hidden="true" />
            {category.label}
          </span>
        </div>

        <div>
          <h3 className="serif-title text-2xl leading-tight text-ink transition-colors group-hover:text-sepia md:text-[1.7rem]">
            {post.titulo}
          </h3>
          {showExcerpt ? <p className="mt-3 max-w-3xl text-sm leading-6 text-ink-soft">{post.extracto}</p> : null}
        </div>

        <p className="article-row-duration text-xs font-semibold uppercase text-sepia md:pt-1">{minutes} min</p>
      </Link>
    </article>
  )
}
