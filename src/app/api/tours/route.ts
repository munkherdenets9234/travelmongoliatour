import { NextRequest, NextResponse } from 'next/server'
import { getTours } from '@/lib/data/tours'

export async function GET(request: NextRequest) {
  const params = request.nextUrl.searchParams
  const result = getTours({
    duration: params.get('duration') ?? undefined,
    region: params.get('region') ?? undefined,
    type: params.get('type') ?? undefined,
    budgetMax: params.get('budget') ? Number(params.get('budget')) : undefined,
    sort: params.get('sort') ?? undefined,
    page: params.get('page') ? Number(params.get('page')) : undefined,
  })

  return NextResponse.json(result)
}
