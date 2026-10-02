import { test } from 'node:test'
import assert from 'node:assert/strict'
import { valuesEqual, planSync, syncPages } from './sync.mjs'

const headers = { 'X-API-Key': 'k', Authorization: 'Bearer t' }
const json = (body, status = 200) => new Response(JSON.stringify(body), { status })
const ok = (entries) => json({ success: true, data: { page: 'hero', entries } })
const clone = (v) => JSON.parse(JSON.stringify(v))

test('valuesEqual: strings, arrays in order, objects ignoring key order', () => {
  assert.equal(valuesEqual('a', 'a'), true)
  assert.equal(valuesEqual('a', 'b'), false)
  assert.equal(valuesEqual(['a', 'b'], ['a', 'b']), true)
  assert.equal(valuesEqual(['a', 'b'], ['b', 'a']), false)
  assert.equal(valuesEqual([{ a: '1', b: '2' }], [{ b: '2', a: '1' }]), true)
  assert.equal(valuesEqual([{ a: '1' }], [{ a: '2' }]), false)
  assert.equal(valuesEqual([{ a: '1' }], [{ a: '1', b: '2' }]), false)
})

test('valuesEqual: any type difference is false', () => {
  assert.equal(valuesEqual('1', ['1']), false)
  assert.equal(valuesEqual(['1'], '1'), false)
  assert.equal(valuesEqual('a', { a: 'a' }), false)
  assert.equal(valuesEqual([], {}), false)
  assert.equal(valuesEqual(undefined, 'a'), false)
  assert.equal(valuesEqual(null, {}), false)
})

test('planSync adds a path that is not stored with values and base equal to shipped', () => {
  const r = planSync([], [{ path: 'a', values: { en: 'x', mn: 'y' }, base: { en: 'x', mn: 'y' } }])
  assert.equal(r.changed, true)
  assert.deepEqual(r.entries, [{ path: 'a', values: { en: 'x', mn: 'y' }, base: { en: 'x', mn: 'y' } }])
})

test('planSync attaches base to a stored entry that has none and keeps its values', () => {
  const r = planSync([{ path: 'a', values: { en: 'edited' } }], [{ path: 'a', values: { en: 'shipped' } }])
  assert.deepEqual(r.entries, [{ path: 'a', values: { en: 'edited' }, base: { en: 'shipped' } }])
  assert.equal(r.changed, true)
})

test('planSync attaches base even when the stored entry has no value for that language', () => {
  const r = planSync([{ path: 'a', values: { en: 'e' } }], [{ path: 'a', values: { en: 'e', mn: 'm' } }])
  assert.deepEqual(r.entries[0], { path: 'a', values: { en: 'e' }, base: { en: 'e', mn: 'm' } })
})

test('planSync refreshes an unedited value to the new shipped text and its base', () => {
  const r = planSync(
    [{ path: 'a', values: { en: 'old' }, base: { en: 'old' } }],
    [{ path: 'a', values: { en: 'new' } }],
  )
  assert.deepEqual(r.entries, [{ path: 'a', values: { en: 'new' }, base: { en: 'new' } }])
})

test('planSync refreshes an unedited array value', () => {
  const r = planSync(
    [{ path: 'a', values: { en: ['1', '2'] }, base: { en: ['1', '2'] } }],
    [{ path: 'a', values: { en: ['1', '3'] } }],
  )
  assert.deepEqual(r.entries[0].values.en, ['1', '3'])
  assert.deepEqual(r.entries[0].base.en, ['1', '3'])
})

test('planSync keeps an edited value and refreshes only its base', () => {
  const r = planSync(
    [{ path: 'a', values: { en: 'mine' }, base: { en: 'old' } }],
    [{ path: 'a', values: { en: 'new' } }],
  )
  assert.deepEqual(r.entries, [{ path: 'a', values: { en: 'mine' }, base: { en: 'new' } }])
})

