import { NextRequest, NextResponse } from 'next/server'
import { apiPost } from '@/lib/api/client'
import { getTourBySlug } from '@/lib/data/tours'
import { ADDONS } from '@/lib/data/addons'

interface BookingResponse {
  id: string
}

function addDays(iso: string, days: number) {
  const d = new Date(iso)
  d.setUTCDate(d.getUTCDate() + days)
  return d.toISOString()
}

export async function POST(request: NextRequest) {
  const body = await request.json().catch(() => null)

  if (!body || !body.name || !body.email || !body.tourSlug) {
    return NextResponse.json({ error: 'Missing required booking fields' }, { status: 400 })
  }

  const tour = await getTourBySlug(body.tourSlug)
  if (!tour || !tour.id) {
    return NextResponse.json({ error: 'Tour not found' }, { status: 404 })
  }

  const start = body.date ? new Date(body.date).toISOString() : new Date().toISOString()
  const end = addDays(start, tour.days)

  // Price is authoritative here, not on the client — never trust a client-supplied
  // total. Recompute it from the tour's real price and known add-on ids.
  const requestedTravellers = Number(body.travellers)
  const maxTravellers = tour.maxTravellers > 0 ? tour.maxTravellers : 20
  const travellers = Number.isInteger(requestedTravellers) && requestedTravellers >= 1
    ? Math.min(requestedTravellers, maxTravellers)
    : 1

  const requestedAddonIds: string[] = Array.isArray(body.addons)
    ? body.addons.filter((id: unknown): id is string => typeof id === 'string')
    : []
  const selectedAddons = ADDONS.filter((a) => requestedAddonIds.includes(a.id))
  const addonsTotal = selectedAddons.reduce((sum, a) => sum + a.price, 0)
  const total = tour.price * travellers + addonsTotal

  try {
    const { data } = await apiPost<BookingResponse>('/bookings', {
      destination_id: tour.id,
      customer: {
        name: body.name,
        email: body.email,
        phone: body.phone ?? '',
        nationality: body.country ?? '',
        notes: body.notes ?? '',
      },
      booking: {
        travel_dates: { start, end },
        travelers: { adults: travellers, children: 0 },
        total_price_usd: total,
        notes: body.notes ?? '',
      },
    })

    // The Booking model has no confirmation_id field (unlike Rental/Transfer) — synthesize one from the created _id.
    const confirmationId = `BK-${data.id.slice(-6).toUpperCase()}`
    return NextResponse.json({ confirmationId, received: body }, { status: 201 })
  } catch (err) {
    return NextResponse.json({ error: err instanceof Error ? err.message : 'Booking failed' }, { status: 502 })
  }
}
