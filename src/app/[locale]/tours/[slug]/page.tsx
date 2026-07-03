import type { Metadata } from 'next'
import Image from 'next/image'
import Link from 'next/link'
import { notFound } from 'next/navigation'
import { getTourBySlug, getRelatedTours } from '@/lib/data/tours'
import { isValidLocale } from '@/lib/i18n'
import JourneyCard from '@/components/ui/JourneyCard'

interface Props {
  params: Promise<{ locale: string; slug: string }>
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { locale, slug } = await params
  const tour = await getTourBySlug(slug)
  if (!tour) return {}

  return {
    title: `${tour.title} — E & S Discovery Mongolia`,
    description: tour.summary,
    alternates: { canonical: `/${locale}/tours/${slug}` },
    openGraph: { title: tour.title, description: tour.summary, images: [tour.image] },
  }
}

export default async function TourDetailPage({ params }: Props) {
  const { locale, slug } = await params
  if (!isValidLocale(locale)) notFound()

  const tour = await getTourBySlug(slug)
  if (!tour) notFound()
  const related = await getRelatedTours(slug)

  return (
    <>
      {/* BREADCRUMB + TITLE */}
      <div className="container mx-auto px-6 sm:px-14 pt-8 pb-4">
        <div className="text-xs font-medium uppercase tracking-wide text-warm-gray">
          <Link href={`/${locale}/tours`}>Tours</Link> <span className="mx-1.5">/</span>
          <span className="capitalize">{tour.region}</span> <span className="mx-1.5">/</span>
          <span className="text-ink">{tour.title}</span>
        </div>
        <div className="flex flex-wrap items-end justify-between gap-6 mt-3">
          <div>
            <h1 className="font-display text-4xl sm:text-5xl">{tour.title}</h1>
            <div className="flex items-center gap-4 mt-3 text-sm text-brown flex-wrap">
              <span className="text-gold tracking-wide">{'★'.repeat(5)} {tour.rating.toFixed(1)}</span>
              <span className="text-border-strong">|</span>
              <span>{tour.days} days · {tour.nights} nights</span>
              <span className="text-border-strong">|</span>
              <span>Max {tour.maxTravellers} travellers</span>
            </div>
          </div>
          <div className="flex gap-3">
            <span className="inline-flex items-center gap-2 border border-border-strong rounded-sm px-4 py-2.5 text-xs font-semibold tracking-widest uppercase">♡ Save</span>
            <span className="inline-flex items-center gap-2 border border-border-strong rounded-sm px-4 py-2.5 text-xs font-semibold tracking-widest uppercase">↗ Share</span>
          </div>
        </div>
      </div>

      {/* GALLERY */}
      <div className="grid grid-cols-1 sm:grid-cols-[2fr_1fr] gap-3 container mx-auto px-6 sm:px-14">
        <div className="relative rounded-md overflow-hidden h-[380px]">
          <Image src={tour.gallery[0] ?? tour.image} alt={tour.title} fill className="object-cover" priority />
        </div>
        <div className="grid grid-rows-2 gap-3">
          {[tour.gallery[1] ?? tour.image, tour.gallery[2] ?? tour.image].map((src, i) => (
            <div key={i} className="relative rounded-md overflow-hidden h-full">
              <Image src={src} alt={`${tour.title} ${i + 2}`} fill className="object-cover" />
            </div>
          ))}
        </div>
      </div>

      {/* BODY */}
      <div className="flex flex-col lg:flex-row gap-11 container mx-auto px-6 sm:px-14 py-8 items-start">
        <div className="flex-1 min-w-0">
          <p className="text-lg leading-relaxed text-brown max-w-2xl">{tour.description}</p>

          <div className="flex flex-wrap gap-12 mt-7">
            <div className="flex-1 min-w-[220px]">
              <div className="text-xs font-semibold tracking-widest uppercase text-warm-gray mb-3">Highlights</div>
              <div className="flex flex-col gap-2.5 text-sm text-brown">
                {tour.highlights.map((h) => (
                  <span key={h}>✦&nbsp;&nbsp;{h}</span>
                ))}
              </div>
            </div>
            <div className="flex-1 min-w-[220px]">
              <div className="text-xs font-semibold tracking-widest uppercase text-warm-gray mb-3">Good to know</div>
              <div className="flex flex-col gap-2.5 text-sm text-brown">
                {tour.goodToKnow.map((g) => (
                  <span key={g}>{g}</span>
                ))}
              </div>
            </div>
          </div>

          {/* ITINERARY */}
          <div className="font-display text-3xl mt-10 mb-4">Day by day</div>
          <div className="flex flex-col">
            {tour.itinerary.map((day) => (
              <div key={day.day} className="flex gap-5 py-4 border-t border-border">
                <span className="flex-none w-14 text-xs font-semibold tracking-wide uppercase text-olive pt-0.5">Day {day.day}</span>
                <div>
                  <div className="font-display text-lg font-semibold">{day.title}</div>
                  <p className="text-sm leading-relaxed text-brown mt-1 max-w-lg">{day.description}</p>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* BOOKING CARD */}
        <aside className="w-full lg:w-80 flex-none">
          <div className="bg-white border border-tan rounded-md shadow-[0_14px_34px_rgba(30,27,22,0.1)] p-6">
            <div className="flex items-baseline gap-2">
              <span className="text-xs text-warm-gray">from</span>
              <span className="font-display text-4xl">${tour.price.toLocaleString()}</span>
              <span className="text-xs text-warm-gray">/ person</span>
            </div>
            <div className="h-px bg-tan my-4" />
            <Link
              href={`/${locale}/book?tour=${tour.slug}`}
              className="block bg-olive text-cream rounded-sm py-3.5 text-center text-xs font-semibold tracking-widest uppercase"
            >
              Check availability →
            </Link>
            <Link href={`/${locale}/share-a-tour`} className="block text-center text-xs font-medium text-warm-gray mt-3">
              or <span className="text-ink border-b border-ink pb-0.5">see open departures</span>
            </Link>
            <div className="flex items-center gap-2 mt-4 pt-4 border-t border-tan text-xs text-muted">
              <span className="text-olive">✓</span> Free cancellation up to 30 days before
            </div>
          </div>
          <div className="flex items-center gap-3 mt-4 p-4 bg-white border border-tan rounded-md">
            <div className="w-12 h-12 rounded-full bg-tan flex-none" />
            <div>
              <div className="font-display text-base font-semibold">Your guide · {tour.guide.name}</div>
              <div className="text-xs text-warm-gray">{tour.guide.note}</div>
            </div>
          </div>
        </aside>
      </div>

      {/* INCLUSIONS */}
      <div className="container mx-auto px-6 sm:px-14 pb-10">
        <div className="h-px bg-border mb-7" />
        <div className="font-display text-3xl mb-5">What&apos;s included</div>
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
          <div className="font-display text-3xl">You may also like</div>
          <Link href={`/${locale}/tours`} className="text-xs font-semibold tracking-widest uppercase border-b border-ink pb-0.5">
            View all tours →
          </Link>
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-6">
          {related.map((t) => (
            <JourneyCard
              key={t.slug}
              item={{ id: t.slug, days: t.days, title: t.title, description: t.summary, badge: `${t.region} · ${t.type}`, rating: t.rating, image: t.image }}
              daysLabel="Days"
              price={`$${t.price.toLocaleString()}`}
              href={`/${locale}/tours/${t.slug}`}
            />
          ))}
        </div>
      </div>
    </>
  )
}
