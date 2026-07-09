import type { Metadata } from 'next'
import Image from 'next/image'
import Link from 'next/link'
import { notFound } from 'next/navigation'
import { getArticleBySlug, getRelatedArticles } from '@/lib/data/journal'
import { isValidLocale, getTranslation } from '@/lib/i18n'
import ArticleCard from '@/components/ui/ArticleCard'

interface Props {
  params: Promise<{ locale: string; slug: string }>
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { locale, slug } = await params
  if (!isValidLocale(locale)) return {}
  const article = await getArticleBySlug(slug, locale)
  if (!article) return {}

  return {
    title: `${article.title} — E & S Discovery Mongolia Journal`,
    description: article.excerpt,
    alternates: { canonical: `/${locale}/journal/${slug}` },
    openGraph: { title: article.title, description: article.excerpt, images: [article.image] },
  }
}

export default async function JournalPostPage({ params }: Props) {
  const { locale, slug } = await params
  if (!isValidLocale(locale)) notFound()

  const article = await getArticleBySlug(slug, locale)
  if (!article) notFound()
  const related = await getRelatedArticles(slug, locale)
  const t = getTranslation(locale)
  const jd = t.journalDetail

  return (
    <>
      {/* HERO */}
      <section className="relative h-[460px]">
        <Image src={article.image} alt={article.title} fill className="object-cover" priority />
        <div className="absolute inset-0 bg-gradient-to-t from-ink/85 via-ink/20 to-ink/35" />
        <div className="absolute left-0 right-0 bottom-0 container mx-auto px-6 sm:px-14 pb-11 max-w-3xl">
          <div className="text-xs font-semibold tracking-wide uppercase text-gold capitalize">
            {article.category} · {article.readTime} {t.journal.read_label}
          </div>
          <h1 className="font-display text-cream text-4xl sm:text-6xl leading-tight mt-4">{article.title}</h1>
        </div>
      </section>

      {/* AUTHOR BAR */}
      <div className="flex items-center gap-3.5 container mx-auto px-6 sm:px-14 py-5 border-b border-border">
        <div className="w-11 h-11 rounded-full bg-tan flex-none" />
        <div className="flex-1">
          <div className="font-display text-base font-semibold">{article.author.name}</div>
          <div className="text-xs text-warm-gray">
            {article.author.role} · {new Date(article.date).toLocaleDateString(locale === 'mn' ? 'mn-MN' : 'en-US', { month: 'long', day: 'numeric', year: 'numeric' })}
          </div>
        </div>
        <span className="hidden sm:inline-flex items-center gap-2 border border-border-strong rounded-sm px-4 py-2.5 text-xs font-semibold tracking-widest uppercase">{jd.share}</span>
        <span className="hidden sm:inline-flex items-center gap-2 border border-border-strong rounded-sm px-4 py-2.5 text-xs font-semibold tracking-widest uppercase">{jd.save}</span>
      </div>

      {/* ARTICLE */}
      <article className="max-w-[660px] mx-auto px-6 py-11">
        <p className="text-lg leading-relaxed text-[#3a352d]">{article.excerpt}</p>

        {article.body.map((section, i) => (
          <div key={i}>
            {section.heading && <h2 className="font-display text-3xl mt-9 mb-3">{section.heading}</h2>}
            <div className="text-brown leading-relaxed [&_p]:mt-4 [&_h2]:font-display [&_h2]:text-2xl [&_h2]:mt-8" dangerouslySetInnerHTML={{ __html: section.text }} />
            {i === 0 && article.quote && (
              <blockquote className="my-8 pl-6 border-l-[3px] border-olive font-display text-2xl italic leading-snug">{article.quote}</blockquote>
            )}
          </div>
        ))}
      </article>

      {/* TAGS */}
      <div className="max-w-[660px] mx-auto px-6 pb-10 flex flex-wrap gap-2.5">
        {article.tags.map((tag) => (
          <span key={tag} className="border border-border-strong rounded-full px-3.5 py-1.5 text-xs font-medium text-brown">
            #{tag}
          </span>
        ))}
      </div>

      {/* RELATED-TOURS CTA */}
      <section className="bg-olive text-cream container mx-auto px-6 sm:px-14 py-12 flex flex-wrap items-center justify-between gap-6">
        <div>
          <div className="text-cream/75 text-xs font-semibold tracking-[0.22em] uppercase">{jd.cta_eyebrow}</div>
          <div className="font-display text-3xl mt-2">
            {jd.cta_heading_prefix} <span className="italic">{jd.cta_heading_italic}</span>
          </div>
        </div>
        <Link href={`/${locale}/tours`} className="bg-cream text-ink rounded-sm px-7 py-3.5 text-xs font-semibold tracking-widest uppercase">
          {jd.browse_tours}
        </Link>
      </section>

      {/* MORE ARTICLES */}
      <div className="container mx-auto px-6 sm:px-14 py-10">
        <div className="font-display text-2xl mb-5">{jd.keep_reading}</div>
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-7">
          {related.map((a) => (
            <Link key={a.slug} href={`/${locale}/journal/${a.slug}`}>
              <ArticleCard item={{ id: a.slug, category: a.category, title: a.title, read_time: a.readTime, image: a.image }} readLabel={t.journal.read_label} />
            </Link>
          ))}
        </div>
      </div>
    </>
  )
}
