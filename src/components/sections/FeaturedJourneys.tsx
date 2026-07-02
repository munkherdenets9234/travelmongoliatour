'use client'

import { useState } from 'react'
import { useTranslation } from '@/hooks/useTranslation'
import JourneyCard from '@/components/ui/JourneyCard'

export default function FeaturedJourneys() {
  const { t } = useTranslation()
  const j = t.journeys
  const [index, setIndex] = useState(0)
  const visible = 3
  const max = j.items.length - visible

  const prev = () => setIndex((i) => Math.max(0, i - 1))
  const next = () => setIndex((i) => Math.min(max, i + 1))

  return (
    <section className="py-24 bg-cream">
      <div className="container mx-auto px-6">
        {/* Header */}
        <div className="flex items-end justify-between mb-12">
          <div>
            <p className="text-olive/80 text-[10px] tracking-[0.3em] uppercase mb-3">{j.eyebrow}</p>
            <h2 className="text-ink text-3xl sm:text-4xl md:text-5xl">{j.title}</h2>
          </div>
          <div className="hidden sm:flex items-center gap-4">
            <button
              onClick={prev}
              disabled={index === 0}
              className="w-10 h-10 rounded-full border border-border-strong flex items-center justify-center hover:border-ink-soft hover:bg-ink-soft hover:text-cream transition-all disabled:opacity-30 disabled:cursor-not-allowed"
              aria-label="Previous"
            >
              <svg width="14" height="14" viewBox="0 0 14 14" fill="none">
                <path d="M9 2L4 7l5 5" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
              </svg>
            </button>
            <button
              onClick={next}
              disabled={index >= max}
              className="w-10 h-10 rounded-full border border-border-strong flex items-center justify-center hover:border-ink-soft hover:bg-ink-soft hover:text-cream transition-all disabled:opacity-30 disabled:cursor-not-allowed"
              aria-label="Next"
            >
              <svg width="14" height="14" viewBox="0 0 14 14" fill="none">
                <path d="M5 2l5 5-5 5" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
              </svg>
            </button>
            <button className="text-[10px] tracking-widest uppercase text-muted hover:text-ink underline underline-offset-4 transition-colors">
              {j.view_all}
            </button>
          </div>
        </div>

        {/* Cards grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5 overflow-hidden">
          {j.items.slice(index, index + visible).map((item) => (
            <JourneyCard key={item.id} item={item} daysLabel={j.days_label} />
          ))}
        </div>

        {/* Mobile controls */}
        <div className="sm:hidden flex items-center justify-center gap-4 mt-8">
          <button onClick={prev} disabled={index === 0} className="w-10 h-10 rounded-full border border-border-strong flex items-center justify-center disabled:opacity-30">
            <svg width="14" height="14" viewBox="0 0 14 14" fill="none"><path d="M9 2L4 7l5 5" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" /></svg>
          </button>
          <button onClick={next} disabled={index >= max} className="w-10 h-10 rounded-full border border-border-strong flex items-center justify-center disabled:opacity-30">
            <svg width="14" height="14" viewBox="0 0 14 14" fill="none"><path d="M5 2l5 5-5 5" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" /></svg>
          </button>
        </div>
      </div>
    </section>
  )
}
