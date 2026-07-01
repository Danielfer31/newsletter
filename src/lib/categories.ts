import { Category } from '@/types/post'

export type CategoryIcon =
  | 'globe'
  | 'waves'
  | 'ball'
  | 'music'
  | 'pen'
  | 'dice'
  | 'archive'

export interface CategoryCoordinates {
  x: number
  y: number
  label: string
}

export interface CategoryPalette {
  accent: string
  accentSoft: string
  paper: string
  ink: string
}

export type RouteLayout =
  | 'dossier'
  | 'voyage'
  | 'tactics'
  | 'constellation'
  | 'margin'
  | 'campaign'
  | 'cabinet'

export interface RouteExperience {
  headline: string
  deck: string
  mood: string
  motif: string
  carouselSignal: string
  carouselArtifact: string
  carouselCue: string
  carouselVolume: string
  layout: RouteLayout
  primaryModuleLabel: string
  secondaryModuleLabel: string
  emptyState: string
}

export interface CategoryMeta {
  slug: Category
  label: string
  shortLabel: string
  imageSrc: string
  accent: string
  colors: CategoryPalette
  description: string
  longDescription: string
  mapExpression: string
  coordinates: CategoryCoordinates
  icon: CategoryIcon
  routeExperience: RouteExperience
}

export const CATEGORY_ORDER: Category[] = [
  'geopolitica',
  'anime',
  'futbol',
  'musica',
  'opinion',
  'rpg',
  'cultura',
]

