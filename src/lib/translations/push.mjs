// Push logic for scripts/export-translations.mjs, with fetch injected so it can
// be tested without a network. Never overwrites a page unless the existing-state
// check returned a well-formed, successful, empty answer.

export const MAX_ENTRIES = 1000
export const MAX_BODY_BYTES = 512 * 1024

const noun = (n) => `${n} ${n === 1 ? 'entry' : 'entries'}`

export function tooLarge(entries) {
  if (entries.length > MAX_ENTRIES) return `${entries.length} entries exceeds the ${MAX_ENTRIES} limit`
  const bytes = Buffer.byteLength(JSON.stringify({ entries }))
  if (bytes > MAX_BODY_BYTES) return `body of ${bytes} bytes exceeds the ${MAX_BODY_BYTES} byte limit`
  return null
}

export async function pushPages({ pages, fetchImpl, baseUrl, headers, dryRun = false, log = console.log }) {
  const counts = { imported: 0, skipped: 0, tooLarge: 0, failed: 0, wouldImport: 0 }

  const call = async (method, apiPath, body) => {
    const res = await fetchImpl(`${baseUrl}${apiPath}`, {
      method,
      headers: { 'Content-Type': 'application/json', ...headers },
      body: body !== undefined ? JSON.stringify(body) : undefined,
    })
    let json = null
    try {
      json = await res.json()
    } catch {
      json = null
    }
    return { ok: res.ok, status: res.status, json }
  }

  for (const [page, entries] of Object.entries(pages)) {
    const big = tooLarge(entries)
    if (big) {
      log(`${page}: skipped (${big})`)
      counts.tooLarge++
      continue
    }

    let existing
    try {
      const got = await call('GET', `/admin/translations/${encodeURIComponent(page)}`)
      if (!got.ok) {
        log(`${page}: failed (GET returned ${got.status})`)
        counts.failed++
        continue
      }
      if (got.json?.success !== true || !Array.isArray(got.json.data?.entries)) {
        log(`${page}: failed (GET returned an unexpected response; not writing)`)
        counts.failed++
        continue
      }
      existing = got.json.data.entries
    } catch (err) {
      log(`${page}: failed (GET ${err.code ?? err.name})`)
      counts.failed++
      continue
    }

    if (existing.length > 0) {
      log(dryRun ? `would skip ${page} (already has ${noun(existing.length)})` : `${page}: skipped (already has entries)`)
      counts.skipped++
      continue
    }
    if (dryRun) {
      log(`would import ${page} (${noun(entries.length)})`)
      counts.wouldImport++
      continue
    }

    try {
      const put = await call('PUT', `/admin/translations/${encodeURIComponent(page)}`, { entries })
      if (!put.ok) {
        log(`${page}: failed (PUT returned ${put.status})`)
        counts.failed++
        continue
      }
      log(`${page}: imported (${noun(entries.length)})`)
      counts.imported++
    } catch (err) {
      log(`${page}: failed (PUT ${err.code ?? err.name})`)
      counts.failed++
    }
  }
  return counts
}
