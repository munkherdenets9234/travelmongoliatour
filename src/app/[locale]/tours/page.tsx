import type { Metadata } from 'next'
import Image from 'next/image'
import Link from 'next/link'
import { getTours, type Tour } from '@/lib/data/tours'
import { isValidLocale, getTranslation } from '@/lib/i18n'
import JourneyCard from '@/components/ui/JourneyCard'
import FilterChips from '@/components/ui/FilterChips'
import { notFound } from 'next/navigation'

interface Props {
  params: Promise<{ locale: string }>
  searchParams: Promise<{ [key: string]: string | string[] | undefined }>
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { locale } = await params
  if (!isValidLocale(locale)) return {}
  const t = getTranslation(locale).toursPage
  const path = `/${locale}/tours`
  return {
    title: t.meta_title,
    description: t.meta_description,
    alternates: { canonical: path },
  }
}

function one(v: string | string[] | undefined) {
  return Array.isArray(v) ? v[0] : v
}

export default async function ToursPage({ params, searchParams }: Props) {
  const { locale } = await params
  if (!isValidLocale(locale)) notFound()
  const sp = await searchParams
  const t = getTranslation(locale).toursPage

  const duration = one(sp.duration)
  const region = one(sp.region)
  const type = one(sp.type)
  const sort = one(sp.sort)
  const page = sp.page ? Number(one(sp.page)) : 1

  const { items, total } = await getTours(locale, { duration, region, type, sort, page })

  const base = `/${locale}/tours`
  const qs = (overrides: Record<string, string | undefined>) => {
    const params = new URLSearchParams()
    const merged = { duration, region, type, sort, ...overrides }
    Object.entries(merged).forEach(([k, v]) => v && params.set(k, v))
    const s = params.toString()
    return s ? `${base}?${s}` : base
  }

  const durationValues = ['1-5', '6-10', '11+']
  const durationChips = t.duration_chips.map((label, i) => ({ label, value: durationValues[i] }))
  const regionValues = ['gobi', 'central', 'north', 'west']
  const regionChips = t.region_chips.map((label, i) => ({ label, value: regionValues[i] }))
  const typeValues = ['cultural', 'adventure', 'festival', 'group']
  const typeChips = t.type_chips.map((label, i) => ({ label, value: typeValues[i] }))
  const sortValues = ['', 'price-low', 'price-high', 'duration']
  const sortChips = t.sort_chips.map((label, i) => ({ label, value: sortValues[i] }))

  const totalPages = Math.max(1, Math.ceil(total / 12))

  return (
    <>
      {/* HERO */}
      <section className="relative h-[360px]">
        <Image src="/images/terelj.jpg" alt="Sweeping Mongolian steppe" fill className="object-cover" priority />
        <div className="absolute inset-0 bg-gradient-to-r from-ink/80 via-ink/45 to-ink/10" />
        <div className="relative z-10 h-full flex flex-col justify-center container mx-auto px-6 sm:px-14 max-w-xl">
          <p className="text-cream/85 text-xs font-semibold tracking-[0.24em] uppercase">{t.hero_eyebrow}</p>
          <h1 className="text-cream text-5xl mt-4">
            {t.hero_title_prefix} <span className="italic font-normal">{t.hero_title_italic}</span>
          </h1>
          <p className="text-cream/85 mt-4 max-w-md">{t.hero_subtext}</p>
        </div>
      </section>

      {/* CONTROL BAR */}
      <div className="flex flex-wrap items-center justify-between gap-4 container mx-auto px-6 sm:px-14 pt-6">
        <div className="flex items-baseline gap-3">
          <span className="font-display text-2xl">{total}</span>
          <span className="text-xs font-medium tracking-widest uppercase text-warm-gray">{t.journeys_found}</span>
        </div>
        <div className="flex flex-wrap gap-2">
          {sortChips.map((s) => (
            <Link
              key={s.label}
              href={qs({ sort: s.value || undefined, page: undefined })}
              className={`text-xs font-medium px-3 py-2 rounded border ${
                (sort ?? '') === s.value ? 'border-ink bg-ink text-cream' : 'border-border-strong text-brown hover:border-ink'
              }`}
            >
              {s.label}
            </Link>
          ))}
        </div>
      </div>

      {/* BODY */}
      <div className="flex flex-col lg:flex-row gap-10 container mx-auto px-6 sm:px-14 py-8">
        <aside className="lg:w-56 flex-none flex flex-col gap-7">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold tracking-widest uppercase">{t.filters}</span>
            <Link href={base} className="text-xs text-olive border-b border-olive pb-0.5">
              {t.clear_all}
            </Link>
          </div>

          <div>
            <div className="text-[10px] font-semibold tracking-widest uppercase text-warm-gray mb-3">{t.duration}</div>
            <FilterChips
              chips={durationChips.map((c) => ({ label: c.label, href: qs({ duration: duration === c.value ? undefined : c.value, page: undefined }), active: duration === c.value }))}
            />
          </div>

          <div className="h-px bg-border" />

          <div>
            <div className="text-[10px] font-semibold tracking-widest uppercase text-warm-gray mb-3">{t.region}</div>
            <FilterChips
              chips={regionChips.map((c) => ({ label: c.label, href: qs({ region: region === c.value ? undefined : c.value, page: undefined }), active: region === c.value }))}
            />
          </div>

          <div className="h-px bg-border" />

          <div>
            <div className="text-[10px] font-semibold tracking-widest uppercase text-warm-gray mb-3">{t.trip_type}</div>
            <FilterChips
              chips={typeChips.map((c) => ({ label: c.label, href: qs({ type: type === c.value ? undefined : c.value, page: undefined }), active: type === c.value }))}
            />
          </div>
        </aside>

        <div className="flex-1">
          {items.length === 0 ? (
            <p className="text-warm-gray">{t.empty}</p>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
              {items.map((tour: Tour) => (
                <JourneyCard
                  key={tour.slug}
                  item={{ id: tour.slug, days: tour.days, title: tour.title, description: tour.summary, badge: `${tour.region} · ${tour.type}`, rating: tour.rating, image: tour.image }}
                  daysLabel={getTranslation(locale).journeys.days_label}
                  price={`$${tour.price.toLocaleString()}`}
                  href={`/${locale}/tours/${tour.slug}`}
                />
              ))}
            </div>
          )}

          {totalPages > 1 && (
            <div className="flex items-center justify-center gap-2 mt-10">
              {Array.from({ length: totalPages }).map((_, i) => (
                <Link
                  key={i}
                  href={qs({ page: String(i + 1) })}
                  className={`w-10 h-10 rounded-full flex items-center justify-center text-sm font-medium ${
                    page === i + 1 ? 'bg-ink text-cream' : 'border border-border-strong text-ink'
                  }`}
                >
                  {i + 1}
                </Link>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* INQUIRY BAND */}
      <section className="bg-olive container mx-auto px-6 sm:px-14 py-12 flex flex-wrap items-center justify-between gap-6">
        <div>
          <div className="text-cream/75 text-xs font-semibold tracking-[0.22em] uppercase">{t.cta_eyebrow}</div>
          <div className="text-cream font-display text-3xl mt-2">
            {t.cta_heading_prefix} <span className="italic">{t.cta_heading_italic}</span>
          </div>
        </div>
        <Link href={`/${locale}/contact`} className="bg-cream text-ink rounded-sm px-7 py-3.5 text-xs font-semibold tracking-widest uppercase">
          {t.cta_button}
        </Link>
      </section>
    </>
  )
}
