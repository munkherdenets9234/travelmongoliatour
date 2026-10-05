// Pure helpers for the public write routes under src/app/api. No Next.js or
// network imports, so they run under `node --test` (see guard-core.test.mjs).

const EMAIL_RE = /^[^\s@<>()[\]\\,;:"]+@[^\s@<>()[\]\\,;:"]+\.[^\s@<>()[\]\\,;:"]{2,}$/
const CONTROL_RE = /[\u0000-\u0008\u000B\u000C\u000E-\u001F\u007F]/

// Read a string field. Missing/null becomes ''. Anything that is not a string
// is invalid. Returns { ok, value } with the trimmed value.
export function cleanString(raw, { min = 0, max = 200, multiline = false } = {}) {
  if (raw === undefined || raw === null) raw = ''
  if (typeof raw !== 'string') return { ok: false, value: '' }
  const value = raw.trim()
  if (value.length < min || value.length > max) return { ok: false, value: '' }
  if (CONTROL_RE.test(value)) return { ok: false, value: '' }
  if (!multiline && /[\r\n]/.test(value)) return { ok: false, value: '' }
  return { ok: true, value }
}

export function cleanEmail(raw) {
  const s = cleanString(raw, { min: 3, max: 254 })
  if (!s.ok || !EMAIL_RE.test(s.value)) return { ok: false, value: '' }
  return s
}

// Phone is optional: empty is fine, otherwise digits and common separators only.
export function cleanPhone(raw) {
  const s = cleanString(raw, { max: 30 })
  if (!s.ok) return s
  if (s.value && !/^\+?[0-9 ()\-.]{5,30}$/.test(s.value)) return { ok: false, value: '' }
  return s
}

export function cleanChoice(raw, allowed) {
  return typeof raw === 'string' && allowed.includes(raw) ? { ok: true, value: raw } : { ok: false, value: '' }
}

export function cleanInt(raw, { min, max }) {
  const n = typeof raw === 'string' && raw.trim() !== '' ? Number(raw) : raw
  if (typeof n !== 'number' || !Number.isInteger(n) || n < min || n > max) return { ok: false, value: 0 }
  return { ok: true, value: n }
}

// Parse a date or datetime string. Rejects unparseable values and, unless
// allowPast, anything before the start of today (UTC) so same-day bookings from
// any timezone still pass. Returns an ISO string.
export function cleanDate(raw, { now = Date.now(), allowPast = false, maxDaysAhead = 1100 } = {}) {
  if (typeof raw !== 'string' || raw.length < 8 || raw.length > 40) return { ok: false, value: '' }
  const t = new Date(raw).getTime()
  if (Number.isNaN(t)) return { ok: false, value: '' }
  const startOfToday = Math.floor(now / 86400000) * 86400000
  if (!allowPast && t < startOfToday) return { ok: false, value: '' }
  if (t > now + maxDaysAhead * 86400000) return { ok: false, value: '' }
  return { ok: true, value: new Date(t).toISOString() }
}

// A bot-only field that humans never see. Any non-empty value means a bot.
export function isHoneypotTripped(body, field = 'website') {
  if (!body || typeof body !== 'object') return false
  const v = body[field]
  return v !== undefined && v !== null && v !== ''
}

// Per-key token bucket. In-memory, so it is per server instance: on serverless
// each warm instance has its own buckets, and a restart resets them. It is a
// first line of defence only; the backend limiter is the real backstop.
export function createRateLimiter({ capacity = 5, refillPerSec = 5 / 60, maxKeys = 5000, now = () => Date.now() } = {}) {
  const buckets = new Map()
  return {
    take(key) {
      const t = now()
      let b = buckets.get(key)
      if (!b) {
        if (buckets.size >= maxKeys) {
          // Evict the least recently used entry so memory stays bounded.
          buckets.delete(buckets.keys().next().value)
        }
        b = { tokens: capacity, at: t }
      } else {
        b.tokens = Math.min(capacity, b.tokens + ((t - b.at) / 1000) * refillPerSec)
        b.at = t
        buckets.delete(key)
      }
      buckets.set(key, b) // re-insert keeps the Map in recency order
      if (b.tokens >= 1) {
        b.tokens -= 1
        return { allowed: true, retryAfterSec: 0 }
      }
      return { allowed: false, retryAfterSec: Math.max(1, Math.ceil((1 - b.tokens) / refillPerSec)) }
    },
    size: () => buckets.size,
  }
}

// Visitor identity. Trust assumption: the app runs behind a platform proxy
// (Vercel, Render) that sets x-forwarded-for and overwrites or appends to any
// client-supplied value. On Vercel the first hop is the real client; x-real-ip
// is used as a fallback. If the app is ever exposed without such a proxy this
// header is spoofable and the limiter can be bypassed (the backend's cannot).
export function visitorIp(getHeader) {
  const ipLike = (s) => typeof s === 'string' && /^[0-9a-fA-F:.]{2,45}$/.test(s)
  const xff = getHeader('x-forwarded-for')
  if (xff) {
    const first = xff.split(',')[0].trim()
    if (ipLike(first)) return first
  }
  const real = (getHeader('x-real-ip') || '').trim()
  return ipLike(real) ? real : 'unknown'
}

export const GENERIC_ERRORS = {
  invalid: 'Please check the form and try again.',
  rateLimited: 'Too many requests. Please wait a moment and try again.',
  upstream: 'We could not complete your request right now. Please try again later.',
  notFound: 'The requested item was not found.',
}

// Strip things that must not reach logs: emails, long token-like runs, long digit runs.
export function redactForLog(message) {
  return String(message ?? '')
    .replace(/[^\s@]+@[^\s@]+/g, '[email]')
    .replace(/\b[A-Za-z0-9_-]{24,}\b/g, '[token]')
    .replace(/\d{6,}/g, '[num]')
    .slice(0, 200)
}
