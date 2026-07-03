import { NextRequest, NextResponse } from 'next/server'
import { apiPost } from '@/lib/api/client'

interface ContactResponse {
  id: string
}

export async function POST(request: NextRequest) {
  const body = await request.json().catch(() => null)

  if (!body || !body.name || !body.email || !body.message) {
    return NextResponse.json({ error: 'Missing required contact fields' }, { status: 400 })
  }

  // The backend ContactMessage model has no `phone` field — fold it into the message.
  const message = body.phone ? `${body.message}\n\nPhone: ${body.phone}` : body.message

  try {
    const { data } = await apiPost<ContactResponse>('/contact', {
      name: body.name,
      email: body.email,
      subject: body.subject ?? 'General question',
      message,
    })

    // ContactMessage has no confirmation_id field — synthesize one from the created _id.
    const confirmationId = `CT-${data.id.slice(-6).toUpperCase()}`
    return NextResponse.json({ confirmationId, received: body }, { status: 201 })
  } catch (err) {
    return NextResponse.json({ error: err instanceof Error ? err.message : 'Message failed' }, { status: 502 })
  }
}
