import { NextResponse } from 'next/server'
import { getTourBySlug, getRelatedTours } from '@/lib/data/tours'
import { defaultLocale } from '@/lib/i18n'

export async function GET(_request: Request, ctx: RouteContext<'/api/tours/[slug]'>) {
  const { slug } = await ctx.params
  const tour = await getTourBySlug(slug, defaultLocale)

  if (!tour) {
    return NextResponse.json({ error: 'Tour not found' }, { status: 404 })
  }

  return NextResponse.json({ tour, related: await getRelatedTours(slug, defaultLocale) })
}
