'use client'

import { useState } from 'react'
import { useTranslation } from '@/hooks/useTranslation'
import StarRatingInput from '@/components/ui/StarRatingInput'

export interface ReviewFormTourOption {
  slug: string
  title: string
}

export default function ReviewForm({ tours }: { tours: ReviewFormTourOption[] }) {
  const { t, locale } = useTranslation()
  const rf = t.reviewForm
  const [star, setStar] = useState(0)
  const [status, setStatus] = useState<'idle' | 'submitting' | 'success' | 'error'>('idle')
  const [starError, setStarError] = useState(false)

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault()
    if (star < 1) {
      setStarError(true)
      return
    }
    setStarError(false)
    setStatus('submitting')
    const form = new FormData(e.currentTarget)

    try {
      const res = await fetch('/api/reviews', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name: form.get('name'),
          star,
          review: form.get('review'),
          related_tour: form.get('related_tour') || undefined,
          locale,
        }),
      })
      if (!res.ok) throw new Error('failed')
      setStatus('success')
    } catch {
      setStatus('error')
    }
  }

  if (status === 'success') {
    return (
      <div className="max-w-lg mx-auto text-center py-6">
        <div className="text-4xl mb-4">✓</div>
        <h2 className="font-display text-3xl mb-2">{rf.success_heading}</h2>
        <p className="text-brown">{rf.success_message}</p>
      </div>
    )
  }

  return (
    <form onSubmit={handleSubmit} className="bg-white border border-tan rounded-lg shadow-[0_14px_34px_rgba(30,27,22,0.08)] p-7 flex flex-col gap-4 max-w-lg mx-auto">
      <h2 className="font-display text-2xl text-center mb-1">{rf.heading}</h2>

      <div className="flex flex-col items-center gap-2">
        <span className="text-warm-gray text-[11px] font-medium tracking-[0.06em] uppercase">{rf.star_label}</span>
        <StarRatingInput
          value={star}
          onChange={(value) => {
            setStar(value)
            setStarError(false)
          }}
          label={rf.star_label}
        />
        {starError && <p className="text-xs text-red-600">{rf.star_required}</p>}
      </div>

      <input name="name" required type="text" placeholder={rf.name_placeholder} className="border border-input-border rounded-sm px-3.5 py-3 text-sm" />

      {tours.length > 0 && (
        <select name="related_tour" defaultValue="" className="border border-input-border rounded-sm px-3.5 py-3 text-sm bg-white">
          <option value="">{rf.tour_placeholder}</option>
          {tours.map((tour) => (
            <option key={tour.slug} value={tour.slug}>{tour.title}</option>
          ))}
        </select>
      )}

      <textarea
        name="review"
        required
        rows={4}
        placeholder={rf.review_placeholder}
        className="border border-input-border rounded-sm px-3.5 py-3 text-sm"
      />

      {status === 'error' && <p className="text-xs text-red-600">{t.common.error_generic}</p>}

      <button type="submit" disabled={status === 'submitting'} className="bg-olive text-cream rounded-sm py-3.5 text-xs font-semibold tracking-widest uppercase disabled:opacity-60">
        {status === 'submitting' ? t.common.sending : rf.submit}
      </button>
    </form>
  )
}
