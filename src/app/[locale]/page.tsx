import HeroSection from '@/components/sections/HeroSection'
import SearchBar from '@/components/sections/SearchBar'
import FeaturedJourneys from '@/components/sections/FeaturedJourneys'
import TripAdvisorSection from '@/components/sections/TripAdvisorSection'
import MapSection from '@/components/sections/MapSection'
import WhySection from '@/components/sections/WhySection'
import QuoteSection from '@/components/sections/QuoteSection'
import JournalSection from '@/components/sections/JournalSection'
import { getAllTours } from '@/lib/data/tours'

export default async function HomePage() {
  const tours = await getAllTours()
  const searchTours = tours.map((t) => ({ slug: t.slug, title: t.title, type: t.type }))
  const featuredItems = tours
    .filter((t) => t.featured)
    .map((t) => ({ id: t.slug, days: t.days, title: t.title, description: t.summary, badge: t.badge ?? '', rating: t.rating, image: t.image }))
  const mapTours = tours
    .filter((t) => t.location.lat !== 0 || t.location.lng !== 0)
    .map((t) => ({ slug: t.slug, title: t.title, subtitle: `${t.days} days · ${t.region}`, lat: t.location.lat, lng: t.location.lng }))

  return (
    <>
      <HeroSection />
      <SearchBar tours={searchTours} />
      <FeaturedJourneys items={featuredItems} />
      <TripAdvisorSection />
      <MapSection tours={mapTours} />
      <WhySection />
      <QuoteSection />
      <JournalSection />
    </>
  )
}
