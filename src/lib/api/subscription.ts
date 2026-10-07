// Server-only: asks DigitalService whether this tenant's subscription has expired.
// Never throws: any failure or odd answer means 'active', so the banner can only
// appear on a clear 'expired' from the backend. Nothing is logged on purpose
// (error text and bodies must not reach the logs).
import { apiGet } from '@/lib/api/client'
import { parseSubscriptionState } from '@/lib/subscription-state.mjs'
import type { SubscriptionState } from '@/lib/subscription-state.mjs'

// Short timeout: this call sits on every page render and must not hold the page up
// when the backend accepts the connection and hangs.
const FETCH_TIMEOUT_MS = 2000

export async function getSubscriptionState(): Promise<SubscriptionState> {
  try {
    const { data } = await apiGet<unknown>('/subscription-status', undefined, {
      signal: AbortSignal.timeout(FETCH_TIMEOUT_MS),
      revalidate: 60,
    })
    return parseSubscriptionState(data)
  } catch {
    return 'active'
  }
}
