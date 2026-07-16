'use client'

import { useState } from 'react'
import { useTranslation } from '@/hooks/useTranslation'

export default function ContactForm() {
  const { t } = useTranslation()
  const cf = t.contactForm
  const [status, setStatus] = useState<'idle' | 'submitting' | 'success' | 'error'>('idle')
  const [confirmationId, setConfirmationId] = useState<string | null>(null)

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault()
    setStatus('submitting')
    const form = new FormData(e.currentTarget)

    try {
      const res = await fetch('/api/contact', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name: form.get('name'),
          email: form.get('email'),
          phone: form.get('phone'),
          subject: form.get('subject'),
          message: form.get('message'),
        }),
      })
      if (!res.ok) throw new Error('failed')
      const data = await res.json()
      setConfirmationId(data.confirmationId)
      setStatus('success')
    } catch {
      setStatus('error')
    }
  }

  if (status === 'success') {
    return (
      <div className="max-w-lg mx-auto text-center py-6">
        <div className="text-4xl mb-4">✓</div>
        <h2 className="font-display text-3xl mb-2">{cf.success_heading}</h2>
        <p className="text-brown mb-1">{cf.reference_label} <span className="font-semibold">{confirmationId}</span></p>
        <p className="text-warm-gray">{cf.success_message}</p>
      </div>
    )
  }

  return (
    <form onSubmit={handleSubmit} className="bg-white border border-tan rounded-lg shadow-[0_14px_34px_rgba(30,27,22,0.08)] p-7 flex flex-col gap-4">
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <input name="name" required type="text" placeholder={cf.name_placeholder} className="border border-input-border rounded-sm px-3.5 py-3 text-sm" />
        <input name="email" required type="email" placeholder={cf.email_placeholder} className="border border-input-border rounded-sm px-3.5 py-3 text-sm" />
      </div>
      <input name="phone" type="tel" placeholder={cf.phone_placeholder} className="border border-input-border rounded-sm px-3.5 py-3 text-sm" />
      <select name="subject" defaultValue={cf.subjects[0]} className="border border-input-border rounded-sm px-3.5 py-3 text-sm bg-white">
        {cf.subjects.map((s) => (
          <option key={s} value={s}>{s}</option>
        ))}
      </select>
      <textarea
        name="message"
        required
        rows={4}
        placeholder={cf.message_placeholder}
        className="border border-input-border rounded-sm px-3.5 py-3 text-sm"
      />

      {status === 'error' && <p className="text-xs text-red-600">{t.common.error_generic}</p>}

      <button type="submit" disabled={status === 'submitting'} className="bg-olive text-cream rounded-sm py-3.5 text-xs font-semibold tracking-widest uppercase disabled:opacity-60">
        {status === 'submitting' ? t.common.sending : cf.send_message}
      </button>
    </form>
  )
}
