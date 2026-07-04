import Link from 'next/link'
import { CATEGORY_META } from '@/lib/categories'
import { Category } from '@/types/post'

export interface RoutePanelItem {
  label?: string
  title: string
  href: string
  description?: string
  category?: Category
}

export interface RoutePanelProps {
  title: string
  eyebrow?: string
  items: RoutePanelItem[]
}

export default function RoutePanel({ title, eyebrow = 'Rutas', items }: RoutePanelProps) {
  return (
    <aside className="border-l border-line pl-5" aria-labelledby="route-panel-title">
      <p className="ui-label mb-3">{eyebrow}</p>
      <h2 id="route-panel-title" className="serif-title text-2xl leading-tight text-ink">
        {title}
      </h2>

      <div className="mt-5 divide-y divide-line">
        {items.map((item) => {
          const category = item.category ? CATEGORY_META[item.category] : null

          return (
            <Link key={item.href} href={item.href} className="group block py-4">
              <p className="text-xs font-semibold uppercase text-sepia">
                {item.label ?? category?.label ?? 'Entrada'}
              </p>
              <h3 className="mt-2 text-sm font-semibold leading-5 text-ink transition-colors group-hover:text-sepia">
                {item.title}
              </h3>
              {item.description ? <p className="mt-2 text-sm leading-6 text-ink-soft">{item.description}</p> : null}
            </Link>
          )
        })}
      </div>
    </aside>
  )
}
