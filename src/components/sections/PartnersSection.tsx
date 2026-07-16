'use client'

import { useState } from 'react'
import Image from 'next/image'
import Link from 'next/link'
import { useTranslation } from '@/hooks/useTranslation'
import type { Partner } from '@/lib/data/partners'

export default function PartnersSection({ partners }: { partners: Partner[] }) {
  const { t, locale } = useTranslation()
  const p = t.partners
  const [index, setIndex] = useState(0)

  if (partners.length === 0) return null

  const partner = partners[index]
  const prev = () => setIndex((i) => (i - 1 + partners.length) % partners.length)
  const next = () => setIndex((i) => (i + 1) % partners.length)

  return (
    <section className="py-24 bg-panel">
      <div className="container mx-auto px-6">
        <div className="flex items-baseline justify-between mb-10">
          <p className="text-olive/80 text-[10px] tracking-[0.3em] uppercase">{p.eyebrow}</p>
          {partners.length > 1 && (
            <div className="flex items-center gap-3">
              <button
                onClick={prev}
                className="w-11 h-11 rounded-full border border-border-strong flex items-center justify-center hover:border-ink-soft hover:bg-ink-soft hover:text-cream transition-all"
                aria-label="Previous partner"
              >
                <svg width="14" height="14" viewBox="0 0 14 14" fill="none">
                  <path d="M9 2L4 7l5 5" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
                </svg>
              </button>
              <button
                onClick={next}
                className="w-11 h-11 rounded-full border border-ink flex items-center justify-center hover:bg-ink hover:text-cream transition-all"
                aria-label="Next partner"
              >
                <svg width="14" height="14" viewBox="0 0 14 14" fill="none">
                  <path d="M5 2l5 5-5 5" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
                </svg>
              </button>
            </div>
          )}
        </div>

        <div className="flex flex-col lg:flex-row gap-10 items-stretch">
          <Link href={`/${locale}/partners/${partner.slug}`} className="relative flex-1 aspect-[4/3] lg:aspect-auto rounded-2xl overflow-hidden block bg-tan/30">
            {partner.image && (
              <Image
                src={partner.image}
                alt={partner.name}
                fill
                className="object-cover"
                sizes="(max-width: 1024px) 100vw, 50vw"
              />
            )}
          </Link>

          <div className="flex-[1.1] flex flex-col justify-center">
            <p className="text-olive/80 text-[10px] tracking-[0.24em] uppercase mb-3">{partner.tag}</p>
            <Link href={`/${locale}/partners/${partner.slug}`}>
              <h2 className="text-ink font-display text-3xl sm:text-4xl font-medium mb-4 hover:text-olive transition-colors">{partner.title}</h2>
            </Link>
            <p className="text-muted text-sm sm:text-base leading-relaxed mb-8 max-w-md">{partner.description}</p>

            <a
              href={partner.webUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="self-start inline-flex items-center gap-2 bg-ink text-cream text-sm font-medium rounded-full px-6 py-3 hover:bg-ink-soft transition-colors"
            >
              {p.cta} {partner.name} →
            </a>
          </div>
        </div>

        {partners.length > 1 && (
          <div className="flex justify-center gap-2 mt-10">
            {partners.map((item, i) => (
              <button
                key={item.id}
                onClick={() => setIndex(i)}
                className={`w-2 h-2 rounded-full transition-colors ${i === index ? 'bg-ink' : 'bg-ink/20'}`}
                aria-label={`Show ${item.name}`}
              />
            ))}
          </div>
        )}
      </div>
    </section>
  )
}
