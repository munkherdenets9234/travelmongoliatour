import { NextRequest, NextResponse } from 'next/server'
import { getDepartureWithTour } from '@/lib/data/departures'
import { defaultLocale } from '@/lib/i18n'

export async function GET(request: NextRequest) {
  const now = new Date()
  const defaultMonth = `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}`
  const month = request.nextUrl.searchParams.get('month') ?? defaultMonth

  return NextResponse.json({ month, items: await getDepartureWithTour(month, defaultLocale) })
}
