'use client'

import { useTranslation } from '@/hooks/useTranslation'

export default function QuoteSection() {
  const { t } = useTranslation()
  const q = t.quote

  return (
    <section className="relative py-40 overflow-hidden">
      <div
        className="absolute inset-0 bg-cover bg-center bg-fixed"
        style={{ backgroundImage: "url('/images/airport-hero.jpg')" }}
      />
      <div className="absolute inset-0 bg-ink/70" />

      <div className="relative z-10 container mx-auto px-6 flex flex-col items-center text-center">
        <h2 className="text-cream text-6xl sm:text-7xl md:text-8xl leading-tight mb-10">
          <span className="block">{q.line1}</span>
          <span className="block italic text-cream/60">{q.line2}</span>
          <span className="block">{q.line3}</span>
        </h2>
        <button className="inline-flex items-center gap-3 text-cream text-xs tracking-widest uppercase group">
          <span className="w-10 h-10 rounded-full border border-cream/40 flex items-center justify-center group-hover:border-cream group-hover:bg-cream group-hover:text-ink transition-all">
            <svg width="12" height="14" viewBox="0 0 12 14" fill="none">
              <path d="M1 1l10 6-10 6V1z" fill="currentColor" />
            </svg>
          </span>
          {q.cta}
        </button>
      </div>
    </section>
  )
}
