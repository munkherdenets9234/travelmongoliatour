import type { Metadata } from 'next'
import Image from 'next/image'
import Link from 'next/link'
import { notFound } from 'next/navigation'
import { isValidLocale, getTranslation } from '@/lib/i18n'
import { getAllPartners, getPartnerBySlug } from '@/lib/data/partners'
import { getReviews } from '@/lib/data/reviews'
import { getAllTours } from '@/lib/data/tours'
import StarRating from '@/components/ui/StarRating'

interface Props {
  params: Promise<{ locale: string; slug: string }>
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { locale, slug } = await params
  if (!isValidLocale(locale)) return {}
  const partner = await getPartnerBySlug(slug, locale)
  if (!partner) return {}

  return {
    title: `${partner.name} — E & S Discovery Mongolia Partners`,
    description: partner.description,
    alternates: { canonical: `/${locale}/partners/${slug}` },
    openGraph: { title: partner.name, description: partner.description, images: partner.image ? [partner.image] : undefined },
  }
}

function domainOf(url: string) {
  try {
    return new URL(url).hostname.replace(/^www\./, '')
  } catch {
    return url
  }
}

export default async function PartnerDetailPage({ params }: Props) {
  const { locale, slug } = await params
  if (!isValidLocale(locale)) notFound()

  const partner = await getPartnerBySlug(slug, locale)
  if (!partner) notFound()

  const [allPartners, tours, testimonials] = await Promise.all([
    getAllPartners(locale),
    getAllTours(locale),
    getReviews(locale, { partner: partner.name, pageSize: 1 }),
  ])
  const tourTitleBySlug = new Map(tours.map((tr) => [tr.slug, tr.title]))
  const testimonial = testimonials.items[0]

  const t = getTranslation(locale)
  const d = t.partnerDetail

  return (
    <>
      {allPartners.length > 1 && (
        <div className="flex justify-center flex-wrap gap-2.5 pt-8 px-6">
          {allPartners.map((p) => (
            <Link
              key={p.id}
              href={`/${locale}/partners/${p.slug}`}
              className={`rounded-full px-5 py-2 text-xs font-semibold tracking-wide transition-colors ${
                p.slug === slug ? 'bg-ink text-cream' : 'border border-border-strong text-brown hover:border-ink'
              }`}
            >
              {p.name}
            </Link>
          ))}
        </div>
      )}

      <section className="relative h-[440px] mt-6 bg-tan/30">
        {partner.image && <Image src={partner.image} alt={partner.name} fill className="object-cover" priority />}
        <div className="absolute inset-0 bg-gradient-to-t from-ink/85 via-ink/20 to-ink/35" />
        <div className="absolute left-0 right-0 bottom-0 container mx-auto px-6 sm:px-14 pb-11">
          <div className="text-xs font-semibold tracking-[0.24em] uppercase text-cream/85">{d.eyebrow}</div>
          <h1 className="font-display text-cream text-4xl sm:text-6xl leading-tight mt-4 max-w-3xl">{partner.title}</h1>
        </div>
      </section>

      <div className="max-w-[560px] mx-auto px-6 pt-12 pb-2 text-center">
        <p className="text-brown leading-relaxed">{partner.description}</p>
      </div>

      {partner.products.length > 0 && (
        <div className="container mx-auto px-6 sm:px-14 pt-14">
          <div className="text-center text-xs font-semibold tracking-[0.2em] uppercase text-olive mb-8">{d.offerings}</div>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {partner.products.map((product) => (
              <div key={product.name} className="rounded-md overflow-hidden bg-white shadow-[0_10px_26px_rgba(30,27,22,0.08)]">
                <div className="relative h-[150px] bg-tan/30">
                  {product.image && <Image src={product.image} alt={product.name} fill className="object-cover" />}
                </div>
                <div className="p-4">
                  <div className="font-display text-xl">{product.name}</div>
                  <div className="text-warm-gray text-xs font-medium mt-1.5">{product.description}</div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {testimonial && (
        <div className="mt-14 bg-panel py-14 px-6 text-center">
          <div className="text-[10px] font-semibold tracking-[0.2em] uppercase text-olive mb-4">{d.testimonialEyebrow}</div>
          <div className="font-display italic text-2xl sm:text-3xl leading-snug max-w-[560px] mx-auto">
            &ldquo;{testimonial.quote}&rdquo;
          </div>
          <div className="text-warm-gray text-xs font-semibold tracking-widest uppercase mt-4">
            {testimonial.customer}
            {testimonial.tourSlug && <> · {tourTitleBySlug.get(testimonial.tourSlug) ?? testimonial.tourSlug}</>}
          </div>
        </div>
      )}

      <div className="bg-olive text-cream container mx-auto px-6 sm:px-14 py-12 flex flex-wrap items-center justify-between gap-6">
        <div>
          <div className="text-cream/75 text-xs font-semibold tracking-[0.22em] uppercase">{d.ctaEyebrow}</div>
          <div className="font-display text-3xl mt-2">{partner.name}</div>
        </div>
        <div className="flex items-center gap-5">
          <Link href={`/${locale}/book`} className="bg-cream text-ink rounded-sm px-7 py-3.5 text-xs font-semibold tracking-widest uppercase">
            {d.ctaBook} →
          </Link>
          <a href={partner.webUrl} target="_blank" rel="noopener noreferrer" className="text-cream text-xs font-semibold tracking-widest uppercase border-b border-cream/60 pb-1">
            {domainOf(partner.webUrl)} ↗
          </a>
        </div>
      </div>
    </>
  )
}
