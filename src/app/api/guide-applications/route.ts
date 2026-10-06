import { NextRequest, NextResponse } from 'next/server'
import { apiPostForm, ApiError } from '@/lib/api/client'
import { buildForwardForm, checkBodySize, clientIp, createRateLimiter } from '@/lib/careers/proxy.mjs'

interface GuideApplicationResponse {
  id: string
  confirmation_id: string
}

// 8 files x 10 MiB plus 1 MiB for the JSON part and multipart framing.
const MAX_BODY_BYTES = 8 * 10 * 1024 * 1024 + 1024 * 1024

// Module-level, per server instance. 5 submissions per visitor per 10 minutes.
const limiter = createRateLimiter({ max: 5, windowMs: 10 * 60 * 1000 })

// Generic, fixed bodies only: never relay backend text or the submitted data.
const PASSTHROUGH: Record<number, string> = {
  400: 'bad_request',
  409: 'duplicate',
  413: 'too_large',
  422: 'validation_failed',
  429: 'rate_limited',
  503: 'unavailable',
}

function fail(status: number, error: string) {
  return NextResponse.json({ error }, { status })
}

export async function POST(request: NextRequest) {
  const ip = clientIp(request.headers)

  if (!limiter.allow(ip ?? 'unknown')) return fail(429, 'too_many_requests')

  const contentType = request.headers.get('content-type') ?? ''
  if (!contentType.toLowerCase().startsWith('multipart/form-data')) return fail(415, 'unsupported_media_type')

  if (!checkBodySize(request.headers.get('content-length'), MAX_BODY_BYTES)) return fail(413, 'too_large')

  let incoming: FormData
  try {
    incoming = await request.formData()
  } catch {
    return fail(400, 'bad_request')
  }

  const built = buildForwardForm(incoming)
  if (!built.ok) return fail(400, 'bad_request')

  try {
    const { data } = await apiPostForm<GuideApplicationResponse>(
      '/guide-applications',
      built.form,
      ip ? { 'X-Forwarded-For': ip } : undefined,
    )
    return NextResponse.json({ confirmationId: data.confirmation_id }, { status: 201 })
  } catch (err) {
    if (err instanceof ApiError && PASSTHROUGH[err.status]) {
      return fail(err.status, PASSTHROUGH[err.status])
    }
    return fail(502, 'upstream_failed')
  }
}
