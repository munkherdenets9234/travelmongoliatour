import { NextRequest, NextResponse } from 'next/server'

// Placeholder endpoint — validates and echoes the payload with a mock confirmation id.
// Swap for a real backend integration when one exists.
export async function POST(request: NextRequest) {
  const body = await request.json().catch(() => null)

  if (!body || !body.name || !body.email || !body.carSlug) {
    return NextResponse.json({ error: 'Missing required rental fields' }, { status: 400 })
  }

  const confirmationId = `RC-${Date.now().toString(36).toUpperCase()}`
  return NextResponse.json({ confirmationId, received: body }, { status: 201 })
}
