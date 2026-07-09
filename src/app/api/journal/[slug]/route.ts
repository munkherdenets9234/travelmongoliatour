import { NextResponse } from 'next/server'
import { getArticleBySlug, getRelatedArticles } from '@/lib/data/journal'
import { defaultLocale } from '@/lib/i18n'

export async function GET(_request: Request, ctx: RouteContext<'/api/journal/[slug]'>) {
  const { slug } = await ctx.params
  const article = await getArticleBySlug(slug, defaultLocale)

  if (!article) {
    return NextResponse.json({ error: 'Article not found' }, { status: 404 })
  }

  return NextResponse.json({ article, related: await getRelatedArticles(slug, defaultLocale) })
}
