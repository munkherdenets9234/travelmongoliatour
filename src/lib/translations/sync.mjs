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

// A blank value counts as absent: there is no stored wording to refresh.
const isAbsent = (v) => v === undefined || v === null || v === ''

const LANGS = ['en', 'mn', 'ko']

// Returns { entries, changed, count }. count = entries added or modified.
// Inputs are never mutated; everything returned is a deep copy.
export function planSync(stored, shipped) {
  const out = stored.map((e) => clone(e))
  const index = new Map(out.map((e, i) => [e.path, i]))
  let count = 0

  for (const ship of shipped) {
    const at = index.get(ship.path)
    if (at === undefined) {
      const values = {}
      const base = {}
      for (const lang of LANGS) {
        if (ship.values?.[lang] === undefined) continue
        values[lang] = clone(ship.values[lang])
        base[lang] = clone(ship.values[lang])
      }
      index.set(ship.path, out.length)
      out.push({ path: ship.path, values, base })
      count++
      continue
    }
    const entry = out[at]
    const before = stored[at]
    entry.values = entry.values ?? {}
    for (const lang of LANGS) {
      const next = ship.values?.[lang]
      if (next === undefined) continue
      const base = entry.base?.[lang]
      const value = entry.values[lang]
      if (base === undefined) {
        entry.base = { ...entry.base, [lang]: clone(next) }
      } else if (!isAbsent(value) && valuesEqual(value, base)) {
        entry.values[lang] = clone(next)
        entry.base[lang] = clone(next)
      } else {
        entry.base[lang] = clone(next)
      }
    }
    if (!valuesEqual(entry, before)) count++
  }

  const changed = !valuesEqual(out, stored)
  return { entries: out, changed, count }
}

const noun = (n) => `${n} ${n === 1 ? 'entry' : 'entries'}`

export async function syncPages({ pages, fetchImpl, baseUrl, headers, dryRun = false, log = console.log }) {
  const counts = { created: 0, synced: 0, unchanged: 0, skipped: 0, tooLarge: 0, failed: 0, wouldSync: 0 }
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
      merged = shipped
      count = shipped.length
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

    if (dryRun) {
      log(stored.length === 0 ? `would create ${page} (${noun(shipped.length)})` : `would sync ${page} (${count} changes)`)
      counts.wouldSync++
      continue
    }

    const big = tooLarge(merged)
    if (big) {
      log(`${page}: skipped (${big})`)
      counts.tooLarge++
      continue
    }

    try {
      const put = await call('PUT', url(page), { entries: merged })
      if (!put.ok) {
        log(`${page}: failed (PUT returned ${put.status})`)
        counts.failed++
        continue
      }
    } catch (err) {
      log(`${page}: failed (PUT ${err.code ?? err.name})`)
      counts.failed++
      continue
    }

    const again = await readEntries(call, page)
    if (again.failure) {
      log(`${page}: failed (re-read after write: ${again.failure})`)
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
      log(`${page}: synced (${count} changes)`)
      counts.synced++
    }
  }
  return counts
}
