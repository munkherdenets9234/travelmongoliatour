// Pure rules for "is the backend unavailable (asleep/unreachable) or just failing?".
// 'unavailable' only for: a TENANT FEATURE_UNAVAILABLE 503, a network failure, a
// timeout, status 0 (dev-mode connect failure), or a 502/503/504 with no code and no
// domain (a hosting proxy page, not the backend's JSON envelope). Everything else
// fails open as 'active'.
export function classifyStatusFailure(f = {}) {
  const { status, code, domain, networkError, timedOut } = f
  if (networkError === true || timedOut === true) return 'unavailable'
  if (status === 0) return 'unavailable'
  if (status === 503 && domain === 'TENANT' && code === 'FEATURE_UNAVAILABLE') return 'unavailable'
  if ((status === 502 || status === 503 || status === 504) && !code && !domain) return 'unavailable'
  return 'active'
}

// Maps a thrown value to classifier input. Duck-typed (no ApiError import) so it also
// works in plain node tests. A plain Error (e.g. missing TENANT_API_KEY) maps to {}.
export function failureInputFromError(err) {
  if (err !== null && typeof err === 'object' && typeof err.status === 'number') {
    return {
      status: err.status,
      code: typeof err.code === 'string' ? err.code : undefined,
      domain: typeof err.domain === 'string' ? err.domain : undefined,
    }
  }
  if (err instanceof TypeError) return { networkError: true }
  if (err?.name === 'AbortError' || err?.name === 'TimeoutError') return { timedOut: true }
  return {}
}
