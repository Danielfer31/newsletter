'use client'

import { useEffect, useRef } from 'react'

export interface GiscusCommentsProps {
  term: string
}

export default function GiscusComments({ term }: GiscusCommentsProps) {
  const containerRef = useRef<HTMLDivElement>(null)

  const repo = process.env.NEXT_PUBLIC_GISCUS_REPO
  const repoId = process.env.NEXT_PUBLIC_GISCUS_REPO_ID
  const category = process.env.NEXT_PUBLIC_GISCUS_CATEGORY
  const categoryId = process.env.NEXT_PUBLIC_GISCUS_CATEGORY_ID

  useEffect(() => {
    if (!repo || !repoId || !category || !categoryId) return
    if (!containerRef.current) return
    if (containerRef.current.querySelector('iframe.giscus-frame')) return

    const script = document.createElement('script')
    script.src = 'https://giscus.app/client.js'
    script.async = true
    script.crossOrigin = 'anonymous'
    script.setAttribute('data-repo', repo)
    script.setAttribute('data-repo-id', repoId)
    script.setAttribute('data-category', category)
    script.setAttribute('data-category-id', categoryId)
    script.setAttribute('data-mapping', 'specific')
    script.setAttribute('data-term', term)
    script.setAttribute('data-reactions-enabled', '1')
    script.setAttribute('data-emit-metadata', '0')
    script.setAttribute('data-input-position', 'bottom')
    script.setAttribute('data-theme', 'light')
    script.setAttribute('data-lang', 'es')

    containerRef.current.appendChild(script)
  }, [repo, repoId, category, categoryId, term])

  if (!repo || !repoId || !category || !categoryId) return null

  return (
    <div className="mx-auto mt-16 max-w-3xl border-t border-line pt-10">
      <p className="ui-label text-sepia mb-6">Comentarios</p>
      <div ref={containerRef} />
    </div>
  )
}
