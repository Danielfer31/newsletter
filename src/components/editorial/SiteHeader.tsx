'use client'

import Image from 'next/image'
import Link from 'next/link'
import { useState } from 'react'

export interface SiteHeaderNavItem {
  label: string
  href: string
}

export interface SiteHeaderProps {
  activeHref?: string
  brandLogoSrc?: string
  navItems?: SiteHeaderNavItem[]
  subscribeHref?: string
  variant?: 'paper' | 'night'
}

const DEFAULT_NAV_ITEMS: SiteHeaderNavItem[] = [
  { label: 'Archivo', href: '/archivo' },
  { label: 'Categorias', href: '/categorias' },
  { label: 'Sobre el proyecto', href: '/sobre-el-proyecto' },
]

const DEFAULT_BRAND_LOGO_SRC = '/images/brand/la-biblioteca-de-apolo-logo.png'

export default function SiteHeader({
  activeHref,
  brandLogoSrc = DEFAULT_BRAND_LOGO_SRC,
  navItems = DEFAULT_NAV_ITEMS,
  subscribeHref = '/sobre-el-proyecto#suscripcion',
  variant = 'paper',
}: SiteHeaderProps) {
  const isNight = variant === 'night'
  const [menuOpen, setMenuOpen] = useState(false)

  function closeMenu() {
    setMenuOpen(false)
  }

  return (
    <header
      className={[
        'site-header',
        isNight ? 'site-header-night' : 'site-header-paper',
      ].join(' ')}
    >
      <div className="editorial-shell site-header-shell">
        <Link
          href="/"
          className={[
            'site-header-brand',
            isNight ? 'text-paper-soft hover:text-gold' : 'text-ink hover:text-sepia',
          ].join(' ')}
          aria-label="Ir al inicio de La Biblioteca de Apolo"
          onClick={closeMenu}
        >
          {brandLogoSrc ? (
            <Image
              src={brandLogoSrc}
              alt=""
              width={88}
              height={88}
              priority
              className="site-header-logo"
              aria-hidden="true"
            />
          ) : (
            <>
              <span className="serif-title text-2xl leading-none">La Biblioteca de Apolo</span>
              <span className="hidden text-[0.65rem] font-semibold uppercase tracking-[0.18em] text-sepia sm:inline">
                est. MMXXVI
              </span>
            </>
          )}
        </Link>

        <button
          type="button"
          className={[
            'site-header-menu-toggle',
            isNight ? 'site-header-menu-toggle-night' : 'site-header-menu-toggle-paper',
          ].join(' ')}
          aria-label={menuOpen ? 'Cerrar navegacion' : 'Abrir navegacion'}
          aria-expanded={menuOpen}
          aria-controls="site-header-nav"
          onClick={() => setMenuOpen((current) => !current)}
        >
          {menuOpen ? <CloseIcon /> : <MenuIcon />}
        </button>

        <nav
          id="site-header-nav"
          className={[
            'site-header-nav',
            menuOpen ? 'site-header-nav-open' : '',
            isNight ? 'site-header-nav-night' : 'site-header-nav-paper',
            isNight ? 'text-white/72' : 'text-ink-soft',
          ].join(' ')}
          aria-label="Navegacion principal"
        >
          {navItems.map((item) => {
            const isActive = activeHref === item.href

            return (
              <Link
                key={item.href}
                href={item.href}
                aria-current={isActive ? 'page' : undefined}
                className={[
                  'site-header-link',
                  isNight
                    ? isActive
                      ? 'site-header-link-active site-header-link-night-active'
                      : 'site-header-link-night'
                    : isActive
                      ? 'site-header-link-active site-header-link-paper-active'
                      : 'site-header-link-paper',
                ].join(' ')}
                onClick={closeMenu}
              >
                {item.label}
              </Link>
            )
          })}

          <Link
            href={subscribeHref}
            className={[
              'site-header-subscribe',
              isNight ? 'site-header-subscribe-night' : 'site-header-subscribe-paper',
            ].join(' ')}
            onClick={closeMenu}
          >
            Suscribirse
          </Link>
        </nav>
      </div>
    </header>
  )
}

function MenuIcon() {
  return (
    <svg className="site-header-menu-icon" viewBox="0 0 24 24" fill="none" aria-hidden="true">
      <path d="M5 7.5h14M5 12h14M5 16.5h14" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" />
    </svg>
  )
}

function CloseIcon() {
  return (
    <svg className="site-header-menu-icon" viewBox="0 0 24 24" fill="none" aria-hidden="true">
      <path d="m7 7 10 10M17 7 7 17" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" />
    </svg>
  )
}
