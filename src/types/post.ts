export type Category =
  | 'geopolitica'
  | 'anime'
  | 'futbol'
  | 'musica'
  | 'rpg'
  | 'cultura'
  | 'opinion'

export type Layout = 'pergamino' | 'cosmos' | 'carta' | 'tablero' | 'manga'

export type FontStyle = 'serif' | 'sans' | 'mono' | 'display'

export interface PostTheme {
  fondo: string
  acento: string
  fuente: FontStyle
}

export interface PostFrontmatter {
  titulo: string
  categoria: Category
  fecha: string
  imagen: string
  extracto: string
  cancion?: string
  tema: PostTheme
  layout: Layout
}

export interface Post extends PostFrontmatter {
  slug: string
  contenido: string
}
