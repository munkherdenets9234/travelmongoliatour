import { NextRequest, NextResponse } from 'next/server'
import { getCars } from '@/lib/data/cars'

export async function GET(request: NextRequest) {
  const type = request.nextUrl.searchParams.get('type') ?? undefined
  return NextResponse.json({ items: await getCars({ type }) })
}
