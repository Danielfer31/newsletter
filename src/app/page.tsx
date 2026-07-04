import Link from 'next/link'
import { ArticleRow, CategoryRouteCarousel, SiteHeader, SubscribeBox } from '@/components/editorial'
import { CATEGORY_META } from '@/lib/categories'
import { estimateReadingMinutes, formatPostDate } from '@/lib/format'
import { getAllPosts } from '@/lib/posts'
import { Post } from '@/types/post'
import HomeStarfield from './HomeStarfield'

export default function Home() {
  const posts = getAllPosts()
  const [featured, ...latestPosts] = posts

  return (
    <main className="home-night-page min-h-screen">
      <HomeStarfield />
      <div className="relative z-10">
        <SiteHeader variant="night" />
        <EditorialHero featured={featured} />

        <div className="home-night-section">
          <CategoryRouteCarousel />
        </div>

        {featured ? (
          <section className="editorial-shell py-6 md:py-8" aria-labelledby="featured-title">
            <div className="observatory-featured-panel">
              <FeaturedArticle post={featured} relatedPosts={latestPosts.slice(0, 2)} />
            </div>
          </section>
        ) : null}

        <section className="home-night-latest editorial-shell pb-16 pt-4 md:pb-20 md:pt-6" aria-labelledby="latest-title">
          <div className="latest-field-header mb-5">
            <div className="latest-field-title-lockup">
              <h2 id="latest-title" className="serif-title text-4xl font-medium leading-tight text-paper-soft">
                Entradas destacadas
              </h2>
              <p className="ui-label text-gold">Diario de campo</p>
            </div>
            <Link href="/archivo" className="latest-archive-link">
              Ver archivo
            </Link>
          </div>

          <div className="observatory-list-panel latest-ledger">
            {(latestPosts.length ? latestPosts : posts).slice(0, 6).map((post) => (
              <ArticleRow key={post.slug} post={post} />
            ))}
          </div>
        </section>

        <section className="home-night-newsletter editorial-shell pb-16 md:pb-20" aria-label="Suscripcion al newsletter">
          <SubscribeBox
            layout="inline"
            description="Una entrega semanal, sin ruido. Lecturas largas y notas al margen, directo a tu correo."
          />
        </section>
      </div>
    </main>
  )
}

function EditorialHero({ featured }: { featured?: Post }) {
  const latestHref = featured ? `/post/${featured.slug}` : '/archivo'

  return (
    <section className="home-night-hero overflow-hidden border-b border-white/10" aria-labelledby="home-title">
      <div className="editorial-shell relative py-14 md:min-h-[34rem] md:py-20">
        <div className="relative z-10 max-w-3xl">
          <div className="mb-6 flex flex-wrap items-center gap-3">
            <p className="ui-label text-gold">EDICION #01</p>
            <p className="ui-label text-white/50">2026</p>
          </div>

          <h1 id="home-title" className="serif-title text-5xl font-semibold leading-[1.04] text-paper-soft md:text-7xl">
            Ideas, mapas
            <br />
            y rutas para pensar.
          </h1>
          <p className="mt-6 max-w-2xl font-serif text-xl leading-8 text-white/72 md:text-2xl md:leading-9">
            Un mapa semanal de politica, cultura, anime, futbol y musica trazado como un atlas de obsesiones personales.
          </p>

          <div className="mt-8 flex flex-wrap items-center gap-5">
            <Link
              href={latestHref}
              className="inline-flex rounded-full border border-red bg-red px-6 py-3 text-sm font-semibold text-[var(--paper-soft)] shadow-sm transition-colors hover:border-sepia hover:bg-sepia"
              style={{ color: 'var(--paper-soft)' }}
            >
              Leer ultima entrada <span className="ml-2 text-gold" aria-hidden="true">-&gt;</span>
            </Link>
            <Link
              href="/archivo"
              className="rounded-full border border-white/15 bg-white/8 px-5 py-3 text-sm font-semibold text-paper-soft shadow-sm transition-colors hover:border-gold/55 hover:bg-white/14"
              style={{ color: 'var(--paper-soft)' }}
            >
              Explorar el archivo
            </Link>
          </div>
        </div>
      </div>
    </section>
  )
}

