# Rutas Independientes — La Biblioteca de Apolo

**Fecha:** 2026-07-01  
**Estado:** Diseño aprobado por dirección editorial  
**Objetivo:** Convertir cada ruta temática en una página independiente con personalidad propia.

## Contexto

Hoy las rutas existen como metadatos y como selector dentro de `/categorias?categoria=<slug>`. Esa vista funciona como explorador general, pero no da suficiente espacio para que Anime, Fútbol, Música, Geopolítica, Opinión, RPG y Cultura se sientan como mundos editoriales propios.

La nueva dirección es crear páginas independientes por ruta. Cada una debe sentirse distinta, memorable y editorial, sin romper el ADN visual de La Biblioteca de Apolo.

## Principio De Diseño

Cada ruta será una pequeña portada/revista temática.

Todas compartirán:

- Header y navegación global.
- Base cálida de papel editorial.
- Tipografía serif para títulos y sans para UI.
- Metáfora cartográfica.
- Acceso a entradas recientes y archivo.
- Enlaces hacia otras rutas.

Cada una diferirá en:

- Composición del hero.
- Motivo visual principal.
- Ritmo de layout.
- Módulos editoriales destacados.
- Imagen, mapa o sistema gráfico.
- Tono microcopy.

## Arquitectura De Rutas

La estructura pública será:

```text
/categorias
/rutas/geopolitica
/rutas/anime
/rutas/futbol
/rutas/musica
/rutas/opinion
/rutas/rpg
/rutas/cultura
```

`/categorias` queda como mapa general de todas las rutas. No desaparece.

`/rutas/[categoria]` será la portada independiente de cada ruta.

Los enlaces desde carruseles, tarjetas y selectores deben apuntar a `/rutas/<slug>` cuando la intención sea entrar en una ruta. `/categorias` queda para explorar el atlas completo.

## Personalidades Por Ruta

### Geopolítica

**Idea:** sala de mapas y dossier diplomático.  
**Motivos:** fronteras, líneas de fractura, cables, coordenadas, mapas sobrios.  
**Layout:** hero tipo informe, bloque de contexto, entradas como expedientes.  
**Tono:** analítico, sobrio, global.

### Anime

**Idea:** mar abierto y cuaderno de aventura.  
**Motivos:** islas, corrientes, paneles limpios, rutas marítimas, personajes como brújulas narrativas.  
**Layout:** hero más expansivo, paneles tipo manga editorial, módulos de viaje/episodio.  
**Tono:** imaginativo, emocional, épico sin exagerar.

### Fútbol

**Idea:** pizarra táctica y crónica de estadio.  
**Motivos:** cancha, zonas de presión, flechas tácticas, marcador sobrio.  
**Layout:** hero con campo abstracto, entradas ordenadas como jugadas o análisis.  
**Tono:** táctico, pasional, directo.

### Música

**Idea:** constelación sonora.  
**Motivos:** ondas, vinilos, pentagramas cartográficos, escenas conectadas.  
**Layout:** hero más rítmico, bloques como lados A/B, lista de escuchas o escenas.  
**Tono:** sensorial, nocturno, de memoria cultural.

### Opinión

**Idea:** margen de ensayo y brújula argumental.  
**Motivos:** notas al margen, subrayados, brújulas, terra incognita.  
**Layout:** más literario y contenido, con énfasis en textos, citas y preguntas.  
**Tono:** personal, reflexivo, con dudas visibles.

### RPG

**Idea:** mapa de campaña y diario de partida.  
**Motivos:** hexágonos, dados, rutas de mazmorra, fichas, terreno.  
**Layout:** hero como mesa de campaña, módulos de mundo/regla/partida.  
**Tono:** narrativo, lúdico, aventurero.

### Cultura

**Idea:** gabinete de archivo pop.  
**Motivos:** objetos culturales, fichas, órbitas de referencias, vitrinas.  
**Layout:** hero tipo archivo curado, mosaico editorial de objetos y entradas.  
**Tono:** curioso, archivístico, conectivo.

## Modelo De Página

Aunque cada ruta tenga layout propio, todas deben resolver estas funciones:

1. Presentar la identidad de la ruta.
2. Explicar por qué existe y qué tipo de obsesiones contiene.
3. Mostrar entradas destacadas o recientes de esa categoría.
4. Ofrecer un gesto visual/motivacional único.
5. Permitir saltar a otras rutas.
6. Mantener la marca global del sitio.

## Datos Y Componentes

La implementación debe apoyarse en `CATEGORY_META` como fuente canónica, pero puede extenderla con campos de experiencia:

```ts
routeExperience: {
  headline: string
  deck: string
  mood: string
  motif: string
  layout: 'dossier' | 'voyage' | 'tactics' | 'constellation' | 'margin' | 'campaign' | 'cabinet'
  primaryModuleLabel: string
}
```

No se deben duplicar textos o colores en cada página manualmente si pueden vivir en la metadata.

## Navegación

- Header global permanece igual.
- `/categorias` debe enlazar a cada `/rutas/<slug>`.
- Cada página de ruta debe incluir navegación lateral o inferior hacia las otras rutas.
- Los enlaces de entradas llevan a `/post/<slug>`.
- Si una categoría no tiene entradas, la ruta igual debe renderizar con un estado editorial vacío, no con error.

## SEO Y Metadata

Cada ruta debe generar metadata propia:

- Title: `<Ruta> — La Biblioteca de Apolo`
- Description basada en `longDescription` o `routeExperience.deck`.

Las rutas inválidas deben usar `notFound()`.

## Responsive

Desktop:

- Cada ruta puede tener composición propia.
- El hero debe dejar ver el siguiente bloque o al menos no sentirse como landing page inflada.
- Las entradas deben ser escaneables.

Mobile:

- El header no debe superponerse.
- Los motivos visuales se simplifican.
- La personalidad debe sobrevivir por color, composición, microcopy y un motivo gráfico, no por exceso de decoración.

## Fuera De Alcance

- Crear nuevas entradas de contenido.
- Rediseñar las páginas de posts.
- Cambiar la marca global.
- Agregar CMS, base de datos o suscripción real.
- Crear assets raster nuevos con IA en esta fase, salvo que el plan posterior lo pida explícitamente.

## Criterios De Aceptación

- `/rutas/<slug>` existe para las siete categorías.
- `/categorias?categoria=anime` deja de ser la forma principal de entrar a una ruta.
- Cada ruta tiene una composición reconociblemente distinta.
- El sitio conserva su tono editorial cálido y cartográfico.
- No hay rutas rotas ni páginas en blanco.
- Las categorías sin posts muestran un estado vacío cuidado.
- `npm run lint` y `npm run build` pasan.
- La verificación en navegador interno confirma al menos:
  - `/rutas/geopolitica`
  - `/rutas/anime`
  - `/rutas/futbol`
  - una ruta sin suficientes posts, si aplica.

## Riesgos

- Demasiada diferencia puede fragmentar la marca. Mitigación: header, tipografía, papel y navegación común.
- Demasiado componente compartido puede volver las rutas simples cambios de color. Mitigación: layout `routeExperience.layout` con variantes reales.
- La falta de entradas por categoría puede hacer algunas rutas vacías. Mitigación: estados editoriales vacíos con manifiesto y enlaces a rutas vecinas.

## Decisión

Se aprueba el enfoque de experiencias distintas por ruta: no solo cambio de color, sino páginas con mundos propios. La implementación debe equilibrar expresividad y mantenimiento usando una ruta dinámica con variantes de layout, en vez de siete páginas copiadas a mano.
