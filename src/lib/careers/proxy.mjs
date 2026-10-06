// Pure helpers for the guide-application proxy route. No I/O, no logging.

const FILE_KINDS = ['photo', 'id_card', 'driver_license', 'guide_certificate', 'cv', 'first_aid']
const FILE_FIELD = new RegExp(`^file_(?:${FILE_KINDS.join('|')}|guide_certificate_[1-3])$`)
const MAX_DATA_CHARS = 256 * 1024
const MAX_FILES = 8
const IP_CHARS = /^[0-9a-fA-F:.]+$/

// Unknown or malformed length is rejected: the proxy must not read a body it cannot bound.
export function checkBodySize(contentLength, maxBytes) {
  if (contentLength === null || contentLength === undefined || contentLength === '') return false
  const n = typeof contentLength === 'number' ? contentLength : Number(contentLength)
  if (!Number.isFinite(n) || n < 0) return false
  return n <= maxBytes
}

function plausibleIp(value) {
  if (typeof value !== 'string') return null
  const v = value.trim()
  if (v.length === 0 || v.length > 45) return null
  if (!IP_CHARS.test(v)) return null
  if (!v.includes('.') && !v.includes(':')) return null
  return v
}

export function clientIp(headers) {
  const xff = headers.get('x-forwarded-for')
  if (xff) {
    const first = plausibleIp(xff.split(',')[0])
    if (first) return first
  }
  return plausibleIp(headers.get('x-real-ip'))
}

// Fixed window per key. The key map is capped; the oldest keys are evicted first.
export function createRateLimiter({ max, windowMs, now = Date.now, maxKeys = 5000 }) {
  const hits = new Map() // key -> { start, count }
  let lastSweep = now()

  function sweep(t) {
    lastSweep = t
    for (const [k, v] of hits) {
      if (t - v.start >= windowMs) hits.delete(k)
    }
  }

  return {
    allow(key) {
      const t = now()
      if (t - lastSweep >= windowMs) sweep(t)
      const cur = hits.get(key)
      if (!cur || t - cur.start >= windowMs) {
        hits.delete(key)
        while (hits.size >= maxKeys) {
          const oldest = hits.keys().next().value
          hits.delete(oldest)
        }
        hits.set(key, { start: t, count: 1 })
        return max >= 1
      }
      cur.count += 1
      return cur.count <= max
    },
    size() {
      return hits.size
    },
  }
}

function isFile(v) {
  return typeof v === 'object' && v !== null && typeof v.arrayBuffer === 'function' && typeof v.name === 'string'
}

// Copies only what the backend accepts: `data`, `website`, and named file parts.
export function buildForwardForm(incoming) {
  const form = new FormData()
  let haveData = false
  let files = 0
  const seen = new Set()

  for (const [name, value] of incoming.entries()) {
    if (name === 'data') {
      if (haveData || typeof value !== 'string' || value.length > MAX_DATA_CHARS) return { ok: false }
      haveData = true
      form.append('data', value)
    } else if (name === 'website') {
      if (typeof value !== 'string') return { ok: false }
      if (value !== '') form.append('website', value)
    } else if (FILE_FIELD.test(name)) {
      if (!isFile(value) || seen.has(name)) return { ok: false }
      seen.add(name)
      if (value.name === '' || value.size === 0) continue // browsers send empty parts for untouched inputs
      files += 1
      if (files > MAX_FILES) return { ok: false }
      form.append(name, value, value.name)
    } else {
      return { ok: false }
    }
  }

  if (!haveData) return { ok: false }
  return { ok: true, form }
}
