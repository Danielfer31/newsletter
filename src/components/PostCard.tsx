import Link from 'next/link'
import { Post, Category } from '@/types/post'
import { CATEGORY_CONFIG } from '@/lib/maps'

interface PostCardProps {
  post: Post
  onHover?: (category: Category) => void
}

export default function PostCard({ post, onHover }: PostCardProps) {
  const config = CATEGORY_CONFIG[post.categoria]

  return (
    <Link href={`/post/${post.slug}`} className="block flex-shrink-0">
      <div
        className="relative w-64 md:w-80 h-96 rounded overflow-hidden cursor-pointer group"
        style={{ backgroundColor: post.tema?.fondo || config.bgColor }}
        onMouseEnter={() => onHover?.(post.categoria)}
      >
        {/* Cover image */}
        <div className="absolute inset-0">
          <img
            src={post.imagen}
            alt={post.titulo}
            className="w-full h-full object-cover opacity-40 group-hover:opacity-50 transition-opacity duration-300"
            onError={(e) => {
              (e.target as HTMLImageElement).style.display = 'none'
            }}
          />
        </div>

        {/* Gradient overlay */}
        <div
          className="absolute inset-0"
          style={{
            background: `linear-gradient(to top, ${post.tema?.fondo || config.bgColor} 40%, transparent 100%)`,
          }}
        />

        {/* Category badge */}
        <div className="absolute top-4 left-4 z-10">
          <span
            className="text-xs tracking-widest uppercase px-2 py-1 rounded"
            style={{
              backgroundColor: `${config.accentColor}22`,
              color: config.accentColor,
              border: `1px solid ${config.accentColor}44`,
            }}
          >
            {config.label}
          </span>
        </div>

        {/* Content */}
        <div className="absolute bottom-0 left-0 right-0 p-5 z-10">
          <h3
            className="text-lg font-bold leading-tight mb-2"
            style={{ color: 'var(--parchment)', fontFamily: 'var(--font-serif)' }}
          >
            {post.titulo}
          </h3>
          <p className="text-xs leading-relaxed opacity-70 line-clamp-3" style={{ color: 'var(--parchment)' }}>
            {post.extracto}
          </p>
          <div className="mt-4 flex items-center justify-between">
            <span
              className="text-xs tracking-widest uppercase opacity-60"
              style={{ color: config.accentColor }}
            >
              Leer →
            </span>
            <span className="text-xs opacity-40" style={{ color: 'var(--parchment)' }}>
              {new Date(post.fecha).toLocaleDateString('es-AR', { day: 'numeric', month: 'short' })}
            </span>
          </div>
        </div>

        {/* Hover accent line */}
        <div
          className="absolute bottom-0 left-0 right-0 h-0.5 transform scale-x-0 group-hover:scale-x-100 transition-transform duration-300"
          style={{ backgroundColor: config.accentColor }}
        />
      </div>
    </Link>
  )
}
