import Link from 'next/link'
import { SiteHeaderNavItem } from './SiteHeader'

export interface EditorialFooterProps {
  navItems?: SiteHeaderNavItem[]
  subscribeHref?: string
}

const DEFAULT_FOOTER_ITEMS: SiteHeaderNavItem[] = [
  { label: 'Archivo', href: '/archivo' },
  { label: 'Categorías', href: '/categorias' },
  { label: 'Sobre el proyecto', href: '/sobre-el-proyecto' },
]

export default function EditorialFooter({
  navItems = DEFAULT_FOOTER_ITEMS,
  subscribeHref = '/sobre-el-proyecto#suscripcion',
}: EditorialFooterProps) {
  return (
    <footer className="border-t border-line bg-paper py-10">
      <div className="editorial-shell grid gap-8 md:grid-cols-[1fr_auto] md:items-end">
        <div>
          <p className="serif-title text-2xl text-ink">La Biblioteca de Apolo</p>
          <p className="mt-3 max-w-xl text-sm leading-6 text-ink-soft">
            Una revista/newsletter cultural independiente construida como un mapa de obsesiones.
          </p>
        </div>

        <nav className="flex flex-wrap gap-x-5 gap-y-3 text-sm font-medium text-ink-soft" aria-label="Navegación secundaria">
          {navItems.map((item) => (
            <Link key={item.href} href={item.href} className="transition-colors hover:text-ink">
              {item.label}
            </Link>
          ))}
          <Link href={subscribeHref} className="text-sepia transition-colors hover:text-ink">
            Suscribirse
          </Link>
        </nav>
      </div>
    </footer>
  )
}
