'use client'

import { useMemo, useState } from 'react'
import Link from 'next/link'
import Image from 'next/image'
import { CategoryCard, SiteHeader } from '@/components/editorial'
import { CATEGORY_META, CATEGORY_ORDER, getRouteHref } from '@/lib/categories'
import { Category } from '@/types/post'

export type CategoryPostSummary = {
  slug: string
  title: string
  category: Category
}

type CategoriesClientProps = {
  initialCategory?: Category
  postCounts: Record<Category, number>
  recentPosts: CategoryPostSummary[]
}

export default function CategoriesClient({ initialCategory, postCounts, recentPosts }: CategoriesClientProps) {
  const [activeCategory, setActiveCategory] = useState<Category>(initialCategory ?? CATEGORY_ORDER[0])

  const activeMeta = CATEGORY_META[activeCategory]
  const activePosts = useMemo(
    () => recentPosts.filter((post) => post.category === activeCategory).slice(0, 3),
    [activeCategory, recentPosts],
  )

  function selectCategory(category: Category) {
    setActiveCategory(category)

    const url = new URL(window.location.href)
    url.searchParams.set('categoria', category)
    url.hash = category
    window.history.replaceState(null, '', url)
  }

  return (
    <main className="paper-page min-h-screen">
      <SiteHeader activeHref="/categorias" />

      <section className="paper-map-bg overflow-hidden border-b border-line" aria-labelledby="categories-title">
        <Image
          src="/images/home-cartographic-map.png"
          alt=""
          fill
          priority
          sizes="100vw"
          className="pointer-events-none z-0 object-cover opacity-25 mix-blend-multiply"
          aria-hidden="true"
        />
        <div className="pointer-events-none absolute inset-0 z-0 bg-[linear-gradient(90deg,var(--paper)_0%,rgba(247,240,228,0.88)_48%,rgba(247,240,228,0.42)_100%)]" aria-hidden="true" />
        <div className="editorial-shell relative grid min-h-72 gap-8 py-12 md:grid-cols-[minmax(0,1fr)_18rem] md:items-end md:py-14">
          <div className="relative z-10 max-w-3xl">
            <p className="ui-label mb-4">Atlas editorial</p>
            <h1 id="categories-title" className="serif-title text-5xl font-medium leading-none text-ink md:text-6xl">
              Rutas temáticas
            </h1>
            <p className="mt-5 max-w-2xl text-lg leading-8 text-ink-soft">
              Un explorador de las obsesiones que ordenan La Biblioteca de Apolo: poder, ficción, juego,
              música, archivo y pensamiento en voz alta.
            </p>
          </div>

          <div className="relative hidden min-h-48 text-sepia md:block" aria-hidden="true">
            <svg className="absolute inset-0 h-full w-full" viewBox="0 0 320 220" fill="none">
              <path d="M28 164C76 112 112 184 154 128C192 78 226 116 288 54" stroke="currentColor" strokeWidth="1.2" strokeDasharray="5 8" opacity="0.5" />
              <path d="M38 52h238M38 112h238M38 172h238M78 26v170M158 26v170M238 26v170" stroke="currentColor" strokeWidth="0.7" opacity="0.18" />
              <circle cx={activeMeta.coordinates.x * 3.2} cy={activeMeta.coordinates.y * 2.2} r="10" stroke={activeMeta.accent} strokeWidth="1.4" />
              <circle cx={activeMeta.coordinates.x * 3.2} cy={activeMeta.coordinates.y * 2.2} r="3" fill={activeMeta.accent} />
              <path d="M242 176l12-38 12 38-12-8-12 8Z" stroke="currentColor" strokeWidth="1" opacity="0.42" />
            </svg>
          </div>
        </div>
      </section>

      <section className="editorial-shell py-10 md:py-12" aria-label="Explorador de categorias">
        <div className="grid gap-9 lg:grid-cols-[18rem_minmax(0,1fr)]">
          <nav aria-label="Selector de categorias">
            <p className="ui-label mb-4">Seleccionar ruta</p>
            <div className="grid gap-2 sm:grid-cols-2 lg:grid-cols-1">
              {CATEGORY_ORDER.map((category) => {
                const meta = CATEGORY_META[category]
                const active = activeCategory === category

                return (
                  <button
                    key={category}
                    type="button"
                    onClick={() => selectCategory(category)}
                    aria-pressed={active}
                    className={[
                      'flex min-h-12 items-center justify-between gap-3 border px-4 py-3 text-left text-sm font-semibold transition-colors',
                      active
                        ? 'bg-paper-soft text-ink'
                        : 'border-line bg-transparent text-ink-soft hover:bg-paper-soft hover:text-ink',
                    ].join(' ')}
                    style={active ? { borderColor: meta.accent, boxShadow: `inset 3px 0 0 ${meta.accent}` } : undefined}
                  >
                    <span className="flex min-w-0 items-center gap-3">
                      <span className="h-2 w-2 flex-none rounded-full" style={{ backgroundColor: meta.accent }} aria-hidden="true" />
                      <span className="truncate">{meta.label}</span>
                    </span>
                    <span className="text-xs text-sepia">{postCounts[category]}</span>
                  </button>
                )
              })}
            </div>
          </nav>

          <div>
            <article
              className="relative overflow-hidden border border-line bg-paper-soft"
              style={{ borderColor: activeMeta.accent }}
              aria-live="polite"
            >
              <div className="pointer-events-none absolute inset-0 opacity-20 mix-blend-multiply" aria-hidden="true">
                <Image
                  src={activeMeta.imageSrc}
                  alt=""
                  fill
                  sizes="(min-width: 1024px) 860px, 100vw"
                  className="object-cover"
                />
              </div>
              <div className="pointer-events-none absolute inset-0 bg-[linear-gradient(90deg,var(--paper-soft)_0%,rgba(255,250,241,0.86)_48%,rgba(255,250,241,0.42)_100%)]" aria-hidden="true" />
              <div
                className="pointer-events-none absolute inset-0 bg-[length:cover] bg-center opacity-[0.07]"
                style={{ backgroundImage: `url(/maps/${activeCategory}.svg)` }}
                aria-hidden="true"
              />
              <div className="relative z-10 grid gap-8 p-6 md:grid-cols-[minmax(0,1fr)_15rem] md:p-8">
                <div>
                  <p className="ui-label" style={{ color: activeMeta.accent }}>
                    {activeMeta.coordinates.label}
                  </p>
                  <h2 className="serif-title mt-3 text-4xl font-medium leading-tight text-ink md:text-5xl">
                    {activeMeta.label}
                  </h2>
                  <p className="mt-5 max-w-2xl font-serif text-xl leading-8 text-ink-soft">
                    {activeMeta.longDescription}
                  </p>
                  <Link
                    href={getRouteHref(activeCategory)}
                    className="mt-7 inline-flex items-center gap-2 rounded-full border px-5 py-3 text-sm font-semibold text-ink transition-colors hover:bg-ink hover:text-paper-soft"
                    style={{ borderColor: activeMeta.accent }}
                  >
                    Entrar a la ruta {activeMeta.label}
                    <span aria-hidden="true">→</span>
                  </Link>

                  <dl className="mt-8 grid gap-5 border-t border-line pt-6 sm:grid-cols-3">
                    <div>
                      <dt className="ui-label">Acento</dt>
                      <dd className="mt-2 flex items-center gap-3 text-sm font-semibold text-ink">
                        <span className="h-4 w-4 border border-line" style={{ backgroundColor: activeMeta.accent }} aria-hidden="true" />
                        {activeMeta.accent}
                      </dd>
                    </div>
                    <div>
                      <dt className="ui-label">Posts</dt>
                      <dd className="mt-2 text-sm font-semibold text-ink">
                        {postCounts[activeCategory]} {postCounts[activeCategory] === 1 ? 'entrada' : 'entradas'}
                      </dd>
                    </div>
                    <div>
                      <dt className="ui-label">Metáfora</dt>
                      <dd className="mt-2 text-sm font-semibold leading-6 text-ink">{activeMeta.mapExpression}</dd>
                    </div>
                  </dl>
                </div>

                <aside className="border-t border-line pt-6 md:border-l md:border-t-0 md:pl-6 md:pt-0">
                  <div className="relative mb-6 aspect-[4/5] overflow-hidden border border-line bg-paper shadow-sm">
                    <Image
                      key={activeMeta.imageSrc}
                      src={activeMeta.imageSrc}
                      alt=""
                      fill
                      sizes="240px"
                      className="object-cover mix-blend-multiply"
                    />
                  </div>
                  <p className="ui-label">Lecturas recientes</p>
                  {activePosts.length ? (
                    <div className="mt-4 divide-y divide-line">
                      {activePosts.map((post) => (
                        <Link key={post.slug} href={`/post/${post.slug}`} className="block py-3 text-sm font-semibold leading-5 text-ink transition-colors hover:text-sepia">
                          {post.title}
                        </Link>
                      ))}
                    </div>
                  ) : (
                    <p className="mt-4 text-sm leading-6 text-ink-soft">Esta ruta aún espera su primera entrada publicada.</p>
                  )}
                </aside>
              </div>
            </article>

            <section className="mt-10" aria-labelledby="all-routes-title">
              <div className="mb-5 flex flex-wrap items-baseline justify-between gap-4 border-b border-line pb-4">
                <h2 id="all-routes-title" className="serif-title text-3xl font-medium text-ink">
                  Todas las rutas
                </h2>
                <p className="ui-label">Mapa completo</p>
              </div>

              <div className="grid gap-3 md:grid-cols-2 xl:grid-cols-3">
                {CATEGORY_ORDER.map((category) => (
                  <CategoryCard
                    key={category}
                    category={category}
                    href={getRouteHref(category)}
                    active={activeCategory === category}
                  />
                ))}
              </div>
            </section>
          </div>
        </div>
      </section>
    </main>
  )
}
