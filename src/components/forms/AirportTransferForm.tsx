'use client'

import { useState } from 'react'
import { useTranslation } from '@/hooks/useTranslation'

const TIER_IDS = ['standard', 'meet-greet', 'vip']
const TIER_PRICES = [25, 45, 120]
const POPULAR_INDEX = 1

export default function AirportTransferForm() {
  const { t } = useTranslation()
  const atf = t.airportTransferForm
  const TIERS = TIER_IDS.map((id, i) => ({
    id,
    price: TIER_PRICES[i],
    popular: i === POPULAR_INDEX,
    ...atf.tiers[i],
  }))
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
        <h2 className="font-display text-3xl mb-2">{atf.success_heading}</h2>
        <p className="text-brown mb-1">{atf.confirmation_label} <span className="font-semibold">{confirmationId}</span></p>
        <p className="text-warm-gray">{atf.success_message}</p>
      </div>
    )
  }

  return (
    <form onSubmit={handleSubmit}>
      {/* WIDGET */}
      <div className="container mx-auto px-6 sm:px-14 -mt-10 relative z-10">
        <div className="bg-white rounded-md shadow-[0_20px_44px_rgba(30,27,22,0.14)] p-5 flex flex-wrap items-end gap-5">
          <div className="flex-1 min-w-[150px]">
            <div className="text-[10px] font-semibold tracking-widest uppercase text-warm-gray mb-2">{atf.flight_number}</div>
            <input name="flightNumber" required type="text" placeholder={atf.flight_number_placeholder} className="w-full border-b border-input-border text-sm py-2 outline-none" />
          </div>
          <div className="flex-1 min-w-[150px]">
            <div className="text-[10px] font-semibold tracking-widest uppercase text-warm-gray mb-2">{atf.arrival_datetime}</div>
            <input name="arrivalDateTime" required type="datetime-local" className="w-full border-b border-input-border text-sm py-2 outline-none" />
          </div>
          <div className="flex-1 min-w-[130px]">
            <div className="text-[10px] font-semibold tracking-widest uppercase text-warm-gray mb-2">{atf.passengers}</div>
            <select name="passengers" defaultValue="2" className="w-full border-b border-input-border text-sm py-2 outline-none bg-transparent">
              {[1, 2, 3, 4, 5, 6].map((n) => (
                <option key={n} value={n}>{n} {n > 1 ? atf.adult_suffix_plural : atf.adult_suffix_singular}</option>
              ))}
            </select>
          </div>
          <div className="flex-1 min-w-[150px]">
            <div className="text-[10px] font-semibold tracking-widest uppercase text-warm-gray mb-2">{atf.name}</div>
            <input name="name" required type="text" placeholder={atf.name_placeholder} className="w-full border-b border-input-border text-sm py-2 outline-none" />
          </div>
          <div className="flex-1 min-w-[150px]">
            <div className="text-[10px] font-semibold tracking-widest uppercase text-warm-gray mb-2">{atf.email}</div>
            <input name="email" required type="email" placeholder={atf.email_placeholder} className="w-full border-b border-input-border text-sm py-2 outline-none" />
          </div>
        </div>
      </div>

      {/* TIERS */}
      <div className="container mx-auto px-6 sm:px-14 pt-11 pb-5">
        <div className="text-xs font-semibold tracking-[0.22em] uppercase text-olive text-center">{atf.choose_service_eyebrow}</div>
        <h2 className="font-display text-3xl text-center mt-2 mb-7">{atf.choose_service_heading}</h2>
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-6">
          {TIERS.map((tr) => {
            const selected = tier === tr.id
            const dark = tr.popular
            return (
              <button
                type="button"
                key={tr.id}
                onClick={() => setTier(tr.id)}
                className={`text-left rounded-md overflow-hidden shadow-[0_10px_26px_rgba(30,27,22,0.08)] transition-all relative ${
                  dark ? 'bg-ink text-cream' : 'bg-white'
                } ${selected ? 'ring-2 ring-olive' : ''}`}
              >
                {tr.popular && (
                  <span className="absolute top-4 right-4 z-10 bg-gold text-ink rounded-sm px-2.5 py-1 text-[10px] font-semibold tracking-wide uppercase">{atf.most_popular}</span>
                )}
                <div className={`h-[150px] ${dark ? 'bg-ink-soft' : 'bg-tan'}`} />
                <div className="p-5">
                  <h3 className="font-display text-2xl font-semibold">{tr.name}</h3>
                  <p className={`text-xs mt-1 ${dark ? 'text-cream/60' : 'text-warm-gray'}`}>{tr.desc}</p>
                  <div className="flex items-baseline gap-1.5 my-4">
                    <span className="font-display text-3xl">${tr.price}</span>
                    <span className={`text-xs ${dark ? 'text-cream/60' : 'text-warm-gray'}`}>{atf.per_vehicle}</span>
                  </div>
                  <div className="flex flex-col gap-2 mb-4">
                    {tr.features.map((f) => (
                      <span key={f} className={`text-xs ${dark ? 'text-cream/85' : 'text-brown'}`}>✓&nbsp; {f}</span>
                    ))}
                  </div>
                  <div className={`text-center rounded-sm py-3 text-xs font-semibold tracking-widest uppercase ${selected ? (dark ? 'bg-cream text-ink' : 'bg-ink text-cream') : dark ? 'border border-cream/40' : 'border border-ink'}`}>
                    {selected ? t.common.selected : t.common.select}
                  </div>
                </div>
              </button>
            )
          })}
        </div>
      </div>

      {status === 'error' && <p className="text-center text-sm text-red-600 mb-3">{t.common.error_generic}</p>}

      <div className="flex justify-center pb-14">
        <button
          type="submit"
          disabled={status === 'submitting'}
          className="bg-olive text-cream rounded-sm px-8 py-4 text-xs font-semibold tracking-widest uppercase disabled:opacity-60"
        >
          {status === 'submitting' ? t.common.sending : atf.book_transfer}
        </button>
      </div>
    </form>
  )
}