function FeaturedArticle({ post, relatedPosts }: { post: Post; relatedPosts: Post[] }) {
  const category = CATEGORY_META[post.categoria]
  const minutes = estimateReadingMinutes(post.contenido)

  return (
    <article id="featured-title" className="featured-curated relative overflow-hidden">
      <div
        className="featured-curated-map"
        style={{ backgroundImage: `url(/maps/${post.categoria}.svg)` }}
        aria-hidden="true"
      />

      <div className="featured-curated-lead">
        <div className="mb-7 flex flex-wrap items-center gap-3">
          <p
            className="rounded-full border border-white/12 bg-white/6 px-3 py-1 ui-label text-paper-soft"
            style={{ color: 'var(--paper-soft)' }}
          >
            Edicion destacada
          </p>
          <p className="ui-label text-white/48">Portada de la semana</p>
        </div>

        <p className="featured-curated-route mb-4 max-w-2xl text-sm font-semibold uppercase leading-6 text-white/48">
          {category.mapExpression}
        </p>
        <h2 className="serif-title max-w-4xl text-4xl font-semibold leading-[1.06] text-paper-soft md:text-5xl lg:text-6xl">
          <Link href={`/post/${post.slug}`} className="transition-colors hover:text-gold">
            {post.titulo}
          </Link>
        </h2>
        <p className="mt-6 max-w-3xl font-serif text-lg leading-8 text-white/68 md:text-xl md:leading-9">{post.extracto}</p>

        <div className="mt-8 flex flex-wrap items-center gap-4 text-sm text-white/54">
          <time dateTime={post.fecha}>{formatPostDate(post.fecha)}</time>
          <span className="h-1 w-1 rounded-full bg-gold" aria-hidden="true" />
          <span>{minutes} min de lectura</span>
          <span className="h-1 w-1 rounded-full bg-gold" aria-hidden="true" />
          <span className="text-gold">{category.label}</span>
        </div>

        <div className="mt-9 flex flex-wrap items-center gap-4">
          <Link
            href={`/post/${post.slug}`}
            className="inline-flex items-center gap-2 rounded-full border border-gold/30 bg-gold/16 px-6 py-3 text-sm font-semibold text-[var(--paper-soft)] transition-colors hover:border-gold/55 hover:bg-gold/24"
            style={{ color: 'var(--paper-soft)' }}
          >
            Leer la entrada
            <ArrowIcon />
          </Link>
          <Link href="/archivo" className="rounded-full border border-white/12 bg-white/6 px-5 py-3 text-sm font-semibold text-paper-soft transition-colors hover:border-gold/45 hover:bg-white/10">
            Ver archivo
          </Link>
        </div>
      </div>

      <aside className="featured-curated-aside" aria-label="Paradas sugeridas">
        <div className="featured-curated-route-card">
          <div>
            <p className="ui-label text-gold">Ruta activa</p>
            <h3 className="serif-title mt-2 text-2xl font-semibold leading-tight text-paper-soft">{category.label}</h3>
          </div>
          <p className="ui-label normal-case tracking-normal text-gold">{category.coordinates.label}</p>
        </div>

        <div className="featured-curated-stops">
          <div className="mb-4 flex items-center justify-between gap-4">
            <p className="ui-label text-white/50">Paradas sugeridas</p>
            <Link href="/archivo" className="text-xs font-semibold text-gold transition-colors hover:text-paper-soft">
              Archivo completo
            </Link>
          </div>

          <div className="divide-y divide-white/10">
            {relatedPosts.length ? (
              relatedPosts.map((relatedPost) => {
                const relatedCategory = CATEGORY_META[relatedPost.categoria]

                return (
                  <Link
                    key={relatedPost.slug}
                    href={`/post/${relatedPost.slug}`}
                    className="group grid gap-3 py-4 transition-colors first:pt-0 last:pb-0"
                  >
                    <span className="flex items-center gap-3 text-xs font-semibold uppercase leading-none text-white/42">
                      <span className="h-1.5 w-1.5 rounded-full bg-current" style={{ color: relatedCategory.accent }} aria-hidden="true" />
                      {relatedCategory.label}
                    </span>
                    <span className="serif-title text-2xl font-semibold leading-tight text-paper-soft transition-colors group-hover:text-gold">
                      {relatedPost.titulo}
                    </span>
                    <span className="text-sm leading-6 text-white/54">{relatedPost.extracto}</span>
                  </Link>
                )
              })
            ) : (
              <p className="py-4 text-sm leading-6 text-white/54">El archivo espera la proxima parada de esta edicion.</p>
            )}
          </div>
        </div>
      </aside>
    </article>
  )
}

function ArrowIcon() {
  return (
    <svg className="h-4 w-4" viewBox="0 0 18 18" fill="none" aria-hidden="true">
      <path d="M3 9h11M10 5l4 4-4 4" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  )
}
