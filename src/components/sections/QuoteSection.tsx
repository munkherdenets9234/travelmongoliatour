'use client'

import { useTranslation } from '@/hooks/useTranslation'

export default function QuoteSection() {
  const { t } = useTranslation()
  const q = t.quote

  return (
    <section className="relative py-40 overflow-hidden">
      <div
        className="absolute inset-0 bg-cover bg-center bg-fixed"
        style={{ backgroundImage: "url('/images/quote-bg.jpg')" }}
      />
      <div className="absolute inset-0 bg-stone-950/70" />

      <div className="relative z-10 max-w-7xl mx-auto px-6 flex flex-col items-center text-center">
        <h2 className="text-white text-6xl sm:text-7xl md:text-8xl font-light leading-tight mb-10">
          <span className="block">{q.line1}</span>
          <span className="block italic text-white/60">{q.line2}</span>
          <span className="block">{q.line3}</span>
        </h2>
        <button className="inline-flex items-center gap-3 text-white text-xs tracking-widest uppercase group">
          <span className="w-10 h-10 rounded-full border border-white/40 flex items-center justify-center group-hover:border-white group-hover:bg-white group-hover:text-stone-900 transition-all">
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
