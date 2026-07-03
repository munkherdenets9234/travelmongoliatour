import { NextRequest, NextResponse } from 'next/server'
import { apiPost } from '@/lib/api/client'
import { getCarBySlug } from '@/lib/data/cars'

interface RentalResponse {
  id: string
  confirmation_id: string
}

export async function POST(request: NextRequest) {
  const body = await request.json().catch(() => null)

  if (!body || !body.name || !body.email || !body.carSlug) {
    return NextResponse.json({ error: 'Missing required rental fields' }, { status: 400 })
  }

  const car = await getCarBySlug(body.carSlug)
  if (!car || !car.id) {
    return NextResponse.json({ error: 'Car not found' }, { status: 404 })
  }

  try {
    const { data } = await apiPost<RentalResponse>('/rentals', {
      car_id: car.id,
      customer: {
        name: body.name,
        email: body.email,
        phone: body.phone ?? '',
        nationality: '',
        notes: '',
      },
      rental: {
        mode: body.mode === 'with-driver' ? 'with_driver' : 'self_drive',
        pickup_date: body.pickupDate ? new Date(body.pickupDate).toISOString() : new Date().toISOString(),
        return_date: body.returnDate ? new Date(body.returnDate).toISOString() : new Date().toISOString(),
        notes: '',
      },
    })

    return NextResponse.json({ confirmationId: data.confirmation_id, received: body }, { status: 201 })
  } catch (err) {
    return NextResponse.json({ error: err instanceof Error ? err.message : 'Rental failed' }, { status: 502 })
  }
}
