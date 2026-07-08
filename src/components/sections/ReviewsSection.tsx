'use client'

import Link from 'next/link'
import { useTranslation } from '@/hooks/useTranslation'
import StarRating from '@/components/ui/StarRating'
import ExpandableQuote from '@/components/ui/ExpandableQuote'

export interface ReviewDisplayItem {
  id: string
  customer: string
  star: number
  quote: string
  source: string
}

export default function ReviewsSection({ reviews }: { reviews: ReviewDisplayItem[] }) {
  const { t, locale } = useTranslation()
  const r = t.reviews

  if (reviews.length === 0) return null

  const average = reviews.reduce((sum, item) => sum + item.star, 0) / reviews.length

  return (
    <section className="py-24 bg-white">
      <div className="container mx-auto px-6 text-center">
        <p className="text-olive/80 text-[10px] tracking-[0.3em] uppercase mb-4">{r.eyebrow}</p>
        <h2 className="text-ink font-display text-3xl sm:text-4xl font-medium mb-8">
          {r.title} <span className="italic">{r.title_italic}</span>
        </h2>

        <div className="flex items-baseline justify-center gap-3 mb-12">
          <span className="text-ink font-display text-4xl">{average.toFixed(1)}</span>
          <span className="flex flex-col items-start gap-0.5">
            <StarRating value={average} />
            <span className="text-muted text-[11px] font-medium tracking-[0.08em] uppercase">
              {reviews.length} {r.reviews_label}
            </span>
          </span>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 text-left">
          {reviews.map((item) => (
            <div key={item.id} className="bg-panel rounded-md p-6 shadow-[0_10px_26px_rgba(30,27,22,0.08)]">
              <div className="mb-3">
                <StarRating value={item.star} />
              </div>
              <ExpandableQuote text={item.quote} className="text-muted text-sm leading-relaxed mb-4" />
              <div className="text-warm-gray text-[11px] font-medium tracking-[0.06em] uppercase">
                {item.customer}
                {item.source && <> · {item.source}</>}
              </div>
            </div>
          ))}
        </div>

        <Link
          href={`/${locale}/reviews`}
          className="inline-block mt-10 text-ink text-xs font-semibold tracking-[0.1em] uppercase border-b border-ink pb-1 hover:text-olive hover:border-olive transition-colors"
        >
          {r.cta} →
        </Link>
      </div>
    </section>
  )
}
