import { getPostBySlug, getAllPosts, getAdjacentPosts, getRoutePosts } from '@/lib/posts'
import { notFound } from 'next/navigation'
import Link from 'next/link'
import { SiteHeader, RoutePanel, EditorialFooter, GiscusComments } from '@/components/editorial'
import { ViewCounter } from '@/components/ViewCounter'
import { CATEGORY_META } from '@/lib/categories'
import { formatPostDate, estimateReadingMinutes } from '@/lib/format'
import ReactMarkdown from 'react-markdown'
import remarkGfm from 'remark-gfm'
import { Category } from '@/types/post'
import fs from 'fs'
import path from 'path'

export async function generateStaticParams() {
  const posts = getAllPosts()
  return posts.map(post => ({ slug: post.slug }))
}

// Fallback elegante para imágenes
function PostImage({ src, alt, category }: { src?: string; alt: string; category: Category }) {
  const meta = CATEGORY_META[category]

  let imageExists = false
  if (src) {
    if (src.startsWith('/')) {
      const fullPath = path.join(process.cwd(), 'public', src)
      imageExists = fs.existsSync(fullPath)
    } else {
      imageExists = true
    }
  }

  return (
    <div className="relative my-8 h-[18rem] w-full overflow-hidden border border-line bg-paper-soft md:h-[24rem]">
      {imageExists && src ? (
        <img
          src={src}
          alt={alt}
          className="w-full h-full object-cover relative z-10"
        />
      ) : (
        /* Placa de fallback que se renderiza si la imagen no existe */
        <div className="absolute inset-0 flex flex-col justify-between bg-paper-soft p-6 md:p-8">
          {/* SVG del mapa de la categoría como marca de agua */}
          <div
            className="pointer-events-none absolute inset-0 bg-center bg-no-repeat opacity-[0.07]"
            style={{
              backgroundImage: `url(/maps/${category}.svg)`,
              backgroundSize: 'contain',
            }}
          />
          
          {/* Coordenadas e información editorial */}
          <div className="relative z-0 flex items-start justify-between">
            <div className="border border-line/45 px-3 py-1.5 backdrop-blur-xs bg-paper/40">
              <span className="ui-label text-[0.62rem] text-sepia">{meta?.coordinates.label || '00°00′'}</span>
            </div>
            <div className="text-right">
              <span className="ui-label text-[0.62rem] text-ink-soft">Edición Cartográfica</span>
            </div>
          </div>

          <div className="relative z-0 max-w-lg">
            <p className="ui-label text-red text-[0.62rem] tracking-[0.2em] mb-1">Ruta de exploración</p>
            <p className="font-serif text-sm md:text-base italic text-ink-soft leading-relaxed">
              “{meta?.mapExpression || 'Terra incógnita y brújulas argumentales'}”
            </p>
          </div>
        </div>
      )}
    </div>
  )
}

