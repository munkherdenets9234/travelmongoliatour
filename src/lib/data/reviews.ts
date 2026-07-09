// Backed by the DigitalService API's `/reviews` resource — see src/lib/api/client.ts.
import { apiGet } from '@/lib/api/client'
import type { Locale } from '@/types/i18n'

export interface Review {
  id: string
  customer: string
  star: number
  quote: string
  tourSlug: string
  partner: string
}

interface BackendReview {
  id: string
  related_customer: string
  star: number
  review: string
  related_tour: string
  related_partner: string
}

function mapReview(r: BackendReview): Review {
  return {
    id: r.id,
    customer: r.related_customer,
    star: r.star,
    quote: r.review,
    tourSlug: r.related_tour ?? '',
    partner: r.related_partner ?? '',
  }
}

export interface ReviewFilters {
  tour?: string
  partner?: string
  page?: number
  pageSize?: number
}

export async function getReviews(locale: Locale, filters: ReviewFilters = {}) {
  const page = filters.page ?? 1
  const pageSize = filters.pageSize ?? 20
  const { data, meta } = await apiGet<BackendReview[]>('/reviews', {
    tour: filters.tour,
    partner: filters.partner,
    page,
    limit: pageSize,
    lang: locale,
  })
  // The Go backend serializes an empty result set as `null`, not `[]`.
  const items = (data ?? []).map(mapReview)
  const total = meta?.total ?? items.length
  return { items, total, page, pageSize, hasMore: page * pageSize < total }
}

export async function getAllReviews(locale: Locale): Promise<Review[]> {
  const { items } = await getReviews(locale, { pageSize: 100 })
  return items
}
