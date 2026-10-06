import { NextRequest, NextResponse } from 'next/server'
import { apiPost } from '@/lib/api/client'
import {
  guardPost, jsonError, upstreamFailure, fakeConfirmation, cleanString, cleanEmail, cleanPhone, cleanDate, cleanChoice, GENERIC_ERRORS,
} from '@/lib/api/guard'
import { getCarBySlug } from '@/lib/data/cars'

interface RentalResponse {
  id: string
  confirmation_id: string
}

export async function POST(request: NextRequest) {
  const g = await guardPost(request, 'rentals', { confirmationId: fakeConfirmation('RN') })
  if (!g.ok) return g.response
  const body = g.body

  const name = cleanString(body.name, { min: 1, max: 100 })
  const email = cleanEmail(body.email)
  const phone = cleanPhone(body.phone)
  const slug = cleanString(body.carSlug, { min: 1, max: 120 })
  const mode = cleanChoice(body.mode, ['with-driver', 'self-drive'])
  const pickup = cleanDate(body.pickupDate)
  const ret = cleanDate(body.returnDate)
  if (![name, email, phone, slug, mode, pickup, ret].every((f) => f.ok) || new Date(ret.value) < new Date(pickup.value)) {
    return jsonError(400, GENERIC_ERRORS.invalid)
  }

  const car = await getCarBySlug(slug.value)
  if (!car || !car.id) {
    return jsonError(404, GENERIC_ERRORS.notFound)
  }

  try {
    const { data } = await apiPost<RentalResponse>('/rentals', {
      car_id: car.id,
      customer: {
        name: name.value,
        email: email.value,
        phone: phone.value,
        nationality: '',
        notes: '',
      },
      rental: {
        mode: mode.value === 'with-driver' ? 'with_driver' : 'self_drive',
        pickup_date: pickup.value,
        return_date: ret.value,
        notes: '',
      },
    }, undefined, g.ip)

    return NextResponse.json({ confirmationId: data.confirmation_id }, { status: 201 })
  } catch (err) {
    return upstreamFailure('rentals', err)
  }
}
