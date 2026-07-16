import { NextRequest, NextResponse } from 'next/server'
import { apiPost } from '@/lib/api/client'

interface ReviewResponse {
  id: string
}

export async function POST(request: NextRequest) {
  const body = await request.json().catch(() => null)
  const star = Number(body?.star)

  if (!body || !body.name || !body.review || !Number.isInteger(star) || star < 1 || star > 5) {
    return NextResponse.json({ error: 'Missing or invalid review fields' }, { status: 400 })
  }

  try {
    const path = body.locale ? `/reviews?lang=${encodeURIComponent(body.locale)}` : '/reviews'
    const { data } = await apiPost<ReviewResponse>(path, {
      name: body.name,
      star,
      review: body.review,
      related_tour: body.related_tour,
    })
    return NextResponse.json({ id: data.id }, { status: 201 })
  } catch (err) {
    return NextResponse.json({ error: err instanceof Error ? err.message : 'Review submission failed' }, { status: 502 })
  }
}
