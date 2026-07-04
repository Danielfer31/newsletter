"use client"

import { useEffect, useRef } from 'react'

type Star = {
  x: number
  y: number
  radius: number
  baseAlpha: number
  twinkle: number
  phase: number
  tint: string
}

const STAR_COUNT = 380

function seededRandom(seed: number) {
  let value = seed

  return () => {
    value = (value * 16807) % 2147483647
    return (value - 1) / 2147483646
  }
}

function createStars(width: number, height: number) {
  const random = seededRandom(Math.round(width * 13 + height * 17 + 42))
  const stars: Star[] = []

  for (let index = 0; index < STAR_COUNT; index += 1) {
    const bright = random() > 0.8

    stars.push({
      x: random() * width,
      y: random() * height,
      radius: bright ? 1.35 + random() * 2.1 : 0.55 + random() * 1.1,
      baseAlpha: bright ? 0.72 + random() * 0.24 : 0.32 + random() * 0.5,
      twinkle: bright ? 0.14 + random() * 0.2 : 0.08 + random() * 0.18,
      phase: random() * Math.PI * 2,
      tint: random() > 0.74 ? '255, 222, 168' : random() > 0.46 ? '216, 230, 255' : '255, 255, 245',
    })
  }

  return stars
}

export default function HomeStarfield() {
  const canvasRef = useRef<HTMLCanvasElement>(null)

  useEffect(() => {
    const canvas = canvasRef.current
    if (!canvas) return

    const context = canvas.getContext('2d')
    if (!context) return

    const reducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches
    let animationFrame = 0
    let stars: Star[] = []

    const resize = () => {
      const dpr = Math.min(window.devicePixelRatio || 1, 2)
      const width = window.innerWidth
      const height = window.innerHeight

      canvas.width = Math.floor(width * dpr)
      canvas.height = Math.floor(height * dpr)
      canvas.style.width = `${width}px`
      canvas.style.height = `${height}px`
      context.setTransform(dpr, 0, 0, dpr, 0, 0)
      stars = createStars(width, height)
    }

    const draw = (time = 0) => {
      const width = window.innerWidth
      const height = window.innerHeight

      context.clearRect(0, 0, width, height)

      const deepGradient = context.createLinearGradient(0, 0, width, height)
      deepGradient.addColorStop(0, '#030814')
      deepGradient.addColorStop(0.44, '#071224')
      deepGradient.addColorStop(1, '#02040c')
      context.fillStyle = deepGradient
      context.fillRect(0, 0, width, height)

      const dust = context.createRadialGradient(width * 0.68, height * 0.2, 0, width * 0.68, height * 0.2, width * 0.72)
      dust.addColorStop(0, 'rgba(182, 199, 237, 0.2)')
      dust.addColorStop(0.36, 'rgba(110, 132, 183, 0.12)')
      dust.addColorStop(1, 'rgba(3, 8, 20, 0)')
      context.fillStyle = dust
      context.fillRect(0, 0, width, height)

      stars.forEach((star) => {
        const pulse = reducedMotion ? 0 : Math.sin(time * 0.0011 + star.phase) * star.twinkle
        const alpha = Math.max(0.12, Math.min(0.96, star.baseAlpha + pulse))

        context.beginPath()
        context.arc(star.x, star.y, star.radius, 0, Math.PI * 2)
        context.fillStyle = `rgba(${star.tint}, ${alpha})`
        context.shadowBlur = star.radius > 1.5 ? 8 : 3
        context.shadowColor = `rgba(${star.tint}, ${alpha * 0.75})`
        context.fill()
      })

      context.shadowBlur = 0

      if (!reducedMotion) {
        animationFrame = window.requestAnimationFrame(draw)
      }
    }

    resize()
    draw()

    if (!reducedMotion) {
      animationFrame = window.requestAnimationFrame(draw)
    }

    window.addEventListener('resize', resize)

    return () => {
      window.removeEventListener('resize', resize)
      window.cancelAnimationFrame(animationFrame)
    }
  }, [])

  return (
    <div className="home-starfield" aria-hidden="true">
      <canvas ref={canvasRef} className="home-starfield-canvas" />
      <div className="home-starfield-vignette" />
      <div className="home-starfield-grain" />
    </div>
  )
}
