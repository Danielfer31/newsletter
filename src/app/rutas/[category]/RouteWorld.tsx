import Image from 'next/image'
import Link from 'next/link'
import { ArticleRow, SiteHeader } from '@/components/editorial'
import { CATEGORY_META, RouteLayout } from '@/lib/categories'
import { Category, Post } from '@/types/post'
import RouteWorldNav from './RouteWorldNav'

type RouteWorldProps = {
  category: Category
  posts: Post[]
}

const NAV_ITEMS = [
  { label: 'Archivo', href: '/archivo' },
  { label: 'Categorías', href: '/categorias' },
  { label: 'Sobre el proyecto', href: '/sobre-el-proyecto' },
]

const layoutClass: Record<RouteLayout, string> = {
  dossier: 'md:grid-cols-[minmax(0,1.05fr)_22rem]',
  voyage: 'md:grid-cols-[minmax(0,0.9fr)_26rem]',
  tactics: 'md:grid-cols-[minmax(0,1fr)_24rem]',
  constellation: 'md:grid-cols-[minmax(0,0.95fr)_24rem]',
  margin: 'md:grid-cols-[minmax(0,0.85fr)_25rem]',
  campaign: 'md:grid-cols-[minmax(0,1fr)_24rem]',
  cabinet: 'md:grid-cols-[minmax(0,0.95fr)_25rem]',
}

export default function RouteWorld({ category, posts }: RouteWorldProps) {
  const meta = CATEGORY_META[category]
  const experience = meta.routeExperience
  const featuredPosts = posts.slice(0, 3)
  const hasPosts = featuredPosts.length > 0

  return (
    <main className="paper-page min-h-screen">
      <SiteHeader activeHref="/categorias" navItems={NAV_ITEMS} />

      <section
        className="relative overflow-hidden border-b border-line"
        style={{ backgroundColor: meta.colors.paper }}
        aria-labelledby="route-title"
      >
        <div
          className="pointer-events-none absolute inset-0 opacity-[0.08]"
          style={{
            backgroundImage: `url(/maps/${category}.svg)`,
            backgroundPosition: 'center',
            backgroundRepeat: 'no-repeat',
            backgroundSize: '72rem',
          }}
          aria-hidden="true"
        />
        <div
          className="pointer-events-none absolute inset-0 bg-[linear-gradient(90deg,rgba(255,250,241,0.92),rgba(255,250,241,0.62),rgba(255,250,241,0.18))]"
          aria-hidden="true"
        />

        <div className={`editorial-shell relative grid min-h-[34rem] gap-10 py-12 md:items-center md:py-16 ${layoutClass[experience.layout]}`}>
          <div className="relative z-10 max-w-3xl">
            <Link href="/categorias" className="ui-label inline-flex items-center gap-2 text-sepia transition-colors hover:text-ink">
              ← Atlas de rutas
            </Link>
            <p className="ui-label mt-8" style={{ color: meta.accent }}>
              {experience.mood}
            </p>
            <h1 id="route-title" className="serif-title mt-4 text-5xl font-medium leading-none text-ink md:text-7xl">
              {meta.label}
            </h1>
            <p className="mt-6 max-w-2xl font-serif text-2xl leading-9 text-ink">
              {experience.headline}
            </p>
            <p className="mt-5 max-w-2xl text-lg leading-8 text-ink-soft">
              {experience.deck}
            </p>
          </div>

          <RouteArtifact category={category} />
        </div>
      </section>

      <section className="editorial-shell grid gap-10 py-10 lg:grid-cols-[minmax(0,1fr)_20rem] lg:py-14">
        <div>
          <div className="mb-6 flex flex-wrap items-end justify-between gap-4 border-b border-line pb-5">
            <div>
              <p className="ui-label" style={{ color: meta.accent }}>
                {experience.primaryModuleLabel}
              </p>
              <h2 className="serif-title mt-2 text-4xl font-medium text-ink">Entradas de la ruta</h2>
            </div>
            <Link href={`/archivo?categoria=${category}`} className="text-sm font-semibold text-sepia transition-colors hover:text-ink">
              Ver archivo →
            </Link>
          </div>

          {hasPosts ? (
            <div className="divide-y divide-line">
              {featuredPosts.map((post) => (
                <ArticleRow key={post.slug} post={post} />
              ))}
            </div>
          ) : (
            <div className="border border-line bg-paper-soft p-8">
              <p className="serif-title text-3xl text-ink">{experience.emptyState}</p>
              <p className="mt-4 max-w-xl text-sm leading-6 text-ink-soft">
                Mientras aparece la primera entrada, puedes volver al atlas general o explorar una ruta vecina.
              </p>
            </div>
          )}
        </div>

        <aside className="space-y-8">
          <section className="border border-line bg-paper-soft p-6">
            <p className="ui-label" style={{ color: meta.accent }}>
              {experience.secondaryModuleLabel}
            </p>
            <h2 className="serif-title mt-3 text-2xl leading-tight text-ink">{experience.motif}</h2>
            <p className="mt-4 text-sm leading-6 text-ink-soft">{meta.mapExpression}</p>
            <p className="ui-label mt-6 normal-case tracking-normal" style={{ color: meta.accent }}>
              {meta.coordinates.label}
            </p>
          </section>

          <RouteWorldNav activeCategory={category} />
        </aside>
      </section>
    </main>
  )
}

