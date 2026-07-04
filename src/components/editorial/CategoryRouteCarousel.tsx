'use client'

import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { useEffect, useRef, useState, type CSSProperties, type MouseEvent } from 'react'
import { CATEGORY_META, CATEGORY_ORDER, getRouteHref, type CategoryMeta } from '@/lib/categories'
import type { Category } from '@/types/post'

type RouteVisualStyle = CSSProperties & {
  '--book-accent': string
  '--book-paper': string
  '--book-soft': string
  '--book-image': string
  '--book-map': string
}

export default function CategoryRouteCarousel() {
  const router = useRouter()
  const trackRef = useRef<HTMLDivElement>(null)
  const navigationTimerRef = useRef<number | null>(null)
  const [activeIndex, setActiveIndex] = useState(0)
  const [highlightedIndex, setHighlightedIndex] = useState<number | null>(null)
  const [openingCategory, setOpeningCategory] = useState<Category | null>(null)

  useEffect(() => {
    return () => {
      if (navigationTimerRef.current !== null) {
        window.clearTimeout(navigationTimerRef.current)
      }
    }
  }, [])

  function scrollToIndex(index: number) {
    const nextIndex = (index + CATEGORY_ORDER.length) % CATEGORY_ORDER.length
    const track = trackRef.current
    const slide = track?.children.item(nextIndex) as HTMLElement | null

    slide?.scrollIntoView({ behavior: 'smooth', inline: 'center', block: 'nearest' })
    setActiveIndex(nextIndex)
  }

  function handleScroll() {
    const track = trackRef.current
    if (!track) return

    const trackCenter = track.scrollLeft + track.clientWidth / 2
    const slides = Array.from(track.children) as HTMLElement[]
    const nearest = slides.reduce(
      (best, slide, index) => {
        const slideCenter = slide.offsetLeft + slide.offsetWidth / 2
        const distance = Math.abs(slideCenter - trackCenter)
        return distance < best.distance ? { distance, index } : best
      },
      { distance: Number.POSITIVE_INFINITY, index: 0 },
    )

    setActiveIndex(nearest.index)
  }

  function openRoute(category: Category, index: number, event: MouseEvent<HTMLAnchorElement>) {
    if (event.defaultPrevented || event.button !== 0 || event.metaKey || event.ctrlKey || event.shiftKey || event.altKey) {
      return
    }

    event.preventDefault()
    setActiveIndex(index)

    if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) {
      router.push(getRouteHref(category))
      return
    }

    if (navigationTimerRef.current !== null) {
      window.clearTimeout(navigationTimerRef.current)
    }

    setOpeningCategory(category)
    navigationTimerRef.current = window.setTimeout(() => {
      router.push(getRouteHref(category))
    }, 1180)
  }

  return (
    <section id="rutas-del-mapa" className="editorial-shell scroll-mt-24 py-6 md:py-9" aria-labelledby="category-rail-title">
      <div className="mb-5 flex flex-wrap items-end justify-between gap-4">
        <div>
          <p className="ui-label mb-2">Rutas del mapa</p>
          <h2 id="category-rail-title" className="serif-title max-w-2xl text-3xl font-medium leading-tight text-ink md:text-4xl">
            Secciones con coordenadas propias
          </h2>
        </div>

        <div className="flex items-center gap-3 self-start md:self-end">
          <Link href="/categorias" className="hidden rounded-full border border-line bg-paper-soft px-4 py-2 text-sm font-semibold text-sepia shadow-sm transition-colors hover:bg-paper hover:text-ink sm:inline">
            Ver todas las categorías
          </Link>
          <CarouselControls activeIndex={activeIndex} onMove={scrollToIndex} />
        </div>
      </div>

      <div className="library-carousel">
        <div className="library-shelf" aria-hidden="true" />
        <div ref={trackRef} onScroll={handleScroll} className="book-spine-track">
          {CATEGORY_ORDER.map((category, index) => (
            <BookSpine
              key={category}
              category={category}
              index={index}
              active={index === highlightedIndex}
              onActivate={() => setHighlightedIndex(index)}
              onDeactivate={() => setHighlightedIndex((currentIndex) => (currentIndex === index ? null : currentIndex))}
              onOpen={(event) => openRoute(category, index, event)}
            />
          ))}
        </div>
      </div>

      <div className="mt-4 flex items-center justify-between gap-4">
        <BookProgressDots activeIndex={activeIndex} onSelect={scrollToIndex} />
        <Link href="/categorias" className="shrink-0 text-sm font-semibold text-sepia transition-colors hover:text-ink sm:hidden">
          Ver todas
        </Link>
      </div>
      {openingCategory ? <OpeningBookTransition category={openingCategory} /> : null}
    </section>
  )
}

