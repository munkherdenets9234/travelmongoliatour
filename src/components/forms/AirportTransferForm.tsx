'use client'

import { useState } from 'react'

const TIERS = [
  { id: 'standard', name: 'Standard Transfer', desc: 'Private sedan · up to 3 passengers', price: 25, features: ['Flight tracking', 'Driver waits at arrivals'] },
  { id: 'meet-greet', name: 'Meet & Greet', desc: 'Guide with name-board · up to 6 pax', price: 45, features: ['Personal greeter inside', 'SIM card & welcome pack', 'Bottled water & wifi'], popular: true },
  { id: 'vip', name: 'VIP & Lounge', desc: 'Private lounge · Land Cruiser · 4 pax', price: 120, features: ['Fast-track & lounge access', 'Luxury Land Cruiser'] },
]

export default function AirportTransferForm() {
  const [tier, setTier] = useState('meet-greet')
  const [status, setStatus] = useState<'idle' | 'submitting' | 'success' | 'error'>('idle')
  const [confirmationId, setConfirmationId] = useState<string | null>(null)

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault()
    setStatus('submitting')
    const form = new FormData(e.currentTarget)

    try {
      const res = await fetch('/api/airport-transfers', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          tier,
          name: form.get('name'),
          email: form.get('email'),
          flightNumber: form.get('flightNumber'),
          arrivalDateTime: form.get('arrivalDateTime'),
          passengers: form.get('passengers'),
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
      <div className="max-w-lg mx-auto text-center py-16 px-6">
        <div className="text-4xl mb-4">✓</div>
        <h2 className="font-display text-3xl mb-2">Transfer requested</h2>
        <p className="text-brown mb-1">Confirmation: <span className="font-semibold">{confirmationId}</span></p>
        <p className="text-warm-gray">We&apos;ll confirm your driver details by email before your flight lands.</p>
      </div>
    )
  }

  return (
    <form onSubmit={handleSubmit}>
      {/* WIDGET */}
      <div className="container mx-auto px-6 sm:px-14 -mt-10 relative z-10">
        <div className="bg-white rounded-md shadow-[0_20px_44px_rgba(30,27,22,0.14)] p-5 flex flex-wrap items-end gap-5">
          <div className="flex-1 min-w-[150px]">
            <div className="text-[10px] font-semibold tracking-widest uppercase text-warm-gray mb-2">Flight number</div>
            <input name="flightNumber" required type="text" placeholder="OM-302" className="w-full border-b border-input-border text-sm py-2 outline-none" />
          </div>
          <div className="flex-1 min-w-[150px]">
            <div className="text-[10px] font-semibold tracking-widest uppercase text-warm-gray mb-2">Arrival date &amp; time</div>
            <input name="arrivalDateTime" required type="datetime-local" className="w-full border-b border-input-border text-sm py-2 outline-none" />
          </div>
          <div className="flex-1 min-w-[130px]">
            <div className="text-[10px] font-semibold tracking-widest uppercase text-warm-gray mb-2">Passengers</div>
            <select name="passengers" defaultValue="2" className="w-full border-b border-input-border text-sm py-2 outline-none bg-transparent">
              {[1, 2, 3, 4, 5, 6].map((n) => (
                <option key={n} value={n}>{n} adult{n > 1 ? 's' : ''}</option>
              ))}
            </select>
          </div>
          <div className="flex-1 min-w-[150px]">
            <div className="text-[10px] font-semibold tracking-widest uppercase text-warm-gray mb-2">Name</div>
            <input name="name" required type="text" placeholder="Full name" className="w-full border-b border-input-border text-sm py-2 outline-none" />
          </div>
          <div className="flex-1 min-w-[150px]">
            <div className="text-[10px] font-semibold tracking-widest uppercase text-warm-gray mb-2">Email</div>
            <input name="email" required type="email" placeholder="you@email.com" className="w-full border-b border-input-border text-sm py-2 outline-none" />
          </div>
        </div>
      </div>

      {/* TIERS */}
      <div className="container mx-auto px-6 sm:px-14 pt-11 pb-5">
        <div className="text-xs font-semibold tracking-[0.22em] uppercase text-olive text-center">Choose your service</div>
        <h2 className="font-display text-3xl text-center mt-2 mb-7">Three ways to arrive</h2>
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-6">
          {TIERS.map((t) => {
            const selected = tier === t.id
            const dark = t.popular
            return (
              <button
                type="button"
                key={t.id}
                onClick={() => setTier(t.id)}
                className={`text-left rounded-md overflow-hidden shadow-[0_10px_26px_rgba(30,27,22,0.08)] transition-all relative ${
                  dark ? 'bg-ink text-cream' : 'bg-white'
                } ${selected ? 'ring-2 ring-olive' : ''}`}
              >
                {t.popular && (
                  <span className="absolute top-4 right-4 z-10 bg-gold text-ink rounded-sm px-2.5 py-1 text-[10px] font-semibold tracking-wide uppercase">Most popular</span>
                )}
                <div className={`h-[150px] ${dark ? 'bg-ink-soft' : 'bg-tan'}`} />
                <div className="p-5">
                  <h3 className="font-display text-2xl font-semibold">{t.name}</h3>
                  <p className={`text-xs mt-1 ${dark ? 'text-cream/60' : 'text-warm-gray'}`}>{t.desc}</p>
                  <div className="flex items-baseline gap-1.5 my-4">
                    <span className="font-display text-3xl">${t.price}</span>
                    <span className={`text-xs ${dark ? 'text-cream/60' : 'text-warm-gray'}`}>per vehicle</span>
                  </div>
                  <div className="flex flex-col gap-2 mb-4">
                    {t.features.map((f) => (
                      <span key={f} className={`text-xs ${dark ? 'text-cream/85' : 'text-brown'}`}>✓&nbsp; {f}</span>
                    ))}
                  </div>
                  <div className={`text-center rounded-sm py-3 text-xs font-semibold tracking-widest uppercase ${selected ? (dark ? 'bg-cream text-ink' : 'bg-ink text-cream') : dark ? 'border border-cream/40' : 'border border-ink'}`}>
                    {selected ? 'Selected' : 'Select'}
                  </div>
                </div>
              </button>
            )
          })}
        </div>
      </div>

      {status === 'error' && <p className="text-center text-sm text-red-600 mb-3">Something went wrong — please try again.</p>}

      <div className="flex justify-center pb-14">
        <button
          type="submit"
          disabled={status === 'submitting'}
          className="bg-olive text-cream rounded-sm px-8 py-4 text-xs font-semibold tracking-widest uppercase disabled:opacity-60"
        >
          {status === 'submitting' ? 'Sending…' : 'Book transfer →'}
        </button>
      </div>
    </form>
  )
}
