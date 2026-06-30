'use client'

import { useState } from 'react'
import { useTranslation } from '@/hooks/useTranslation'

export default function SearchBar() {
  const { t } = useTranslation()
  const s = t.search
  const [destination, setDestination] = useState('')
  const [duration, setDuration] = useState('')
  const [style, setStyle] = useState('')

  return (
    <section className="relative z-20 -mt-16 px-4">
      <div className="max-w-5xl mx-auto bg-white shadow-2xl rounded-sm">
        <div className="grid grid-cols-1 md:grid-cols-4 divide-y md:divide-y-0 md:divide-x divide-stone-200">
          {/* Destination */}
          <div className="p-5 md:p-6">
            <label className="block text-[10px] tracking-[0.2em] uppercase text-stone-400 mb-2">
              {s.destination_label}
            </label>
            <div className="flex items-center gap-2">
              <svg className="text-stone-400 shrink-0" width="14" height="14" viewBox="0 0 14 14" fill="none">
                <path d="M7 1C4.79 1 3 2.79 3 5c0 3.5 4 8 4 8s4-4.5 4-8c0-2.21-1.79-4-4-4zm0 5.5A1.5 1.5 0 115 5a1.5 1.5 0 012 1.5z" fill="currentColor" />
              </svg>
              <select
                value={destination}
                onChange={(e) => setDestination(e.target.value)}
                className="w-full text-sm text-stone-600 bg-transparent outline-none appearance-none cursor-pointer"
              >
                <option value="">{s.destination_placeholder}</option>
                {s.destinations.map((d) => <option key={d} value={d}>{d}</option>)}
              </select>
              <svg className="text-stone-400 shrink-0" width="10" height="6" viewBox="0 0 10 6" fill="none">
                <path d="M1 1l4 4 4-4" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
              </svg>
            </div>
          </div>

          {/* Duration */}
          <div className="p-5 md:p-6">
            <label className="block text-[10px] tracking-[0.2em] uppercase text-stone-400 mb-2">
              {s.duration_label}
            </label>
            <div className="flex items-center gap-2">
              <svg className="text-stone-400 shrink-0" width="14" height="14" viewBox="0 0 14 14" fill="none">
                <rect x="1" y="2" width="12" height="11" rx="1" stroke="currentColor" strokeWidth="1.2" />
                <path d="M1 6h12M4 1v2M10 1v2" stroke="currentColor" strokeWidth="1.2" strokeLinecap="round" />
              </svg>
              <select
                value={duration}
                onChange={(e) => setDuration(e.target.value)}
                className="w-full text-sm text-stone-600 bg-transparent outline-none appearance-none cursor-pointer"
              >
                <option value="">{s.duration_placeholder}</option>
                {s.durations.map((d) => <option key={d} value={d}>{d}</option>)}
              </select>
              <svg className="text-stone-400 shrink-0" width="10" height="6" viewBox="0 0 10 6" fill="none">
                <path d="M1 1l4 4 4-4" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
              </svg>
            </div>
          </div>

          {/* Style */}
          <div className="p-5 md:p-6">
            <label className="block text-[10px] tracking-[0.2em] uppercase text-stone-400 mb-2">
              {s.style_label}
            </label>
            <div className="flex items-center gap-2">
              <svg className="text-stone-400 shrink-0" width="14" height="14" viewBox="0 0 14 14" fill="none">
                <circle cx="7" cy="5" r="3" stroke="currentColor" strokeWidth="1.2" />
                <path d="M1 13c0-3.314 2.686-5 6-5s6 1.686 6 5" stroke="currentColor" strokeWidth="1.2" strokeLinecap="round" />
              </svg>
              <select
                value={style}
                onChange={(e) => setStyle(e.target.value)}
                className="w-full text-sm text-stone-600 bg-transparent outline-none appearance-none cursor-pointer"
              >
                <option value="">{s.style_placeholder}</option>
                {s.styles.map((st) => <option key={st} value={st}>{st}</option>)}
              </select>
              <svg className="text-stone-400 shrink-0" width="10" height="6" viewBox="0 0 10 6" fill="none">
                <path d="M1 1l4 4 4-4" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
              </svg>
            </div>
          </div>

          {/* CTA */}
          <div className="p-4 flex items-center">
            <button className="w-full bg-stone-800 hover:bg-stone-700 text-white text-xs font-semibold tracking-widest uppercase py-4 px-6 flex items-center justify-center gap-3 transition-colors">
              {s.cta}
              <svg width="14" height="14" viewBox="0 0 14 14" fill="none">
                <path d="M2 7h10M8 3l4 4-4 4" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
              </svg>
            </button>
          </div>
        </div>
      </div>
    </section>
  )
}
