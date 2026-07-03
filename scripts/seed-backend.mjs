#!/usr/bin/env node
// Pushes data/mongo-seed/{tours,cars,journal}.json into the live DigitalService API
// via its /admin/* endpoints. Run manually once .env.local has TENANT_API_KEY and
// ADMIN_TOKEN filled in (ADMIN_TOKEN comes from `POST /login` with your tenant's
// admin credentials — see the Postman collection's "Auth (Tenant Users) > Login").
//
//   node scripts/seed-backend.mjs
//
// Safe to re-run: the API's unique-slug constraint makes repeat inserts 409,
// which this script reports and skips rather than duplicating.

import { readFile } from 'node:fs/promises'
import path from 'node:path'
import { fileURLToPath } from 'node:url'

const rootDir = path.dirname(path.dirname(fileURLToPath(import.meta.url)))

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

await loadEnvFile(path.join(rootDir, '.env.local'))
await loadEnvFile(path.join(rootDir, '.env'))

const API_BASE_URL = process.env.API_BASE_URL ?? 'http://localhost:8080/api/v1'
const TENANT_API_KEY = process.env.TENANT_API_KEY
const ADMIN_TOKEN = process.env.ADMIN_TOKEN

if (!TENANT_API_KEY || !ADMIN_TOKEN) {
  console.error('Missing TENANT_API_KEY and/or ADMIN_TOKEN in .env.local — fill those in before seeding.')
  process.exit(1)
}

async function call(method, apiPath, body) {
  const res = await fetch(`${API_BASE_URL}${apiPath}`, {
    method,
    headers: {
      'Content-Type': 'application/json',
      'X-API-Key': TENANT_API_KEY,
      Authorization: `Bearer ${ADMIN_TOKEN}`,
    },
    body: body !== undefined ? JSON.stringify(body) : undefined,
  })
  const json = await res.json().catch(() => ({}))
  return { ok: res.ok, status: res.status, json }
}

function htmlFromBody(body, quote) {
  const sections = body.map((s) => `<h2>${s.heading}</h2>\n<p>${s.text}</p>`).join('\n')
  const quoteHtml = quote ? `\n<blockquote>${quote}</blockquote>` : ''
  return `${sections}${quoteHtml}`
}

async function seedTours() {
  const tours = JSON.parse(await readFile(path.join(rootDir, 'data/mongo-seed/tours.json'), 'utf8'))
  console.log(`\nSeeding ${tours.length} destinations…`)
  for (const t of tours) {
    const { guide, ...destination } = t
    void guide // not part of the Destination model — dropped
    const { ok, status, json } = await call('POST', '/admin/destinations', destination)
    if (ok) console.log(`  created destination "${t.slug}" (${json.data?.id})`)
    else if (status === 409) console.log(`  skipped "${t.slug}" — already exists`)
    else console.error(`  FAILED "${t.slug}": ${status} ${json.message ?? ''}`)
  }
}

async function seedCars() {
  const cars = JSON.parse(await readFile(path.join(rootDir, 'data/mongo-seed/cars.json'), 'utf8'))
  console.log(`\nSeeding ${cars.length} cars…`)
  for (const c of cars) {
    const body = {
      slug: c.slug,
      name: c.name,
      type: c.type,
      seats: c.seats,
      fuel: c.fuel,
      price_per_day_usd: c.pricePerDay,
      tags: c.tags,
      cover_image: { url: c.image, caption: c.name },
      images: [],
    }
    const { ok, status, json } = await call('POST', '/admin/cars', body)
    if (ok) console.log(`  created car "${c.slug}" (${json.data?.id})`)
    else if (status === 409) console.log(`  skipped "${c.slug}" — already exists`)
    else console.error(`  FAILED "${c.slug}": ${status} ${json.message ?? ''}`)
  }
}

async function seedJournal() {
  const articles = JSON.parse(await readFile(path.join(rootDir, 'data/mongo-seed/journal.json'), 'utf8'))
  console.log(`\nSeeding ${articles.length} blog posts…`)
  for (const a of articles) {
    const body = {
      title: a.title,
      slug: a.slug,
      excerpt: a.excerpt,
      content: htmlFromBody(a.body, a.quote),
      author: a.author?.name ?? 'E&S Travel',
      cover_image: { url: a.image, caption: a.title },
      images: [],
      tags: [a.category, ...(a.tags ?? [])],
    }
    const { ok, status, json } = await call('POST', '/admin/blogs', body)
    if (!ok) {
      if (status === 409) console.log(`  skipped "${a.slug}" — already exists`)
      else console.error(`  FAILED "${a.slug}": ${status} ${json.message ?? ''}`)
      continue
    }
    const id = json.data?.id
    console.log(`  created blog "${a.slug}" (${id})`)
    if (id) {
      const pub = await call('POST', `/admin/blogs/${id}/publish`)
      console.log(pub.ok ? `    published "${a.slug}"` : `    FAILED to publish "${a.slug}": ${pub.status}`)
    }
  }
}

await seedTours()
await seedCars()
await seedJournal()
console.log('\nDone.')
