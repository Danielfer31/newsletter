'use client'

import { useEffect, useState } from 'react'

export function ViewCounter({ slug }: { slug: string }) {
  const [views, setViews] = useState<number | null>(null)

  useEffect(() => {
    const storageKey = `viewed:${slug}`
    const alreadyViewed = sessionStorage.getItem(storageKey)

    const method = alreadyViewed ? 'GET' : 'POST'

    fetch(`/api/views/${slug}`, { method })
      .then(res => {
        if (!res.ok) throw new Error(`View counter request failed: ${res.status}`)
        return res.json()
      })
      .then((data: { views: number }) => {
        setViews(data.views)
        if (!alreadyViewed) {
          sessionStorage.setItem(storageKey, '1')
        }
      })
      .catch(err => {
        console.error('ViewCounter error:', err)
      })
  }, [slug])

  if (views === null || views === 0) return null

  return (
    <span className="ui-label text-ink-soft">
      {views} {views === 1 ? 'lectura' : 'lecturas'}
    </span>
  )
}
