import type { MetadataRoute } from 'next'
import { locales, siteUrl, defaultLocale } from '@/lib/i18n'
import { getAllTours } from '@/lib/data/tours'
import { getAllArticles } from '@/lib/data/journal'

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

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const [tours, articles] = await Promise.all([getAllTours(defaultLocale), getAllArticles(defaultLocale)])
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
