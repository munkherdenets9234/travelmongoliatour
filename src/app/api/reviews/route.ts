import { NextRequest, NextResponse } from 'next/server'
import { apiPost } from '@/lib/api/client'
import { guardPost, jsonError, upstreamFailure, cleanString, cleanInt, cleanChoice, GENERIC_ERRORS } from '@/lib/api/guard'
import { locales } from '@/lib/i18n'

interface ReviewResponse {
  id: string
}

export async function POST(request: NextRequest) {
  const g = await guardPost(request, 'reviews', { id: 'accepted' })
  if (!g.ok) return g.response
  const body = g.body

  const name = cleanString(body.name, { min: 1, max: 100 })
  const review = cleanString(body.review, { min: 1, max: 3000, multiline: true })
  const star = cleanInt(body.star, { min: 1, max: 5 })
  const relatedTour = cleanString(body.related_tour, { max: 120 })
  const locale = body.locale === undefined || body.locale === null || body.locale === ''
    ? { ok: true, value: '' }
    : cleanChoice(body.locale, locales)
  if (![name, review, star, relatedTour, locale].every((f) => f.ok)) {
    return jsonError(400, GENERIC_ERRORS.invalid)
  }

  try {
    const path = locale.value ? `/reviews?lang=${encodeURIComponent(locale.value)}` : '/reviews'
    const { data } = await apiPost<ReviewResponse>(path, {
      name: name.value,
      star: star.value,
      review: review.value,
      related_tour: relatedTour.value || undefined,
    }, undefined, g.ip)
    return NextResponse.json({ id: data.id }, { status: 201 })
  } catch (err) {
    return upstreamFailure('reviews', err)
  }
}
