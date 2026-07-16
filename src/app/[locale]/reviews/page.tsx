import type { Metadata } from 'next'
import Link from 'next/link'
import { notFound } from 'next/navigation'
import { isValidLocale, getTranslation } from '@/lib/i18n'
import { getReviews } from '@/lib/data/reviews'
import { getAllTours } from '@/lib/data/tours'
import { humanizeSlug } from '@/lib/format'
import FilterChips from '@/components/ui/FilterChips'
import StarRating from '@/components/ui/StarRating'
import ExpandableQuote from '@/components/ui/ExpandableQuote'
import ReviewForm from '@/components/forms/ReviewForm'

interface Props {
  params: Promise<{ locale: string }>
  searchParams: Promise<{ [key: string]: string | string[] | undefined }>
}

function one(v: string | string[] | undefined) {
  return Array.isArray(v) ? v[0] : v
}

const PAGE_SIZE = 6

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { locale } = await params
  return {
    title: 'Traveler Reviews — E & S Discovery Mongolia',
    description: 'Real traveler reviews from journeys across Mongolia.',
    alternates: { canonical: `/${locale}/reviews` },
  }
}

export default async function ReviewsPage({ params, searchParams }: Props) {
  const { locale } = await params
  if (!isValidLocale(locale)) notFound()
  const sp = await searchParams
  const tourSlug = one(sp.tour)
  const page = sp.page ? Math.max(1, Number(one(sp.page))) : 1

  const [tours, all] = await Promise.all([getAllTours(locale), getReviews(locale, { pageSize: 100 })])
  const tourTitleBySlug = new Map(tours.map((t) => [t.slug, t.title]))
  const distinctTourSlugs = Array.from(new Set(all.items.map((r) => r.tourSlug).filter(Boolean)))
  const totalAll = all.items.length
  const average = totalAll ? all.items.reduce((sum, r) => sum + r.star, 0) / totalAll : 0

  const { items, total, pageSize } = await getReviews(locale, { tour: tourSlug, page, pageSize: PAGE_SIZE })
  const reviewItems = items.map((r) => ({
    id: r.id,
    customer: r.customer,
    star: r.star,
    quote: r.quote,
    source: tourTitleBySlug.get(r.tourSlug) ?? (r.tourSlug ? humanizeSlug(r.tourSlug) : r.partner),
  }))
  const totalPages = Math.max(1, Math.ceil(total / pageSize))

  const base = `/${locale}/reviews`
  const qs = (overrides: Record<string, string | undefined>) => {
    const params = new URLSearchParams()
    const merged: Record<string, string | undefined> = { tour: tourSlug, ...overrides }
    Object.entries(merged).forEach(([k, v]) => v && params.set(k, v))
    const s = params.toString()
    return s ? `${base}?${s}` : base
  }

  const t = getTranslation(locale)
  const r = t.reviewsPage

  return (
    <>
      <section className="text-center py-16 px-6 bg-panel">
        <p className="text-olive text-[10px] font-semibold tracking-[0.24em] uppercase">{r.eyebrow}</p>
        <h1 className="font-display text-5xl sm:text-6xl mt-4">
          {totalAll} {r.travelers_label}, <span className="italic font-normal">{r.title_suffix}</span>
        </h1>
        {totalAll > 0 && (
          <div className="flex justify-center items-baseline gap-3 mt-6">
            <span className="font-display text-4xl">{average.toFixed(1)}</span>
            <span className="flex flex-col items-start gap-0.5">
              <StarRating value={average} />
              <span className="text-muted text-[11px] font-medium tracking-[0.08em] uppercase">
                {totalAll} {r.reviews_label}
              </span>
            </span>
          </div>
        )}
      </section>

      {distinctTourSlugs.length > 0 && (
        <div className="flex justify-center flex-wrap px-6 pt-8">
          <FilterChips
            chips={[
              { label: r.all_tours, href: qs({ tour: undefined, page: undefined }), active: !tourSlug },
              ...distinctTourSlugs.map((slug) => ({
                label: tourTitleBySlug.get(slug) ?? humanizeSlug(slug),
                href: qs({ tour: slug, page: undefined }),
                active: tourSlug === slug,
              })),
            ]}
          />
        </div>
      )}

      {reviewItems.length === 0 ? (
        <p className="text-center text-muted py-16">{r.empty}</p>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 container mx-auto px-6 sm:px-14 py-10">
          {reviewItems.map((item) => (
            <div key={item.id} className="bg-white rounded-md p-6 border border-border">
              <div className="mb-3">
                <StarRating value={item.star} />
              </div>
              <ExpandableQuote text={item.quote} className="text-brown leading-relaxed mb-4" />
              <div className="text-warm-gray text-[11px] font-medium tracking-[0.06em] uppercase">
                {item.customer}
                {item.source && <> · {item.source}</>}
              </div>
            </div>
          ))}
        </div>
      )}

      {totalPages > 1 && (
        <div className="flex justify-center items-center gap-2 pb-16">
          {page > 1 && (
            <Link href={qs({ page: String(page - 1) })} className="text-xs font-semibold tracking-widest uppercase text-brown hover:text-ink px-2">
              {r.prev}
            </Link>
          )}
          {Array.from({ length: totalPages }, (_, i) => i + 1).map((n) => (
            <Link
              key={n}
              href={qs({ page: String(n) })}
              className={`w-9 h-9 rounded-full flex items-center justify-center text-sm font-medium transition-colors ${
                n === page ? 'bg-ink text-cream' : 'text-brown hover:bg-panel'
              }`}
            >
              {n}
            </Link>
          ))}
          {page < totalPages && (
            <Link href={qs({ page: String(page + 1) })} className="text-xs font-semibold tracking-widest uppercase text-brown hover:text-ink px-2">
              {r.next}
            </Link>
          )}
        </div>
      )}

      <section className="px-6 pb-20">
        <ReviewForm tours={tours.map((t) => ({ slug: t.slug, title: t.title }))} />
      </section>
    </>
  )
}
