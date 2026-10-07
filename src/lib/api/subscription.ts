// Server-only: asks DigitalService about this tenant's state: 'expired' (banner),
// 'unavailable' (service asleep/unreachable: waking-up screen) or 'active'.
// Never throws: only a clear 'expired' answer or a failure that classifyStatusFailure
// calls unavailable changes the page; everything else (odd answers, 401/403/500,
// missing TENANT_API_KEY) means 'active'. Nothing is logged on purpose (error text
// and bodies must not reach the logs). A failure is never cached: Next caches only
// 200 responses, so the next request probes again.
import { apiGet } from '@/lib/api/client'
import { parseSubscriptionState } from '@/lib/subscription-state.mjs'
import { classifyStatusFailure, failureInputFromError } from '@/lib/service-state.mjs'
import type { ServiceState } from '@/lib/service-state.mjs'

// Long enough for a sleeping backend to wake; the waking-up screen covers the wait
// on later requests.
const FETCH_TIMEOUT_MS = 8000

export async function getSubscriptionState(): Promise<ServiceState> {
  try {
    const { data } = await apiGet<unknown>('/subscription-status', undefined, {
      signal: AbortSignal.timeout(FETCH_TIMEOUT_MS),
      revalidate: 60,
    })
    return parseSubscriptionState(data)
  } catch (err) {
    // A timeout while reading the body is swallowed by request() and fails open to 'active' (accepted).
    return classifyStatusFailure(failureInputFromError(err))
  }
}
