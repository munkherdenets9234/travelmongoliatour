'use client'

import { useState } from 'react'

export default function NewsletterForm({
  placeholder,
  subscribeLabel,
  successMessage,
  errorMessage,
}: {
  placeholder: string
  subscribeLabel: string
  successMessage: string
  errorMessage: string
}) {
  const [status, setStatus] = useState<'idle' | 'submitting' | 'success' | 'error'>('idle')

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault()
    const form = e.currentTarget
    const email = new FormData(form).get('email')
    setStatus('submitting')

    try {
      const res = await fetch('/api/newsletter', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email }),
      })
      if (!res.ok) throw new Error('failed')
      form.reset()
      setStatus('success')
    } catch {
      setStatus('error')
    }
  }

  return (
    <div>
      <form className="flex border border-cream/30 rounded-sm overflow-hidden" onSubmit={handleSubmit}>
        <input
          name="email"
          type="email"
          required
          placeholder={placeholder}
          onChange={() => status !== 'submitting' && setStatus('idle')}
          className="flex-1 min-w-0 bg-transparent px-3 py-2.5 text-sm text-cream placeholder:text-cream/50 focus:outline-none"
        />
        <button
          type="submit"
          disabled={status === 'submitting'}
          className="bg-cream text-ink px-4 py-2.5 text-xs font-semibold disabled:opacity-60"
          aria-label={subscribeLabel}
        >
          →
        </button>
      </form>
      {status === 'success' && <p className="text-cream/80 text-xs mt-2">{successMessage}</p>}
      {status === 'error' && <p className="text-cream/80 text-xs mt-2">{errorMessage}</p>}
    </div>
  )
}
