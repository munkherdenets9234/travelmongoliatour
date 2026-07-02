import type { Metadata } from 'next'
import Link from 'next/link'
import Image from 'next/image'
import { notFound } from 'next/navigation'
import { isValidLocale } from '@/lib/i18n'
import { getArticles } from '@/lib/data/journal'
import ArticleCard from '@/components/ui/ArticleCard'
import FilterChips from '@/components/ui/FilterChips'

interface Props {
  params: Promise<{ locale: string }>
  searchParams: Promise<{ [key: string]: string | string[] | undefined }>
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { locale } = await params
  return {
    title: 'The Journal — Stories from the Steppe — E & S Discovery Mongolia',
    description: 'Guides, culture, tips and stories from the steppe, the Gobi and the taiga.',
    alternates: { canonical: `/${locale}/journal` },
  }
}

function one(v: string | string[] | undefined) {
  return Array.isArray(v) ? v[0] : v
}

const CATEGORIES = ['all', 'guides', 'culture', 'tips', 'stories', 'food', 'adventure']

export default async function JournalPage({ params, searchParams }: Props) {
  const { locale } = await params
  if (!isValidLocale(locale)) notFound()
  const sp = await searchParams

  const category = one(sp.category) ?? 'all'
  const page = sp.page ? Number(one(sp.page)) : 1
  const { featured, items, hasMore } = getArticles({ category, page })

  const base = `/${locale}/journal`
  const qs = (overrides: Record<string, string | undefined>) => {
    const params = new URLSearchParams()
    const merged: Record<string, string | undefined> = { category: category !== 'all' ? category : undefined, ...overrides }
    Object.entries(merged).forEach(([k, v]) => v && params.set(k, v))
    const s = params.toString()
    return s ? `${base}?${s}` : base
  }

  return (
    <>
      <div className="text-center px-6 pt-12 pb-2">
        <div className="text-xs font-semibold tracking-[0.24em] uppercase text-olive">Stories from the steppe</div>
        <h1 className="font-display text-5xl sm:text-6xl mt-3">
          The <span className="italic font-normal">Journal</span>
        </h1>
      </div>

      <div className="flex justify-center px-6 pt-6">
        <FilterChips
          chips={CATEGORIES.map((c) => ({
            label: c === 'all' ? 'All' : c[0].toUpperCase() + c.slice(1),
            href: qs({ category: c === 'all' ? undefined : c, page: undefined }),
            active: category === c,
          }))}
        />
      </div>

      {featured && (
        <div className="container mx-auto px-6 sm:px-14 pt-7">
          <Link
            href={`/${locale}/journal/${featured.slug}`}
            className="grid grid-cols-1 sm:grid-cols-[1.3fr_1fr] rounded-lg overflow-hidden bg-ink text-cream shadow-[0_16px_40px_rgba(30,27,22,0.16)]"
          >
            <div className="relative h-[360px]">
              <Image src={featured.image} alt={featured.title} fill className="object-cover" />
            </div>
            <div className="p-8 sm:p-10 flex flex-col justify-center">
              <div className="text-[11px] font-semibold tracking-[0.18em] uppercase text-gold">Featured · {featured.category}</div>
              <h2 className="font-display text-3xl sm:text-4xl mt-3 leading-tight">{featured.title}</h2>
              <p className="text-sm text-cream/70 leading-relaxed mt-4">{featured.excerpt}</p>
              <div className="flex items-center gap-4 mt-6">
                <span className="bg-cream text-ink rounded-sm px-6 py-3 text-xs font-semibold tracking-widest uppercase">Read article →</span>
                <span className="text-xs text-cream/60">{featured.readTime} min read</span>
              </div>
            </div>
          </Link>
        </div>
      )}

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-7 container mx-auto px-6 sm:px-14 pt-9 pb-5">
        {items.map((a) => (
          <Link key={a.slug} href={`/${locale}/journal/${a.slug}`}>
            <ArticleCard item={{ id: a.slug, category: a.category, title: a.title, read_time: a.readTime, image: a.image }} readLabel="min read" />
          </Link>
        ))}
      </div>

      {hasMore && (
        <div className="flex justify-center pb-11">
          <Link href={qs({ page: String(page + 1) })} className="border border-ink rounded-sm px-7 py-3.5 text-xs font-semibold tracking-widest uppercase">
            Load more articles
          </Link>
        </div>
      )}
    </>
  )
}
