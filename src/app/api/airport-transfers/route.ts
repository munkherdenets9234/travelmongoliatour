import { NextRequest, NextResponse } from 'next/server'
import { apiPost } from '@/lib/api/client'

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
  const body = await request.json().catch(() => null)

  if (!body || !body.name || !body.email || !body.flightNumber) {
    return NextResponse.json({ error: 'Missing required transfer fields' }, { status: 400 })
  }

  try {
    const { data } = await apiPost<TransferResponse>('/airport-transfers', {
      customer: {
        name: body.name,
        email: body.email,
        phone: '',
        nationality: '',
        notes: '',
      },
      transfer: {
        tier: mapTier(body.tier),
        flight_number: body.flightNumber,
        arrival_at: body.arrivalDateTime ? new Date(body.arrivalDateTime).toISOString() : new Date().toISOString(),
        passengers: Number(body.passengers) || 1,
        notes: '',
      },
    })

    return NextResponse.json({ confirmationId: data.confirmation_id, received: body }, { status: 201 })
  } catch (err) {
    return NextResponse.json({ error: err instanceof Error ? err.message : 'Transfer request failed' }, { status: 502 })
  }
}
