import { Category } from '@/types/post'
import { CATEGORY_META } from '@/lib/categories'

export interface CategoryConfig {
  label: string
  mapSrc: string
  accentColor: string
  bgColor: string
  description: string
}

export const CATEGORY_CONFIG: Record<Category, CategoryConfig> = Object.fromEntries(
  Object.entries(CATEGORY_META).map(([category, meta]) => [
    category,
    {
      label: meta.label,
      mapSrc: `/maps/${category}.svg`,
      accentColor: meta.accent,
      bgColor: meta.colors.paper,
      description: meta.description,
    },
  ])
) as Record<Category, CategoryConfig>
