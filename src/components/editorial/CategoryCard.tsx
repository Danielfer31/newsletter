'use client'

import Link from 'next/link'
import Image from 'next/image'
import { CATEGORY_META, CategoryMeta } from '@/lib/categories'
import { Category } from '@/types/post'

export interface CategoryCardProps {
  category: Category
  href?: string
  active?: boolean
  compact?: boolean
  onSelect?: (category: Category) => void
}

export default function CategoryCard({ category, href, active = false, compact = false, onSelect }: CategoryCardProps) {
  const meta = CATEGORY_META[category]
  const content = <CategoryCardContent meta={meta} active={active} compact={compact} />

  if (href) {
    return (
      <Link href={href} className="block">
        {content}
      </Link>
    )
  }

  return (
    <button type="button" className="block w-full text-left" onClick={() => onSelect?.(category)}>
      {content}
    </button>
  )
}

function CategoryCardContent({
  meta,
  active,
  compact,
}: {
  meta: CategoryMeta
  active: boolean
  compact: boolean
}) {
  return (
    <span
      className={[
        'group block border bg-paper-soft transition-colors hover:bg-paper',
        compact ? 'p-4' : 'p-5',
        active ? 'border-current' : 'border-line',
      ].join(' ')}
      style={{ color: meta.accent }}
    >
      {!compact ? (
        <span className="relative mb-4 block aspect-[16/9] overflow-hidden border border-line bg-paper">
          <Image
            src={meta.imageSrc}
            alt=""
            fill
            sizes="(min-width: 1280px) 320px, (min-width: 768px) 50vw, 100vw"
            className="object-cover opacity-85 mix-blend-multiply transition-transform duration-500 group-hover:scale-105"
          />
          <span className="absolute inset-0 bg-[linear-gradient(180deg,rgba(255,250,241,0.02),rgba(255,250,241,0.35))]" aria-hidden="true" />
        </span>
      ) : null}
      <span className="flex items-center justify-between gap-4">
        <span className="font-semibold text-ink">{meta.label}</span>
        <span className="h-px flex-1 bg-current opacity-35" aria-hidden="true" />
      </span>
      <span className="mt-3 block text-sm leading-6 text-ink-soft">{compact ? meta.description : meta.longDescription}</span>
      {!compact ? <span className="ui-label mt-4 block normal-case tracking-normal">{meta.coordinates.label}</span> : null}
    </span>
  )
}
