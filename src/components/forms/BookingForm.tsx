'use client'

import { useMemo, useState } from 'react'
import Image from 'next/image'
import type { Tour } from '@/lib/data/tours'

const ADDONS = [
  { id: 'meet-greet', label: 'Airport meet & greet', price: 40 },
  { id: 'insurance', label: 'Travel insurance', price: 75 },
  { id: 'extra-night', label: 'Extra night in Ulaanbaatar', price: 90 },
]

export default function BookingForm({ tours, initialSlug, initialDate }: { tours: Tour[]; initialSlug?: string; initialDate?: string }) {
  const [slug, setSlug] = useState(initialSlug && tours.some((t) => t.slug === initialSlug) ? initialSlug : tours[0]?.slug ?? '')
  const [travellers, setTravellers] = useState(2)
  const [addons, setAddons] = useState<string[]>(['meet-greet'])
  const [status, setStatus] = useState<'idle' | 'submitting' | 'success' | 'error'>('idle')
  const [confirmationId, setConfirmationId] = useState<string | null>(null)

  const tour = tours.find((t) => t.slug === slug) ?? tours[0]

  const addonsTotal = useMemo(() => addons.reduce((sum, id) => sum + (ADDONS.find((a) => a.id === id)?.price ?? 0), 0), [addons])
  const subtotal = (tour?.price ?? 0) * travellers
  const total = subtotal + addonsTotal
  const deposit = Math.round(total * 0.2)

  function toggleAddon(id: string) {
    setAddons((prev) => (prev.includes(id) ? prev.filter((a) => a !== id) : [...prev, id]))
  }

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault()
    if (!tour) return
    setStatus('submitting')
    const form = new FormData(e.currentTarget)

    try {
      const res = await fetch('/api/bookings', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          tourSlug: tour.slug,
          date: form.get('date') || initialDate,
          travellers,
          name: form.get('name'),
          email: form.get('email'),
          country: form.get('country'),
          phone: form.get('phone'),
          addons,
          notes: form.get('notes'),
          total,
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

  if (!tour) return <p className="container mx-auto px-6 sm:px-14 py-14 text-warm-gray">No tours available to book right now.</p>

  if (status === 'success') {
    return (
      <div className="max-w-lg mx-auto text-center py-20 px-6">
        <div className="text-4xl mb-4">✓</div>
        <h2 className="font-display text-3xl mb-2">Booking request sent</h2>
        <p className="text-brown mb-1">Confirmation: <span className="font-semibold">{confirmationId}</span></p>
        <p className="text-warm-gray">Our team will follow up by email to confirm your {tour.title} booking.</p>
      </div>
    )
  }

  return (
    <form onSubmit={handleSubmit} className="flex flex-col lg:flex-row gap-10 container mx-auto px-6 sm:px-14 pb-16 items-start">
      {/* FORM */}
      <div className="flex-1 min-w-0 flex flex-col gap-7">
        <div className="bg-white border border-tan rounded-md p-6">
          <div className="text-xs font-semibold tracking-widest uppercase text-olive mb-4">1 · Trip details</div>
          <div className="grid grid-cols-1 sm:grid-cols-[2fr_1fr_1fr] gap-3.5">
            <div>
              <div className="text-[10px] font-semibold tracking-widest uppercase text-warm-gray mb-1.5">Tour</div>
              <select value={slug} onChange={(e) => setSlug(e.target.value)} className="w-full border border-input-border rounded-sm px-3 py-3 text-sm bg-white">
                {tours.map((t) => (
                  <option key={t.slug} value={t.slug}>{t.title}</option>
                ))}
              </select>
            </div>
            <div>
              <div className="text-[10px] font-semibold tracking-widest uppercase text-warm-gray mb-1.5">Date</div>
              <input
                name="date"
                type="date"
                defaultValue={initialDate}
                onClick={(e) => e.currentTarget.showPicker?.()}
                className="w-full border border-input-border rounded-sm px-3 py-3 text-sm bg-white cursor-pointer"
              />
            </div>
            <div>
              <div className="text-[10px] font-semibold tracking-widest uppercase text-warm-gray mb-1.5">Travellers</div>
              <select value={travellers} onChange={(e) => setTravellers(Number(e.target.value))} className="w-full border border-input-border rounded-sm px-3 py-3 text-sm bg-white">
                {[1, 2, 3, 4, 5, 6].map((n) => (
                  <option key={n} value={n}>{n}</option>
                ))}
              </select>
            </div>
          </div>
        </div>

        <div className="bg-white border border-tan rounded-md p-6">
          <div className="text-xs font-semibold tracking-widest uppercase text-olive mb-4">2 · Lead traveller</div>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
            <input name="name" required type="text" placeholder="Full name" className="border border-input-border rounded-sm px-3 py-3 text-sm" />
            <input name="email" required type="email" placeholder="Email" className="border border-input-border rounded-sm px-3 py-3 text-sm" />
            <input name="country" type="text" placeholder="Country" className="border border-input-border rounded-sm px-3 py-3 text-sm" />
            <input name="phone" type="tel" placeholder="Phone" className="border border-input-border rounded-sm px-3 py-3 text-sm" />
          </div>
        </div>

        <div className="bg-white border border-tan rounded-md p-6">
          <div className="text-xs font-semibold tracking-widest uppercase text-olive mb-4">3 · Add-ons</div>
          <div className="flex flex-col gap-3.5">
            {ADDONS.map((a) => (
              <label key={a.id} className="flex items-center justify-between cursor-pointer">
                <span className="inline-flex items-center gap-3 text-sm">
                  <input type="checkbox" checked={addons.includes(a.id)} onChange={() => toggleAddon(a.id)} className="w-4 h-4 accent-olive" />
                  {a.label}
                </span>
                <span className="text-sm text-brown">+ ${a.price}</span>
              </label>
            ))}
          </div>
        </div>

        <div className="bg-white border border-tan rounded-md p-6">
          <div className="text-xs font-semibold tracking-widest uppercase text-olive mb-4">4 · Notes &amp; requests</div>
          <textarea name="notes" rows={3} placeholder="Dietary needs, accessibility, custom itinerary…" className="w-full border border-input-border rounded-sm px-3 py-3 text-sm" />
        </div>
      </div>

      {/* SUMMARY */}
      <aside className="w-full lg:w-[340px] flex-none">
        <div className="bg-white border border-tan rounded-md shadow-[0_14px_34px_rgba(30,27,22,0.1)] overflow-hidden">
          <div className="relative h-[150px]">
            <Image src={tour.image} alt={tour.title} fill className="object-cover" />
            <div className="absolute inset-0 bg-gradient-to-t from-ink/60 to-transparent" />
            <div className="absolute left-4 bottom-3 text-cream">
              <div className="font-display text-xl">{tour.title}</div>
              <div className="text-[11px] font-medium tracking-wide uppercase text-cream/85 mt-0.5">{tour.days} days · {travellers} {travellers === 1 ? 'adult' : 'adults'}</div>
            </div>
          </div>
          <div className="p-5">
            <div className="text-xs font-semibold tracking-widest uppercase text-warm-gray mb-3.5">Order summary</div>
            <div className="flex justify-between text-sm text-brown mb-2.5">
              <span>{travellers} × ${tour.price.toLocaleString()}</span>
              <span>${subtotal.toLocaleString()}</span>
            </div>
            {addons.map((id) => {
              const a = ADDONS.find((x) => x.id === id)!
              return (
                <div key={id} className="flex justify-between text-sm text-brown mb-2.5">
                  <span>{a.label}</span>
                  <span>${a.price}</span>
                </div>
              )
            })}
            <div className="h-px bg-tan my-4" />
            <div className="flex justify-between items-baseline mb-1">
              <span className="text-xs font-semibold tracking-wide uppercase">Total</span>
              <span className="font-display text-3xl">${total.toLocaleString()}</span>
            </div>
            <div className="text-xs text-warm-gray mb-4">Deposit today · 20% · ${deposit.toLocaleString()}</div>

            {status === 'error' && <p className="text-xs text-red-600 mb-3">Something went wrong — please try again.</p>}

            <button type="submit" disabled={status === 'submitting'} className="w-full bg-olive text-cream rounded-sm py-3.5 text-xs font-semibold tracking-widest uppercase disabled:opacity-60">
              {status === 'submitting' ? 'Sending…' : 'Pay deposit →'}
            </button>
            <div className="flex items-center gap-2 mt-4 pt-4 border-t border-tan text-xs text-muted">
              <span className="text-olive">✓</span> No account needed · guest checkout
            </div>
          </div>
        </div>
      </aside>
    </form>
  )
}
