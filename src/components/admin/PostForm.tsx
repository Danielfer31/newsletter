'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { Post, Category, Layout, FontStyle, MarginNote } from '@/types/post'
import { CATEGORY_ORDER } from '@/lib/categories'

const LAYOUTS: Layout[] = ['pergamino', 'cosmos', 'carta', 'tablero', 'manga']
const FONTS: FontStyle[] = ['serif', 'sans', 'mono', 'display']

type FormState = {
  slug: string
  titulo: string
  categoria: Category
  fecha: string
  imagen: string
  extracto: string
  cancion: string
  tema: { fondo: string; acento: string; fuente: FontStyle }
  layout: Layout
  ruta: string[]
  notasMargen: MarginNote[]
  contenido: string
}

function toFormState(post?: Post): FormState {
  const today = new Date().toISOString().slice(0, 10)
  return {
    slug: post?.slug ?? '',
    titulo: post?.titulo ?? '',
    categoria: post?.categoria ?? 'opinion',
    fecha: post?.fecha ?? today,
    imagen: post?.imagen ?? '',
    extracto: post?.extracto ?? '',
    cancion: post?.cancion ?? '',
    tema: post?.tema ?? { fondo: '#f4efe4', acento: '#596f45', fuente: 'sans' },
    layout: post?.layout ?? 'pergamino',
    ruta: post?.ruta ?? [],
    notasMargen: post?.notasMargen ?? [],
    contenido: post?.contenido ?? '',
  }
}

function slugify(titulo: string, fecha: string): string {
  const base = titulo
    .toLowerCase()
    .normalize('NFD')
    .replace(/[̀-ͯ]/g, '')
    .replace(/[^a-z0-9\s-]/g, '')
    .trim()
    .replace(/\s+/g, '-')
  return `${fecha}-${base}`
}

