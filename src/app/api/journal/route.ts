import { NextRequest, NextResponse } from 'next/server'
import { getArticles } from '@/lib/data/journal'
import { defaultLocale } from '@/lib/i18n'

export async function GET(request: NextRequest) {
  const params = request.nextUrl.searchParams
  const result = await getArticles(defaultLocale, {
    category: params.get('category') ?? undefined,
    page: params.get('page') ? Number(params.get('page')) : undefined,
  })

  return NextResponse.json(result)
}
