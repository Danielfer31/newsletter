'use client'

import { FormEvent, useId, useState } from 'react'

export interface SubscribeBoxProps {
  title?: string
  description?: string
  placeholder?: string
  buttonLabel?: string
  layout?: 'stacked' | 'inline'
}

export default function SubscribeBox({
  title = 'Recibir la próxima edición',
  description = 'Un correo sobrio cuando el mapa tenga una nueva ruta.',
  placeholder = 'tu@email.com',
  buttonLabel = 'Suscribirme',
  layout = 'stacked',
}: SubscribeBoxProps) {
  const [email, setEmail] = useState('')
  const [status, setStatus] = useState<'idle' | 'loading' | 'success' | 'error'>('idle')
  const emailId = useId()
  const isInline = layout === 'inline'

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault()
    if (!email.trim() || status === 'loading') return

    setStatus('loading')

    try {
      const response = await fetch('/api/newsletter/subscribe', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email }),
      })

      if (!response.ok) throw new Error('subscribe failed')
      setStatus('success')
    } catch {
      setStatus('error')
    }
  }

  return (
    <section
      className={[
        'soft-panel p-6',
        isInline ? 'grid gap-6 md:grid-cols-[0.9fr_1.1fr] md:items-end md:p-8' : '',
      ].join(' ')}
      aria-labelledby={`${emailId}-title`}
    >
      <div>
        <p className="ui-label mb-3">Newsletter</p>
        <h2
          id={`${emailId}-title`}
          className={[
            'serif-title leading-tight text-ink',
            isInline ? 'text-2xl md:text-3xl' : 'text-3xl',
          ].join(' ')}
        >
          {title}
        </h2>
        <p className="mt-3 max-w-xl text-sm leading-6 text-ink-soft">{description}</p>
      </div>

      <form className={['space-y-3', isInline ? 'md:space-y-4' : 'mt-6'].join(' ')} onSubmit={handleSubmit}>
        <label htmlFor={emailId} className="sr-only">
          Correo electrónico
        </label>
        <div className="flex flex-col gap-3 sm:flex-row">
          <input
            id={emailId}
            name="email"
            type="email"
            required
            value={email}
            placeholder={placeholder}
            onChange={(event) => {
              setEmail(event.target.value)
              setStatus('idle')
            }}
            className="min-h-12 flex-1 rounded-full border border-line bg-paper px-5 text-sm text-ink outline-none transition-colors focus:border-blue"
            aria-describedby={status !== 'idle' ? `${emailId}-status` : undefined}
          />
          <button
            type="submit"
            disabled={status === 'loading'}
            className="min-h-12 rounded-full border border-red bg-red px-6 text-sm font-semibold text-[var(--paper-soft)] shadow-sm transition-colors hover:border-sepia hover:bg-sepia disabled:opacity-60"
            style={{ color: 'var(--paper-soft)' }}
          >
            {status === 'loading' ? 'Enviando...' : buttonLabel}
          </button>
        </div>

        {status === 'success' ? (
          <p id={`${emailId}-status`} className="text-sm font-medium text-green" role="status">
            Listo. Revisá tu correo para confirmar la suscripción.
          </p>
        ) : null}
        {status === 'error' ? (
          <p id={`${emailId}-status`} className="text-sm font-medium text-red" role="status">
            Algo falló. Intentá de nuevo en un momento.
          </p>
        ) : null}
      </form>
    </section>
  )
}
