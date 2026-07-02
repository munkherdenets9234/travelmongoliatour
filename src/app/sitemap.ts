import type { MetadataRoute } from 'next'
import { locales, siteUrl } from '@/lib/i18n'
import { tours } from '@/lib/data/tours'
import { articles } from '@/lib/data/journal'

const STATIC_ROUTES = [
  '',
  '/tours',
  '/share-a-tour',
  '/rent-a-car',
  '/journal',
  '/airport-transfers',
  '/book',
  '/about-mongolia',
  '/about',
  '/contact',
]

export default function sitemap(): MetadataRoute.Sitemap {
  const routes = [
    ...STATIC_ROUTES,
    ...tours.map((t) => `/tours/${t.slug}`),
    ...articles.map((a) => `/journal/${a.slug}`),
  ]

  return routes.map((route) => {
    const languages = Object.fromEntries(locales.map((locale) => [locale, `${siteUrl}/${locale}${route}`]))
    return {
      url: `${siteUrl}/en${route}`,
      lastModified: new Date(),
      changeFrequency: route === '' ? 'weekly' : 'monthly',
      priority: route === '' ? 1 : 0.7,
      alternates: { languages },
    }
  })
}
