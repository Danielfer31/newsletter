'use client'

import { FormEvent, useId, useState } from 'react'

const EMAIL_PATTERN = /^[^\s@]+@[^\s@]+\.[^\s@]+$/

export default function SubscribeForm() {
  const [email, setEmail] = useState('')
  const [message, setMessage] = useState('')
  const [status, setStatus] = useState<'idle' | 'error' | 'success'>('idle')
  const emailId = useId()
  const messageId = `${emailId}-message`

  function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault()

    const nextEmail = email.trim()

    if (!EMAIL_PATTERN.test(nextEmail)) {
      setStatus('error')
      setMessage('Escribe un correo válido para guardar esta ruta.')
      return
    }

    setEmail(nextEmail)
    setStatus('success')
    setMessage('Listo. Tu correo queda anotado para la próxima edición.')
  }

  return (
    <form className="mt-6 space-y-3" onSubmit={handleSubmit} noValidate>
      <label htmlFor={emailId} className="sr-only">
        Correo electrónico
      </label>
      <div className="grid gap-3 sm:grid-cols-[minmax(0,1fr)_auto]">
        <input
          id={emailId}
          name="email"
          type="email"
          inputMode="email"
          autoComplete="email"
          required
          value={email}
          placeholder="tu@email.com"
          onChange={(event) => {
            setEmail(event.target.value)
            if (status !== 'idle') {
              setStatus('idle')
              setMessage('')
            }
          }}
          aria-describedby={message ? messageId : undefined}
          aria-invalid={status === 'error'}
          className="min-h-12 border border-line bg-paper px-4 text-sm text-ink outline-none transition-colors focus:border-blue"
        />
        <button
          type="submit"
          className="min-h-12 border border-ink bg-ink px-5 text-sm font-semibold text-[var(--paper-soft)] transition-colors hover:border-sepia hover:bg-sepia"
          style={{ color: 'var(--paper-soft)' }}
        >
          Suscribirme
        </button>
      </div>

      {message ? (
        <p
          id={messageId}
          className={[
            'text-sm font-medium',
            status === 'success' ? 'text-green' : 'text-red',
          ].join(' ')}
          role="status"
        >
          {message}
        </p>
      ) : (
        <p className="text-sm leading-6 text-ink-soft">
          Por ahora es una suscripción local: no se envía nada a servicios externos.
        </p>
      )}
    </form>
  )
}
