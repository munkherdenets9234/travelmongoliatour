// Pure helpers for the guide-application proxy route. No I/O, no logging.

const FILE_KINDS = ['photo', 'id_card', 'driver_license', 'guide_certificate', 'cv', 'first_aid']
const FILE_FIELD = new RegExp(`^file_(?:${FILE_KINDS.join('|')}|guide_certificate_[1-3])$`)
const MAX_DATA_CHARS = 256 * 1024
const MAX_FILES = 8

// Unknown or malformed length is rejected: the proxy must not read a body it cannot bound.
export function checkBodySize(contentLength, maxBytes) {
  if (contentLength === null || contentLength === undefined || contentLength === '') return false
  const n = typeof contentLength === 'number' ? contentLength : Number(contentLength)
  if (!Number.isFinite(n) || n < 0) return false
  return n <= maxBytes
}

// Backend validation messages look like `<field.path>: <reason>`. Only the path is
// returned, and only when it is a plain dotted identifier; the message text is dropped.
export function fieldFromMessage(message) {
  if (typeof message !== 'string') return undefined
  const i = message.indexOf(':')
  if (i < 1) return undefined
  const head = message.slice(0, i)
  return /^[a-z][a-z0-9_.]{0,60}$/.test(head) ? head : undefined
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