function BookSpine({
  category,
  index,
  active,
  onActivate,
  onDeactivate,
  onOpen,
}: {
  category: Category
  index: number
  active: boolean
  onActivate: () => void
  onDeactivate: () => void
  onOpen: (event: MouseEvent<HTMLAnchorElement>) => void
}) {
  const meta = CATEGORY_META[category]
  const experience = meta.routeExperience

  return (
    <Link
      href={getRouteHref(category)}
      className={active ? 'book-spine book-spine-active' : 'book-spine'}
      style={getRouteVisualStyle(meta, category)}
      aria-label={`Explorar ruta ${meta.label}`}
      onClick={onOpen}
      onBlur={onDeactivate}
      onFocus={onActivate}
      onMouseEnter={onActivate}
      onMouseLeave={onDeactivate}
    >
      <span className="book-spine-glint" aria-hidden="true" />
      <span className="book-spine-marker" aria-hidden="true" />
      <span className="book-spine-route">Ruta {String(index + 1).padStart(2, '0')}</span>
      <span className="book-spine-title">
        <span>{meta.label}</span>
      </span>
      <span className="book-spine-signal">{experience.carouselSignal}</span>
      <span className="book-spine-seal" aria-hidden="true">
        {meta.shortLabel.slice(0, 2)}
      </span>
    </Link>
  )
}

function OpeningBookTransition({ category }: { category: Category }) {
  const meta = CATEGORY_META[category]
  const experience = meta.routeExperience

  return (
    <div className="route-book-transition" style={getRouteVisualStyle(meta, category)} aria-hidden="true">
      <div className="route-book-vortex" />
      <div className="route-open-book">
        <div className="route-open-cover route-open-cover-left">
          <span>{meta.label}</span>
        </div>
        <div className="route-open-pages">
          <span className="route-open-page route-open-page-1" />
          <span className="route-open-page route-open-page-2" />
          <span className="route-open-page route-open-page-3" />
          <span className="route-open-page route-open-page-4" />
          <span className="route-open-page route-open-page-5" />
        </div>
        <div className="route-open-cover route-open-cover-right">
          <span>{experience.carouselSignal}</span>
        </div>
      </div>
      <div className="route-book-transition-copy">
        <p>Entrando a la ruta</p>
        <strong>{meta.label}</strong>
      </div>
    </div>
  )
}

function CarouselControls({ activeIndex, onMove }: { activeIndex: number; onMove: (index: number) => void }) {
  return (
    <div className="flex rounded-full border border-line bg-paper-soft p-1 shadow-sm" aria-label="Controles del carrusel">
      <button
        type="button"
        className="grid h-9 w-9 place-items-center rounded-full text-ink transition-colors hover:bg-paper-deep/60"
        onClick={() => onMove(activeIndex - 1)}
        aria-label="Ver ruta anterior"
      >
        <ArrowIcon direction="left" />
      </button>
      <button
        type="button"
        className="grid h-9 w-9 place-items-center rounded-full text-ink transition-colors hover:bg-paper-deep/60"
        onClick={() => onMove(activeIndex + 1)}
        aria-label="Ver ruta siguiente"
      >
        <ArrowIcon direction="right" />
      </button>
    </div>
  )
}

function BookProgressDots({ activeIndex, onSelect }: { activeIndex: number; onSelect: (index: number) => void }) {
  return (
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
            onClick={() => onSelect(index)}
            aria-label={`Ver ${meta.label}`}
            aria-current={isActive ? 'true' : undefined}
          />
        )
      })}
    </div>
  )
}

function getRouteVisualStyle(meta: CategoryMeta, category: Category): RouteVisualStyle {
  return {
    '--book-accent': meta.accent,
    '--book-paper': meta.colors.paper,
    '--book-soft': meta.colors.accentSoft,
    '--book-image': `url(${meta.imageSrc})`,
    '--book-map': `url(/maps/${category}.svg)`,
  }
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
