export const CATEGORIES = ['geopolitica', 'anime', 'futbol', 'musica', 'rpg', 'cultura', 'opinion']
export const LAYOUTS = ['pergamino', 'cosmos', 'carta', 'tablero', 'manga']
export const FONT_STYLES = ['serif', 'sans', 'mono', 'display']

export function slugify(text) {
  return text
    .normalize('NFD')
    .replace(/[̀-ͯ]/g, '') // strip accents
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9\s-]/g, '')
    .replace(/\s+/g, '-')
    .replace(/-+/g, '-')
    .replace(/^-|-$/g, '')
}

export function todayISO() {
  const d = new Date()
  const yyyy = d.getFullYear()
  const mm = String(d.getMonth() + 1).padStart(2, '0')
  const dd = String(d.getDate()).padStart(2, '0')
  return `${yyyy}-${mm}-${dd}`
}

export function buildSlug(fecha, titulo) {
  return `${fecha}-${slugify(titulo)}`
}

export function isValidHexColor(value) {
  return /^#[0-9a-fA-F]{6}$/.test(value)
}
