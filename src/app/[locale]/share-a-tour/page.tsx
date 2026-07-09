import type { Metadata } from 'next'
import { notFound } from 'next/navigation'
import { isValidLocale, getTranslation } from '@/lib/i18n'
import { getDepartureWithTour } from '@/lib/data/departures'
import DepartureCalendar from '@/components/tours/DepartureCalendar'

interface Props {
  params: Promise<{ locale: string }>
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { locale } = await params
  if (!isValidLocale(locale)) return {}
  const t = getTranslation(locale).shareATour
  return {
    title: t.meta_title,
    description: t.meta_description,
    alternates: { canonical: `/${locale}/share-a-tour` },
  }
}

const DEFAULT_YEAR = 2026
const DEFAULT_MONTH = 6

export default async function ShareATourPage({ params }: Props) {
  const { locale } = await params
  if (!isValidLocale(locale)) notFound()

  const items = await getDepartureWithTour(`${DEFAULT_YEAR}-${String(DEFAULT_MONTH).padStart(2, '0')}`, locale)

  return <DepartureCalendar locale={locale} initialYear={DEFAULT_YEAR} initialMonth={DEFAULT_MONTH} initialItems={items} />
}
