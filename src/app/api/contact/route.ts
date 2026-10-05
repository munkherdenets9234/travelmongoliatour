import { NextRequest, NextResponse } from 'next/server'
import { apiPost } from '@/lib/api/client'
import {
  guardPost, jsonError, upstreamFailure, fakeConfirmation, cleanString, cleanEmail, cleanPhone, GENERIC_ERRORS,
} from '@/lib/api/guard'

interface ContactResponse {
  id: string
}

export async function POST(request: NextRequest) {
  const g = await guardPost(request, 'contact', { confirmationId: fakeConfirmation('CT') })
  if (!g.ok) return g.response
  const body = g.body

  const name = cleanString(body.name, { min: 1, max: 100 })
  const email = cleanEmail(body.email)
  const phone = cleanPhone(body.phone)
  // Subjects are localized labels from the translation files, so check length, not a fixed list.
  const subject = cleanString(body.subject ?? 'General question', { min: 1, max: 120 })
  const msg = cleanString(body.message, { min: 1, max: 5000, multiline: true })
  if (![name, email, phone, subject, msg].every((f) => f.ok)) {
    return jsonError(400, GENERIC_ERRORS.invalid)
  }

  // The backend ContactMessage model has no `phone` field — fold it into the message.
  const message = phone.value ? `${msg.value}\n\nPhone: ${phone.value}` : msg.value

  try {
    const { data } = await apiPost<ContactResponse>('/contact', {
      name: name.value,
      email: email.value,
      subject: subject.value,
      message,
    }, undefined, g.ip)

    // ContactMessage has no confirmation_id field — synthesize one from the created _id.
    const confirmationId = `CT-${data.id.slice(-6).toUpperCase()}`
    return NextResponse.json({ confirmationId }, { status: 201 })
  } catch (err) {
    return upstreamFailure('contact', err)
  }
}
