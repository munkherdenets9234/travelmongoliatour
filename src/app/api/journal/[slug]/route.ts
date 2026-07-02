import { NextResponse } from 'next/server'
import { getArticleBySlug, getRelatedArticles } from '@/lib/data/journal'

export async function GET(_request: Request, ctx: RouteContext<'/api/journal/[slug]'>) {
  const { slug } = await ctx.params
  const article = getArticleBySlug(slug)

  if (!article) {
    return NextResponse.json({ error: 'Article not found' }, { status: 404 })
  }

  return NextResponse.json({ article, related: getRelatedArticles(slug) })
}
