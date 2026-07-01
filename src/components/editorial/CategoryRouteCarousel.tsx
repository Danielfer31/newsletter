'use client'

import Link from 'next/link'
import Image from 'next/image'
import { useRef, useState } from 'react'
import { CATEGORY_META, CATEGORY_ORDER, CategoryMeta, getRouteHref } from '@/lib/categories'
import { Category } from '@/types/post'

const ROUTE_MOODS: Record<Category, { signal: string; artifact: string; cue: string; volume: string }> = {
  geopolitica: {
    signal: 'Tablero mundial',
    artifact: 'Fronteras, pactos y lineas de fractura',
    cue: 'Pulso rojo',
    volume: 'Atlas de poder',
  },
  anime: {
    signal: 'Mar abierto',
    artifact: 'Islas, aventuras y personajes en ruta',
    cue: 'Azul marea',
    volume: 'Cuaderno manga',
  },
  futbol: {
    signal: 'Cancha viva',
    artifact: 'Zonas, mitos y geometria del juego',
    cue: 'Verde tactico',
    volume: 'Pizarra de juego',
  },
  musica: {
    signal: 'Constelacion sonora',
    artifact: 'Discos, escenas y memoria auditiva',
    cue: 'Violeta nocturno',
    volume: 'Vinilo anotado',
  },
  opinion: {
    signal: 'Margen abierto',
    artifact: 'Ideas en borrador y dudas con brujula',
    cue: 'Dorado ensayo',
    volume: 'Ensayo al margen',
  },
  rpg: {
    signal: 'Mesa de aventura',
    artifact: 'Dados, mapas hexagonales y mundos posibles',
    cue: 'Sepia legendario',
    volume: 'Manual de campaña',
  },
  cultura: {
    signal: 'Archivo orbital',
    artifact: 'Cine, libros y rarezas conectadas',
    cue: 'Azul archivo',
    volume: 'Gabinete pop',
  },
}

export default function CategoryRouteCarousel() {
  const trackRef = useRef<HTMLDivElement>(null)
  const [activeIndex, setActiveIndex] = useState(0)

  function scrollToIndex(index: number) {
    const nextIndex = (index + CATEGORY_ORDER.length) % CATEGORY_ORDER.length
    const track = trackRef.current
    const slide = track?.children.item(nextIndex) as HTMLElement | null

    slide?.scrollIntoView({ behavior: 'smooth', inline: 'start', block: 'nearest' })
    setActiveIndex(nextIndex)
  }

  function handleScroll() {
    const track = trackRef.current
    if (!track) return

    const slides = Array.from(track.children) as HTMLElement[]
    const nearest = slides.reduce(
      (best, slide, index) => {
        const distance = Math.abs(slide.offsetLeft - track.scrollLeft)
        return distance < best.distance ? { distance, index } : best
      },
      { distance: Number.POSITIVE_INFINITY, index: 0 },
    )

    setActiveIndex(nearest.index)
  }

  return (
    <section className="editorial-shell py-6 md:py-8" aria-labelledby="category-rail-title">
      <div className="mb-4 flex flex-wrap items-end justify-between gap-4">
        <div>
          <p className="ui-label mb-2">Rutas del mapa</p>
          <h2 id="category-rail-title" className="serif-title max-w-2xl text-3xl font-medium leading-tight text-ink md:text-4xl">
            Secciones con coordenadas propias
          </h2>
        </div>

        <div className="flex items-center gap-3 self-start md:self-end">
          <Link href="/categorias" className="hidden rounded-full border border-line bg-paper-soft px-4 py-2 text-sm font-semibold text-sepia shadow-sm transition-colors hover:bg-paper hover:text-ink sm:inline">
            Ver todas las categorias
          </Link>
          <div className="flex rounded-full border border-line bg-paper-soft p-1 shadow-sm" aria-label="Controles del carrusel">
            <button
              type="button"
              className="grid h-9 w-9 place-items-center rounded-full text-ink transition-colors hover:bg-paper-deep/60"
              onClick={() => scrollToIndex(activeIndex - 1)}
              aria-label="Ver ruta anterior"
            >
              <ArrowIcon direction="left" />
            </button>
            <button
              type="button"
              className="grid h-9 w-9 place-items-center rounded-full text-ink transition-colors hover:bg-paper-deep/60"
              onClick={() => scrollToIndex(activeIndex + 1)}
              aria-label="Ver ruta siguiente"
            >
              <ArrowIcon direction="right" />
            </button>
          </div>
        </div>
      </div>

      <div
        ref={trackRef}
        onScroll={handleScroll}
        className="-mx-1 flex snap-x snap-mandatory gap-4 overflow-x-auto px-1 pb-3 [scrollbar-width:none] [&::-webkit-scrollbar]:hidden"
      >
        {CATEGORY_ORDER.map((category, index) => (
          <RouteSlide key={category} category={category} index={index} active={index === activeIndex} />
        ))}
      </div>

      <div className="mt-0 flex items-center justify-between gap-4">
        <div className="flex gap-2" aria-label="Indicador de ruta activa">
          {CATEGORY_ORDER.map((category, index) => {
            const meta = CATEGORY_META[category]
            const isActive = index === activeIndex

            return (
              <button
                key={category}
                type="button"
                className="h-2.5 rounded-full border border-line transition-all"
                style={{
                  width: isActive ? '2rem' : '0.625rem',
                  backgroundColor: isActive ? meta.accent : 'transparent',
                }}
                onClick={() => scrollToIndex(index)}
                aria-label={`Ver ${meta.label}`}
                aria-current={isActive ? 'true' : undefined}
              />
            )
          })}
        </div>
        <Link href="/categorias" className="shrink-0 text-sm font-semibold text-sepia transition-colors hover:text-ink sm:hidden">
          Ver todas
        </Link>
      </div>
    </section>
  )
}