export default async function PostPage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params
  const post = getPostBySlug(slug)
  if (!post) notFound()

  const adjacent = getAdjacentPosts(slug)
  const routePosts = getRoutePosts(post.ruta)
  const readingMinutes = estimateReadingMinutes(post.contenido)
  const meta = CATEGORY_META[post.categoria]

  const accentColor = post.tema?.acento || meta?.accent || 'var(--sepia)'
  const fontClass = post.tema?.fuente === 'sans' ? 'font-sans' : 'font-serif'

  const hasNotes = post.notasMargen && post.notasMargen.length > 0
  const hasRoute = post.ruta && post.ruta.length > 0

  const routeItems = routePosts.map(p => ({
    title: p.titulo,
    href: `/post/${p.slug}`,
    category: p.categoria,
    description: p.extracto,
  }))

  return (
    <main className="paper-page min-h-screen flex flex-col" style={{ '--accent-color': accentColor } as React.CSSProperties}>
      <SiteHeader />

      <article className="editorial-shell flex-1 py-10 md:py-14">
        {/* Masthead editorial */}
        <header className="mx-auto mb-10 max-w-[42rem]">
          <div className="flex flex-wrap items-center gap-3 mb-5">
            <Link
              href={`/categorias?categoria=${post.categoria}`}
              className="ui-label transition-colors hover:opacity-80 flex items-center gap-2"
              style={{ color: accentColor }}
            >
              <span className="h-2 w-2 rounded-full" style={{ backgroundColor: accentColor }} />
              {meta?.label || post.categoria}
            </Link>
            <span className="h-px w-8 bg-line" />
            <time className="ui-label text-ink-soft" dateTime={post.fecha}>
              {formatPostDate(post.fecha)}
            </time>
            <span className="h-px w-8 bg-line" />
            <span className="ui-label text-ink-soft">{readingMinutes} min de lectura</span>
            <ViewCounter slug={post.slug} />
          </div>

          <h1 className="serif-title mb-6 text-4xl font-semibold leading-[1.08] text-ink md:text-6xl">
            {post.titulo}
          </h1>

          <p className="font-serif text-lg md:text-xl italic leading-relaxed text-ink-soft border-l-2 pl-4 border-line">
            {post.extracto}
          </p>
        </header>

        {/* Imagen destacada o Fallback */}
        <PostImage src={post.imagen} alt={post.titulo} category={post.categoria} />

        {/* Cuerpo, Notas al margen y Ruta en Grid */}
        <div className={`mx-auto mt-12 grid max-w-6xl gap-10 lg:gap-12 ${
          hasNotes && hasRoute
              ? 'lg:grid-cols-[210px_minmax(0,42rem)_260px]'
            : hasNotes
              ? 'lg:grid-cols-[210px_minmax(0,42rem)]'
              : hasRoute
                ? 'lg:grid-cols-[minmax(0,42rem)_260px]'
                : 'max-w-3xl mx-auto'
        }`}>
          {/* Columna Izquierda: Notas al margen (Desktop) */}
          {hasNotes && (
            <aside className="space-y-6 order-2 lg:order-1 lg:border-r lg:border-line lg:pr-6" aria-label="Notas al margen">
              <p className="ui-label text-sepia border-b border-line pb-2 mb-4">Notas al margen</p>
              {post.notasMargen?.map((note, index) => (
                <div key={index} className="border-l-2 pl-3 py-1" style={{ borderColor: accentColor }}>
                  <h4 className="font-serif text-sm font-semibold text-ink leading-tight">{note.title}</h4>
                  <p className="mt-1 font-serif text-xs text-ink-soft leading-relaxed">{note.body}</p>
                </div>
              ))}
            </aside>
          )}

          {/* Columna Central: Cuerpo del Post */}
          <section className={`order-1 lg:order-2 ${(!hasNotes && !hasRoute) ? 'w-full' : ''}`}>
            <div className={`editorial-prose post-prose ${fontClass}`}>
              <ReactMarkdown remarkPlugins={[remarkGfm]}>
                {post.contenido}
              </ReactMarkdown>
            </div>
          </section>

          {/* Columna Derecha: Ruta de lectura (Desktop) */}
          {hasRoute && (
            <aside className="space-y-6 order-3 lg:order-3 lg:border-l lg:border-line lg:pl-6" aria-label="Ruta de lectura relacionada">
              <RoutePanel
                title="Ruta de lectura"
                eyebrow="Ediciones de la serie"
                items={routeItems}
              />
              
              {/* Coordenadas e ilustración de ruta */}
              <div className="border border-line bg-paper-soft p-5 relative overflow-hidden hidden lg:block">
                <div
                  className="absolute inset-0 bg-center bg-no-repeat opacity-[0.06] pointer-events-none"
                  style={{
                    backgroundImage: `url(/maps/${post.categoria}.svg)`,
                    backgroundSize: 'cover',
                  }}
                />
                <p className="ui-label text-[0.6rem] text-sepia relative z-10">Coordenadas del mapa</p>
                <p className="mt-1 font-serif text-xs font-semibold text-ink relative z-10">{meta?.coordinates.label || '00°00′'}</p>
                <p className="mt-3 ui-label text-[0.6rem] text-sepia relative z-10">Foco geográfico</p>
                <p className="mt-1 font-serif text-xs italic text-ink-soft relative z-10">{meta?.coordinates.label !== '00°00′' ? meta?.mapExpression : 'Terra incógnita'}</p>
              </div>
            </aside>
          )}
        </div>

        {/* Navegación anterior / siguiente */}
        <nav className="border-t border-line mt-16 pt-8 flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-6" aria-label="Navegación entre entradas">
          <div className="flex-1 flex justify-start">
            {adjacent.previous ? (
              <Link href={`/post/${adjacent.previous.slug}`} className="group flex flex-col items-start text-left max-w-xs">
                <span className="ui-label text-sepia group-hover:text-ink transition-colors">&larr; Entrada anterior</span>
                <span className="mt-1 font-serif text-sm font-semibold text-ink group-hover:text-sepia transition-colors line-clamp-2">{adjacent.previous.titulo}</span>
              </Link>
            ) : (
              <span className="text-xs text-ink-soft italic ui-label opacity-40">Primer texto publicado</span>
            )}
          </div>

          <div className="flex justify-center my-4 sm:my-0">
            <Link
              href="/archivo"
              className="border border-ink-soft/40 hover:border-ink bg-paper-soft hover:bg-paper px-6 py-2.5 text-xs font-semibold uppercase tracking-widest text-ink transition-all text-center"
            >
              Volver al Archivo
            </Link>
          </div>

          <div className="flex-1 flex justify-end">
            {adjacent.next ? (
              <Link href={`/post/${adjacent.next.slug}`} className="group flex flex-col items-end text-right max-w-xs">
                <span className="ui-label text-sepia group-hover:text-ink transition-colors">Siguiente entrada &rarr;</span>
                <span className="mt-1 font-serif text-sm font-semibold text-ink group-hover:text-sepia transition-colors line-clamp-2">{adjacent.next.titulo}</span>
              </Link>
            ) : (
              <span className="text-xs text-ink-soft italic ui-label opacity-40">Último texto publicado</span>
            )}
          </div>
        </nav>

        <GiscusComments term={post.slug} />
      </article>

      <EditorialFooter />
    </main>
  )
}
