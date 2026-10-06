// Sync mode for scripts/export-translations.mjs: migrate and refresh stored
// translations against the shipped wording, never losing a person's edit.
// Fetch is injected so it can be tested without a network.

import { clone, createCall, readEntries, tooLarge } from './push.mjs'

const isObject = (v) => v !== null && typeof v === 'object' && !Array.isArray(v)

// Same semantics as the server's siteValuesEqual: strings equal, arrays equal
// element-wise in order, plain objects equal field-wise (key order irrelevant),
// any type difference is false.
export function valuesEqual(a, b) {
  if (typeof a === 'string' || typeof b === 'string') return a === b
  if (Array.isArray(a) || Array.isArray(b)) {
    if (!Array.isArray(a) || !Array.isArray(b) || a.length !== b.length) return false
    return a.every((item, i) => valuesEqual(item, b[i]))
  }
  if (isObject(a) && isObject(b)) {
    const ka = Object.keys(a)
    if (ka.length !== Object.keys(b).length) return false
    return ka.every((k) => Object.hasOwn(b, k) && valuesEqual(a[k], b[k]))
  }
  return false
}

// Structural deep equality for whole entries (handles null, numbers, booleans,
// arrays and objects). valuesEqual stays the server-parity value compare.
function deepEqual(a, b) {
  if (a === b) return true
  if (Array.isArray(a) || Array.isArray(b)) {
    if (!Array.isArray(a) || !Array.isArray(b) || a.length !== b.length) return false
    return a.every((item, i) => deepEqual(item, b[i]))
  }
  if (isObject(a) && isObject(b)) {
    const ka = Object.keys(a)
    if (ka.length !== Object.keys(b).length) return false
    return ka.every((k) => Object.hasOwn(b, k) && deepEqual(a[k], b[k]))
  }
  return false
}

// A blank value counts as absent: there is no stored wording to refresh. Blank
// follows the server: a trimmed-empty string, an empty array, an array whose
// items are all blank strings or objects with all-blank fields.
function isBlank(v) {
  if (v === undefined || v === null) return true
  if (typeof v === 'string') return v.trim() === ''
  if (Array.isArray(v)) return v.every(isBlank)
  if (isObject(v)) return Object.values(v).every(isBlank)
  return false
}

const LANGS = ['en', 'mn', 'ko']

// Returns { entries, changed, count }. count = entries added or modified.
// Inputs are never mutated; everything returned is a deep copy.
export function planSync(stored, shipped) {
  // One entry per shipped path (languages of a repeated path are merged); blank
  // shipped languages are dropped because the server would drop them too.
  const wanted = new Map()
  for (const ship of shipped) {
    if (!wanted.has(ship.path)) wanted.set(ship.path, {})
    const target = wanted.get(ship.path)
    for (const lang of LANGS) {
      const v = ship.values?.[lang]
      if (isBlank(v) || target[lang] !== undefined) continue
      target[lang] = v
    }
  }

  const out = stored.map((e) => clone(e))
  const index = new Map(out.map((e, i) => [e.path, i]))
  let count = 0

  for (const [path, langs] of wanted) {
    const at = index.get(path)
    if (at === undefined) {
      if (Object.keys(langs).length === 0) continue
      const values = {}
      const base = {}
      for (const lang of LANGS) {
        if (langs[lang] === undefined) continue
        values[lang] = clone(langs[lang])
        base[lang] = clone(langs[lang])
      }
      index.set(path, out.length)
      out.push({ path, values, base })
      count++
      continue
    }
    const entry = out[at]
    const before = stored[at]
    entry.values = entry.values ?? {}
    for (const lang of LANGS) {
      const next = langs[lang]
      if (next === undefined) continue
      const base = entry.base?.[lang]
      const value = entry.values[lang]
      if (base === undefined) {
        entry.base = { ...entry.base, [lang]: clone(next) }
      } else if (!isBlank(value) && valuesEqual(value, base)) {
        entry.values[lang] = clone(next)
        entry.base[lang] = clone(next)
      } else {
        entry.base[lang] = clone(next)
      }
    }
    if (!deepEqual(entry, before)) count++
  }

  const changed = !deepEqual(out, stored)
  return { entries: out, changed, count }
}

const changes = (n) => `${n} ${n === 1 ? 'change' : 'changes'}`
const noun = (n) => `${n} ${n === 1 ? 'entry' : 'entries'}`

export async function syncPages({ pages, fetchImpl, baseUrl, headers, dryRun = false, log = console.log }) {
  const counts = { created: 0, synced: 0, unchanged: 0, skipped: 0, tooLarge: 0, failed: 0, wouldSync: 0, wouldCreate: 0 }
  const call = createCall({ fetchImpl, baseUrl, headers })
  const url = (page) => `/admin/translations/${encodeURIComponent(page)}`

  for (const [page, shipped] of Object.entries(pages)) {
    const read = await readEntries(call, page)
    if (read.failure) {
      log(`${page}: failed (${read.failure})`)
      counts.failed++
      continue
    }
    const stored = read.entries

    let merged
    let count
    if (stored.length === 0) {
      merged = planSync([], shipped).entries
      count = merged.length
    } else {
      const plan = planSync(stored, shipped)
      if (!plan.changed) {
        log(`${page}: unchanged`)
        counts.unchanged++
        continue
      }
      merged = plan.entries
      count = plan.count
    }

    const big = tooLarge(merged)
    if (big) {
      log(`${page}: skipped (${big})`)
      counts.tooLarge++
      continue
    }

    if (dryRun) {
      if (stored.length === 0) {
        log(`would create ${page} (${noun(merged.length)})`)
        counts.wouldCreate++
      } else {
        log(`would sync ${page} (${changes(count)})`)
        counts.wouldSync++
      }
      continue
    }

    try {
      const put = await call('PUT', url(page), { entries: merged })
      if (!put.ok) {
        log(`${page}: failed (PUT returned ${put.status})`)
        counts.failed++
        continue
      }
      if (put.json?.success !== true || put.json.data?.entries !== merged.length) {
        log(`${page}: failed (PUT response did not confirm ${noun(merged.length)} saved; the write may not have been applied)`)
        counts.failed++
        continue
      }
    } catch (err) {
      log(`${page}: failed (PUT ${err.code ?? err.name}; the write may or may not have been applied)`)
      counts.failed++
      continue
    }

    const again = await readEntries(call, page)
    if (again.failure) {
      log(`${page}: failed (re-read after write: ${again.failure}; the write may already be applied)`)
      counts.failed++
      continue
    }
    if (again.entries.length !== merged.length) {
      log(`${page}: failed (re-read after write found ${noun(again.entries.length)}, expected ${merged.length})`)
      counts.failed++
      continue
    }
    if (stored.length === 0) {
      log(`${page}: created (${noun(merged.length)})`)
      counts.created++
    } else {
      log(`${page}: synced (${changes(count)})`)
      counts.synced++
    }
  }
  return counts
}
