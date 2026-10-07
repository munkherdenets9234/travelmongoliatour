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
  '/careers',
  '/careers/guide',
]

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const [tours, articles] = await Promise.all([getAllTours(defaultLocale), getAllArticles(defaultLocale)])

  const routes: { path: string; lastModified?: Date }[] = [
    ...STATIC_ROUTES.map((path) => ({ path })),
    ...tours.map((t) => ({ path: `/tours/${t.slug}` })),
    ...articles.map((a) => {
      // An article with a missing or malformed date must not break the build:
      // Date#toISOString throws on an invalid Date.
      const modified = new Date(a.date)
      return {
        path: `/journal/${a.slug}`,
        ...(Number.isNaN(modified.getTime()) ? {} : { lastModified: modified }),
      }
    }),
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
