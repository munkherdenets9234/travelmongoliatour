import { test } from 'node:test'
import assert from 'node:assert/strict'
import { pushPages, withBase } from './push.mjs'

const pages = { hero: [{ path: 'title', values: { en: 'a', mn: 'b', ko: 'c' } }] }
const headers = { 'X-API-Key': 'k', Authorization: 'Bearer t' }

function run(getResponse, { dryRun = false } = {}) {
  const calls = []
  const fetchImpl = async (url, init) => {
    calls.push(init.method)
    if (init.method === 'GET') {
      if (getResponse instanceof Error) throw getResponse
      return getResponse
    }
    return new Response(JSON.stringify({ success: true, data: {} }), { status: 200 })
  }
  const lines = []
  return pushPages({ pages, fetchImpl, baseUrl: 'http://x/api/v1', headers, dryRun, log: (l) => lines.push(l) }).then(
    (counts) => ({ counts, calls, lines }),
  )
}

const json = (body, status = 200) => new Response(JSON.stringify(body), { status })

test('GET with entries -> skipped, no PUT', async () => {
  const r = await run(json({ success: true, data: { page: 'hero', entries: [{ path: 'x' }] } }))
  assert.equal(r.counts.skipped, 1)
  assert.deepEqual(r.calls, ['GET'])
})

test('GET 200 non-JSON -> failed, no PUT', async () => {
  const r = await run(new Response('<html>proxy</html>', { status: 200 }))
  assert.equal(r.counts.failed, 1)
  assert.deepEqual(r.calls, ['GET'])
})

test('GET 200 success:false -> failed, no PUT', async () => {
  const r = await run(json({ success: false, data: { entries: [] } }))
  assert.equal(r.counts.failed, 1)
  assert.deepEqual(r.calls, ['GET'])
})

test('GET 200 entries not an array -> failed, no PUT', async () => {
  const r = await run(json({ success: true, data: { entries: 'nope' } }))
  assert.equal(r.counts.failed, 1)
  assert.deepEqual(r.calls, ['GET'])
})

test('GET 500 -> failed, no PUT', async () => {
  const r = await run(json({ success: false }, 500))
  assert.equal(r.counts.failed, 1)
  assert.deepEqual(r.calls, ['GET'])
})

test('GET network error -> failed, no PUT', async () => {
  const r = await run(new Error('boom'))
  assert.equal(r.counts.failed, 1)
  assert.deepEqual(r.calls, ['GET'])
})

test('GET 200 empty entries -> exactly one PUT', async () => {
  const r = await run(json({ success: true, data: { page: 'hero', entries: [] } }))
  assert.equal(r.counts.imported, 1)
  assert.deepEqual(r.calls, ['GET', 'PUT'])
})

test('default import sends base equal to values', async () => {
  const input = [{ path: 'title', values: { en: 'a', ko: ['x', 'y'] } }]
  const withBaseEntries = withBase(input)
  assert.deepEqual(withBaseEntries[0].base, input[0].values)
  assert.notEqual(withBaseEntries[0].base.ko, input[0].values.ko)
  let body = null
  const fetchImpl = async (url, init) => {
    if (init.method === 'GET') return json({ success: true, data: { entries: [] } })
    body = JSON.parse(init.body)
    return json({ success: true, data: {} })
  }
  const r = await pushPages({ pages: { hero: withBaseEntries }, fetchImpl, baseUrl: 'http://x', headers, log: () => {} })
  assert.equal(r.imported, 1)
  assert.deepEqual(body.entries[0].base, body.entries[0].values)
})

test('dry-run never PUTs', async () => {
  const r = await run(json({ success: true, data: { page: 'hero', entries: [] } }), { dryRun: true })
  assert.equal(r.counts.wouldImport, 1)
  assert.deepEqual(r.calls, ['GET'])
})
