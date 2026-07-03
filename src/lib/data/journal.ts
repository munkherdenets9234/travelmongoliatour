// Backed by the DigitalService API's `/blogs` resource — see src/lib/api/client.ts.
// The backend's Blog model is simpler than this UI's shape (single HTML `content`
// string, no category/readTime/featured/quote) — those are derived below.
import { apiGet, ApiError } from '@/lib/api/client'

export interface JournalArticle {
  slug: string
  title: string
  category: string
  readTime: number
  image: string
  featured?: boolean
  excerpt: string
  author: { name: string; role: string }
  date: string
  body: { heading: string; text: string }[]
  quote?: string
  tags: string[]
}

interface BackendImage {
  url: string
  caption: string
}

interface BackendAuthor {
  name: string
  role: string
}

interface BackendBlogSection {
  heading: string
  text: string
}

interface BackendBlog {
  id: string
  title: string
  slug: string
  category?: string
  excerpt: string
  content: string
  body?: BackendBlogSection[]
  quote?: string
  author: BackendAuthor | string
  read_time?: number
  date?: string
  destination_id?: string
  cover_image: BackendImage
  image?: string
  images: BackendImage[] | null
  tags: string[]
  status: 'draft' | 'published'
  views: number
  published_at?: string
  created_at: string
  updated_at: string
}

const CATEGORY_VALUES = ['guides', 'culture', 'tips', 'stories', 'food', 'adventure']

function stripHtml(html: string): string {
  return html.replace(/<[^>]*>/g, ' ').replace(/\s+/g, ' ').trim()
}

function deriveCategory(tags: string[]): string {
  return tags.find((t) => CATEGORY_VALUES.includes(t)) ?? 'guides'
}

function deriveReadTime(content: string): number {
  const words = stripHtml(content).split(' ').filter(Boolean).length
  return Math.max(1, Math.round(words / 200))
}

function deriveQuote(content: string): string | undefined {
  const match = content.match(/<blockquote[^>]*>([\s\S]*?)<\/blockquote>/i)
  return match ? stripHtml(match[1]) : undefined
}

function normalizeAuthor(author: BackendBlog['author']): { name: string; role: string } {
  if (typeof author === 'string') return { name: author, role: '' }
  return { name: author?.name ?? '', role: author?.role ?? '' }
}

function mapBlog(b: BackendBlog): JournalArticle {
  return {
    slug: b.slug,
    title: b.title,
    category: b.category ?? deriveCategory(b.tags ?? []),
    readTime: b.read_time || deriveReadTime(b.content ?? ''),
    image: b.image ?? b.cover_image?.url ?? '',
    excerpt: b.excerpt,
    author: normalizeAuthor(b.author),
    date: b.date ?? b.published_at ?? b.created_at,
    body: b.body?.length ? b.body : [{ heading: '', text: b.content ?? '' }],
    quote: b.quote || deriveQuote(b.content ?? ''),
    tags: b.tags ?? [],
  }
}

export async function getAllArticles(): Promise<JournalArticle[]> {
  const { data } = await apiGet<BackendBlog[]>('/blogs', { limit: 100 })
  // The Go backend serializes an empty result set as `null`, not `[]`.
  const mapped = (data ?? []).map(mapBlog)

  // Feature the single most-recently-published article, mirroring the old
  // hand-curated `featured` flag — derived since the backend has no such field.
  const sorted = [...mapped].sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime())
  const featuredSlug = sorted[0]?.slug
  return mapped.map((a) => ({ ...a, featured: a.slug === featuredSlug }))
}

export interface JournalFilters {
  category?: string
  page?: number
  pageSize?: number
}

export async function getArticles(filters: JournalFilters = {}) {
  const all = await getAllArticles()
  const featured = all.find((a) => a.featured)
  let results = all.filter((a) => !a.featured)
  if (filters.category && filters.category !== 'all') {
    results = results.filter((a) => a.category === filters.category)
  }

  const pageSize = filters.pageSize ?? 6
  const page = filters.page ?? 1
  const items = results.slice(0, page * pageSize)

  return { featured, items, total: results.length, hasMore: items.length < results.length }
}

export async function getArticleBySlug(slug: string): Promise<JournalArticle | undefined> {
  try {
    const { data } = await apiGet<BackendBlog>(`/blogs/${slug}`)
    return mapBlog(data)
  } catch (err) {
    if (err instanceof ApiError && err.status === 404) return undefined
    throw err
  }
}

export async function getRelatedArticles(slug: string, count = 3): Promise<JournalArticle[]> {
  const all = await getAllArticles()
  return all.filter((a) => a.slug !== slug).slice(0, count)
}
