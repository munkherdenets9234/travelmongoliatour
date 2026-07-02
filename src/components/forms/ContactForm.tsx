'use client'

import { useState } from 'react'

export default function ContactForm() {
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
        <h2 className="font-display text-3xl mb-2">Message sent</h2>
        <p className="text-brown mb-1">Reference: <span className="font-semibold">{confirmationId}</span></p>
        <p className="text-warm-gray">A member of our Ulaanbaatar team will reply within a day.</p>
      </div>
    )
  }

  return (
    <form onSubmit={handleSubmit} className="bg-white border border-tan rounded-lg shadow-[0_14px_34px_rgba(30,27,22,0.08)] p-7 flex flex-col gap-4">
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <input name="name" required type="text" placeholder="Name" className="border border-input-border rounded-sm px-3.5 py-3 text-sm" />
        <input name="email" required type="email" placeholder="Email" className="border border-input-border rounded-sm px-3.5 py-3 text-sm" />
      </div>
      <input name="phone" type="tel" placeholder="Phone (optional)" className="border border-input-border rounded-sm px-3.5 py-3 text-sm" />
      <select name="subject" defaultValue="Tour inquiry" className="border border-input-border rounded-sm px-3.5 py-3 text-sm bg-white">
        {['Tour inquiry', 'Car rental', 'Airport transfer', 'General question'].map((s) => (
          <option key={s} value={s}>{s}</option>
        ))}
      </select>
      <textarea
        name="message"
        required
        rows={4}
        placeholder="Tell us about your trip — dates, group size, what you'd love to see…"
        className="border border-input-border rounded-sm px-3.5 py-3 text-sm"
      />

      {status === 'error' && <p className="text-xs text-red-600">Something went wrong — please try again.</p>}

      <button type="submit" disabled={status === 'submitting'} className="bg-olive text-cream rounded-sm py-3.5 text-xs font-semibold tracking-widest uppercase disabled:opacity-60">
        {status === 'submitting' ? 'Sending…' : 'Send message →'}
      </button>
    </form>
  )
}
