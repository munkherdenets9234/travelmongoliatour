'use client'

import { useState } from 'react'
import type { Car } from '@/lib/data/cars'

interface Props {
  car: Car
  mode: 'self-drive' | 'with-driver'
  onClose: () => void
}

export default function ReservationDialog({ car, mode, onClose }: Props) {
  const [status, setStatus] = useState<'idle' | 'submitting' | 'success' | 'error'>('idle')
  const [confirmationId, setConfirmationId] = useState<string | null>(null)

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault()
    setStatus('submitting')
    const form = new FormData(e.currentTarget)

    try {
      const res = await fetch('/api/rentals', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          carSlug: car.slug,
          mode,
          name: form.get('name'),
          email: form.get('email'),
          phone: form.get('phone'),
          pickupDate: form.get('pickupDate'),
          returnDate: form.get('returnDate'),
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

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center bg-ink/60 p-4" onClick={onClose}>
      <div className="bg-cream rounded-md max-w-md w-full p-7 shadow-2xl" onClick={(e) => e.stopPropagation()}>
        {status === 'success' ? (
          <div className="text-center py-4">
            <div className="text-3xl mb-3">✓</div>
            <h3 className="font-display text-2xl mb-2">Reservation received</h3>
            <p className="text-sm text-brown mb-1">Confirmation: <span className="font-semibold">{confirmationId}</span></p>
            <p className="text-sm text-warm-gray mb-6">We&apos;ll confirm your {car.name} rental by email shortly.</p>
            <button onClick={onClose} className="bg-ink text-cream rounded-sm px-6 py-3 text-xs font-semibold tracking-widest uppercase">
              Close
            </button>
          </div>
        ) : (
          <>
            <div className="flex items-start justify-between mb-5">
              <div>
                <div className="text-xs font-semibold tracking-widest uppercase text-warm-gray">Reserve</div>
                <h3 className="font-display text-2xl">{car.name}</h3>
                <p className="text-xs text-brown mt-1 capitalize">{mode.replace('-', ' ')} · ${car.pricePerDay}/day</p>
              </div>
              <button onClick={onClose} aria-label="Close" className="text-warm-gray text-xl leading-none">
                ×
              </button>
            </div>
            <form onSubmit={handleSubmit} className="flex flex-col gap-3">
              <div className="grid grid-cols-2 gap-3">
                <input name="pickupDate" type="date" required className="border border-input-border rounded-sm px-3 py-2.5 text-sm bg-white" />
                <input name="returnDate" type="date" required className="border border-input-border rounded-sm px-3 py-2.5 text-sm bg-white" />
              </div>
              <input name="name" type="text" required placeholder="Full name" className="border border-input-border rounded-sm px-3 py-2.5 text-sm bg-white" />
              <input name="email" type="email" required placeholder="Email" className="border border-input-border rounded-sm px-3 py-2.5 text-sm bg-white" />
              <input name="phone" type="tel" placeholder="Phone (optional)" className="border border-input-border rounded-sm px-3 py-2.5 text-sm bg-white" />

              {status === 'error' && <p className="text-xs text-red-600">Something went wrong — please try again.</p>}

              <button
                type="submit"
                disabled={status === 'submitting'}
                className="bg-olive text-cream rounded-sm py-3.5 text-xs font-semibold tracking-widest uppercase mt-2 disabled:opacity-60"
              >
                {status === 'submitting' ? 'Sending…' : 'Confirm reservation →'}
              </button>
            </form>
          </>
        )}
      </div>
    </div>
  )
}
