import { test } from 'node:test'
import assert from 'node:assert/strict'
import { validateValue, filterEntries } from './push.mjs'
import { pushPages } from './push.mjs'

test('string length boundary', () => {
  assert.equal(validateValue('a'.repeat(5000)), null)
  assert.ok(validateValue('a'.repeat(5001)))
})

test('array item count boundary', () => {
  assert.equal(validateValue(Array(100).fill('a')), null)
  assert.ok(validateValue(Array(101).fill('a')))
})

test('object key count boundary', () => {
  const mk = (n) => Object.fromEntries(Array.from({ length: n }, (_, i) => [`k${i}`, 'v']))
  assert.equal(validateValue([mk(20)]), null)
  assert.ok(validateValue([mk(21)]))
})

test('rejects number field, nested array field, bad key, non-string, mixed array', () => {
  assert.ok(validateValue([{ id: 1 }]))
  assert.ok(validateValue([{ features: ['a'] }]))
  assert.ok(validateValue([{ $x: 'a' }]))
  assert.ok(validateValue(5))
  assert.ok(validateValue(null))
  assert.ok(validateValue(['a', { k: 'v' }]))
  assert.equal(validateValue([{ title: 'a', body: 'b' }]), null)
})

test('filterEntries skips whole entry when any language fails', () => {
  const ok = { path: 'a', values: { en: 'x', mn: 'y', ko: 'z' } }
  const bad = { path: 'b', values: { en: [{ t: 'x' }], mn: [{ t: 1 }], ko: [{ t: 'z' }] } }
  const notes = []
  const out = filterEntries('p', [ok, bad], (n) => notes.push(n))
  assert.deepEqual(out, [ok])
  assert.equal(notes.length, 1)
  assert.match(notes[0], /^skipped p\.b: /)
})

test('page with conforming and non-conforming entry PUTs only the conforming one', async () => {
  const ok = { path: 'a', values: { en: 'x', mn: 'y', ko: 'z' } }
  const bad = { path: 'b', values: { en: 'x', mn: [1], ko: 'z' } }
  const entries = filterEntries('p', [ok, bad], () => {})
  let body
  const fetchImpl = async (url, init) => {
    if (init.method === 'PUT') body = JSON.parse(init.body)
    return new Response(JSON.stringify({ success: true, data: { entries: [] } }), { status: 200 })
  }
  await pushPages({ pages: { p: entries }, fetchImpl, baseUrl: 'http://x', headers: {}, log: () => {} })
  assert.deepEqual(body.entries.map((e) => e.path), ['a'])
})
