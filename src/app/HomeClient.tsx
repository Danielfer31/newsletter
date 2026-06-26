'use client'

import { useState } from 'react'
import { Category, Post } from '@/types/post'
import LiveMap from '@/components/LiveMap'
import StoryCarousel from '@/components/StoryCarousel'

export default function HomeClient({ posts }: { posts: Post[] }) {
  const [activeCategory, setActiveCategory] = useState<Category | null>(null)

  return (
    <main>
      <LiveMap activeCategory={activeCategory} />
      <StoryCarousel posts={posts} onCategoryChange={setActiveCategory} />
    </main>
  )
}
