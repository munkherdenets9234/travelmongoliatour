// Placeholder/mock data — the DigitalService API has no `/departures` resource
// (only a per-destination `departures` window with no spots-left/status), so
// this stays local, cross-referencing tour slugs from the live `/destinations` API.
import { getTourBySlug } from './tours'

export interface Departure {
  id: string
  date: string // YYYY-MM-DD
  tourSlug: string
  spotsLeft: number
  status: 'open' | 'few-left' | 'full'
}

const JUNE_2026: Departure[] = [
  { id: 'dep-1', date: '2026-06-05', tourSlug: 'gobi-desert-classic', spotsLeft: 6, status: 'few-left' },
  { id: 'dep-2', date: '2026-06-08', tourSlug: 'khuvsgul-lake-and-reindeer', spotsLeft: 9, status: 'open' },
  { id: 'dep-3', date: '2026-06-12', tourSlug: 'naadam-festival', spotsLeft: 4, status: 'few-left' },
  { id: 'dep-4', date: '2026-06-15', tourSlug: 'gobi-desert-classic', spotsLeft: 0, status: 'full' },
  { id: 'dep-5', date: '2026-06-18', tourSlug: 'eagle-hunters-of-the-altai', spotsLeft: 8, status: 'few-left' },
  { id: 'dep-6', date: '2026-06-22', tourSlug: 'heartland-and-karakorum', spotsLeft: 10, status: 'open' },
  { id: 'dep-7', date: '2026-06-29', tourSlug: 'gobi-desert-classic', spotsLeft: 8, status: 'open' },
]

export function getDepartures(month: string): Departure[] {
  if (month === '2026-06') return JUNE_2026

  // Generic fallback so other months aren't empty in the placeholder API.
  const [year, mo] = month.split('-').map(Number)
  const pad = (n: number) => String(n).padStart(2, '0')
  return [
    { id: `${month}-a`, date: `${year}-${pad(mo)}-07`, tourSlug: 'naadam-festival', spotsLeft: 6, status: 'open' },
    { id: `${month}-b`, date: `${year}-${pad(mo)}-21`, tourSlug: 'gobi-desert-classic', spotsLeft: 5, status: 'few-left' },
  ]
}

export async function getDepartureWithTour(month: string) {
  const departures = getDepartures(month)
  const tours = await Promise.all(departures.map((d) => getTourBySlug(d.tourSlug)))
  return departures
    .map((d, i) => ({ ...d, tour: tours[i] }))
    .filter((d): d is Departure & { tour: NonNullable<(typeof tours)[number]> } => Boolean(d.tour))
}

export type DepartureWithTour = Awaited<ReturnType<typeof getDepartureWithTour>>[number]
