// Shared guard for the public POST routes: rate limit, honeypot, JSON parsing
// and generic error responses. Server-only. Validation lives in guard-core.mjs.
import { NextRequest, NextResponse } from 'next/server'
import { ApiError } from '@/lib/api/client'
import { createRateLimiter, visitorIp, isHoneypotTripped, GENERIC_ERRORS, redactForLog, upstreamResponseFor } from './guard-core.mjs'

export * from './guard-core.mjs'

// Per instance and in memory: a first line of defence only. The backend
// limiter (keyed on X-Visitor-IP) is the real control.
const limiter = createRateLimiter({ capacity: 5, refillPerSec: 5 / 60 })

export function jsonError(status: number, error: string, headers?: Record<string, string>) {
  return NextResponse.json({ error }, { status, headers })
}

export function getVisitorIp(request: NextRequest) {
  return visitorIp((name: string) => request.headers.get(name))
}

export type GuardResult =
  | { ok: true; body: Record<string, unknown>; ip: string }
  | { ok: false; response: NextResponse }

// Runs rate limit, body parse and honeypot. When the honeypot is tripped the
// bot gets a plausible 201 (`fakeOk`) and nothing is forwarded.
export async function guardPost(request: NextRequest, route: string, fakeOk: Record<string, unknown>): Promise<GuardResult> {
  const ip = getVisitorIp(request)
  const rl = limiter.take(`${route}:${ip}`)
  if (!rl.allowed) {
    return { ok: false, response: jsonError(429, GENERIC_ERRORS.rateLimited, { 'Retry-After': String(rl.retryAfterSec) }) }
  }

  const raw = await request.json().catch(() => null)
  if (!raw || typeof raw !== 'object' || Array.isArray(raw)) {
    return { ok: false, response: jsonError(400, GENERIC_ERRORS.invalid) }
  }
  const body = raw as Record<string, unknown>

  if (isHoneypotTripped(body)) {
    return { ok: false, response: NextResponse.json(fakeOk, { status: 201 }) }
  }
  return { ok: true, body, ip }
}

// Log a redacted message (never the body) and return a generic response.
export function upstreamFailure(route: string, err: unknown) {
  const detail = err instanceof ApiError
    ? `status ${err.status}: ${redactForLog(err.message)}`
    : redactForLog(err instanceof Error ? err.message : err)
  console.error(`[api/${route}] upstream failure: ${detail}`)
  const { status, error } = upstreamResponseFor(err, err instanceof ApiError ? err.status : undefined)
  return jsonError(status, error)
}
