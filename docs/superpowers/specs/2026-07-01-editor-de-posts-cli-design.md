# Editor de posts — CLI script

## Contexto

Los posts son archivos markdown con frontmatter YAML en `content/posts/*.md`, leídos en build
time por `src/lib/posts.ts` (fs + gray-matter). No hay backend ni base de datos. Hoy, agregar un
post nuevo requiere escribir el `.md` a mano, incluyendo un frontmatter con varios campos tipados
(`src/types/post.ts`) y valores que deben respetar enums (`categoria`, `layout`, `tema.fuente`).
Es fácil equivocarse (typo en categoría, campo faltante, YAML mal indentado).

## Objetivo

Dar una forma rápida y sin fricción de crear un post nuevo con frontmatter válido, sin agregar
infraestructura nueva (sin admin web, sin CMS externo) — proyecto de un solo autor.

## Diseño

### `scripts/new-post.mjs`

Script Node ejecutado con `npm run new-post`. Usa el módulo `readline/promises` nativo (sin
dependencias nuevas) para hacer preguntas secuenciales, y `gray-matter` (ya en `package.json`)
para serializar el frontmatter.

Flujo de preguntas:

1. **Título** (`titulo`, string, requerido)
2. **Categoría** (`categoria`) — valida contra el enum de `Category` en `src/types/post.ts`
   (`geopolitica | anime | futbol | musica | rpg | cultura | opinion`); reintenta si no matchea
3. **Fecha** (`fecha`) — default: hoy en formato `YYYY-MM-DD`, aceptar override
4. **Imagen** (`imagen`) — ruta tipo `/images/...`, default `/images/placeholder-<categoria>.jpg`
5. **Extracto** (`extracto`, string, requerido)
6. **Canción** (`cancion`, opcional) — URL de Spotify, se puede dejar vacío
7. **Tema**:
   - `fondo` (hex color, default sugerido por categoría si existe patrón previo, si no `#f4efe4`)
   - `acento` (hex color, requerido)
   - `fuente` — valida contra `FontStyle` (`serif | sans | mono | display`)
8. **Layout** (`layout`) — valida contra `Layout` (`pergamino | cosmos | carta | tablero | manga`)
9. **Ruta** (`ruta`, opcional) — lista de slugs separados por coma; no se valida contra posts
   existentes (puede referenciar un post que se cree después)
10. **Notas de margen** (`notasMargen`, opcional) — loop: pregunta título+body, repite hasta que
    el usuario responda vacío al título

### Slug

Autogenerado como `<fecha>-<titulo-slugificado>` (slugify: minúsculas, espacios→guiones, sin
tildes/símbolos). Se muestra al usuario con opción de sobrescribir antes de confirmar.

### Escritura del archivo

- Verifica que `content/posts/<slug>.md` no exista ya; si existe, aborta con error.
- Usa `matter.stringify(body, frontmatterObject)` para generar el archivo con frontmatter YAML
  correctamente formateado.
- `body` es un placeholder: `# <titulo>\n\nEscribe el contenido aquí...\n`
- Al terminar, imprime la ruta del archivo creado y recuerda abrirlo para escribir el contenido.

### Validación de campos enum

Reutiliza las listas de valores válidos definidas inline en el script (duplicadas de
`src/types/post.ts` como arrays de constantes, ya que el script corre con Node plano sin
transpilar TypeScript). Si el usuario da un valor inválido, se le muestra la lista de opciones
válidas y se le vuelve a preguntar.

### `docs/CONTENT.md`

Documento de referencia corto con:
- Los valores válidos de cada campo enum (`categoria`, `layout`, `tema.fuente`)
- Un ejemplo de frontmatter completo (tomado de un post real)
- Instrucciones de uso: `npm run new-post`, y cómo editar un post existente (directamente el
  `.md`, no requiere el script)

### `package.json`

Agrega script:
```json
"new-post": "node scripts/new-post.mjs"
```

## Fuera de alcance

- Edición de posts existentes vía el script (se edita el `.md` directamente con cualquier editor)
- Validación de que `ruta` apunte a slugs existentes
- Subida/gestión de imágenes (el usuario coloca el archivo en `public/images/` manualmente)
- UI web o CMS

## Testing

- Correr `npm run new-post`, completar flujo con datos de prueba, verificar que el `.md`
  generado tiene frontmatter válido y es parseado correctamente por `getAllPosts()` /
  `getPostBySlug()` sin errores.
- Probar validación de enum inválido (categoría mal escrita) y confirmar reintento.
- Probar abort cuando el slug ya existe.
