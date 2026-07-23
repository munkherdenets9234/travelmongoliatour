import { NextRequest, NextResponse } from 'next/server'
import { apiPost } from '@/lib/api/client'

export async function POST(request: NextRequest) {
  const body = await request.json().catch(() => null)

  if (!body || typeof body.email !== 'string' || !body.email) {
    return NextResponse.json({ error: 'Missing required email field' }, { status: 400 })
  }

  try {
    // Idempotent on the backend — resubmitting the same email is a no-op, not a duplicate error.
    await apiPost('/newsletter', { email: body.email })
    return NextResponse.json({ success: true }, { status: 201 })
  } catch (err) {
    return NextResponse.json({ error: err instanceof Error ? err.message : 'Subscription failed' }, { status: 502 })
  }
}