test('planSync keeps a value absent while refreshing its base', () => {
  const r = planSync(
    [{ path: 'a', values: { en: 'x' }, base: { en: 'x', mn: 'old' } }],
    [{ path: 'a', values: { en: 'x', mn: 'new' } }],
  )
  assert.deepEqual(r.entries, [{ path: 'a', values: { en: 'x' }, base: { en: 'x', mn: 'new' } }])
})

test('planSync decides per language', () => {
  const r = planSync(
    [{ path: 'a', values: { en: 'old', mn: 'mine', ko: 'k' }, base: { en: 'old', mn: 'old' } }],
    [{ path: 'a', values: { en: 'new', mn: 'new', ko: 'knew' } }],
  )
  assert.deepEqual(r.entries[0], {
    path: 'a',
    values: { en: 'new', mn: 'mine', ko: 'k' },
    base: { en: 'new', mn: 'new', ko: 'knew' },
  })
})

test('planSync leaves stored entries that are no longer shipped, and orders output', () => {
  const stored = [
    { path: 'gone', values: { en: 'g' }, base: { en: 'g' } },
    { path: 'a', values: { en: 'a' }, base: { en: 'a' } },
  ]
  const r = planSync(stored, [
    { path: 'n1', values: { en: '1' } },
    { path: 'a', values: { en: 'a' } },
    { path: 'n2', values: { en: '2' } },
  ])
  assert.deepEqual(
    r.entries.map((e) => e.path),
    ['gone', 'a', 'n1', 'n2'],
  )
  assert.deepEqual(r.entries[0], stored[0])
})

test('planSync reports changed false when nothing differs', () => {
  const stored = [{ path: 'a', values: { en: 'x' }, base: { en: 'x' } }]
  const r = planSync(stored, [{ path: 'a', values: { en: 'x' } }])
  assert.equal(r.changed, false)
  assert.deepEqual(r.entries, stored)
})

test('planSync does not mutate inputs and does not alias them', () => {
  const stored = [{ path: 'a', values: { en: ['o'] }, base: { en: ['o'] } }]
  const shipped = [
    { path: 'a', values: { en: ['n'] } },
    { path: 'b', values: { en: ['z'] } },
  ]
  const s0 = clone(stored)
  const h0 = clone(shipped)
  const r = planSync(stored, shipped)
  assert.deepEqual(stored, s0)
  assert.deepEqual(shipped, h0)
  r.entries[0].values.en.push('x')
  r.entries[1].values.en.push('x')
  r.entries[1].base.en.push('x')
  assert.deepEqual(stored, s0)
  assert.deepEqual(shipped, h0)
})

function harness(getResponses, { dryRun = false, putOk = true } = {}) {
  const calls = []
  const bodies = []
  let gets = 0
  const fetchImpl = async (url, init) => {
    calls.push(init.method)
    if (init.method === 'GET') {
      const r = getResponses[Math.min(gets++, getResponses.length - 1)]
      if (r instanceof Error) throw r
      return r
    }
    bodies.push(JSON.parse(init.body))
    return putOk ? json({ success: true, data: {} }) : json({ success: false }, 500)
  }
  const lines = []
  return (pages) =>
    syncPages({ pages, fetchImpl, baseUrl: 'http://x/api/v1', headers, dryRun, log: (l) => lines.push(l) }).then(
      (counts) => ({ counts, calls, bodies, lines }),
    )
}

const shipped = { hero: [{ path: 'title', values: { en: 'new' }, base: { en: 'new' } }] }

const badGets = [
  ['500', () => json({ success: false }, 500)],
  ['non-JSON', () => new Response('<html>', { status: 200 })],
  ['success:false', () => json({ success: false, data: { entries: [] } })],
  ['non-array entries', () => json({ success: true, data: { entries: 'nope' } })],
  ['thrown error', () => new Error('boom')],
]
for (const [name, res] of badGets) {
  test(`syncPages never writes when the GET is ${name}`, async () => {
    const r = await harness([res()])(shipped)
    assert.equal(r.counts.failed, 1)
    assert.deepEqual(r.calls, ['GET'])
    assert.equal(r.lines.join('\n').includes('Bearer'), false)
  })
}

