// Single source of truth for booking add-on pricing — used by BookingForm (display)
// and the /api/bookings route (authoritative total, recomputed server-side).
export interface Addon {
  id: string
  label: string
  price: number
}

export const ADDONS: Addon[] = [
  { id: 'meet-greet', label: 'Airport meet & greet', price: 40 },
  { id: 'insurance', label: 'Travel insurance', price: 75 },
  { id: 'extra-night', label: 'Extra night in Ulaanbaatar', price: 90 },
  { id: 'recovery-package', label: 'NatureMed recovery package', price: 120 },
]
