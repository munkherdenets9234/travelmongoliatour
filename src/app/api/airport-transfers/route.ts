import { NextRequest, NextResponse } from 'next/server'
import { apiPost } from '@/lib/api/client'
import {
  guardPost, jsonError, upstreamFailure, fakeConfirmation, cleanString, cleanEmail, cleanDate, cleanChoice, cleanInt, GENERIC_ERRORS,
} from '@/lib/api/guard'

interface TransferResponse {
  id: string
  confirmation_id: string
}

// Frontend offers 'standard' | 'meet-greet' | 'vip'; backend only has 'standard' | 'premium' | 'vip'.
function mapTier(tier: string): 'standard' | 'premium' | 'vip' {
  if (tier === 'meet-greet') return 'premium'
  if (tier === 'vip') return 'vip'
  return 'standard'
}

export async function POST(request: NextRequest) {
  const g = await guardPost(request, 'airport-transfers', { confirmationId: fakeConfirmation('AT') })
  if (!g.ok) return g.response
  const body = g.body

  const name = cleanString(body.name, { min: 1, max: 100 })
  const email = cleanEmail(body.email)
  const flight = cleanString(body.flightNumber, { min: 2, max: 12 })
  const tier = cleanChoice(body.tier, ['standard', 'meet-greet', 'vip'])
  const arrival = cleanDate(body.arrivalDateTime)
  const passengers = cleanInt(body.passengers ?? 1, { min: 1, max: 20 })
  if (![name, email, flight, tier, arrival, passengers].every((f) => f.ok) || !/^[A-Za-z0-9 -]+$/.test(flight.value)) {
    return jsonError(400, GENERIC_ERRORS.invalid)
  }

  try {
    const { data } = await apiPost<TransferResponse>('/airport-transfers', {
      customer: {
        name: name.value,
        email: email.value,
        phone: '',
        nationality: '',
        notes: '',
      },
      transfer: {
        tier: mapTier(tier.value),
        flight_number: flight.value,
        arrival_at: arrival.value,
        passengers: passengers.value,
        notes: '',
      },
    }, undefined, g.ip)

    return NextResponse.json({ confirmationId: data.confirmation_id }, { status: 201 })
  } catch (err) {
    return upstreamFailure('airport-transfers', err)
  }
}
