import type { Metadata } from 'next'
import Link from 'next/link'
import { notFound } from 'next/navigation'
import { getTourBySlug, getRelatedTours } from '@/lib/data/tours'
import { isValidLocale, getTranslation } from '@/lib/i18n'
import JourneyCard from '@/components/ui/JourneyCard'
import TourGallery from '@/components/ui/TourGallery'

interface Props {
  params: Promise<{ locale: string; slug: string }>
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { locale, slug } = await params
  if (!isValidLocale(locale)) return {}
  const tour = await getTourBySlug(slug, locale)
  if (!tour) return {}

  const metaDescription = tour.summary.replace(/\n+/g, ' ')

  return {
    title: `${tour.title} — E & S Discovery Mongolia`,
    description: metaDescription,
    alternates: { canonical: `/${locale}/tours/${slug}` },
    openGraph: { title: tour.title, description: metaDescription, images: [tour.image] },
  }
}

export default async function TourDetailPage({ params }: Props) {
  const { locale, slug } = await params
  if (!isValidLocale(locale)) notFound()

  const tour = await getTourBySlug(slug, locale)
  if (!tour) notFound()
  const related = await getRelatedTours(slug, locale)
  const t = getTranslation(locale)
  const td = t.tourDetail

  return (
    <>
      {/* BREADCRUMB + TITLE */}
      <div className="container mx-auto px-6 sm:px-14 pt-8 pb-4">
        <div className="text-xs font-medium uppercase tracking-wide text-warm-gray">
          <Link href={`/${locale}/tours`}>{td.breadcrumb_tours}</Link> <span className="mx-1.5">/</span>
          <span className="capitalize">{tour.region}</span> <span className="mx-1.5">/</span>
          <span className="text-ink">{tour.title}</span>
        </div>
        <div className="flex flex-wrap items-end justify-between gap-6 mt-3">
          <div>
            <h1 className="font-display text-4xl sm:text-5xl">{tour.title}</h1>
            <div className="flex items-center gap-4 mt-3 text-sm text-brown flex-wrap">
              <span className="text-gold tracking-wide">{'★'.repeat(5)} {tour.rating.toFixed(1)}</span>
              <span className="text-border-strong">|</span>
              <span>{tour.days} {td.days_label} · {tour.nights} {td.nights_label}</span>
              <span className="text-border-strong">|</span>
              <span>{td.max_travellers} {tour.maxTravellers} {td.traveller_plural}</span>
            </div>
          </div>
          <div className="flex gap-3">
            <span className="inline-flex items-center gap-2 border border-border-strong rounded-sm px-4 py-2.5 text-xs font-semibold tracking-widest uppercase">♡ {t.common.save}</span>
            <span className="inline-flex items-center gap-2 border border-border-strong rounded-sm px-4 py-2.5 text-xs font-semibold tracking-widest uppercase">↗ {t.common.share}</span>
          </div>
        </div>
      </div>

      {/* GALLERY */}
      <TourGallery images={tour.gallery.length > 0 ? tour.gallery : [tour.image]} title={tour.title} />

      {/* BODY */}
      <div className="flex flex-col lg:flex-row gap-11 container mx-auto px-6 sm:px-14 py-8 items-start">
        <div className="flex-1 min-w-0">
          <div
            className="text-lg leading-relaxed text-brown max-w-2xl [&_p]:mt-4 [&_p:first-child]:mt-0 [&_h2]:font-display [&_h2]:text-2xl [&_h2]:mt-8 [&_h3]:font-display [&_h3]:text-xl [&_h3]:mt-6 [&_ul]:list-disc [&_ul]:pl-5 [&_ol]:list-decimal [&_ol]:pl-5 [&_li]:mt-1 [&_a]:underline [&_blockquote]:border-l-[3px] [&_blockquote]:border-olive [&_blockquote]:pl-4 [&_blockquote]:italic"
            dangerouslySetInnerHTML={{ __html: tour.description }}
          />

          <div className="flex flex-wrap gap-12 mt-7">
            <div className="flex-1 min-w-[220px]">
              <div className="text-xs font-semibold tracking-widest uppercase text-warm-gray mb-3">{td.highlights}</div>
              <div className="flex flex-col gap-2.5 text-sm text-brown">
                {tour.highlights.map((h) => (
                  <span key={h}>✦&nbsp;&nbsp;{h}</span>
                ))}
              </div>
            </div>
            <div className="flex-1 min-w-[220px]">
              <div className="text-xs font-semibold tracking-widest uppercase text-warm-gray mb-3">{td.good_to_know}</div>
              <div className="flex flex-col gap-2.5 text-sm text-brown">
                {tour.goodToKnow.map((g) => (
                  <span key={g}>{g}</span>
                ))}
              </div>
            </div>
          </div>

          {/* ITINERARY */}
          <div className="font-display text-3xl mt-10 mb-4">{td.day_by_day}</div>
          <div className="flex flex-col">
            {tour.itinerary.map((day) => (
              <div key={day.day} className="flex gap-5 py-4 border-t border-border">
                <span className="flex-none w-14 text-xs font-semibold tracking-wide uppercase text-olive pt-0.5">{td.day_label} {day.day}</span>
                <div>
                  <div className="font-display text-lg font-semibold">{day.title}</div>
                  <p className="text-sm leading-relaxed text-brown mt-1 max-w-lg">{day.description}</p>

                  {day.activities.length > 0 || day.overnight || day.meals.length > 0 ? (
                    <div className="flex flex-wrap gap-x-6 gap-y-1.5 mt-3 text-xs text-warm-gray">
                      {day.activities.length > 0 ? (
                        <span>
                          <span className="font-semibold uppercase tracking-wide text-olive">{td.activities}</span>{' '}
                          {day.activities.join(', ')}
                        </span>
                      ) : null}
                      {day.overnight ? (
                        <span>
                          <span className="font-semibold uppercase tracking-wide text-olive">{td.accommodation}</span>{' '}
                          {day.overnight}
                        </span>
                      ) : null}
                      {day.meals.length > 0 ? (
                        <span>
                          <span className="font-semibold uppercase tracking-wide text-olive">{td.meals}</span>{' '}
                          {day.meals.join(', ')}
                        </span>
                      ) : null}
                    </div>
                  ) : null}
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* BOOKING CARD */}
        <aside className="w-full lg:w-80 flex-none">
          <div className="bg-white border border-tan rounded-md shadow-[0_14px_34px_rgba(30,27,22,0.1)] p-6">
            <div className="flex items-baseline gap-2">
              <span className="text-xs text-warm-gray">{t.common.from}</span>
              <span className="font-display text-4xl">${tour.price.toLocaleString()}</span>
              <span className="text-xs text-warm-gray">{t.common.per_person}</span>
            </div>

            {tour.prices.length > 0 ? (
              <div className="flex flex-col gap-1.5 mt-3 pt-3 border-t border-tan text-xs text-brown">
                {tour.prices.map((tier) => (
                  <div key={`${tier.minPeople}-${tier.maxPeople}`} className="flex items-center justify-between">
                    <span>
                      {tier.minPeople === tier.maxPeople
                        ? `${tier.minPeople} ${td.traveller_singular}`
                        : `${tier.minPeople}–${tier.maxPeople} ${td.traveller_plural}`}
                    </span>
                    <span className="font-semibold">${tier.priceUsd.toLocaleString()}</span>
                  </div>
                ))}
              </div>
            ) : null}

            <div className="h-px bg-tan my-4" />
            <Link
              href={`/${locale}/book?tour=${tour.slug}`}
              className="block bg-olive text-cream rounded-sm py-3.5 text-center text-xs font-semibold tracking-widest uppercase"
            >
              {td.book_now}
            </Link>
            <Link href={`/${locale}/share-a-tour`} className="block text-center text-xs font-medium text-warm-gray mt-3">
              {td.or} <span className="text-ink border-b border-ink pb-0.5">{td.see_open_departures}</span>
            </Link>
            <div className="flex items-center gap-2 mt-4 pt-4 border-t border-tan text-xs text-muted">
              <span className="text-olive">✓</span> {td.free_cancellation}
            </div>
          </div>
          {/* <div className="flex items-center gap-3 mt-4 p-4 bg-white border border-tan rounded-md">
            <div className="w-12 h-12 rounded-full bg-tan flex-none" />
            <div>
              <div className="font-display text-base font-semibold">Your guide · {tour.guide.name}</div>
              <div className="text-xs text-warm-gray">{tour.guide.note}</div>
            </div>
          </div> */}
        </aside>
      </div>

      {/* INCLUSIONS */}
      <div className="container mx-auto px-6 sm:px-14 pb-10">
        <div className="h-px bg-border mb-7" />
        <div className="font-display text-3xl mb-5">{td.whats_included}</div>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
          {tour.inclusions.map((inc) => (
            <div key={inc.title}>
              <div className="w-10 h-10 rounded-full border border-olive text-olive flex items-center justify-center mb-3">✦</div>
              <div className="font-display text-base font-semibold">{inc.title}</div>
              <p className="text-sm text-muted mt-1">{inc.description}</p>
            </div>
          ))}
        </div>
      </div>

      {/* RELATED */}
      <div className="container mx-auto px-6 sm:px-14 pb-12">
        <div className="flex items-baseline justify-between mb-5">
          <div className="font-display text-3xl">{td.you_may_also_like}</div>
          <Link href={`/${locale}/tours`} className="text-xs font-semibold tracking-widest uppercase border-b border-ink pb-0.5">
            {td.view_all_tours}
          </Link>
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-6">
          {related.map((rt) => (
            <JourneyCard
              key={rt.slug}
              item={{ id: rt.slug, days: rt.days, title: rt.title, description: rt.summary, badge: `${rt.region} · ${rt.type}`, rating: rt.rating, image: rt.image }}
              daysLabel={t.journeys.days_label}
              price={`$${rt.price.toLocaleString()}`}
              href={`/${locale}/tours/${rt.slug}`}
            />
          ))}
        </div>
      </div>
    </>
  )
}
