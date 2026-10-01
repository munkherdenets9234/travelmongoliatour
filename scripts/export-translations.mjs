#!/usr/bin/env node
// Exports the shipped site wording (src/locales/{en,mn,ko}.json) per page, and
// optionally imports it into the DigitalService admin translations store.
//
//   node scripts/export-translations.mjs             print { page: [{ path, values }] } JSON
//   node scripts/export-translations.mjs --dry-run   print per-page import decisions (no network)
//   node scripts/export-translations.mjs --push      import pages that have no entries yet
//   node scripts/export-translations.mjs --push --dry-run   same decisions, reads state, writes nothing
//
// --push needs TENANT_API_KEY and ADMIN_TOKEN (and optionally API_BASE_URL) in the
// environment or .env.local, exactly like scripts/seed-backend.mjs. A page that
// already has entries is never overwritten. Secrets are never printed.

import { readFile } from 'node:fs/promises'
import path from 'node:path'
import { fileURLToPath } from 'node:url'
import { flattenTranslation } from '../src/lib/translations/merge.mjs'
import { filterEntries, pushPages, tooLarge } from '../src/lib/translations/push.mjs'

const rootDir = path.dirname(path.dirname(fileURLToPath(import.meta.url)))
const LOCALES = ['en', 'mn', 'ko']
const PAGE_RE = /^[A-Za-z0-9_-]{1,64}$/
const PATH_RE = /^[A-Za-z0-9_.-]{1,200}$/

const args = new Set(process.argv.slice(2))
const push = args.has('--push')
const dryRun = args.has('--dry-run')

async function loadEnvFile(file) {
  try {
    const text = await readFile(file, 'utf8')
    for (const line of text.split('\n')) {
      const trimmed = line.trim()
      if (!trimmed || trimmed.startsWith('#')) continue
      const eq = trimmed.indexOf('=')
      if (eq === -1) continue
      const key = trimmed.slice(0, eq).trim()
      const value = trimmed.slice(eq + 1).trim()
      if (!(key in process.env)) process.env[key] = value
    }
  } catch {
    // no env file at this path — fine, keep going
  }
}

const isObject = (v) => v !== null && typeof v === 'object' && !Array.isArray(v)

let skippedEntries = 0

async function buildPages() {
  const raw = {}
  for (const locale of LOCALES) {
    raw[locale] = JSON.parse(await readFile(path.join(rootDir, 'src', 'locales', `${locale}.json`), 'utf8'))
  }
  const flat = Object.fromEntries(LOCALES.map((l) => [l, flattenTranslation(raw[l])]))
  const pageNames = []
  for (const locale of LOCALES) {
    for (const page of Object.keys(raw[locale])) if (!pageNames.includes(page)) pageNames.push(page)
  }

  const pages = {}
  for (const page of pageNames) {
    if (!PAGE_RE.test(page)) {
      console.error(`skip page "${page}": name does not match [A-Za-z0-9_-]{1,64}`)
      continue
    }
    if (LOCALES.some((l) => Object.hasOwn(raw[l], page) && !isObject(raw[l][page]))) {
      console.error(`skip page "${page}": top-level value is not an object`)
      continue
    }
    const paths = []
    for (const locale of LOCALES) {
      for (const p of Object.keys(flat[locale][page] ?? {})) if (!paths.includes(p)) paths.push(p)
    }
    const entries = []
    for (const p of paths) {
      if (!PATH_RE.test(p) || p.split('.').includes('')) {
        console.error(`skip path "${page}" / "${p}": must be 1-200 chars of [A-Za-z0-9_.-] with no empty segment`)
        continue
      }
      const values = {}
      for (const locale of LOCALES) {
        if (Object.hasOwn(flat[locale][page] ?? {}, p)) values[locale] = flat[locale][page][p]
      }
      entries.push({ path: p, values })
    }
    const valid = filterEntries(page, entries, (note) => {
      skippedEntries++
      console.error(note)
    })
    if (valid.length === 0) {
      console.error(`skip page "${page}": no storable entries`)
      continue
    }
    entries.splice(0, entries.length, ...valid)
    const big = tooLarge(entries)
    if (big) {
      console.error(`skip page "${page}": ${big}`)
      continue
    }
    pages[page] = entries
  }
  return pages
}

const pages = await buildPages()

if (!push && !dryRun) {
  console.log(JSON.stringify(pages, null, 2))
  process.exit(0)
}

let fetchImpl = null
let baseUrl = ''
let headers = {}
if (push) {
  await loadEnvFile(path.join(rootDir, '.env.local'))
  await loadEnvFile(path.join(rootDir, '.env'))
  baseUrl = process.env.API_BASE_URL ?? 'http://localhost:8080/api/v1'
  const TENANT_API_KEY = process.env.TENANT_API_KEY
  const ADMIN_TOKEN = process.env.ADMIN_TOKEN
  if (!TENANT_API_KEY || !ADMIN_TOKEN) {
    console.error('Missing TENANT_API_KEY and/or ADMIN_TOKEN in .env.local — fill those in before pushing.')
    process.exit(1)
  }
  fetchImpl = fetch
  headers = { 'X-API-Key': TENANT_API_KEY, Authorization: `Bearer ${ADMIN_TOKEN}` }
}

const total = Object.keys(pages).length
let counts
if (push) {
  counts = await pushPages({ pages, fetchImpl, baseUrl, headers, dryRun })
} else {
  counts = { imported: 0, skipped: 0, tooLarge: 0, failed: 0, wouldImport: 0 }
  for (const [page, entries] of Object.entries(pages)) {
    console.log(`would import ${page} (${entries.length} ${entries.length === 1 ? 'entry' : 'entries'})`)
    counts.wouldImport++
  }
}

if (dryRun) {
  console.log(
    `Dry run: ${total} pages, would import ${counts.wouldImport}, would skip ${counts.skipped}, too large ${counts.tooLarge}, failed ${counts.failed}, skipped entries ${skippedEntries}`,
  )
} else {
  console.log(
    `Summary: ${total} pages, imported ${counts.imported}, skipped ${counts.skipped}, too large ${counts.tooLarge}, failed ${counts.failed}, skipped entries ${skippedEntries}`,
  )
}
process.exit(counts.failed > 0 ? 1 : 0)
