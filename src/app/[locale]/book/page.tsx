import type { Metadata } from 'next'
import { notFound } from 'next/navigation'
import { isValidLocale } from '@/lib/i18n'
import { getAllTours } from '@/lib/data/tours'
import BookingForm from '@/components/forms/BookingForm'

interface Props {
  params: Promise<{ locale: string }>
  searchParams: Promise<{ [key: string]: string | string[] | undefined }>
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { locale } = await params
  return {
    title: 'Book Your Journey — E & S Discovery Mongolia',
    description: 'A single-page guest checkout for your Mongolia journey — no account needed.',
    alternates: { canonical: `/${locale}/book` },
  }
}

function one(v: string | string[] | undefined) {
  return Array.isArray(v) ? v[0] : v
}

export default async function BookPage({ params, searchParams }: Props) {
  const { locale } = await params
  if (!isValidLocale(locale)) notFound()
  const sp = await searchParams
  const tours = await getAllTours()

  return (
    <>
      <div className="flex items-center justify-center gap-3.5 px-6 pt-7 pb-1 text-xs font-semibold tracking-widest uppercase">
        <span className="inline-flex items-center gap-2 text-ink">
          <span className="w-6 h-6 rounded-full bg-olive text-cream flex items-center justify-center">1</span> Trip
        </span>
        <span className="w-10 h-px bg-border-strong" />
        <span className="inline-flex items-center gap-2 text-ink">
          <span className="w-6 h-6 rounded-full bg-olive text-cream flex items-center justify-center">2</span> Traveller
        </span>
        <span className="w-10 h-px bg-border-strong" />
        <span className="inline-flex items-center gap-2 text-warm-gray">
          <span className="w-6 h-6 rounded-full border border-border-strong flex items-center justify-center">3</span> Payment
        </span>
      </div>

      <div className="container mx-auto px-6 sm:px-14 pt-5 pb-3">
        <h1 className="font-display text-4xl">
          Book your <span className="italic font-normal">journey</span>
        </h1>
      </div>

      <BookingForm tours={tours} initialSlug={one(sp.tour)} initialDate={one(sp.date)} />
    </>
  )
}
