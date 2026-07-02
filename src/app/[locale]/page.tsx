import HeroSection from '@/components/sections/HeroSection'
import SearchBar from '@/components/sections/SearchBar'
import FeaturedJourneys from '@/components/sections/FeaturedJourneys'
import TripAdvisorSection from '@/components/sections/TripAdvisorSection'
import MapSection from '@/components/sections/MapSection'
import WhySection from '@/components/sections/WhySection'
import QuoteSection from '@/components/sections/QuoteSection'
import JournalSection from '@/components/sections/JournalSection'

export default function HomePage() {
  return (
    <>
      <HeroSection />
      <SearchBar />
      <FeaturedJourneys />
      <TripAdvisorSection />
      <MapSection />
      <WhySection />
      <QuoteSection />
      <JournalSection />
    </>
  )
}
