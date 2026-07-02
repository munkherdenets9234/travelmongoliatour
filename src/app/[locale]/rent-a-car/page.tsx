import type { Metadata } from 'next'
import Image from 'next/image'
import Link from 'next/link'
import { notFound } from 'next/navigation'
import { isValidLocale } from '@/lib/i18n'
import { getCars } from '@/lib/data/cars'
import FilterChips from '@/components/ui/FilterChips'
import CarCard from '@/components/rentals/CarCard'

interface Props {
  params: Promise<{ locale: string }>
  searchParams: Promise<{ [key: string]: string | string[] | undefined }>
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { locale } = await params
  return {
    title: 'Rent a 4×4 — Car Rental — E & S Discovery Mongolia',
    description: 'Well-maintained expedition vehicles — drive yourself, or add an experienced local driver-guide.',
    alternates: { canonical: `/${locale}/rent-a-car` },
  }
}

function one(v: string | string[] | undefined) {
  return Array.isArray(v) ? v[0] : v
}

export default async function RentACarPage({ params, searchParams }: Props) {
  const { locale } = await params
  if (!isValidLocale(locale)) notFound()
  const sp = await searchParams

  const type = one(sp.type)
  const mode: 'self-drive' | 'with-driver' = one(sp.mode) === 'self-drive' ? 'self-drive' : 'with-driver'
  const cars = getCars({ type })

  const base = `/${locale}/rent-a-car`
  const qs = (overrides: Record<string, string | undefined>) => {
    const params = new URLSearchParams()
    const merged = { type, mode, ...overrides }
    Object.entries(merged).forEach(([k, v]) => v && params.set(k, v))
    const s = params.toString()
    return s ? `${base}?${s}` : base
  }

  const typeChips = [
    { label: 'SUV', value: 'suv' },
    { label: 'Van', value: 'van' },
    { label: 'Furgon', value: 'furgon' },
    { label: 'Sedan', value: 'sedan' },
  ]

  return (
    <>
      <section className="relative h-[320px]">
        <Image src="/images/car-rental-hero.jpg" alt="4x4 vehicle in the Mongolian steppe" fill className="object-cover" priority />
        <div className="absolute inset-0 bg-gradient-to-r from-ink/80 via-ink/45 to-ink/10" />
        <div className="relative z-10 h-full flex flex-col justify-center container mx-auto px-6 sm:px-14 max-w-lg">
          <p className="text-cream/85 text-xs font-semibold tracking-[0.24em] uppercase">Built for the roadless steppe</p>
          <h1 className="text-cream text-5xl mt-4">
            Rent a <span className="italic font-normal">4×4</span>
          </h1>
          <p className="text-cream/85 mt-4">Well-maintained expedition vehicles — drive yourself, or add an experienced local driver-guide.</p>
        </div>
      </section>

      {/* SEARCH RAIL */}
      <div className="container mx-auto px-6 sm:px-14 -mt-9 relative z-10">
        <div className="bg-white rounded-md shadow-[0_20px_44px_rgba(30,27,22,0.14)] p-5 flex flex-wrap items-end gap-5">
          <div className="flex-1 min-w-[150px]">
            <div className="text-[10px] font-semibold tracking-widest uppercase text-warm-gray mb-2">Pick-up date</div>
            <input type="date" className="w-full border-b border-input-border text-sm py-2 outline-none" />
          </div>
          <div className="flex-1 min-w-[150px]">
            <div className="text-[10px] font-semibold tracking-widest uppercase text-warm-gray mb-2">Return date</div>
            <input type="date" className="w-full border-b border-input-border text-sm py-2 outline-none" />
          </div>
          <div className="flex border border-input-border rounded-sm overflow-hidden">
            <Link href={qs({ mode: 'with-driver' })} className={`px-4 py-2.5 text-xs font-semibold tracking-wide ${mode === 'with-driver' ? 'bg-ink text-cream' : 'text-brown'}`}>
              With driver
            </Link>
            <Link href={qs({ mode: 'self-drive' })} className={`px-4 py-2.5 text-xs font-semibold tracking-wide ${mode === 'self-drive' ? 'bg-ink text-cream' : 'text-brown'}`}>
              Self-drive
            </Link>
          </div>
        </div>
      </div>

      {/* FILTERS */}
      <div className="container mx-auto px-6 sm:px-14 pt-8">
        <FilterChips
          chips={[
            { label: 'All vehicles', href: base, active: !type },
            ...typeChips.map((c) => ({ label: c.label, href: qs({ type: type === c.value ? undefined : c.value }), active: type === c.value })),
          ]}
        />
      </div>

      {/* FLEET GRID */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 container mx-auto px-6 sm:px-14 py-8">
        {cars.map((car) => (
          <CarCard key={car.slug} car={car} mode={mode} />
        ))}

        <article className="rounded-md bg-ink text-cream flex flex-col items-center justify-center text-center p-8 shadow-[0_10px_26px_rgba(30,27,22,0.12)]">
          <div className="w-11 h-11 rounded-full border border-cream/50 flex items-center justify-center mb-3.5">✦</div>
          <div className="font-display text-2xl">Need a fleet?</div>
          <p className="text-sm text-cream/65 mt-2 mb-4">Multiple vehicles for a group expedition, with drivers and support crew.</p>
          <Link href={`/${locale}/contact`} className="border border-cream/50 rounded-sm px-5 py-2.5 text-xs font-semibold tracking-widest uppercase">
            Ask us →
          </Link>
        </article>
      </div>

      {/* INSURANCE STRIP */}
      <div className="bg-olive text-cream container mx-auto px-6 sm:px-14 py-8 flex flex-wrap gap-8 items-center justify-center">
        <div className="flex items-center gap-2.5 text-sm font-medium"><span>✓</span> Insurance & unlimited km included</div>
        <div className="flex items-center gap-2.5 text-sm font-medium"><span>✓</span> 24/7 roadside support</div>
        <div className="flex items-center gap-2.5 text-sm font-medium"><span>✓</span> Rooftop tent & camping gear add-ons</div>
      </div>
    </>
  )
}
