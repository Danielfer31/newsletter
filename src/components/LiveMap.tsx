'use client'

import { useEffect, useState } from 'react'
import { AnimatePresence, motion } from 'framer-motion'
import { Category } from '@/types/post'
import { CATEGORY_CONFIG } from '@/lib/maps'

interface LiveMapProps {
  activeCategory: Category | null
}

export default function LiveMap({ activeCategory }: LiveMapProps) {
  const [currentCategory, setCurrentCategory] = useState<Category>('geopolitica')

  useEffect(() => {
    if (activeCategory) setCurrentCategory(activeCategory)
  }, [activeCategory])

  const config = CATEGORY_CONFIG[currentCategory]

  return (
    <div className="relative w-full h-screen overflow-hidden">
      {/* Background color transition */}
      <motion.div
        key={`bg-${currentCategory}`}
        className="absolute inset-0"
        style={{ backgroundColor: config.bgColor }}
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 0.8 }}
      />

      {/* Map SVG transition */}
      <AnimatePresence mode="wait">
        <motion.div
          key={currentCategory}
          className="absolute inset-0 flex items-center justify-center"
          initial={{ opacity: 0, scale: 1.02 }}
          animate={{ opacity: 1, scale: 1 }}
          exit={{ opacity: 0, scale: 0.98 }}
          transition={{ duration: 0.8, ease: 'easeInOut' }}
        >
          <img
            src={config.mapSrc}
            alt={`Mapa: ${config.label}`}
            className="w-full h-full object-cover opacity-60"
          />
        </motion.div>
      </AnimatePresence>

      {/* Gradient overlay — makes bottom content readable */}
      <div className="absolute bottom-0 left-0 right-0 h-1/2 bg-gradient-to-t from-black/80 to-transparent pointer-events-none" />

      {/* Site title */}
      <div className="absolute top-8 left-1/2 -translate-x-1/2 text-center z-10">
        <h1
          className="text-4xl md:text-5xl tracking-widest uppercase"
          style={{ color: 'var(--gold)', fontFamily: 'var(--font-serif)' }}
        >
          La Biblioteca de Apolo
        </h1>
        <motion.p
          key={`label-${currentCategory}`}
          className="text-sm tracking-[0.3em] uppercase mt-2"
          style={{ color: config.accentColor }}
          initial={{ opacity: 0, y: 5 }}
          animate={{ opacity: 0.8, y: 0 }}
          transition={{ duration: 0.5, delay: 0.3 }}
        >
          {config.description}
        </motion.p>
      </div>

      {/* Scroll indicator */}
      <div className="absolute bottom-8 left-1/2 -translate-x-1/2 z-10 flex flex-col items-center gap-2 opacity-50">
        <span className="text-xs tracking-widest uppercase" style={{ color: 'var(--gold)' }}>
          Explorar
        </span>
        <motion.div
          animate={{ y: [0, 6, 0] }}
          transition={{ repeat: Infinity, duration: 1.5 }}
          className="w-px h-8"
          style={{ backgroundColor: 'var(--gold)' }}
        />
      </div>
    </div>
  )
}
