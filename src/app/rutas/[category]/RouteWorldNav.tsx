import Link from 'next/link'
import { CATEGORY_META, CATEGORY_ORDER, getRouteHref } from '@/lib/categories'
import { Category } from '@/types/post'

export default function RouteWorldNav({ activeCategory }: { activeCategory: Category }) {
  return (
    <nav className="border-t border-line pt-6" aria-label="Otras rutas">
      <p className="ui-label mb-4">Otras rutas</p>
      <div className="grid gap-2 sm:grid-cols-2 lg:grid-cols-1">
        {CATEGORY_ORDER.filter((category) => category !== activeCategory).map((category) => {
          const meta = CATEGORY_META[category]

          return (
            <Link
              key={category}
              href={getRouteHref(category)}
              className="group flex items-center justify-between gap-4 border border-line bg-paper-soft px-4 py-3 text-sm font-semibold text-ink transition-colors hover:bg-paper"
            >
              <span className="flex items-center gap-3">
                <span className="h-2 w-2 rounded-full" style={{ backgroundColor: meta.accent }} aria-hidden="true" />
                {meta.label}
              </span>
              <span className="text-sepia transition-transform group-hover:translate-x-1" aria-hidden="true">
                →
              </span>
            </Link>
          )
        })}
      </div>
    </nav>
  )
}
