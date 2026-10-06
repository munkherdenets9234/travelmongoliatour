import { NextRequest, NextResponse } from 'next/server'
import { apiPostForm, ApiError } from '@/lib/api/client'
import { createRateLimiter, getVisitorIp, jsonError, fakeConfirmation, GENERIC_ERRORS } from '@/lib/api/guard'
import { buildForwardForm, checkBodySize, fieldFromMessage } from '@/lib/careers/proxy.mjs'

interface GuideApplicationResponse {
  id: string
  confirmation_id: string
}

// 8 files x 10 MiB plus 1 MiB for the JSON part and multipart framing. Vercel
// serverless bodies are capped near 4.5 MB, so this ceiling only matters when self-hosted.
const MAX_BODY_BYTES = 8 * 10 * 1024 * 1024 + 1024 * 1024

// Module-level, per server instance: 10 submissions per visitor, refilling over 10 minutes.
// The burst is generous because CGNAT mobile carriers put many visitors behind one IP.
// Only requests that pass the cheap local checks (content type, size) consume a token.
const limiter = createRateLimiter({ capacity: 10, refillPerSec: 10 / 600 })

// Fixed codes only. Backend message text is never relayed; the form shows its own copy.
const PASSTHROUGH: Record<number, string> = {
  400: GENERIC_ERRORS.invalid,
  409: 'duplicate',
  413: GENERIC_ERRORS.invalid,
  422: 'validation_failed',
  429: GENERIC_ERRORS.rateLimited,
  503: 'unavailable',
}

export async function POST(request: NextRequest) {
  const ip = getVisitorIp(request)

  const contentType = request.headers.get('content-type') ?? ''
  if (!contentType.toLowerCase().startsWith('multipart/form-data')) return jsonError(415, GENERIC_ERRORS.invalid)

  if (!checkBodySize(request.headers.get('content-length'), MAX_BODY_BYTES)) return jsonError(413, GENERIC_ERRORS.invalid)

  const rl = limiter.take(`guide-applications:${ip}`)
  if (!rl.allowed) {
    return jsonError(429, GENERIC_ERRORS.rateLimited, { 'Retry-After': String(rl.retryAfterSec) })
  }

  let incoming: FormData
  try {
    incoming = await request.formData()
  } catch {
    return jsonError(400, GENERIC_ERRORS.invalid)
  }

  // Honeypot: a bot gets a plausible 201 and nothing is forwarded.
  const trap = incoming.get('website')
  if (typeof trap === 'string' && trap.trim() !== '') {
    return NextResponse.json({ confirmationId: fakeConfirmation('GA') }, { status: 201 })
  }

  const built = buildForwardForm(incoming)
  if (!built.ok) return jsonError(400, GENERIC_ERRORS.invalid)

  // The Go backend's limiter keys on gin ClientIP, which honours X-Forwarded-For only
  // from TRUSTED_PROXIES; X-Visitor-IP is the existing apiPost convention. Send both.
  const headers = ip !== 'unknown' ? { 'X-Forwarded-For': ip, 'X-Visitor-IP': ip } : undefined

  try {
    const { data } = await apiPostForm<GuideApplicationResponse>('/guide-applications', built.form, headers)
    return NextResponse.json({ confirmationId: data.confirmation_id }, { status: 201 })
  } catch (err) {
    const status = err instanceof ApiError ? err.status : undefined
    const code = status !== undefined ? PASSTHROUGH[status] : undefined
    if (status !== undefined && code) {
      const field = status === 400 || status === 422 ? fieldFromMessage((err as ApiError).message) : undefined
      return NextResponse.json(field ? { error: code, field } : { error: code }, { status })
    }
    // Status-only line: no message, body, key or IP.
    console.error(`[api/guide-applications] upstream failure: ${status !== undefined ? `status ${status}` : 'non-api error'}`)
    return jsonError(502, GENERIC_ERRORS.upstream)
  }
}
