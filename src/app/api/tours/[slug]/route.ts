import { NextResponse } from 'next/server'
import { getTourBySlug, getRelatedTours } from '@/lib/data/tours'

export async function GET(_request: Request, ctx: RouteContext<'/api/tours/[slug]'>) {
  const { slug } = await ctx.params
  const tour = getTourBySlug(slug)

  if (!tour) {
    return NextResponse.json({ error: 'Tour not found' }, { status: 404 })
  }

  return NextResponse.json({ tour, related: getRelatedTours(slug) })
}
