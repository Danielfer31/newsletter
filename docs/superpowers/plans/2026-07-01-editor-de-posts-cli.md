# Editor de posts CLI — Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Build a Node CLI script (`npm run new-post`) that interactively creates a new markdown
post file in `content/posts/` with valid, correctly-shaped frontmatter.

**Architecture:** Single script `scripts/new-post.mjs` using Node's built-in `readline/promises`
for prompts and `gray-matter`'s `stringify()` to write the file. No new dependencies. A companion
reference doc `docs/CONTENT.md` documents valid enum values and usage.

**Tech Stack:** Node.js (ESM `.mjs`), `readline/promises` (built-in), `gray-matter` (already a
dependency).

---

There is no test framework in this project (no jest/vitest configured). Verification is manual:
run the script with real input, inspect the generated file, and confirm `npm run build` still
succeeds (proves `getAllPosts()`/`getPostBySlug()` parse the new file without error).

### Task 1: Slug + validation helpers

**Files:**
- Create: `scripts/lib/post-helpers.mjs`

- [ ] **Step 1: Write the helpers file**

```javascript
// scripts/lib/post-helpers.mjs

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
```

- [ ] **Step 2: Verify with a quick manual check**

Run:
```bash
node -e "import('./scripts/lib/post-helpers.mjs').then(m => { console.log(m.buildSlug('2026-07-01', 'Un Título con Ñ y Acentós!')); console.log(m.isValidHexColor('#f4efe4')); console.log(m.isValidHexColor('red')); })"
```
Expected output:
```
2026-07-01-un-titulo-con-n-y-acentos
true
false
```

- [ ] **Step 3: Commit**

```bash
git add scripts/lib/post-helpers.mjs
git commit -m "feat: add slug and validation helpers for post CLI"
```

---

### Task 2: Interactive CLI script

**Files:**
- Create: `scripts/new-post.mjs`

- [ ] **Step 1: Write the script**

```javascript
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
```

- [ ] **Step 2: Add npm script**

Modify `package.json` — add `"new-post"` to the `"scripts"` block:

```json
  "scripts": {
    "dev": "next dev",
    "build": "next build",
    "start": "next start",
    "lint": "eslint",
    "new-post": "node scripts/new-post.mjs"
  },
```

- [ ] **Step 3: Manual test — happy path**

Run:
```bash
npm run new-post
```
Answer prompts with test data (e.g. título "Post de Prueba CLI", categoria `opinion`, accept
defaults for fecha/imagen, extracto "Extracto de prueba", skip canción, fondo `#f4efe4`, acento
`#333333`, fuente `serif`, layout `pergamino`, skip ruta, skip notas).

Expected: script prints `Post creado: .../content/posts/2026-07-01-post-de-prueba-cli.md` and the
file exists.

- [ ] **Step 4: Verify generated frontmatter**

Open `content/posts/2026-07-01-post-de-prueba-cli.md` and confirm it matches this shape (values
per your test input):

```yaml
---
titulo: Post de Prueba CLI
categoria: opinion
fecha: '2026-07-01'
imagen: /images/placeholder-opinion.jpg
extracto: Extracto de prueba
tema:
  fondo: '#f4efe4'
  acento: '#333333'
  fuente: serif
layout: pergamino
---
# Post de Prueba CLI

Escribe el contenido aquí...
```

- [ ] **Step 5: Verify enum validation rejects bad input**

Run `npm run new-post` again, and when asked for **Categoría**, type `noexiste` first. Expected:
script prints `Valor inválido. Opciones válidas: geopolitica, anime, futbol, musica, rpg, cultura, opinion`
and re-prompts. Enter `Ctrl+C` to abort this test run.

- [ ] **Step 6: Verify duplicate-slug abort**

Run `npm run new-post` a third time, using the same título/fecha as Step 3 (so it resolves to the
same slug `2026-07-01-post-de-prueba-cli`). Expected: script prints
`Error: ya existe un post con el slug "2026-07-01-post-de-prueba-cli"` and exits with code 1
without overwriting the file.

- [ ] **Step 7: Verify the build picks up the new post**

Run:
```bash
npm run build
```
Expected: build succeeds (no gray-matter/type errors), confirming `getAllPosts()` parses the
generated file correctly.

- [ ] **Step 8: Delete the test post**

```bash
rm "content/posts/2026-07-01-post-de-prueba-cli.md"
```

- [ ] **Step 9: Commit**

```bash
git add scripts/new-post.mjs package.json
git commit -m "feat: add interactive CLI script for creating new posts"
```

---

### Task 3: Content reference doc

**Files:**
- Create: `docs/CONTENT.md`

- [ ] **Step 1: Write the doc**

```markdown
# Guía de contenido — La Biblioteca de Apolo

## Crear un post nuevo

```bash
npm run new-post
```

El script pregunta cada campo del frontmatter, valida los que tienen valores fijos (categoría,
layout, fuente), genera un slug automático (`<fecha>-<titulo-slugificado>`), y crea el archivo en
`content/posts/<slug>.md` con un cuerpo placeholder listo para editar.

## Editar un post existente

No hay script para esto — edita el `.md` directamente en `content/posts/` con cualquier editor.
El frontmatter es YAML; el cuerpo es markdown normal (soporta GFM vía `remark-gfm`).

## Valores válidos de frontmatter

**`categoria`**: `geopolitica` | `anime` | `futbol` | `musica` | `rpg` | `cultura` | `opinion`

**`layout`**: `pergamino` | `cosmos` | `carta` | `tablero` | `manga`

**`tema.fuente`**: `serif` | `sans` | `mono` | `display`

**`tema.fondo`** / **`tema.acento`**: colores hex de 6 dígitos, ej. `#f4efe4`

## Ejemplo de frontmatter completo

```yaml
---
titulo: "Boca es Boca y el resto es el resto"
categoria: futbol
fecha: "2026-06-24"
imagen: /images/placeholder-futbol.jpg
extracto: "Hay clubes de fútbol y hay religiones paganas. Boca es las dos cosas al mismo tiempo, y en esa contradicción está toda su grandeza."
cancion: https://open.spotify.com/track/2374M7fBbDrEGbFed0LUQB
tema:
  fondo: "#f4efe4"
  acento: "#596f45"
  fuente: sans
layout: tablero
ruta:
  - "2026-06-26-el-mundo-se-parte"
notasMargen:
  - title: "El Templo de Brandsen"
    body: "La Bombonera no solo alberga partidos; vibra físicamente debido a su estructura de hormigón armado, un latido que los rivales sienten como hostil."
---
```

## Imágenes

El script no sube ni gestiona imágenes. Coloca el archivo manualmente en `public/images/` y
referencia la ruta (`/images/nombre.jpg`) en el campo `imagen`.
```

- [ ] **Step 2: Commit**

```bash
git add docs/CONTENT.md
git commit -m "docs: add content authoring guide"
```

---

## Spec coverage check

- Interactive prompts for all frontmatter fields → Task 2 Step 1
- Enum validation with retry → Task 1 (helpers) + Task 2 (askFromEnum)
- Slug autogeneration + override → Task 1 (buildSlug) + Task 2
- Duplicate slug abort → Task 2 Step 1 (existsSync check) + Step 6 (verification)
- `matter.stringify` for file writing → Task 2 Step 1
- `npm run new-post` script → Task 2 Step 2
- `docs/CONTENT.md` reference doc → Task 3
- Manual testing (happy path, validation, duplicate, build) → Task 2 Steps 3-7
