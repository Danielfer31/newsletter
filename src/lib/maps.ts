import { Category } from '@/types/post'

export interface CategoryConfig {
  label: string
  mapSrc: string
  accentColor: string
  bgColor: string
  description: string
}

export const CATEGORY_CONFIG: Record<Category, CategoryConfig> = {
  geopolitica: {
    label: 'Geopolítica',
    mapSrc: '/maps/geopolitica.svg',
    accentColor: '#8B0000',
    bgColor: '#0d0d1a',
    description: 'El tablero global',
  },
  anime: {
    label: 'Anime',
    mapSrc: '/maps/anime.svg',
    accentColor: '#1a6b8a',
    bgColor: '#0a1628',
    description: 'Los 4 mares y más allá',
  },
  futbol: {
    label: 'Fútbol',
    mapSrc: '/maps/futbol.svg',
    accentColor: '#2d6a4f',
    bgColor: '#001a00',
    description: 'La cancha del mundo',
  },
  musica: {
    label: 'Música',
    mapSrc: '/maps/musica.svg',
    accentColor: '#6b2fa0',
    bgColor: '#0d0a1a',
    description: 'El mapa de las estrellas',
  },
  rpg: {
    label: 'RPG',
    mapSrc: '/maps/rpg.svg',
    accentColor: '#b5660a',
    bgColor: '#1a0d00',
    description: 'Tierras desconocidas',
  },
  cultura: {
    label: 'Cultura',
    mapSrc: '/maps/cultura.svg',
    accentColor: '#0a8b8b',
    bgColor: '#001a1a',
    description: 'El universo observable',
  },
  opinion: {
    label: 'Opinión',
    mapSrc: '/maps/opinion.svg',
    accentColor: '#c9a84c',
    bgColor: '#1a1400',
    description: 'Terra incógnita',
  },
}
