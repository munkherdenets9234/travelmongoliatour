// Backed by the DigitalService API's `/destinations` resource — see src/lib/api/client.ts.
import { apiGet, ApiError } from '@/lib/api/client'

export interface TourItinerary {
  day: number
  title: string
  description: string
}

export interface TourInclusion {
  title: string
  description: string
}

export interface Tour {
  id?: string
  slug: string
  title: string
  region: string
  type: string
  location: { lat: number; lng: number }
  days: number
  nights: number
  price: number
  rating: number
  maxTravellers: number
  image: string
  gallery: string[]
  badge?: string
  featured: boolean
  summary: string
  description: string
  highlights: string[]
  goodToKnow: string[]
  itinerary: TourItinerary[]
  inclusions: TourInclusion[]
  guide: { name: string; note: string }
}

interface BackendImage {
  url: string
  caption: string
}

interface BackendPriceByGroup {
  min_people: number
  max_people: number
  price_usd: number
}

interface BackendItineraryDay {
  day: number
  title: string
  description: string
  activities: string[]
  overnight: string
  meals: string[]
}

interface Destination {
  id: string
  name: string
  slug: string
  overview: string
  region: string
  location: { lat: number; lng: number }
  duration_days: number
  group_size: { min: number; max: number }
  prices: BackendPriceByGroup[]
  best_seasons: string[]
  departures: { start_date: string; end_date: string; available: boolean }[]
  highlights: string[]
  activities: string[]
  inclusions: string[]
  exclusions: string[]
  itinerary: BackendItineraryDay[]
  accommodation: string
  meal_plan: string
  difficulty: string
  categories: string[]
  tags: string[]
  cover_image: BackendImage
  images: BackendImage[]
  is_active: boolean
  featured?: boolean
}

function mapDestinationToTour(d: Destination): Tour {
  const cheapest = d.prices?.length ? Math.min(...d.prices.map((p) => p.price_usd)) : 0

  // rating and guide have no backend field yet — static placeholders until the
  // Destination model grows one.
  const goodToKnow = [
    d.best_seasons?.length ? `Best season · ${d.best_seasons.join('–')}` : undefined,
    d.difficulty ? `Difficulty · ${d.difficulty}` : undefined,
    d.accommodation || undefined,
    d.meal_plan || undefined,
  ].filter((v): v is string => Boolean(v))

  return {
    id: d.id,
    slug: d.slug,
    title: d.name,
    region: d.region,
    type: d.categories?.[0] ?? 'adventure',
    location: { lat: d.location?.lat ?? 0, lng: d.location?.lng ?? 0 },
    days: d.duration_days,
    nights: Math.max(0, d.duration_days - 1),
    price: cheapest,
    rating: 4.8,
    maxTravellers: d.group_size?.max ?? 0,
    image: d.cover_image?.url ?? '',
    gallery: d.images?.map((img) => img.url) ?? [],
    badge: d.tags?.includes('signature') ? 'Signature' : undefined,
    featured: d.featured === true,
    summary: d.overview,
    description: d.overview,
    highlights: d.highlights ?? [],
    goodToKnow,
    itinerary: (d.itinerary ?? []).map((day) => ({ day: day.day, title: day.title, description: day.description })),
    inclusions: (d.inclusions ?? []).map((title) => ({ title, description: '' })),
    guide: { name: 'Your local guide', note: 'Assigned on booking' },
  }
}

export async function getAllTours(): Promise<Tour[]> {
  const { data } = await apiGet<Destination[]>('/destinations', { limit: 100 })
  // The Go backend serializes an empty result set as `null`, not `[]`.
  return (data ?? []).map(mapDestinationToTour)
}

// `/destinations` has no `?featured` query param — the Destination model's
// `featured` field is filtered client-side instead of trusting the backend to do it.
export async function getFeaturedTours(): Promise<Tour[]> {
  const tours = await getAllTours()
  return tours.filter((t) => t.featured)
}

export interface TourFilters {
  duration?: string
  region?: string
  type?: string
  budgetMax?: number
  sort?: string
  page?: number
  pageSize?: number
}

export async function getTours(filters: TourFilters = {}) {
  let results = await getAllTours()

  if (filters.region) results = results.filter((t) => t.region === filters.region)
  if (filters.type) results = results.filter((t) => t.type === filters.type)
  if (filters.duration) {
    results = results.filter((t) => {
      if (filters.duration === '1-5') return t.days <= 5
      if (filters.duration === '6-10') return t.days >= 6 && t.days <= 10
      if (filters.duration === '11+') return t.days >= 11
      return true
    })
  }
  if (filters.budgetMax) results = results.filter((t) => t.price <= filters.budgetMax!)

  if (filters.sort === 'price-low') results.sort((a, b) => a.price - b.price)
  else if (filters.sort === 'price-high') results.sort((a, b) => b.price - a.price)
  else if (filters.sort === 'duration') results.sort((a, b) => a.days - b.days)
  else results.sort((a, b) => b.rating - a.rating)

  const total = results.length
  const pageSize = filters.pageSize ?? 12
  const page = filters.page ?? 1
  const start = (page - 1) * pageSize
  const items = results.slice(start, start + pageSize)

  return { items, total, page, pageSize }
}

export async function getTourBySlug(slug: string): Promise<Tour | undefined> {
  try {
    const { data } = await apiGet<Destination>(`/destinations/${slug}`)
    return mapDestinationToTour(data)
  } catch (err) {
    if (err instanceof ApiError && err.status === 404) return undefined
    throw err
  }
}

export async function getRelatedTours(slug: string, count = 3): Promise<Tour[]> {
  const all = await getAllTours()
  return all.filter((t) => t.slug !== slug).slice(0, count)
}
