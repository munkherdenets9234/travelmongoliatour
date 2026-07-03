// Server-only client for the E&S Travel DigitalService API (Go/Gin + MongoDB).
// TENANT_API_KEY must never reach the browser — only import this from Server
// Components, Route Handlers, or other server-side code.

interface ApiEnvelope<T> {
  success: boolean
  data?: T
  meta?: { total: number; page: number; limit: number }
  message?: string
}

export class ApiError extends Error {
  status: number
  constructor(status: number, message: string) {
    super(message)
    this.status = status
    this.name = 'ApiError'
  }
}

function baseUrl() {
  return process.env.API_BASE_URL ?? 'http://localhost:8080/api/v1'
}

function apiKey() {
  const key = process.env.TENANT_API_KEY
  if (!key) {
    throw new Error('TENANT_API_KEY is not set — add it to .env.local (see .env.local for the expected shape).')
  }
  return key
}

async function request<T>(path: string, init: RequestInit = {}, token?: string): Promise<{ data: T; meta?: ApiEnvelope<T>['meta'] }> {
  const headers: Record<string, string> = {
    'X-API-Key': apiKey(),
    ...(init.headers as Record<string, string> | undefined),
  }
  if (token) headers['Authorization'] = `Bearer ${token}`

  const res = await fetch(`${baseUrl()}${path}`, { ...init, headers })
  const json = (await res.json().catch(() => null)) as ApiEnvelope<T> | null

  if (!res.ok || !json || !json.success) {
    throw new ApiError(res.status, json?.message ?? `Request to ${path} failed with status ${res.status}`)
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

export function apiGet<T>(path: string, searchParams?: Record<string, string | number | undefined>) {
  return request<T>(`${path}${toQueryString(searchParams)}`, { method: 'GET' })
}

export function apiPost<T>(path: string, body: unknown, token?: string) {
  return request<T>(path, { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(body) }, token)
}

export function apiPut<T>(path: string, body: unknown, token?: string) {
  return request<T>(path, { method: 'PUT', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(body) }, token)
}
