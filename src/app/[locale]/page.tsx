import HeroSection from '@/components/sections/HeroSection'
import SearchBar from '@/components/sections/SearchBar'
import FeaturedJourneys from '@/components/sections/FeaturedJourneys'
import TripAdvisorSection from '@/components/sections/TripAdvisorSection'
import MapSection from '@/components/sections/MapSection'
import WhySection from '@/components/sections/WhySection'
import ReviewsSection from '@/components/sections/ReviewsSection'
import PartnersSection from '@/components/sections/PartnersSection'
import QuoteSection from '@/components/sections/QuoteSection'
import JournalSection from '@/components/sections/JournalSection'
import { getAllTours } from '@/lib/data/tours'
import { getAllArticles } from '@/lib/data/journal'
import { getAllPartners } from '@/lib/data/partners'
import { getAllReviews } from '@/lib/data/reviews'
import { humanizeSlug } from '@/lib/format'
import { getTranslation, isValidLocale } from '@/lib/i18n'
import { notFound } from 'next/navigation'

interface Props {
  params: Promise<{ locale: string }>
}

export default async function HomePage({ params }: Props) {
  const { locale } = await params
  if (!isValidLocale(locale)) notFound()

  const t = getTranslation(locale)
  const tours = await getAllTours(locale)
  const articles = await getAllArticles(locale)
  const partners = await getAllPartners(locale)
  const reviews = await getAllReviews(locale)
  const latestArticles = [...articles]
    .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime())
    .slice(0, 3)
    .map((a) => ({ id: a.slug, category: a.category, title: a.title, read_time: a.readTime, image: a.image }))
  const searchTours = tours.map((t) => ({ slug: t.slug, title: t.title, type: t.type }))
  const featuredItems = tours
    .filter((t) => t.featured)
    .map((t) => ({ id: t.slug, days: t.days, title: t.title, description: t.summary, badge: t.badge ?? '', rating: t.rating, image: t.image }))
  const mapTours = tours
    .filter((t) => t.location.lat !== 0 || t.location.lng !== 0)
    .map((t) => ({ slug: t.slug, title: t.title, subtitle: `${t.days} days · ${t.region}`, lat: t.location.lat, lng: t.location.lng }))
  const tourTitleBySlug = new Map(tours.map((t) => [t.slug, t.title]))
  const reviewItems = reviews.map((r) => ({
    id: r.id,
    customer: r.customer,
    star: r.star,
    quote: r.quote,
    source: tourTitleBySlug.get(r.tourSlug) ?? (r.tourSlug ? humanizeSlug(r.tourSlug) : r.partner),
  }))

  return (
    <>
      <HeroSection t={t} locale={locale} />
      <SearchBar tours={searchTours} />
      <FeaturedJourneys items={featuredItems} />
      <TripAdvisorSection t={t} />
      <MapSection tours={mapTours} />
      <WhySection t={t} />
      <ReviewsSection reviews={reviewItems} t={t} locale={locale} />
      <PartnersSection partners={partners} />
      <QuoteSection t={t} />
      <JournalSection items={latestArticles} t={t} locale={locale} />
    </>
  )
}
