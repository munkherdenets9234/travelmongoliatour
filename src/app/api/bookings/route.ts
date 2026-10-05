import { NextRequest, NextResponse } from 'next/server'
import { apiPost } from '@/lib/api/client'
import {
  guardPost, jsonError, upstreamFailure, fakeConfirmation, cleanString, cleanEmail, cleanPhone, cleanDate, GENERIC_ERRORS,
} from '@/lib/api/guard'
import { getTourBySlug } from '@/lib/data/tours'
import { ADDONS } from '@/lib/data/addons'
import { defaultLocale } from '@/lib/i18n'

interface BookingResponse {
  id: string
}

function addDays(iso: string, days: number) {
  const d = new Date(iso)
  d.setUTCDate(d.getUTCDate() + days)
  return d.toISOString()
}

export async function POST(request: NextRequest) {
  const g = await guardPost(request, 'bookings', { confirmationId: fakeConfirmation('BK') })
  if (!g.ok) return g.response
  const body = g.body

  const name = cleanString(body.name, { min: 1, max: 100 })
  const email = cleanEmail(body.email)
  const phone = cleanPhone(body.phone)
  const country = cleanString(body.country, { max: 80 })
  const notes = cleanString(body.notes, { max: 2000, multiline: true })
  const slug = cleanString(body.tourSlug, { min: 1, max: 120 })
  const date = cleanDate(body.date)
  if (![name, email, phone, country, notes, slug, date].every((f) => f.ok)) {
    return jsonError(400, GENERIC_ERRORS.invalid)
  }

  const tour = await getTourBySlug(slug.value, defaultLocale)
  if (!tour || !tour.id) {
    return jsonError(404, GENERIC_ERRORS.notFound)
  }

  const start = date.value
  const end = addDays(start, tour.days)

  // Price is authoritative here, not on the client — never trust a client-supplied
  // total. Recompute it from the tour's real price and known add-on ids.
  const requestedTravellers = Number(body.travellers)
  const maxTravellers = tour.maxTravellers > 0 ? tour.maxTravellers : 20
  const travellers = Number.isInteger(requestedTravellers) && requestedTravellers >= 1
    ? Math.min(requestedTravellers, maxTravellers)
    : 1

  const requestedAddonIds: string[] = Array.isArray(body.addons)
    ? body.addons.slice(0, 20).filter((id: unknown): id is string => typeof id === 'string')
    : []
  const selectedAddons = ADDONS.filter((a) => requestedAddonIds.includes(a.id))
  const addonsTotal = selectedAddons.reduce((sum, a) => sum + a.price, 0)
  const total = tour.price * travellers + addonsTotal

  try {
    const { data } = await apiPost<BookingResponse>('/bookings', {
      destination_id: tour.id,
      customer: {
        name: name.value,
        email: email.value,
        phone: phone.value,
        nationality: country.value,
        notes: notes.value,
      },
      booking: {
        travel_dates: { start, end },
        travelers: { adults: travellers, children: 0 },
        total_price_usd: total,
        notes: notes.value,
      },
    }, undefined, g.ip)

    // The Booking model has no confirmation_id field (unlike Rental/Transfer) — synthesize one from the created _id.
    const confirmationId = `BK-${data.id.slice(-6).toUpperCase()}`
    return NextResponse.json({ confirmationId }, { status: 201 })
  } catch (err) {
    return upstreamFailure('bookings', err)
  }
}