export const CATEGORY_META: Record<Category, CategoryMeta> = {
  geopolitica: {
    slug: 'geopolitica',
    label: 'Geopolítica',
    shortLabel: 'Política',
    imageSrc: '/images/routes/geopolitica.png',
    accent: '#b55249',
    colors: {
      accent: '#b55249',
      accentSoft: '#f8e8e4',
      paper: '#fff6ec',
      ink: '#1f1f1c',
    },
    description: 'Mapas de poder, fronteras y corrientes',
    longDescription:
      'Mapas de poder, fronteras y las corrientes que mueven al mundo: relaciones internacionales, economía política y tablero global.',
    mapExpression: 'Rutas globales, fronteras tensas y líneas de fractura',
    coordinates: { x: 42, y: 34, label: '41°N 12°E' },
    icon: 'globe',
    routeExperience: {
      headline: 'Dossier de fronteras, pactos y líneas de fractura',
      deck: 'Una sala de mapas para leer el poder: cables, tratados, economías y territorios en tensión.',
      mood: 'Sala de mapas',
      motif: 'Fronteras, cables diplomáticos y coordenadas de crisis',
      carouselSignal: 'Tablero mundial',
      carouselArtifact: 'Fronteras, pactos y líneas de fractura',
      carouselCue: 'Pulso rojo',
      carouselVolume: 'Atlas de poder',
      layout: 'dossier',
      primaryModuleLabel: 'Expedientes recientes',
      secondaryModuleLabel: 'Lectura de tablero',
      emptyState: 'Esta mesa diplomática aún no tiene expedientes publicados.',
    },
  },
  anime: {
    slug: 'anime',
    label: 'Anime',
    shortLabel: 'Anime',
    imageSrc: '/images/routes/anime.png',
    accent: '#2f7f95',
    colors: {
      accent: '#2f7f95',
      accentSoft: '#e5f3f5',
      paper: '#f4fbfa',
      ink: '#1f1f1c',
    },
    description: 'Series, autoría y cultura cuadro a cuadro',
    longDescription:
      'Lecturas largas sobre series, autoría, personajes e ideas que cruzan fronteras entre la épica, la amistad y la imaginación popular.',
    mapExpression: 'Rutas marítimas, islas, corrientes y marcas de aventura',
    coordinates: { x: 66, y: 42, label: '35°N 139°E' },
    icon: 'waves',
    routeExperience: {
      headline: 'Un mar de islas, promesas y personajes en viaje',
      deck: 'Lecturas sobre series, autoría y épica popular trazadas como rutas marítimas.',
      mood: 'Cuaderno de aventura',
      motif: 'Islas, corrientes, paneles limpios y marcas de viaje',
      carouselSignal: 'Mar abierto',
      carouselArtifact: 'Islas, aventuras y personajes en ruta',
      carouselCue: 'Azul marea',
      carouselVolume: 'Cuaderno manga',
      layout: 'voyage',
      primaryModuleLabel: 'Bitácora reciente',
      secondaryModuleLabel: 'Islas narrativas',
      emptyState: 'Esta ruta marítima aún espera su próxima bitácora.',
    },
  },
  futbol: {
    slug: 'futbol',
    label: 'Fútbol',
    shortLabel: 'Cancha',
    imageSrc: '/images/routes/futbol.png',
    accent: '#66814f',
    colors: {
      accent: '#66814f',
      accentSoft: '#edf4e8',
      paper: '#f7faef',
      ink: '#1f1f1c',
    },
    description: 'Tácticas, mitologías y geografías del balón',
    longDescription:
      'El juego como texto: táctica, cultura, negocio, pasión y geografías del balón.',
    mapExpression: 'Geometría de cancha, zonas de presión y flechas tácticas',
    coordinates: { x: 28, y: 58, label: '34°S 58°O' },
    icon: 'ball',
    routeExperience: {
      headline: 'La cancha como mapa: zonas, mitos y presión',
      deck: 'Táctica, cultura y pasión leídas desde una pizarra que también es crónica.',
      mood: 'Pizarra táctica',
      motif: 'Campo, flechas de presión, zonas y marcador editorial',
      carouselSignal: 'Cancha viva',
      carouselArtifact: 'Zonas, mitos y geometría del juego',
      carouselCue: 'Verde táctico',
      carouselVolume: 'Pizarra de juego',
      layout: 'tactics',
      primaryModuleLabel: 'Jugadas recientes',
      secondaryModuleLabel: 'Mapa de partido',
      emptyState: 'La pizarra está lista, pero todavía no hay jugadas publicadas.',
    },
  },
  musica: {
    slug: 'musica',
    label: 'Música',
    shortLabel: 'Música',
    imageSrc: '/images/routes/musica.png',
    accent: '#7d6390',
    colors: {
      accent: '#7d6390',
      accentSoft: '#f1eaf6',
      paper: '#fbf6ff',
      ink: '#1f1f1c',
    },
    description: 'Discos, escenas y obsesiones sonoras',
    longDescription:
      'Discos, escenas, géneros y obsesiones sonoras anotadas como coordenadas de memoria.',
    mapExpression: 'Pentagramas cartográficos, constelaciones y rutas entre escenas',
    coordinates: { x: 58, y: 68, label: '40°N 3°O' },
    icon: 'music',
    routeExperience: {
      headline: 'Constelaciones sonoras para ordenar la memoria',
      deck: 'Discos, escenas y obsesiones auditivas conectadas por ondas, noches y rutas.',
      mood: 'Constelación sonora',
      motif: 'Ondas, vinilos, pentagramas cartográficos y escenas conectadas',
      carouselSignal: 'Constelación sonora',
      carouselArtifact: 'Discos, escenas y memoria auditiva',
      carouselCue: 'Violeta nocturno',
      carouselVolume: 'Vinilo anotado',
      layout: 'constellation',
      primaryModuleLabel: 'Lado A',
      secondaryModuleLabel: 'Escenas conectadas',
      emptyState: 'La aguja todavía no cae sobre ninguna entrada publicada.',
    },
  },
  opinion: {
    slug: 'opinion',
    label: 'Opinión',
    shortLabel: 'Opinión',
    imageSrc: '/images/routes/opinion.png',
    accent: '#bc9342',
    colors: {
      accent: '#bc9342',
      accentSoft: '#f8efd9',
      paper: '#fff9ec',
      ink: '#1f1f1c',
    },
    description: 'Dudas en voz alta, sin certezas de molde',
    longDescription:
      'Columnas personales, ensayos breves y dudas en voz alta para pensar el presente sin certezas de molde.',
    mapExpression: 'Terra incógnita, notas al margen y brújulas argumentales',
    coordinates: { x: 48, y: 50, label: '00°00′' },
    icon: 'pen',
    routeExperience: {
      headline: 'Ensayos al margen para pensar sin molde',
      deck: 'Una brújula argumental hecha de dudas, subrayados y notas personales.',
      mood: 'Margen abierto',
      motif: 'Notas al margen, subrayados, brújula y terra incognita',
      carouselSignal: 'Margen abierto',
      carouselArtifact: 'Ideas en borrador y dudas con brújula',
      carouselCue: 'Dorado ensayo',
      carouselVolume: 'Ensayo al margen',
      layout: 'margin',
      primaryModuleLabel: 'Cuadernos recientes',
      secondaryModuleLabel: 'Preguntas guía',
      emptyState: 'El margen está abierto, pero aún no hay columnas publicadas.',
    },
  },
  rpg: {
    slug: 'rpg',
    label: 'RPG',
    shortLabel: 'RPG',
    imageSrc: '/images/routes/rpg.png',
    accent: '#927149',
    colors: {
      accent: '#927149',
      accentSoft: '#f4eadc',
      paper: '#fff7ea',
      ink: '#1f1f1c',
    },
    description: 'Diarios de partida, mundos y dados',
    longDescription:
      'Diarios de partida, diseño de mundos, juegos de mesa y dados que cuentan historias.',
    mapExpression: 'Caminos de mazmorra, hexágonos, marcas de terreno y azar',
    coordinates: { x: 72, y: 28, label: '48°N 11°E' },
    icon: 'dice',
    routeExperience: {
      headline: 'Mapas de campaña, dados y mundos posibles',
      deck: 'Diarios de partida, reglas y territorios imaginarios para jugar pensando.',
      mood: 'Mesa de campaña',
      motif: 'Hexágonos, dados, rutas de mazmorra y terreno',
      carouselSignal: 'Mesa de aventura',
      carouselArtifact: 'Dados, mapas hexagonales y mundos posibles',
      carouselCue: 'Sepia legendario',
      carouselVolume: 'Manual de campaña',
      layout: 'campaign',
      primaryModuleLabel: 'Diario de partida',
      secondaryModuleLabel: 'Mesa preparada',
      emptyState: 'La campaña está preparada, pero aún no empieza la sesión.',
    },
  },
  cultura: {
    slug: 'cultura',
    label: 'Cultura',
    shortLabel: 'Cultura pop',
    imageSrc: '/images/routes/cultura.png',
    accent: '#4f8991',
    colors: {
      accent: '#4f8991',
      accentSoft: '#e8f3f4',
      paper: '#f3faf8',
      ink: '#1f1f1c',
    },
    description: 'Cine, libros y rarezas de archivo',
    longDescription:
      'Cine, libros, objetos pop y rarezas que merecen una entrada en el archivo.',
    mapExpression: 'Mapa orbital de ideas, archivo vivo y conexiones culturales',
    coordinates: { x: 36, y: 76, label: '48°N 2°E' },
    icon: 'archive',
    routeExperience: {
      headline: 'Un gabinete de objetos, rarezas y referencias pop',
      deck: 'Cine, libros, archivo y cultura popular ordenados como vitrinas conectadas.',
      mood: 'Gabinete pop',
      motif: 'Fichas, vitrinas, órbitas de referencias y objetos culturales',
      carouselSignal: 'Archivo orbital',
      carouselArtifact: 'Cine, libros y rarezas conectadas',
      carouselCue: 'Azul archivo',
      carouselVolume: 'Gabinete pop',
      layout: 'cabinet',
      primaryModuleLabel: 'Piezas recientes',
      secondaryModuleLabel: 'Archivo orbital',
      emptyState: 'El gabinete está abierto, pero todavía no hay piezas publicadas.',
    },
  },
}

export function getCategoryMeta(category: Category): CategoryMeta {
  return CATEGORY_META[category]
}

export function isCategory(value: string): value is Category {
  return CATEGORY_ORDER.includes(value as Category)
}

export function getRouteHref(category: Category): string {
  return `/rutas/${category}`
}
