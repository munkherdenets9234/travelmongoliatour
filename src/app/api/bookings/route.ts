import { NextRequest, NextResponse } from 'next/server'
import { apiPost } from '@/lib/api/client'
import { getTourBySlug } from '@/lib/data/tours'

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
        travelers: { adults: Number(body.travellers) || 1, children: 0 },
        total_price_usd: Number(body.total) || 0,
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
