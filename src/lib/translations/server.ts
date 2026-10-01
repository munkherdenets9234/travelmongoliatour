// Server-only: merges admin-edited overrides (DigitalService) over the shipped
// JSON. Never import this from a client component — it pulls in the API client.
import { apiGet } from '@/lib/api/client'
import { shippedTranslation } from '@/lib/i18n'
import type { Locale, Translation } from '@/types/i18n'
import { mergeOverrides } from './merge.mjs'

const LOG_INTERVAL_MS = 60_000
// Every page render depends on this call; if the backend accepts the connection
// and hangs, fall back to the shipped wording quickly instead of blocking.
const FETCH_TIMEOUT_MS = 2000
const lastLogged = new Map<string, number>()

function logOnce(locale: Locale, err: unknown) {
  const now = Date.now()
  const last = lastLogged.get(locale)
  if (last !== undefined && now - last < LOG_INTERVAL_MS) return
  lastLogged.set(locale, now)
  console.error(`[translations] override fetch failed for "${locale}", using shipped text:`, err instanceof Error ? err.message : err)
}

export async function getTranslation(locale: Locale): Promise<Translation> {
  const shipped = shippedTranslation(locale)
  try {
    const { data } = await apiGet<Record<string, Record<string, unknown>>>('/translations', { lang: locale }, { signal: AbortSignal.timeout(FETCH_TIMEOUT_MS) })
    return mergeOverrides(shipped, data ?? {})
  } catch (err) {
    logOnce(locale, err)
    return shipped
  }
}
