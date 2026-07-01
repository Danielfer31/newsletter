#!/usr/bin/env node
// scripts/new-post.mjs
import fs from 'fs'
import path from 'path'
import readline from 'readline/promises'
import matter from 'gray-matter'
import {
  CATEGORIES,
  LAYOUTS,
  FONT_STYLES,
  buildSlug,
  todayISO,
  isValidHexColor,
} from './lib/post-helpers.mjs'

const POSTS_DIR = path.join(process.cwd(), 'content', 'posts')

const rl = readline.createInterface({ input: process.stdin, output: process.stdout })

async function askRequired(question) {
  let answer = ''
  while (!answer.trim()) {
    answer = await rl.question(question)
    if (!answer.trim()) console.log('Este campo es obligatorio.')
  }
  return answer.trim()
}

async function askOptional(question) {
  const answer = await rl.question(question)
  return answer.trim()
}

async function askFromEnum(question, allowed) {
  while (true) {
    const answer = (await rl.question(`${question} (${allowed.join(' | ')}): `)).trim()
    if (allowed.includes(answer)) return answer
    console.log(`Valor inválido. Opciones válidas: ${allowed.join(', ')}`)
  }
}

async function askHexColor(question, fallback) {
  while (true) {
    const raw = await rl.question(`${question}${fallback ? ` [${fallback}]` : ''}: `)
    const answer = raw.trim() || fallback
    if (answer && isValidHexColor(answer)) return answer
    console.log('Formato inválido. Usa un hex de 6 dígitos, ej: #f4efe4')
  }
}

async function main() {
  console.log('== Crear nuevo post ==\n')

  const titulo = await askRequired('Título: ')
  const categoria = await askFromEnum('Categoría', CATEGORIES)

  const fechaDefault = todayISO()
  const fechaRaw = await rl.question(`Fecha [${fechaDefault}]: `)
  const fecha = fechaRaw.trim() || fechaDefault

  const imagenDefault = `/images/placeholder-${categoria}.jpg`
  const imagenRaw = await rl.question(`Imagen [${imagenDefault}]: `)
  const imagen = imagenRaw.trim() || imagenDefault

  const extracto = await askRequired('Extracto: ')

  const cancion = await askOptional('Canción (URL de Spotify, opcional): ')

  console.log('\n-- Tema --')
  const fondo = await askHexColor('Color de fondo', '#f4efe4')
  const acento = await askHexColor('Color de acento', null)
  const fuente = await askFromEnum('Fuente', FONT_STYLES)

  const layout = await askFromEnum('Layout', LAYOUTS)

  const rutaRaw = await askOptional('Ruta (slugs separados por coma, opcional): ')
  const ruta = rutaRaw
    ? rutaRaw.split(',').map(s => s.trim()).filter(Boolean)
    : undefined

  console.log('\n-- Notas de margen (opcional, deja el título vacío para terminar) --')
  const notasMargen = []
  while (true) {
    const notaTitulo = await rl.question(`Nota #${notasMargen.length + 1} - título: `)
    if (!notaTitulo.trim()) break
    const notaBody = await askRequired(`Nota #${notasMargen.length + 1} - contenido: `)
    notasMargen.push({ title: notaTitulo.trim(), body: notaBody })
  }

  const defaultSlug = buildSlug(fecha, titulo)
  const slugRaw = await rl.question(`Slug [${defaultSlug}]: `)
  const slug = slugRaw.trim() || defaultSlug

  const filePath = path.join(POSTS_DIR, `${slug}.md`)
  if (fs.existsSync(filePath)) {
    console.error(`\nError: ya existe un post con el slug "${slug}" (${filePath}). Abortando.`)
    rl.close()
    process.exit(1)
  }

  const frontmatter = {
    titulo,
    categoria,
    fecha,
    imagen,
    extracto,
    ...(cancion ? { cancion } : {}),
    tema: { fondo, acento, fuente },
    layout,
    ...(ruta && ruta.length ? { ruta } : {}),
    ...(notasMargen.length ? { notasMargen } : {}),
  }

  const body = `# ${titulo}\n\nEscribe el contenido aquí...\n`
  const fileContents = matter.stringify(body, frontmatter)

  fs.mkdirSync(POSTS_DIR, { recursive: true })
  fs.writeFileSync(filePath, fileContents, 'utf-8')

  console.log(`\nPost creado: ${filePath}`)
  console.log('Abre el archivo y escribe el contenido.')

  rl.close()
}

main().catch(err => {
  console.error(err)
  rl.close()
  process.exit(1)
})