test('syncPages makes no PUT when nothing changed', async () => {
  const r = await harness([ok([{ path: 'title', values: { en: 'new' }, base: { en: 'new' } }])])(shipped)
  assert.equal(r.counts.unchanged, 1)
  assert.deepEqual(r.calls, ['GET'])
})

test('syncPages dry-run makes no PUT and counts changes', async () => {
  const r = await harness([ok([{ path: 'title', values: { en: 'old' }, base: { en: 'old' } }])], { dryRun: true })(shipped)
  assert.equal(r.counts.wouldSync, 1)
  assert.deepEqual(r.calls, ['GET'])
  assert.deepEqual(r.lines, ['would sync hero (1 changes)'])
})

test('syncPages creates a page that has no stored entries with base set', async () => {
  const r = await harness([ok([]), ok(shipped.hero)])(shipped)
  assert.equal(r.counts.created, 1)
  assert.deepEqual(r.calls, ['GET', 'PUT', 'GET'])
  assert.deepEqual(r.bodies[0].entries[0].base, { en: 'new' })
})

test('syncPages dry-run on an empty page writes nothing', async () => {
  const r = await harness([ok([])], { dryRun: true })(shipped)
  assert.deepEqual(r.calls, ['GET'])
})

test('syncPages syncs, re-reads, and succeeds when the count matches', async () => {
  const stored = [{ path: 'title', values: { en: 'old' }, base: { en: 'old' } }]
  const merged = [{ path: 'title', values: { en: 'new' }, base: { en: 'new' } }]
  const r = await harness([ok(stored), ok(merged)])(shipped)
  assert.equal(r.counts.synced, 1)
  assert.deepEqual(r.calls, ['GET', 'PUT', 'GET'])
})

test('syncPages fails the page when the re-GET entry count differs', async () => {
  const stored = [{ path: 'title', values: { en: 'old' }, base: { en: 'old' } }]
  const r = await harness([ok(stored), ok([])])(shipped)
  assert.equal(r.counts.failed, 1)
  assert.equal(r.counts.synced, 0)
  assert.match(r.lines.join('\n'), /re-read/)
})

test('syncPages fails the page when the re-GET is malformed', async () => {
  const stored = [{ path: 'title', values: { en: 'old' }, base: { en: 'old' } }]
  const r = await harness([ok(stored), json({ success: false }, 500)])(shipped)
  assert.equal(r.counts.failed, 1)
})

test('syncPages fails the page when the PUT fails', async () => {
  const stored = [{ path: 'title', values: { en: 'old' }, base: { en: 'old' } }]
  const r = await harness([ok(stored)], { putOk: false })(shipped)
  assert.equal(r.counts.failed, 1)
  assert.deepEqual(r.calls, ['GET', 'PUT'])
})

test('syncPages never loses an edit', async () => {
  const stored = [
    { path: 'title', values: { en: 'my edit' }, base: { en: 'old' } },
    { path: 'extra', values: { en: 'e' } },
  ]
  const r = await harness([ok(stored), ok([1, 2])])(shipped)
  const put = r.bodies[0].entries
  assert.equal(put.find((e) => e.path === 'title').values.en, 'my edit')
  assert.equal(put.find((e) => e.path === 'title').base.en, 'new')
  assert.ok(put.find((e) => e.path === 'extra'))
})

test('syncPages second run on the synced result is unchanged', async () => {
  const stored = [{ path: 'title', values: { en: 'mine' } }]
  const first = await harness([ok(stored), ok([1])])(shipped)
  const synced = first.bodies[0].entries
  const second = await harness([ok(synced)])(shipped)
  assert.equal(second.counts.unchanged, 1)
  assert.deepEqual(second.calls, ['GET'])
})

test('syncPages skips a merged list that is too large', async () => {
  const big = Array.from({ length: 1001 }, (_, i) => ({ path: `p${i}`, values: { en: 'x' }, base: { en: 'x' } }))
  const r = await harness([ok([{ path: 'a', values: { en: 'x' } }])])({ hero: big })
  assert.equal(r.counts.tooLarge, 1)
  assert.deepEqual(r.calls, ['GET'])
})
