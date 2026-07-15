import type { MetadataRoute } from 'next'
import { locales, siteUrl } from '@/lib/i18n'
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
  const [tours, articles] = await Promise.all([getAllTours(), getAllArticles()])

  const routes: { path: string; lastModified?: Date }[] = [
    ...STATIC_ROUTES.map((path) => ({ path })),
    ...tours.map((t) => ({ path: `/tours/${t.slug}` })),
    ...articles.map((a) => ({ path: `/journal/${a.slug}`, lastModified: new Date(a.date) })),
  ]

  const entries: MetadataRoute.Sitemap = []
  for (const { path, lastModified } of routes) {
    const languages = Object.fromEntries(locales.map((locale) => [locale, `${siteUrl}/${locale}${path}`]))
    for (const locale of locales) {
      entries.push({
        url: `${siteUrl}/${locale}${path}`,
        ...(lastModified ? { lastModified } : {}),
        changeFrequency: path === '' ? 'weekly' : 'monthly',
        priority: path === '' ? 1 : 0.7,
        alternates: { languages },
      })
    }
  }
  return entries
}
