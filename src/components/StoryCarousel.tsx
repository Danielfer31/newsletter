'use client'

import { useRef, useEffect, useState } from 'react'
import { Post, Category } from '@/types/post'
import PostCard from './PostCard'

interface StoryCarouselProps {
  posts: Post[]
  onCategoryChange?: (category: Category) => void
}

export default function StoryCarousel({ posts, onCategoryChange }: StoryCarouselProps) {
  const containerRef = useRef<HTMLDivElement>(null)
  const [isHovered, setIsHovered] = useState(false)
  const positionRef = useRef(0)
  const animFrameRef = useRef<number>(0)

  useEffect(() => {
    const container = containerRef.current
    if (!container) return

    const speed = 0.5

    const animate = () => {
      if (!isHovered && container) {
        positionRef.current += speed
        const halfWidth = container.scrollWidth / 2
        if (positionRef.current >= halfWidth) {
          positionRef.current = 0
        }
        container.style.transform = `translateX(-${positionRef.current}px)`
      }
      animFrameRef.current = requestAnimationFrame(animate)
    }

    animFrameRef.current = requestAnimationFrame(animate)
    return () => {
      if (animFrameRef.current) cancelAnimationFrame(animFrameRef.current)
    }
  }, [isHovered])

  // Duplicate posts for seamless infinite loop
  const loopedPosts = [...posts, ...posts, ...posts]

  return (
    <div className="relative py-12 overflow-hidden" style={{ backgroundColor: 'var(--bg-base)' }}>
      {/* Left fade */}
      <div
        className="absolute left-0 top-0 bottom-0 w-20 z-10 pointer-events-none"
        style={{ background: 'linear-gradient(to right, var(--bg-base), transparent)' }}
      />

      {/* Carousel track */}
      <div
        className="flex gap-6 px-6"
        ref={containerRef}
        style={{ width: 'max-content' }}
        onMouseEnter={() => setIsHovered(true)}
        onMouseLeave={() => setIsHovered(false)}
      >
        {loopedPosts.map((post, index) => (
          <PostCard
            key={`${post.slug}-${index}`}
            post={post}
            onHover={onCategoryChange}
          />
        ))}
      </div>

      {/* Right fade */}
      <div
        className="absolute right-0 top-0 bottom-0 w-20 z-10 pointer-events-none"
        style={{ background: 'linear-gradient(to left, var(--bg-base), transparent)' }}
      />

      {/* Label */}
      <div className="absolute top-4 left-1/2 -translate-x-1/2 z-10">
        <p
          className="text-xs tracking-[0.4em] uppercase opacity-40"
          style={{ color: 'var(--gold)' }}
        >
          Últimas entradas
        </p>
      </div>
    </div>
  )
}
