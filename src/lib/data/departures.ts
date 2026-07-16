// Backed by each Destination's embedded `departures` window on the DigitalService
// API's `/destinations` resource (see mapDestinationToTour in ./tours) — there is no
// separate `/departures` endpoint, and the backend has no spots-left count, only
// `available`.
import { getAllTours, type Tour } from './tours'
import type { Locale } from '@/types/i18n'

export interface DepartureWithTour {
  id: string
  date: string // YYYY-MM-DD
  tourSlug: string
  status: 'open' | 'full'
  tour: Tour
}

export async function getDepartureWithTour(month: string, locale: Locale): Promise<DepartureWithTour[]> {
  const tours = await getAllTours(locale)
  return tours.flatMap((tour) =>
    tour.departures
      .filter((dep) => dep.date.startsWith(month))
      .map((dep) => ({
        id: `${tour.slug}-${dep.date}`,
        date: dep.date,
        tourSlug: tour.slug,
        status: dep.available ? ('open' as const) : ('full' as const),
        tour,
      }))
  )
}
