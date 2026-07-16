// Backed by the DigitalService API's `/partners` resource — see src/lib/api/client.ts.
import { apiGet, ApiError } from '@/lib/api/client'
import type { Locale } from '@/types/i18n'

export interface PartnerProduct {
  name: string
  image: string
  description: string
}

export interface Partner {
  id: string
  slug: string
  name: string
  tag: string
  title: string
  description: string
  image: string
  webUrl: string
  products: PartnerProduct[]
}

interface BackendPartner {
  id: string
  slug: string
  name: string
  tag: string
  title: string
  description: string
  image: string
  web_url: string
  products: PartnerProduct[]
  is_active: boolean
}

function mapPartner(p: BackendPartner): Partner {
  return {
    id: p.id,
    slug: p.slug,
    name: p.name,
    tag: p.tag,
    title: p.title,
    description: p.description,
    image: p.image,
    webUrl: p.web_url,
    products: p.products ?? [],
  }
}

export async function getAllPartners(locale: Locale): Promise<Partner[]> {
  const { data } = await apiGet<BackendPartner[]>('/partners', { lang: locale })
  // The Go backend serializes an empty result set as `null`, not `[]`.
  return (data ?? []).map(mapPartner)
}

export async function getPartnerBySlug(slug: string, locale: Locale): Promise<Partner | undefined> {
  try {
    const { data } = await apiGet<BackendPartner>(`/partners/${slug}`, { lang: locale })
    return mapPartner(data)
  } catch (err) {
    if (err instanceof ApiError && err.status === 404) return undefined
    throw err
  }
}
