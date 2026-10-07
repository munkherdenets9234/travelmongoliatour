// Server-only client for the E&S Travel DigitalService API (Go/Gin + MongoDB).
// TENANT_API_KEY must never reach the browser — only import this from Server
// Components, Route Handlers, or other server-side code.

interface ApiEnvelope<T> {
  success: boolean
  data?: T
  meta?: { total: number; page: number; limit: number }
  message?: string
  // Error envelope of the guide-applications endpoints: {success:false, error:{code, message}}.
  // detail is the specific cause; the backend sends it only in development, to a loopback caller.
  error?: { code?: string; domain?: string; message?: string; detail?: string }
}

export class ApiError extends Error {
  status: number
  code?: string
  domain?: string
  detail?: string
  constructor(status: number, message: string, extra?: { code?: string; domain?: string; detail?: string }) {
    super(message)
    this.status = status
    this.code = extra?.code
    this.domain = extra?.domain
    this.detail = extra?.detail
    this.name = 'ApiError'
  }
}

// In development the error says exactly what failed, so nobody has to guess:
// "GET /destinations -> 401 AUTH/UNAUTHORIZED: unauthorized (<detail>)". In production the
// message stays the backend's generic text and nothing else is exposed.
function describeFailure(method: string, path: string, status: number, json: ApiEnvelope<unknown> | null) {
  const message = json?.message ?? json?.error?.message ?? `Request to ${path} failed with status ${status}`
  if (process.env.NODE_ENV === 'production') return message
  const e = json?.error
  const tag = e?.domain && e?.code ? ` ${e.domain}/${e.code}` : ''
  const detail = e?.detail ? ` (${e.detail})` : ''
  return `${method} ${path} -> ${status}${tag}: ${message}${detail}`
}

function baseUrl() {
  return (process.env.API_BASE_URL ?? 'http://localhost:8080/api/v1').replace(/\/+$/, '')
}

function apiKey() {
  const key = process.env.TENANT_API_KEY
  if (!key) {
    throw new Error('TENANT_API_KEY is not set — add it to .env.local (see .env.local for the expected shape).')
  }
  return key
}

async function request<T>(path: string, init: RequestInit = {}, token?: string, visitorIp?: string): Promise<{ data: T; meta?: ApiEnvelope<T>['meta'] }> {
  const headers: Record<string, string> = {
    'X-API-Key': apiKey(),
    ...(init.headers as Record<string, string> | undefined),
  }
  if (token) headers['Authorization'] = `Bearer ${token}`
  // The backend sees only this server as the caller; it honours this header for trusted callers only.
  if (visitorIp && visitorIp !== 'unknown') headers['X-Visitor-IP'] = visitorIp

  let res: Response
  try {
    res = await fetch(`${baseUrl()}${path}`, { ...init, headers })
  } catch (err) {
    // Network-level failure (refused, TLS, DNS): name the URL host and the cause in development.
    if (process.env.NODE_ENV === 'production') throw err
    const cause = (err as { cause?: { code?: string; message?: string } }).cause
    const why = cause?.code ?? cause?.message ?? (err as Error).message
    throw new ApiError(0, `${init.method ?? 'GET'} ${baseUrl()}${path} -> could not connect: ${why}`)
  }
  const json = (await res.json().catch(() => null)) as ApiEnvelope<T> | null

  if (!res.ok || !json || !json.success) {
    throw new ApiError(res.status, describeFailure(init.method ?? 'GET', path, res.status, json), {
      code: json?.error?.code,
      domain: json?.error?.domain,
      detail: json?.error?.detail,
    })
  }

  return { data: json.data as T, meta: json.meta }
}

function toQueryString(searchParams?: Record<string, string | number | undefined>) {
  if (!searchParams) return ''
  const params = new URLSearchParams()
  for (const [key, value] of Object.entries(searchParams)) {
    if (value !== undefined) params.set(key, String(value))
  }
  const qs = params.toString()
  return qs ? `?${qs}` : ''
}

// GET reads hit the Next.js Data Cache instead of the live backend on every
// request — this content is admin-managed and changes infrequently. Mutations
// (apiPost/apiPut below) intentionally stay uncached.
export function apiGet<T>(
  path: string,
  searchParams?: Record<string, string | number | undefined>,
  init?: { signal?: AbortSignal; revalidate?: number },
) {
  const { revalidate = 300, ...rest } = init ?? {}
  return request<T>(`${path}${toQueryString(searchParams)}`, { ...rest, method: 'GET', next: { revalidate } })
}

export function apiPost<T>(path: string, body: unknown, token?: string, visitorIp?: string) {
  return request<T>(path, { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(body) }, token, visitorIp)
}

// Multipart POST. No Content-Type header on purpose: fetch sets it with the boundary.
export function apiPostForm<T>(path: string, body: FormData, extraHeaders?: Record<string, string>) {
  return request<T>(path, { method: 'POST', headers: extraHeaders, body, cache: 'no-store' })
}

export function apiPut<T>(path: string, body: unknown, token?: string) {
  return request<T>(path, { method: 'PUT', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(body) }, token)
}
