import { NextRequest, NextResponse } from 'next/server'

// Placeholder endpoint — validates and echoes the payload with a mock confirmation id.
// Swap for a real backend integration when one exists.
export async function POST(request: NextRequest) {
  const body = await request.json().catch(() => null)

  if (!body || !body.name || !body.email || !body.tourSlug) {
    return NextResponse.json({ error: 'Missing required booking fields' }, { status: 400 })
  }

  const confirmationId = `BK-${Date.now().toString(36).toUpperCase()}`
  return NextResponse.json({ confirmationId, received: body }, { status: 201 })
}
