import { NextRequest, NextResponse } from 'next/server'
import { apiPost } from '@/lib/api/client'
import { guardPost, jsonError, upstreamFailure, cleanEmail, GENERIC_ERRORS } from '@/lib/api/guard'

export async function POST(request: NextRequest) {
  const g = await guardPost(request, 'newsletter', { success: true })
  if (!g.ok) return g.response

  const email = cleanEmail(g.body.email)
  if (!email.ok) return jsonError(400, GENERIC_ERRORS.invalid)

  try {
    // Idempotent on the backend — resubmitting the same email is a no-op, not a duplicate error.
    await apiPost('/newsletter', { email: email.value }, undefined, g.ip)
    return NextResponse.json({ success: true }, { status: 201 })
  } catch (err) {
    return upstreamFailure('newsletter', err)
  }
}