function RouteArtifact({ category }: { category: Category }) {
  const meta = CATEGORY_META[category]
  const experience = meta.routeExperience

  return (
    <div
      className="relative z-10 min-h-[22rem] overflow-hidden border border-line bg-paper-soft shadow-sm"
      style={{
        borderColor: meta.accent,
        borderRadius: experience.layout === 'dossier' || experience.layout === 'margin' ? '0.25rem' : '1.5rem',
      }}
      aria-hidden="true"
    >
      <Image
        src={meta.imageSrc}
        alt=""
        fill
        priority
        sizes="(min-width: 768px) 420px, 100vw"
        className="object-cover opacity-80 mix-blend-multiply"
      />
      <div className="absolute inset-0 bg-[linear-gradient(180deg,rgba(255,250,241,0.12),rgba(255,250,241,0.62))]" />
      <svg className="absolute inset-0 h-full w-full" viewBox="0 0 420 420" fill="none">
        {experience.layout === 'tactics' ? (
          <g stroke={meta.accent} strokeWidth="1.3" opacity="0.72">
            <rect x="42" y="58" width="336" height="256" rx="2" />
            <path d="M210 58v256M42 186h336M96 112c54 36 98 36 150 0M156 260c46-38 92-38 138 0" strokeDasharray="7 8" />
            <circle cx="210" cy="186" r="42" />
          </g>
        ) : experience.layout === 'constellation' ? (
          <g stroke={meta.accent} strokeWidth="1.2" opacity="0.72">
            <path d="M72 116c58-36 112 24 166-14 42-30 72-8 112 18M68 226c70-22 112 36 172 2 46-26 70-12 114 22" strokeDasharray="4 10" />
            {[88, 156, 236, 318, 112, 286].map((x, index) => (
              <circle key={x} cx={x} cy={index < 4 ? 118 + index * 10 : 238} r="5" fill={meta.accent} />
            ))}
          </g>
        ) : experience.layout === 'campaign' ? (
          <g stroke={meta.accent} strokeWidth="1.1" opacity="0.72">
            {Array.from({ length: 5 }).map((_, row) =>
              Array.from({ length: 5 }).map((__, col) => (
                <path key={`${row}-${col}`} d={`M${74 + col * 58} ${82 + row * 44}l25 14v28l-25 14-25-14v-28z`} />
              )),
            )}
            <path d="M92 96c72 62 118 70 214 38M118 278c48-34 100-24 158 10" strokeDasharray="5 9" />
          </g>
        ) : (
          <g stroke={meta.accent} strokeWidth="1.1" opacity="0.7">
            <circle cx="292" cy="120" r="64" />
            <circle cx="292" cy="120" r="98" opacity="0.42" />
            <path d="M52 272C118 212 156 308 224 224S332 122 372 158" strokeDasharray="6 10" />
            <path d="M58 86h132M74 116h86M68 324h172" opacity="0.44" />
          </g>
        )}
      </svg>
      <div className="absolute bottom-5 left-5 right-5 flex items-end justify-between gap-4">
        <p className="ui-label max-w-[12rem] normal-case tracking-normal text-ink">{experience.motif}</p>
        <span className="h-10 w-10 border border-current" style={{ color: meta.accent, backgroundColor: meta.colors.accentSoft }} />
      </div>
    </div>
  )
}
