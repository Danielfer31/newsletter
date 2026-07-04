'use client'

import { useMemo, useState } from 'react'
import { ArticleRow, MapHero, RoutePanel, SiteHeader } from '@/components/editorial'
import { CATEGORY_META, CATEGORY_ORDER } from '@/lib/categories'
import { Category, Post } from '@/types/post'

type CategoryFilter = Category | 'all'
type YearFilter = string | 'all'

export default function ArchiveClient({ posts }: { posts: Post[] }) {
  const [category, setCategory] = useState<CategoryFilter>('all')
  const [year, setYear] = useState<YearFilter>('all')

  const years = useMemo(() => {
    return Array.from(new Set(posts.map((post) => post.fecha.slice(0, 4)))).sort((a, b) => Number(b) - Number(a))
  }, [posts])

  const filteredPosts = useMemo(() => {
    return posts.filter((post) => {
      const matchesCategory = category === 'all' || post.categoria === category
      const matchesYear = year === 'all' || post.fecha.startsWith(year)

      return matchesCategory && matchesYear
    })
  }, [category, posts, year])

  const routeItems = CATEGORY_ORDER.map((item) => {
    const meta = CATEGORY_META[item]
    const count = posts.filter((post) => post.categoria === item).length

    return {
      title: meta.label,
      href: `/categorias?categoria=${item}`,
      label: `${count} ${count === 1 ? 'entrada' : 'entradas'}`,
      description: meta.description,
      category: item,
    }
  })

  return (
    <main className="paper-page min-h-screen">
      <SiteHeader activeHref="/archivo" />
      <MapHero
        compact
        title="Archivo"
        subtitle="Explora todas las ediciones y artículos publicados por categoría, año y ruta de lectura."
      />

      <section className="editorial-shell py-10 md:py-12" aria-labelledby="archive-title">
        <div className="grid gap-10 lg:grid-cols-[minmax(0,1fr)_20rem]">
          <div className="min-w-0">
            <div className="border-b border-line pb-6">
              <div className="flex flex-wrap items-end justify-between gap-5">
                <div className="min-w-0">
                  <p className="ui-label">Índice editorial</p>
                  <h2 id="archive-title" className="serif-title mt-2 text-4xl font-medium leading-tight text-ink">
                    Todas las entradas
                  </h2>
                </div>

                <p className="text-sm font-semibold text-sepia">
                  {filteredPosts.length} de {posts.length} {posts.length === 1 ? 'texto' : 'textos'}
                </p>
              </div>

              <div className="mt-7 grid gap-5 xl:grid-cols-[1fr_auto] xl:items-end">
                <div className="min-w-0">
                  <p className="mb-3 text-xs font-semibold uppercase tracking-[0.14em] text-ink-soft">
                    Categoría
                  </p>
                    <div className="-mx-1 flex gap-2 overflow-x-auto px-1 pb-1" role="group" aria-label="Filtrar por categoría">
                    <FilterButton active={category === 'all'} onClick={() => setCategory('all')}>
                      Todas
                    </FilterButton>
                    {CATEGORY_ORDER.map((item) => {
                      const meta = CATEGORY_META[item]

                      return (
                        <FilterButton
                          key={item}
                          active={category === item}
                          accent={meta.accent}
                          onClick={() => setCategory(item)}
                        >
                          {meta.label}
                        </FilterButton>
                      )
                    })}
                  </div>
                </div>

                <label className="block min-w-44">
                  <span className="mb-3 block text-xs font-semibold uppercase tracking-[0.14em] text-ink-soft">
                    Año
                  </span>
                  <select
                    value={year}
                    onChange={(event) => setYear(event.target.value)}
                    className="h-11 w-full border border-line bg-paper-soft px-3 text-sm font-semibold text-ink transition-colors hover:border-gold focus:border-blue focus:outline-none"
                    aria-label="Filtrar por año"
                  >
                    <option value="all">Todos</option>
                    {years.map((item) => (
                      <option key={item} value={item}>
                        {item}
                      </option>
                    ))}
                  </select>
                </label>
              </div>
            </div>

            {filteredPosts.length ? (
              <div aria-live="polite">
                {filteredPosts.map((post) => (
                  <ArticleRow key={post.slug} post={post} />
                ))}
              </div>
            ) : (
              <div className="border-b border-line py-14 text-center" aria-live="polite">
                <p className="serif-title text-3xl text-ink">No hay entradas en esta combinación.</p>
                <p className="mt-3 text-sm leading-6 text-ink-soft">
                  Prueba con otra categoría o vuelve a consultar todos los años.
                </p>
              </div>
            )}

            <p className="ui-label mt-8 text-center">Fin de los artículos del archivo</p>
          </div>

          <div className="lg:pt-2">
            <RoutePanel title="Rutas del archivo" eyebrow="Categorías" items={routeItems} />
          </div>
        </div>
      </section>
    </main>
  )
}

function FilterButton({
  active,
  accent,
  children,
  onClick,
}: {
  active: boolean
  accent?: string
  children: React.ReactNode
  onClick: () => void
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      aria-pressed={active}
      className={[
        'h-10 flex-none border px-4 text-sm font-semibold transition-colors',
        active
          ? 'border-ink bg-ink text-paper-soft'
          : 'border-line bg-paper-soft text-ink hover:border-gold hover:text-sepia',
      ].join(' ')}
      style={active && accent ? { borderColor: accent, backgroundColor: accent } : undefined}
    >
      {children}
    </button>
  )
}