export function PostForm({ post }: { post?: Post }) {
  const router = useRouter()
  const isEditing = !!post
  const [form, setForm] = useState<FormState>(() => toFormState(post))
  const [error, setError] = useState<string | null>(null)
  const [saving, setSaving] = useState(false)
  const [uploading, setUploading] = useState(false)

  async function handleImageUpload(file: File) {
    setUploading(true)
    try {
      const body = new FormData()
      body.append('file', file)
      const res = await fetch('/api/admin/upload', { method: 'POST', body })
      if (!res.ok) {
        setError('No se pudo subir la imagen')
        return
      }
      const { url } = await res.json()
      setForm((f) => ({ ...f, imagen: url }))
    } finally {
      setUploading(false)
    }
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    setSaving(true)
    setError(null)

    const slug = isEditing ? form.slug : slugify(form.titulo, form.fecha)
    const { slug: _slug, ...frontmatterAndBody } = form
    void _slug

    try {
      const res = await fetch(isEditing ? `/api/admin/posts/${slug}` : '/api/admin/posts', {
        method: isEditing ? 'PUT' : 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(isEditing ? frontmatterAndBody : { ...frontmatterAndBody, slug }),
      })

      if (!res.ok) {
        const data = await res.json().catch(() => ({}))
        setError(data.error ?? 'Error al guardar')
        return
      }

      router.push('/admin')
    } catch {
      setError('Error de red al guardar')
    } finally {
      setSaving(false)
    }
  }

  function updateNota(index: number, patch: Partial<MarginNote>) {
    setForm((f) => ({
      ...f,
      notasMargen: f.notasMargen.map((n, i) => (i === index ? { ...n, ...patch } : n)),
    }))
  }

  function updateRuta(index: number, value: string) {
    setForm((f) => ({ ...f, ruta: f.ruta.map((r, i) => (i === index ? value : r)) }))
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-4 max-w-2xl">
      {error && <p className="text-red-600">{error}</p>}

      <label className="block">
        Título
        <input
          className="block w-full border p-2"
          value={form.titulo}
          onChange={(e) => setForm((f) => ({ ...f, titulo: e.target.value }))}
          required
        />
      </label>

      <label className="block">
        Categoría
        <select
          className="block w-full border p-2"
          value={form.categoria}
          onChange={(e) => setForm((f) => ({ ...f, categoria: e.target.value as Category }))}
        >
          {CATEGORY_ORDER.map((c) => (
            <option key={c} value={c}>{c}</option>
          ))}
        </select>
      </label>

      <label className="block">
        Fecha
        <input
          type="date"
          className="block w-full border p-2"
          value={form.fecha}
          onChange={(e) => setForm((f) => ({ ...f, fecha: e.target.value }))}
          disabled={isEditing}
        />
      </label>

      <label className="block">
        Imagen
        <div className="mt-1 flex items-center gap-3 border border-dashed p-3 rounded">
          <svg
            xmlns="http://www.w3.org/2000/svg"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="1.5"
            className="w-8 h-8 shrink-0 text-gray-500"
            aria-hidden="true"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              d="M3 16.5V18a2.25 2.25 0 002.25 2.25h13.5A2.25 2.25 0 0021 18v-1.5m-13.5-9L12 3m0 0l4.5 4.5M12 3v13.5"
            />
          </svg>
          <div className="flex-1">
            <input
              type="file"
              accept="image/*"
              onChange={(e) => e.target.files?.[0] && handleImageUpload(e.target.files[0])}
            />
            <p className="text-sm text-gray-500 mt-1">
              Click para subir una imagen (JPG, PNG, WEBP)
            </p>
          </div>
        </div>
        {form.imagen && <img src={form.imagen} alt="preview" className="mt-2 h-32 object-cover" />}
      </label>

      <label className="block">
        Extracto
        <textarea
          className="block w-full border p-2"
          value={form.extracto}
          onChange={(e) => setForm((f) => ({ ...f, extracto: e.target.value }))}
          required
        />
      </label>

      <label className="block">
        Canción (URL, opcional)
        <input
          className="block w-full border p-2"
          value={form.cancion}
          onChange={(e) => setForm((f) => ({ ...f, cancion: e.target.value }))}
        />
      </label>

      <fieldset className="border p-2">
        <legend>Tema</legend>
        <label className="block">
          Fondo
          <input
            type="color"
            value={form.tema.fondo}
            onChange={(e) => setForm((f) => ({ ...f, tema: { ...f.tema, fondo: e.target.value } }))}
          />
        </label>
        <label className="block">
          Acento
          <input
            type="color"
            value={form.tema.acento}
            onChange={(e) => setForm((f) => ({ ...f, tema: { ...f.tema, acento: e.target.value } }))}
          />
        </label>
        <label className="block">
          Fuente
          <select
            value={form.tema.fuente}
            onChange={(e) => setForm((f) => ({ ...f, tema: { ...f.tema, fuente: e.target.value as FontStyle } }))}
          >
            {FONTS.map((fnt) => (
              <option key={fnt} value={fnt}>{fnt}</option>
            ))}
          </select>
        </label>
      </fieldset>

      <label className="block">
        Layout
        <select
          className="block w-full border p-2"
          value={form.layout}
          onChange={(e) => setForm((f) => ({ ...f, layout: e.target.value as Layout }))}
        >
          {LAYOUTS.map((l) => (
            <option key={l} value={l}>{l}</option>
          ))}
        </select>
      </label>

      <fieldset className="border p-2">
        <legend>Ruta (slugs relacionados)</legend>
        {form.ruta.map((r, i) => (
          <div key={i} className="flex gap-2">
            <input className="flex-1 border p-1" value={r} onChange={(e) => updateRuta(i, e.target.value)} />
            <button type="button" onClick={() => setForm((f) => ({ ...f, ruta: f.ruta.filter((_, idx) => idx !== i) }))}>
              Quitar
            </button>
          </div>
        ))}
        <button type="button" onClick={() => setForm((f) => ({ ...f, ruta: [...f.ruta, ''] }))}>
          + Agregar slug
        </button>
      </fieldset>

      <fieldset className="border p-2">
        <legend>Notas de margen</legend>
        {form.notasMargen.map((n, i) => (
          <div key={i} className="border p-2 mb-2">
            <input
              className="block w-full border p-1"
              placeholder="Título"
              value={n.title}
              onChange={(e) => updateNota(i, { title: e.target.value })}
            />
            <textarea
              className="block w-full border p-1"
              placeholder="Cuerpo"
              value={n.body}
              onChange={(e) => updateNota(i, { body: e.target.value })}
            />
            <button
              type="button"
              onClick={() => setForm((f) => ({ ...f, notasMargen: f.notasMargen.filter((_, idx) => idx !== i) }))}
            >
              Quitar nota
            </button>
          </div>
        ))}
        <button
          type="button"
          onClick={() => setForm((f) => ({ ...f, notasMargen: [...f.notasMargen, { title: '', body: '' }] }))}
        >
          + Agregar nota
        </button>
      </fieldset>

      <label className="block">
        Contenido (markdown)
        <textarea
          className="block w-full border p-2 h-64 font-mono"
          value={form.contenido}
          onChange={(e) => setForm((f) => ({ ...f, contenido: e.target.value }))}
          required
        />
      </label>

      <button type="submit" disabled={saving || uploading} className="border px-4 py-2">
        {uploading ? 'Subiendo imagen…' : saving ? 'Guardando…' : isEditing ? 'Guardar cambios' : 'Crear post'}
      </button>
    </form>
  )
}