function RouteSlide({ category, index, active }: { category: Category; index: number; active: boolean }) {
  const meta = CATEGORY_META[category]
  const mood = ROUTE_MOODS[category]

  return (
    <Link
      href={getRouteHref(category)}
      className="group relative min-h-[20rem] w-[calc(100vw-2rem)] max-w-[26rem] flex-none snap-start overflow-hidden rounded-[1.65rem] border border-line bg-paper-soft p-5 text-ink shadow-sm transition-all hover:-translate-y-1 hover:shadow-[var(--shadow-lift)] sm:w-[24rem] lg:w-[25rem]"
      style={{ backgroundColor: meta.colors.paper }}
      aria-label={`Explorar ruta ${meta.label}`}
    >
      <div
        className="pointer-events-none absolute inset-0 opacity-[0.06] transition-opacity group-hover:opacity-[0.09]"
        style={{ backgroundImage: `url(/maps/${category}.svg)`, backgroundPosition: 'center', backgroundRepeat: 'no-repeat', backgroundSize: '78%' }}
        aria-hidden="true"
      />
      <RouteLinework meta={meta} index={index} />

      <div className="relative z-10 flex min-h-[17.5rem] flex-col justify-between">
        <div>
          <div className="mb-6 flex items-center justify-between gap-4">
            <span className="ui-label" style={{ color: meta.accent }}>
              Ruta {String(index + 1).padStart(2, '0')}
            </span>
            <span className="text-xs font-semibold uppercase text-ink-soft">{mood.cue}</span>
          </div>

          <div className="mb-5 grid min-h-[8.5rem] grid-cols-[1fr_6.25rem] items-start gap-4 sm:grid-cols-[1fr_8.5rem]">
            <div>
              <p className="text-sm font-semibold uppercase text-ink-soft">{mood.signal}</p>
              <h3 className="serif-title mt-3 text-4xl font-semibold leading-none text-ink">{meta.label}</h3>
              <p className="mt-4 max-w-[18rem] text-sm leading-6 text-ink-soft">{meta.longDescription}</p>
            </div>
            <RouteCoverArt category={category} accent={meta.accent} />
          </div>
        </div>

        <div>
          <div className="mb-5 grid grid-cols-[1fr_auto] items-end gap-4 border-t border-line pt-5">
            <div>
              <p className="ui-label mb-2 normal-case tracking-normal" style={{ color: meta.accent }}>
                {mood.volume}
              </p>
              <p className="text-sm font-medium leading-5 text-ink">{mood.artifact}</p>
            </div>
            <span className="ui-label text-right normal-case tracking-normal" style={{ color: meta.accent }}>
              {meta.coordinates.label}
            </span>
          </div>

          <span
            className="inline-flex items-center gap-2 rounded-full border px-4 py-2 text-sm font-semibold text-ink transition-colors group-hover:border-ink group-hover:bg-ink group-hover:text-[var(--paper-soft)]"
            style={{ borderColor: active ? meta.accent : 'currentColor' }}
          >
            Entrar a la ruta
            <ArrowIcon direction="right" />
          </span>
        </div>
      </div>
    </Link>
  )
}

function RouteCoverArt({ category, accent }: { category: Category; accent: string }) {
  const meta = CATEGORY_META[category]

  return (
    <div
      className="relative block aspect-[4/5] overflow-hidden rounded-2xl border border-line bg-paper-soft shadow-sm"
      style={{ background: `linear-gradient(145deg, color-mix(in srgb, ${accent} 12%, white), var(--paper-soft))` }}
      aria-hidden="true"
    >
      <Image
        src={meta.imageSrc}
        alt=""
        fill
        sizes="136px"
        className="object-cover opacity-90 mix-blend-multiply transition-transform duration-500 group-hover:scale-105"
      />
      <div className="absolute inset-0 bg-[linear-gradient(180deg,rgba(255,250,241,0.1),rgba(255,250,241,0.34))]" />
      <svg className="absolute inset-0 h-full w-full" viewBox="0 0 160 200" fill="none">
        <path d="M18 20h124M18 180h124M30 12v176M132 12v176" stroke={accent} strokeOpacity="0.18" />
      </svg>
    </div>
  )
}

function RouteLinework({ meta, index }: { meta: CategoryMeta; index: number }) {
  const offset = index % 2 === 0 ? 0 : 16

  return (
    <svg className="pointer-events-none absolute inset-0 h-full w-full opacity-60" viewBox="0 0 420 320" aria-hidden="true">
      <g fill="none" stroke={meta.accent} strokeWidth="1">
        <circle cx={304 - offset} cy={86 + offset} r="58" opacity="0.18" />
        <circle cx={304 - offset} cy={86 + offset} r="94" opacity="0.12" />
        <path d={`M36 ${238 - offset} C 112 188, 148 260, 224 202 S 338 116, 384 142`} strokeDasharray="5 10" opacity="0.3" />
        <path d="M24 72h118M276 248h96M72 34v64M344 192v82" opacity="0.16" />
      </g>
      <circle cx={`${meta.coordinates.x}%`} cy={`${meta.coordinates.y}%`} r="5" fill={meta.accent} opacity="0.72" />
    </svg>
  )
}

function ArrowIcon({ direction }: { direction: 'left' | 'right' }) {
  return (
    <svg
      className={direction === 'left' ? 'h-4 w-4 rotate-180' : 'h-4 w-4'}
      viewBox="0 0 18 18"
      fill="none"
      aria-hidden="true"
    >
      <path d="M3 9h11M10 5l4 4-4 4" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  )
}
